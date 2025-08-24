import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, Inject, forwardRef } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { RegisterDto, LoginDto, VerifySmsDto, RefreshTokenDto, ForgotPasswordDto } from "./auth.dto"
import { Iranian2FAService } from "./iranian-2fa.service"
import { UserService } from "./user.service"
import { User } from "./user.entity"
// import dayjs from 'dayjs'
// import jalaliday from 'jalaliday'
// dayjs.extend(jalaliday)

const sessions = new Map()
const smsCodes = new Map()
const failedAttempts = new Map()

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, 
    private readonly iranian2FAService: Iranian2FAService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ 
      where: { mobile: dto.mobile } 
    })
    
    if (existingUser) {
      throw new BadRequestException("این شماره قبلاً ثبت شده است.")
    }

    // Create user with default values
    const user = this.userRepository.create({
      mobile: dto.mobile,
      password: dto.password,
      isActive: true,
      isVerified: false,
      preferences: {
        language: 'fa',
        theme: 'light',
        notifications: { sms: true, email: true, push: true },
        privacy: { profileVisibility: 'friends', showBalance: false }
      },
      metadata: {
        registrationSource: 'mobile',
        deviceInfo: null
      }
    })

    await this.userRepository.save(user)
    
    // Send SMS verification code
    await this.sendSmsCode(dto.mobile)
    
    return { 
      message: "کد تایید به شماره شما ارسال شد.",
      userId: user.id 
    }
  }

  async login(dto: LoginDto, ip?: string) {
    const user = await this.userRepository.findOne({ 
      where: { mobile: dto.mobile } 
    })
    
    if (!user) {
      throw new UnauthorizedException("کاربر یافت نشد.")
    }
    
    if (user.isLocked) {
      throw new ForbiddenException("حساب شما به دلیل تلاش ناموفق قفل شده است.")
    }
    
    if (!user.isActive) {
      throw new ForbiddenException("حساب شما غیرفعال شده است.")
    }

    // Validate password
    const isValidPassword = await user.validatePassword(dto.password)
    if (!isValidPassword) {
      this.increaseFailedAttempts(dto.mobile)
      throw new UnauthorizedException("رمز عبور اشتباه است.")
    }

    if (!user.isVerified) {
      throw new ForbiddenException("حساب شما تایید نشده است.")
    }

    // Reset failed attempts and update last login
    this.resetFailedAttempts(dto.mobile)
    await this.userService.updateLastLogin(user.id, ip || 'unknown')

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.mobile)
    sessions.set(tokens.refreshToken, { 
      userId: user.id, 
      mobile: user.mobile, 
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 
    })

    return {
      ...tokens,
      user: {
        id: user.id,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        preferences: user.preferences
      }
    }
  }

  async sendSmsCode(mobile: string) {
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    smsCodes.set(mobile, { code, expires: Date.now() + 5 * 60 * 1000 })
    await this.iranian2FAService.sendSms(mobile, code)
  }

  async verifySms(dto: VerifySmsDto) {
    const record = smsCodes.get(dto.mobile)
    if (!record || record.expires < Date.now()) {
      throw new BadRequestException("کد منقضی شده است.")
    }
    
    if (record.code !== dto.code) {
      throw new BadRequestException("کد تایید اشتباه است.")
    }

    const user = await this.userRepository.findOne({ 
      where: { mobile: dto.mobile } 
    })
    
    if (!user) {
      throw new UnauthorizedException("کاربر یافت نشد.")
    }

    // Mark user as verified
    user.isVerified = true
    await this.userRepository.save(user)

    // Remove SMS code
    smsCodes.delete(dto.mobile)

    return { 
      message: "حساب شما با موفقیت تایید شد.",
      userId: user.id 
    }
  }

  async refreshToken(dto: RefreshTokenDto) {
    const session = sessions.get(dto.refreshToken)
    if (!session || session.expires < Date.now()) {
      throw new UnauthorizedException("توکن منقضی شده است.")
    }

    const user = await this.userRepository.findOne({ 
      where: { id: session.userId } 
    })
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException("کاربر یافت نشد یا غیرفعال است.")
    }

    // Generate new tokens
    const tokens = this.generateTokens(user.id, user.mobile)
    
    // Update session
    sessions.delete(dto.refreshToken)
    sessions.set(tokens.refreshToken, { 
      userId: user.id, 
      mobile: user.mobile, 
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 
    })

    return tokens
  }

  async logout(refreshToken: string) {
    sessions.delete(refreshToken)
    return { message: "خروج با موفقیت انجام شد." }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ 
      where: { mobile: dto.mobile } 
    })
    
    if (!user) {
      throw new BadRequestException("کاربر یافت نشد.")
    }

    await this.sendSmsCode(dto.mobile)
    return { message: "کد بازیابی رمز عبور ارسال شد." }
  }

  async resetPassword(mobile: string, code: string, newPassword: string) {
    const record = smsCodes.get(mobile)
    if (!record || record.expires < Date.now()) {
      throw new BadRequestException("کد منقضی شده است.")
    }
    
    if (record.code !== code) {
      throw new BadRequestException("کد تایید اشتباه است.")
    }

    const user = await this.userRepository.findOne({ 
      where: { mobile } 
    })
    
    if (!user) {
      throw new UnauthorizedException("کاربر یافت نشد.")
    }

    // Update password
    user.password = newPassword
    await this.userRepository.save(user)

    // Remove SMS code
    smsCodes.delete(mobile)

    return { message: "رمز عبور با موفقیت تغییر یافت." }
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { id: userId, isActive: true } 
    })
  }

  private generateTokens(userId: string, mobile: string) {
    const payload = { sub: userId, mobile }
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" })
    return { accessToken, refreshToken }
  }

  private increaseFailedAttempts(mobile: string) {
    const count = failedAttempts.get(mobile) || 0
    if (count + 1 >= 5) {
      // Lock account after 5 failed attempts
      this.userRepository.update({ mobile }, { isLocked: true })
    }
    failedAttempts.set(mobile, count + 1)
  }

  private resetFailedAttempts(mobile: string) {
    failedAttempts.set(mobile, 0)
  }

  getPersianDate() {
    return new Date().toISOString()
  }

  // Clean up expired sessions and SMS codes
  async cleanupExpiredData() {
    const now = Date.now()
    
    // Clean expired sessions
    for (const [token, session] of sessions.entries()) {
      if (session.expires < now) {
        sessions.delete(token)
      }
    }

    // Clean expired SMS codes
    for (const [mobile, record] of smsCodes.entries()) {
      if (record.expires < now) {
        smsCodes.delete(mobile)
      }
    }
  }
}

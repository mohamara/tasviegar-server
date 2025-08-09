import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, Inject, forwardRef } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { RegisterDto, LoginDto, VerifySmsDto, RefreshTokenDto, ForgotPasswordDto } from "./auth.dto"
import { Iranian2FAService } from "./iranian-2fa.service"
import * as moment from "moment-jalaali"

const users = new Map() // جایگزین با دیتابیس در نسخه نهایی
const sessions = new Map()
const smsCodes = new Map()
const failedAttempts = new Map()

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly iranian2FAService: Iranian2FAService) {}

  async register(dto: RegisterDto) {
    if (users.has(dto.mobile)) {
      throw new BadRequestException("این شماره قبلاً ثبت شده است.")
    }
    users.set(dto.mobile, { ...dto, verified: false })
    await this.sendSmsCode(dto.mobile)
    return { message: "کد تایید به شماره شما ارسال شد." }
  }

  async login(dto: LoginDto) {
    const user = users.get(dto.mobile)
    if (!user) throw new UnauthorizedException("کاربر یافت نشد.")
    if (user.locked) throw new ForbiddenException("حساب شما به دلیل تلاش ناموفق قفل شده است.")
    if (user.password !== dto.password) {
      this.increaseFailedAttempts(dto.mobile)
      throw new UnauthorizedException("رمز عبور اشتباه است.")
    }
    if (!user.verified) throw new ForbiddenException("حساب شما تایید نشده است.")
    this.resetFailedAttempts(dto.mobile)
    const tokens = this.generateTokens(dto.mobile)
    sessions.set(tokens.refreshToken, { mobile: dto.mobile, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 })
    return tokens
  }

  async sendSmsCode(mobile: string) {
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    smsCodes.set(mobile, { code, expires: Date.now() + 5 * 60 * 1000 })
    await this.iranian2FAService.sendSms(mobile, code)
  }

  async verifySms(dto: VerifySmsDto) {
    const record = smsCodes.get(dto.mobile)
    if (!record || record.expires < Date.now()) throw new BadRequestException("کد منقضی شده است.")
    if (record.code !== dto.code) throw new BadRequestException("کد تایید اشتباه است.")
    const user = users.get(dto.mobile)
    if (!user) throw new UnauthorizedException("کاربر یافت نشد.")
    user.verified = true
    return { message: "حساب شما با موفقیت تایید شد." }
  }

  async refreshToken(dto: RefreshTokenDto) {
    const session = sessions.get(dto.refreshToken)
    if (!session || session.expires < Date.now()) throw new UnauthorizedException("توکن منقضی شده است.")
    const tokens = this.generateTokens(session.mobile)
    sessions.set(tokens.refreshToken, { mobile: session.mobile, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 })
    return tokens
  }

  async logout(refreshToken: string) {
    sessions.delete(refreshToken)
    return { message: "خروج با موفقیت انجام شد." }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    if (!users.has(dto.mobile)) throw new BadRequestException("کاربر یافت نشد.")
    await this.sendSmsCode(dto.mobile)
    return { message: "کد بازیابی رمز عبور ارسال شد." }
  }

  private generateTokens(mobile: string) {
    const payload = { sub: mobile }
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" })
    return { accessToken, refreshToken }
  }

  private increaseFailedAttempts(mobile: string) {
    const count = failedAttempts.get(mobile) || 0
    if (count + 1 >= 5) {
      const user = users.get(mobile)
      if (user) user.locked = true
    }
    failedAttempts.set(mobile, count + 1)
  }

  private resetFailedAttempts(mobile: string) {
    failedAttempts.set(mobile, 0)
  }

  getPersianDate() {
    return moment().format("jYYYY/jMM/jDD HH:mm:ss")
  }
}

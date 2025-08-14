import { Controller, Post, Body, Req, UseGuards, Res, HttpStatus, Ip, Get } from "@nestjs/common"
import { Request, Response } from "express"
import { AuthService } from "./auth.service"
import { RegisterDto, LoginDto, VerifySmsDto, RefreshTokenDto, ForgotPasswordDto } from "./auth.dto"
import { AuthGuard } from "./auth.guard"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

const rateLimits = new Map()

function checkRateLimit(ip: string, key: string) {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 دقیقه
  const maxAttempts = 5
  const id = `${ip}:${key}`
  const record = rateLimits.get(id) || { count: 0, time: now }
  if (now - record.time > windowMs) {
    rateLimits.set(id, { count: 1, time: now })
    return
  }
  if (record.count >= maxAttempts) {
    throw { status: 429, message: "تعداد تلاش بیش از حد مجاز. لطفاً بعداً تلاش کنید." }
  }
  rateLimits.set(id, { count: record.count + 1, time: record.time })
}

@ApiTags('Authentication')
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() dto: RegisterDto, @Ip() ip: string, @Res() res: Response) {
    try {
      checkRateLimit(ip, "register")
      const result = await this.authService.register(dto)
      return res.status(HttpStatus.CREATED).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در ثبت‌نام." 
      })
    }
  }

  @Post("login")
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Account locked or inactive' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Res() res: Response) {
    try {
      checkRateLimit(ip, "login")
      const result = await this.authService.login(dto, ip)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در ورود." 
      })
    }
  }

  @Post("verify-sms")
  @ApiOperation({ summary: 'Verify SMS code' })
  @ApiResponse({ status: 200, description: 'SMS verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async verifySms(@Body() dto: VerifySmsDto, @Ip() ip: string, @Res() res: Response) {
    try {
      checkRateLimit(ip, "verify-sms")
      const result = await this.authService.verifySms(dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در تایید پیامک." 
      })
    }
  }

  @Post("refresh")
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async refresh(@Body() dto: RefreshTokenDto, @Ip() ip: string, @Res() res: Response) {
    try {
      checkRateLimit(ip, "refresh")
      const result = await this.authService.refreshToken(dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در تجدید توکن." 
      })
    }
  }

  @Post("logout")
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async logout(@Body("refreshToken") refreshToken: string, @Ip() ip: string, @Res() res: Response) {
    try {
      checkRateLimit(ip, "logout")
      const result = await this.authService.logout(refreshToken)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در خروج." 
      })
    }
  }

  @Post("forgot-password")
  @ApiOperation({ summary: 'Send forgot password SMS' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Ip() ip: string, @Res() res: Response) {
    try {
      checkRateLimit(ip, "forgot-password")
      const result = await this.authService.forgotPassword(dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در بازیابی رمز." 
      })
    }
  }

  @Post("reset-password")
  @ApiOperation({ summary: 'Reset password with SMS code' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @ApiResponse({ status: 401, description: 'User not found' })
  async resetPassword(
    @Body() body: { mobile: string; code: string; newPassword: string },
    @Res() res: Response
  ) {
    try {
      const result = await this.authService.resetPassword(
        body.mobile,
        body.code,
        body.newPassword
      )
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در بازنشانی رمز عبور." 
      })
    }
  }

  @Post("me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.authService.validateUser((req as any).user.sub)
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          message: "کاربر یافت نشد." 
        })
      }
      
      const { password, ...userWithoutPassword } = user
      return res.status(HttpStatus.OK).json({ user: userWithoutPassword })
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در دریافت اطلاعات کاربر." 
      })
    }
  }

  @Get("persian-date")
  @ApiOperation({ summary: 'Get current Persian date' })
  @ApiResponse({ status: 200, description: 'Persian date retrieved successfully' })
  async getPersianDate(@Res() res: Response) {
    try {
      const persianDate = this.authService.getPersianDate()
      return res.status(HttpStatus.OK).json({ 
        persianDate,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "خطا در دریافت تاریخ شمسی." 
      })
    }
  }
}

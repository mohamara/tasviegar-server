import { Controller, Post, Body, Req, UseGuards, Res, HttpStatus, Ip } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { RegisterDto, LoginDto, VerifySmsDto, RefreshTokenDto, ForgotPasswordDto } from "./auth.dto"
import { AuthGuard } from "./auth.guard"

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

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto, @Ip() ip: string, @Res() res) {
    try {
      checkRateLimit(ip, "register")
      const result = await this.authService.register(dto)
      return res.status(HttpStatus.CREATED).json(result)
    } catch (e) {
      return res.status(e.status || 400).json({ message: e.message || "خطا در ثبت‌نام." })
    }
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Res() res) {
    try {
      checkRateLimit(ip, "login")
      const result = await this.authService.login(dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (e) {
      return res.status(e.status || 401).json({ message: e.message || "خطا در ورود." })
    }
  }

  @Post("verify-sms")
  async verifySms(@Body() dto: VerifySmsDto, @Ip() ip: string, @Res() res) {
    try {
      checkRateLimit(ip, "verify-sms")
      const result = await this.authService.verifySms(dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (e) {
      return res.status(e.status || 400).json({ message: e.message || "خطا در تایید پیامک." })
    }
  }

  @Post("refresh")
  async refresh(@Body() dto: RefreshTokenDto, @Ip() ip: string, @Res() res) {
    try {
      checkRateLimit(ip, "refresh")
      const result = await this.authService.refreshToken(dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (e) {
      return res.status(e.status || 401).json({ message: e.message || "خطا در تجدید توکن." })
    }
  }

  @Post("logout")
  async logout(@Body("refreshToken") refreshToken: string, @Ip() ip: string, @Res() res) {
    try {
      checkRateLimit(ip, "logout")
      const result = await this.authService.logout(refreshToken)
      return res.status(HttpStatus.OK).json(result)
    } catch (e) {
      return res.status(e.status || 400).json({ message: e.message || "خطا در خروج." })
    }
  }

  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Ip() ip: string, @Res() res) {
    try {
      checkRateLimit(ip, "forgot-password")
      const result = await this.authService.forgotPassword(dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (e) {
      return res.status(e.status || 400).json({ message: e.message || "خطا در بازیابی رمز." })
    }
  }

  // نمونه route محافظت‌شده
  @Post("me")
  @UseGuards(AuthGuard)
  async me(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json({ user: req.user })
  }
}

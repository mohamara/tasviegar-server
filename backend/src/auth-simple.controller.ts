import { Controller, Post, Body, Get, HttpStatus, Res } from '@nestjs/common'
import { Response } from 'express'

// In-memory storage for demo
const users = new Map()
const smsCodes = new Map()
const sessions = new Map()

@Controller('api/auth')
export class AuthSimpleController {
  
  @Post('send-sms')
  async sendSms(@Body() body: { mobile: string; message?: string }, @Res() res: Response) {
    try {
      const { mobile } = body
      
      if (!mobile || !/^09\d{9}$/.test(mobile)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'شماره موبایل معتبر نیست'
        })
      }

      // Generate 4-digit code
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      
      // Store code with expiration (5 minutes)
      smsCodes.set(mobile, {
        code,
        expires: Date.now() + 5 * 60 * 1000
      })

      // Log SMS (in real app, this would send actual SMS)
      const smsMessage = body.message || `کد تایید: ${code}`
      console.log(`📱 SMS sent to ${mobile}: ${smsMessage}`)
      
      return res.status(HttpStatus.OK).json({
        message: 'پیامک ارسال شد',
        mobile,
        expiresIn: '5 دقیقه'
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'خطا در ارسال پیامک'
      })
    }
  }

  @Post('verify-sms')
  async verifySms(@Body() body: { mobile: string; code: string }, @Res() res: Response) {
    try {
      const { mobile, code } = body
      
      if (!mobile || !code) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'شماره موبایل و کد تایید الزامی است'
        })
      }

      const record = smsCodes.get(mobile)
      
      if (!record) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'کد تایید یافت نشد'
        })
      }

      if (record.expires < Date.now()) {
        smsCodes.delete(mobile)
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'کد تایید منقضی شده است'
        })
      }

      if (record.code !== code) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'کد تایید اشتباه است'
        })
      }

      // Remove used code
      smsCodes.delete(mobile)

      // Create or get user
      let user = users.get(mobile)
      if (!user) {
        user = {
          id: `user_${Date.now()}`,
          mobile,
          isVerified: true,
          createdAt: new Date().toISOString()
        }
        users.set(mobile, user)
      }

      // Generate session token
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessions.set(token, {
        userId: user.id,
        mobile: user.mobile,
        expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      })

      return res.status(HttpStatus.OK).json({
        message: 'ورود موفقیت‌آمیز',
        user: {
          id: user.id,
          mobile: user.mobile,
          isVerified: user.isVerified
        },
        token,
        expiresIn: '24 ساعت'
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'خطا در تایید کد'
      })
    }
  }

  @Post('register')
  async register(@Body() body: { mobile: string; password: string }, @Res() res: Response) {
    try {
      const { mobile, password } = body
      
      if (!mobile || !password) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'شماره موبایل و رمز عبور الزامی است'
        })
      }

      if (users.has(mobile)) {
        return res.status(HttpStatus.CONFLICT).json({
          message: 'این شماره قبلاً ثبت شده است'
        })
      }

      // Create user
      const user = {
        id: `user_${Date.now()}`,
        mobile,
        password: password, // In real app, hash this
        isVerified: false,
        createdAt: new Date().toISOString()
      }
      
      users.set(mobile, user)

      // Send SMS verification
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      smsCodes.set(mobile, {
        code,
        expires: Date.now() + 5 * 60 * 1000
      })

      console.log(`📱 Registration SMS to ${mobile}: کد تایید: ${code}`)

      return res.status(HttpStatus.CREATED).json({
        message: 'کاربر ایجاد شد. کد تایید ارسال شد',
        userId: user.id,
        mobile
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'خطا در ثبت‌نام'
      })
    }
  }

  @Get('profile')
  async getProfile(@Body() body: { token: string }, @Res() res: Response) {
    try {
      const { token } = body
      
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'توکن الزامی است'
        })
      }

      const session = sessions.get(token)
      
      if (!session || session.expires < Date.now()) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'توکن نامعتبر یا منقضی شده'
        })
      }

      const user = users.get(session.mobile)
      
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'کاربر یافت نشد'
        })
      }

      return res.status(HttpStatus.OK).json({
        user: {
          id: user.id,
          mobile: user.mobile,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'خطا در دریافت اطلاعات کاربر'
      })
    }
  }

  @Post('logout')
  async logout(@Body() body: { token: string }, @Res() res: Response) {
    try {
      const { token } = body
      
      if (token) {
        sessions.delete(token)
      }

      return res.status(HttpStatus.OK).json({
        message: 'خروج موفقیت‌آمیز'
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'خطا در خروج'
      })
    }
  }
}

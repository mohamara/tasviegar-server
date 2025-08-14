import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from '@nestjs/config'
import { AuthService } from "./auth.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'settler-iran-secret'),
    })
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.mobile) {
      throw new UnauthorizedException("توکن نامعتبر است.")
    }

    // Validate user exists and is active
    const user = await this.authService.validateUser(payload.sub)
    if (!user) {
      throw new UnauthorizedException("کاربر یافت نشد یا غیرفعال است.")
    }

    return { 
      sub: user.id, 
      mobile: user.mobile,
      role: user.role,
      isVerified: user.isVerified
    }
  }
}

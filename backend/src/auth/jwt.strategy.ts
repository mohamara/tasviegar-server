import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "settler-iran-secret",
    })
  }

  async validate(payload: any) {
    // در نسخه نهایی باید کاربر را از دیتابیس واکشی کند
    if (!payload.sub) throw new UnauthorizedException("توکن نامعتبر است.")
    return { mobile: payload.sub }
  }
}

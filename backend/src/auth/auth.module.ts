import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { JwtStrategy } from "./jwt.strategy"
import { Iranian2FAService } from "./iranian-2fa.service"
import { AuthGuard } from "./auth.guard"

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "settler-iran-secret",
      signOptions: { expiresIn: "15m" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, Iranian2FAService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}

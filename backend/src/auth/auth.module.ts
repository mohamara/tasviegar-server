import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from "@nestjs/passport"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { JwtStrategy } from "./jwt.strategy"
import { Iranian2FAService } from "./iranian-2fa.service"
import { AuthGuard } from "./auth.guard"
import { UserModule } from "./user.module"
import { User } from "./user.entity"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'settler-iran-secret'),
        signOptions: { expiresIn: '15m' },
      })
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, Iranian2FAService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}

import { Injectable, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common"
import { AuthGuard as NestAuthGuard } from "@nestjs/passport"

@Injectable()
export class AuthGuard extends NestAuthGuard("jwt") {
  private readonly logger = new Logger(AuthGuard.name)

  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      this.logger.error(`JWT validation error: ${err.message}`)
      throw new UnauthorizedException("خطا در اعتبارسنجی توکن.")
    }

    if (!user) {
      this.logger.warn(`Unauthorized access attempt: ${info?.message || 'No token provided'}`)
      throw new UnauthorizedException("دسترسی غیرمجاز. لطفاً وارد شوید.")
    }

    return user
  }
}

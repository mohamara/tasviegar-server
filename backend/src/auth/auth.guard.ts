import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { AuthGuard as NestAuthGuard } from "@nestjs/passport"

@Injectable()
export class AuthGuard extends NestAuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException("دسترسی غیرمجاز. لطفاً وارد شوید.")
    }
    return user
  }
}

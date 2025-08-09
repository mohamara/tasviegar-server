import { Injectable, Logger } from "@nestjs/common"

@Injectable()
export class Iranian2FAService {
  private readonly logger = new Logger(Iranian2FAService.name)

  async sendSms(mobile: string, code: string) {
    // اینجا باید API سرویس پیامک واقعی (Farapayamak یا IPPanel) فراخوانی شود
    // برای نمونه فقط لاگ می‌زنیم
    this.logger.log(`ارسال پیامک به ${mobile}: کد تایید Settler: ${code} - این کد تا ۵ دقیقه معتبر است`)
    // TODO: پیاده‌سازی واقعی با کلید API و ...
    return true
  }
}

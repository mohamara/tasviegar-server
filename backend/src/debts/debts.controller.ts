import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req,
  HttpStatus,
  Res
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger'
import { DebtsService } from './debts.service'
import { AuthGuard } from '../auth/auth.guard'
import { 
  CreateDebtDto, 
  UpdateDebtDto, 
  CreateTransactionDto, 
  UpdateTransactionDto,
  GetDebtsQueryDto,
  GetTransactionsQueryDto,
  DebtResponseDto,
  TransactionResponseDto
} from './debts.dto'

@ApiTags('Debts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد بدهی جدید' })
  @ApiResponse({ status: 201, description: 'بدهی با موفقیت ایجاد شد', type: DebtResponseDto })
  @ApiResponse({ status: 400, description: 'داده‌های نامعتبر' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  async createDebt(
    @Body() createDebtDto: CreateDebtDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      const result = await this.debtsService.createDebt(userId, createDebtDto)
      return res.status(HttpStatus.CREATED).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در ایجاد بدهی." 
      })
    }
  }

  @Get()
  @ApiOperation({ summary: 'دریافت لیست بدهی‌های کاربر' })
  @ApiResponse({ status: 200, description: 'لیست بدهی‌ها' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'active', 'settled', 'cancelled'] })
  @ApiQuery({ name: 'type', required: false, enum: ['group_expense', 'personal_loan', 'shared_purchase'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getUserDebts(
    @Query() query: GetDebtsQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      const result = await this.debtsService.getUserDebts(userId, query)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در دریافت بدهی‌ها." 
      })
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'دریافت آمار بدهی‌های کاربر' })
  @ApiResponse({ status: 200, description: 'آمار بدهی‌ها' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  async getDebtStatistics(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      const result = await this.debtsService.getDebtStatistics(userId)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در دریافت آمار." 
      })
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت جزئیات بدهی' })
  @ApiResponse({ status: 200, description: 'جزئیات بدهی', type: DebtResponseDto })
  @ApiResponse({ status: 404, description: 'بدهی یافت نشد' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiParam({ name: 'id', description: 'شناسه بدهی' })
  async getDebtById(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      const result = await this.debtsService.getDebtById(id, userId)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در دریافت بدهی." 
      })
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'ویرایش بدهی' })
  @ApiResponse({ status: 200, description: 'بدهی با موفقیت ویرایش شد', type: DebtResponseDto })
  @ApiResponse({ status: 400, description: 'داده‌های نامعتبر' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiResponse({ status: 404, description: 'بدهی یافت نشد' })
  @ApiParam({ name: 'id', description: 'شناسه بدهی' })
  async updateDebt(
    @Param('id') id: string,
    @Body() updateDebtDto: UpdateDebtDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      const result = await this.debtsService.updateDebt(id, userId, updateDebtDto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در ویرایش بدهی." 
      })
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف بدهی' })
  @ApiResponse({ status: 200, description: 'بدهی با موفقیت حذف شد' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiResponse({ status: 404, description: 'بدهی یافت نشد' })
  @ApiParam({ name: 'id', description: 'شناسه بدهی' })
  async deleteDebt(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      const result = await this.debtsService.deleteDebt(id, userId)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در حذف بدهی." 
      })
    }
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'تایید شرکت‌کنندگی در بدهی' })
  @ApiResponse({ status: 200, description: 'شرکت‌کنندگی تایید شد' })
  @ApiResponse({ status: 400, description: 'قبلاً تایید شده' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  @ApiResponse({ status: 404, description: 'شرکت‌کننده یافت نشد' })
  @ApiParam({ name: 'id', description: 'شناسه بدهی' })
  async confirmParticipation(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      const result = await this.debtsService.confirmParticipation(id, userId)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در تایید شرکت‌کنندگی." 
      })
    }
  }

  @Post('transactions')
  @ApiOperation({ summary: 'ایجاد تراکنش جدید' })
  @ApiResponse({ status: 201, description: 'تراکنش با موفقیت ایجاد شد', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'داده‌های نامعتبر' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      const result = await this.debtsService.createTransaction(userId, createTransactionDto)
      return res.status(HttpStatus.CREATED).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در ایجاد تراکنش." 
      })
    }
  }

  @Put('transactions/:id/complete')
  @ApiOperation({ summary: 'تکمیل تراکنش' })
  @ApiResponse({ status: 200, description: 'تراکنش با موفقیت تکمیل شد', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'تراکنش قابل تکمیل نیست' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiResponse({ status: 404, description: 'تراکنش یافت نشد' })
  @ApiParam({ name: 'id', description: 'شناسه تراکنش' })
  async completeTransaction(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      const result = await this.debtsService.completeTransaction(id, userId)
      return res.status(HttpStatus.OK).json(result)
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در تکمیل تراکنش." 
      })
    }
  }

  @Get('transactions')
  @ApiOperation({ summary: 'دریافت لیست تراکنش‌های کاربر' })
  @ApiResponse({ status: 200, description: 'لیست تراکنش‌ها' })
  @ApiResponse({ status: 401, description: 'غیرمجاز' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'completed', 'failed', 'cancelled'] })
  @ApiQuery({ name: 'type', required: false, enum: ['payment', 'refund', 'adjustment'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserTransactions(
    @Query() query: GetTransactionsQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id']
      // TODO: Implement getUserTransactions method in service
      return res.status(HttpStatus.OK).json({ 
        message: "این قابلیت در حال توسعه است." 
      })
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در دریافت تراکنش‌ها." 
      })
    }
  }
}

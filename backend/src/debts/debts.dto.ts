import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString, IsBoolean, IsArray, Min, MaxLength, IsNotEmpty, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DebtStatus, DebtType } from './debt.entity'
import { ParticipantRole } from './debt-participant.entity'
import { TransactionStatus, TransactionType } from './debt-transaction.entity'
import { validateJalaliDate } from '../utils/jalali-date.util'

// Create Debt DTO
export class CreateDebtDto {
  @ApiProperty({ description: 'عنوان بدهی', example: 'خرید ناهار گروهی' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @ApiPropertyOptional({ description: 'توضیحات بدهی', example: 'ناهار گروهی در رستوران' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: 'مبلغ کل', example: 500000 })
  @IsNumber()
  @Min(0)
  totalAmount: number

  @ApiPropertyOptional({ description: 'نوع بدهی', enum: DebtType, default: DebtType.GROUP_EXPENSE })
  @IsOptional()
  @IsEnum(DebtType)
  type?: DebtType

  @ApiPropertyOptional({ description: 'واحد پول', example: 'IRR' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ description: 'تاریخ سررسید (شمسی)', example: '1403/08/15' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}\/\d{2}\/\d{2}$/, { message: 'فرمت تاریخ باید YYYY/MM/DD باشد' })
  dueDate?: string

  @ApiPropertyOptional({ description: 'اطلاعات اضافی' })
  @IsOptional()
  metadata?: {
    category?: string
    tags?: string[]
    location?: string
    receipt?: string
    notes?: string
  }

  @ApiPropertyOptional({ description: 'آیا بدهی تکراری است' })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean

  @ApiPropertyOptional({ description: 'الگوی تکرار' })
  @IsOptional()
  @IsString()
  recurringPattern?: string

  @ApiProperty({ description: 'لیست شرکت‌کنندگان' })
  @IsArray()
  participants: CreateParticipantDto[]
}

// Create Participant DTO
export class CreateParticipantDto {
  @ApiProperty({ description: 'شناسه کاربر' })
  @IsUUID()
  userId: string

  @ApiPropertyOptional({ description: 'نقش در بدهی', enum: ParticipantRole, default: ParticipantRole.DEBTOR })
  @IsOptional()
  @IsEnum(ParticipantRole)
  role?: ParticipantRole

  @ApiProperty({ description: 'مبلغ سهم', example: 100000 })
  @IsNumber()
  @Min(0)
  shareAmount: number

  @ApiPropertyOptional({ description: 'یادداشت' })
  @IsOptional()
  @IsString()
  notes?: string
}

// Update Debt DTO
export class UpdateDebtDto {
  @ApiPropertyOptional({ description: 'عنوان بدهی' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string

  @ApiPropertyOptional({ description: 'توضیحات بدهی' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: 'وضعیت بدهی', enum: DebtStatus })
  @IsOptional()
  @IsEnum(DebtStatus)
  status?: DebtStatus

  @ApiPropertyOptional({ description: 'تاریخ سررسید (شمسی)', example: '1403/08/15' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}\/\d{2}\/\d{2}$/, { message: 'فرمت تاریخ باید YYYY/MM/DD باشد' })
  dueDate?: string

  @ApiPropertyOptional({ description: 'اطلاعات اضافی' })
  @IsOptional()
  metadata?: {
    category?: string
    tags?: string[]
    location?: string
    receipt?: string
    notes?: string
  }
}

// Create Transaction DTO
export class CreateTransactionDto {
  @ApiProperty({ description: 'شناسه بدهی' })
  @IsUUID()
  debtId: string

  @ApiProperty({ description: 'شناسه گیرنده' })
  @IsUUID()
  payeeId: string

  @ApiProperty({ description: 'مبلغ تراکنش', example: 50000 })
  @IsNumber()
  @Min(0)
  amount: number

  @ApiPropertyOptional({ description: 'توضیحات تراکنش' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: 'روش پرداخت', example: 'cash' })
  @IsOptional()
  @IsString()
  paymentMethod?: string

  @ApiPropertyOptional({ description: 'مرجع تراکنش' })
  @IsOptional()
  @IsString()
  transactionReference?: string

  @ApiPropertyOptional({ description: 'اطلاعات اضافی' })
  @IsOptional()
  metadata?: {
    receipt?: string
    notes?: string
    location?: string
  }
}

// Update Transaction DTO
export class UpdateTransactionDto {
  @ApiPropertyOptional({ description: 'وضعیت تراکنش', enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus

  @ApiPropertyOptional({ description: 'توضیحات تراکنش' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: 'دلیل شکست' })
  @IsOptional()
  @IsString()
  failureReason?: string
}

// Query DTOs
export class GetDebtsQueryDto {
  @ApiPropertyOptional({ description: 'وضعیت بدهی', enum: DebtStatus })
  @IsOptional()
  @IsEnum(DebtStatus)
  status?: DebtStatus

  @ApiPropertyOptional({ description: 'نوع بدهی', enum: DebtType })
  @IsOptional()
  @IsEnum(DebtType)
  type?: DebtType

  @ApiPropertyOptional({ description: 'صفحه', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number

  @ApiPropertyOptional({ description: 'تعداد در هر صفحه', example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number

  @ApiPropertyOptional({ description: 'جستجو در عنوان' })
  @IsOptional()
  @IsString()
  search?: string
}

export class GetTransactionsQueryDto {
  @ApiPropertyOptional({ description: 'وضعیت تراکنش', enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus

  @ApiPropertyOptional({ description: 'نوع تراکنش', enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType

  @ApiPropertyOptional({ description: 'صفحه', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number

  @ApiPropertyOptional({ description: 'تعداد در هر صفحه', example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number
}

// Response DTOs
export class DebtResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  description?: string

  @ApiProperty()
  totalAmount: number

  @ApiProperty()
  type: DebtType

  @ApiProperty()
  status: DebtStatus

  @ApiProperty()
  creatorId: string

  @ApiProperty()
  currency?: string

  @ApiProperty({ description: 'تاریخ سررسید (شمسی)', example: '1403/08/15' })
  dueDate?: string

  @ApiProperty()
  metadata?: any

  @ApiProperty()
  isRecurring: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty()
  settledAt?: Date

  @ApiProperty()
  remainingAmount: number

  @ApiProperty()
  participants: DebtParticipantResponseDto[]
}

export class DebtParticipantResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  role: ParticipantRole

  @ApiProperty()
  shareAmount: number

  @ApiProperty()
  paidAmount: number

  @ApiProperty()
  isConfirmed: boolean

  @ApiProperty()
  remainingAmount: number

  @ApiProperty()
  isFullyPaid: boolean

  @ApiProperty()
  paymentPercentage: number

  @ApiProperty()
  user: {
    id: string
    firstName?: string
    lastName?: string
    mobile: string
    avatar?: string
  }
}

export class TransactionResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  debtId: string

  @ApiProperty()
  payerId: string

  @ApiProperty()
  payeeId: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  type: TransactionType

  @ApiProperty()
  status: TransactionStatus

  @ApiProperty()
  description?: string

  @ApiProperty()
  paymentMethod?: string

  @ApiProperty()
  transactionReference?: string

  @ApiProperty()
  completedAt?: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  formattedAmount: string
}

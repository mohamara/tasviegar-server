import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In, SelectQueryBuilder } from 'typeorm'
import { Debt, DebtStatus, DebtType } from './debt.entity'
import { DebtParticipant, ParticipantRole } from './debt-participant.entity'
import { DebtTransaction, TransactionStatus, TransactionType } from './debt-transaction.entity'
import { User } from '../auth/user.entity'
import { 
  CreateDebtDto, 
  UpdateDebtDto, 
  CreateTransactionDto, 
  UpdateTransactionDto,
  GetDebtsQueryDto,
  GetTransactionsQueryDto,
  DebtResponseDto,
  DebtParticipantResponseDto,
  TransactionResponseDto
} from './debts.dto'

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(DebtParticipant)
    private readonly participantRepository: Repository<DebtParticipant>,
    @InjectRepository(DebtTransaction)
    private readonly transactionRepository: Repository<DebtTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // Create new debt
  async createDebt(creatorId: string, createDebtDto: CreateDebtDto): Promise<DebtResponseDto> {
    const { participants, ...debtData } = createDebtDto

    // Validate participants
    if (!participants || participants.length === 0) {
      throw new BadRequestException('حداقل یک شرکت‌کننده باید وجود داشته باشد.')
    }

    // Check if creator is in participants
    const creatorInParticipants = participants.find(p => p.userId === creatorId)
    if (!creatorInParticipants) {
      throw new BadRequestException('ایجادکننده باید در لیست شرکت‌کنندگان باشد.')
    }

    // Validate total amount matches participants
    const totalShareAmount = participants.reduce((sum, p) => sum + p.shareAmount, 0)
    if (Math.abs(totalShareAmount - debtData.totalAmount) > 0.01) {
      throw new BadRequestException('مجموع سهم‌ها باید با مبلغ کل برابر باشد.')
    }

    // Create debt
    const debt = this.debtRepository.create({
      ...debtData,
      creatorId,
      status: DebtStatus.PENDING,
      currency: debtData.currency || 'IRR'
    })

    const savedDebt = await this.debtRepository.save(debt)

    // Create participants
    const participantEntities = participants.map(p => 
      this.participantRepository.create({
        debtId: savedDebt.id,
        userId: p.userId,
        role: p.role || ParticipantRole.DEBTOR,
        shareAmount: p.shareAmount,
        metadata: { notes: p.notes }
      })
    )

    await this.participantRepository.save(participantEntities)

    return this.getDebtById(savedDebt.id, creatorId)
  }

  // Get debt by ID
  async getDebtById(debtId: string, userId: string): Promise<DebtResponseDto> {
    const debt = await this.debtRepository.findOne({
      where: { id: debtId },
      relations: ['participants', 'participants.user', 'transactions']
    })

    if (!debt) {
      throw new NotFoundException('بدهی یافت نشد.')
    }

    // Check if user has access to this debt
    const hasAccess = debt.creatorId === userId || 
                     debt.participants.some(p => p.userId === userId)
    
    if (!hasAccess) {
      throw new ForbiddenException('شما دسترسی به این بدهی ندارید.')
    }

    return this.mapDebtToResponse(debt)
  }

  // Get user's debts
  async getUserDebts(userId: string, query: GetDebtsQueryDto): Promise<{
    debts: DebtResponseDto[]
    total: number
    page: number
    limit: number
  }> {
    const { status, type, page = 1, limit = 10, search } = query
    const offset = (page - 1) * limit

    let queryBuilder = this.debtRepository
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('debt.transactions', 'transactions')
      .where('(debt.creatorId = :userId OR participants.userId = :userId)', { userId })

    if (status) {
      queryBuilder = queryBuilder.andWhere('debt.status = :status', { status })
    }

    if (type) {
      queryBuilder = queryBuilder.andWhere('debt.type = :type', { type })
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(debt.title ILIKE :search OR debt.description ILIKE :search)',
        { search: `%${search}%` }
      )
    }

    const [debts, total] = await queryBuilder
      .orderBy('debt.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount()

    return {
      debts: debts.map(debt => this.mapDebtToResponse(debt)),
      total,
      page,
      limit
    }
  }

  // Update debt
  async updateDebt(debtId: string, userId: string, updateDebtDto: UpdateDebtDto): Promise<DebtResponseDto> {
    const debt = await this.debtRepository.findOne({
      where: { id: debtId },
      relations: ['participants']
    })

    if (!debt) {
      throw new NotFoundException('بدهی یافت نشد.')
    }

    if (debt.creatorId !== userId) {
      throw new ForbiddenException('فقط ایجادکننده می‌تواند بدهی را ویرایش کند.')
    }

    if (debt.status !== DebtStatus.PENDING) {
      throw new BadRequestException('فقط بدهی‌های در انتظار قابل ویرایش هستند.')
    }

    // Update debt
    Object.assign(debt, updateDebtDto)
    await this.debtRepository.save(debt)

    return this.getDebtById(debtId, userId)
  }

  // Delete debt
  async deleteDebt(debtId: string, userId: string): Promise<{ message: string }> {
    const debt = await this.debtRepository.findOne({
      where: { id: debtId }
    })

    if (!debt) {
      throw new NotFoundException('بدهی یافت نشد.')
    }

    if (debt.creatorId !== userId) {
      throw new ForbiddenException('فقط ایجادکننده می‌تواند بدهی را حذف کند.')
    }

    if (debt.status !== DebtStatus.PENDING) {
      throw new BadRequestException('فقط بدهی‌های در انتظار قابل حذف هستند.')
    }

    await this.debtRepository.remove(debt)

    return { message: 'بدهی با موفقیت حذف شد.' }
  }

  // Confirm debt participation
  async confirmParticipation(debtId: string, userId: string): Promise<{ message: string }> {
    const participant = await this.participantRepository.findOne({
      where: { debtId, userId }
    })

    if (!participant) {
      throw new NotFoundException('شرکت‌کننده یافت نشد.')
    }

    if (participant.isConfirmed) {
      throw new BadRequestException('شرکت‌کننده قبلاً تایید شده است.')
    }

    participant.isConfirmed = true
    participant.confirmedAt = new Date()
    await this.participantRepository.save(participant)

    // Check if all participants confirmed
    const allParticipants = await this.participantRepository.find({
      where: { debtId }
    })

    const allConfirmed = allParticipants.every(p => p.isConfirmed)
    if (allConfirmed) {
      await this.debtRepository.update(debtId, { status: DebtStatus.ACTIVE })
    }

    return { message: 'شرکت‌کنندگی تایید شد.' }
  }

  // Create transaction
  async createTransaction(userId: string, createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const { debtId, payeeId, amount, ...transactionData } = createTransactionDto

    // Validate debt exists and user has access
    const debt = await this.debtRepository.findOne({
      where: { id: debtId },
      relations: ['participants']
    })

    if (!debt) {
      throw new NotFoundException('بدهی یافت نشد.')
    }

    const hasAccess = debt.creatorId === userId || 
                     debt.participants.some(p => p.userId === userId)
    
    if (!hasAccess) {
      throw new ForbiddenException('شما دسترسی به این بدهی ندارید.')
    }

    if (debt.status !== DebtStatus.ACTIVE) {
      throw new BadRequestException('فقط بدهی‌های فعال قابل پرداخت هستند.')
    }

    // Validate payee is participant
    const payeeParticipant = debt.participants.find(p => p.userId === payeeId)
    if (!payeeParticipant) {
      throw new BadRequestException('گیرنده باید شرکت‌کننده بدهی باشد.')
    }

    // Validate payer is participant
    const payerParticipant = debt.participants.find(p => p.userId === userId)
    if (!payerParticipant) {
      throw new BadRequestException('پرداخت‌کننده باید شرکت‌کننده بدهی باشد.')
    }

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestException('مبلغ باید بیشتر از صفر باشد.')
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      debtId,
      payerId: userId,
      payeeId,
      amount,
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PENDING,
      ...transactionData
    })

    const savedTransaction = await this.transactionRepository.save(transaction)

    return this.mapTransactionToResponse(savedTransaction)
  }

  // Complete transaction
  async completeTransaction(transactionId: string, userId: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['debt', 'debt.participants']
    })

    if (!transaction) {
      throw new NotFoundException('تراکنش یافت نشد.')
    }

    if (transaction.payerId !== userId) {
      throw new ForbiddenException('فقط پرداخت‌کننده می‌تواند تراکنش را تکمیل کند.')
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('فقط تراکنش‌های در انتظار قابل تکمیل هستند.')
    }

    // Update transaction status
    transaction.status = TransactionStatus.COMPLETED
    transaction.completedAt = new Date()
    await this.transactionRepository.save(transaction)

    // Update participant paid amounts
    const payerParticipant = transaction.debt.participants.find(p => p.userId === transaction.payerId)
    if (payerParticipant) {
      payerParticipant.paidAmount += transaction.amount
      await this.participantRepository.save(payerParticipant)
    }

    // Check if debt is fully settled
    const allParticipants = transaction.debt.participants
    const isFullySettled = allParticipants.every(p => p.paidAmount >= p.shareAmount)
    
    if (isFullySettled) {
      await this.debtRepository.update(transaction.debtId, { 
        status: DebtStatus.SETTLED,
        settledAt: new Date()
      })
    }

    return this.mapTransactionToResponse(transaction)
  }

  // Get debt statistics
  async getDebtStatistics(userId: string): Promise<{
    totalDebts: number
    activeDebts: number
    settledDebts: number
    totalOwed: number
    totalOwedToMe: number
    recentTransactions: TransactionResponseDto[]
  }> {
    const [debts, transactions] = await Promise.all([
      this.debtRepository.find({
        where: [
          { creatorId: userId },
          { participants: { userId } }
        ],
        relations: ['participants', 'transactions']
      }),
      this.transactionRepository.find({
        where: [
          { payerId: userId },
          { payeeId: userId }
        ],
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['debt', 'payer', 'payee']
      })
    ])

    let totalOwed = 0
    let totalOwedToMe = 0

    debts.forEach(debt => {
      const userParticipant = debt.participants.find(p => p.userId === userId)
      if (userParticipant) {
        const remaining = userParticipant.shareAmount - userParticipant.paidAmount
        if (remaining > 0) {
          totalOwed += remaining
        } else if (remaining < 0) {
          totalOwedToMe += Math.abs(remaining)
        }
      }
    })

    return {
      totalDebts: debts.length,
      activeDebts: debts.filter(d => d.status === DebtStatus.ACTIVE).length,
      settledDebts: debts.filter(d => d.status === DebtStatus.SETTLED).length,
      totalOwed,
      totalOwedToMe,
      recentTransactions: transactions.map(t => this.mapTransactionToResponse(t))
    }
  }

  // Helper methods
  private mapDebtToResponse(debt: Debt): DebtResponseDto {
    return {
      id: debt.id,
      title: debt.title,
      description: debt.description,
      totalAmount: debt.totalAmount,
      type: debt.type,
      status: debt.status,
      creatorId: debt.creatorId,
      currency: debt.currency,
      dueDate: debt.dueDate,
      metadata: debt.metadata,
      isRecurring: debt.isRecurring,
      createdAt: debt.createdAt,
      updatedAt: debt.updatedAt,
      settledAt: debt.settledAt,
      remainingAmount: debt.remainingAmount,
      participants: debt.participants?.map(p => this.mapParticipantToResponse(p)) || []
    }
  }

  private mapParticipantToResponse(participant: DebtParticipant): DebtParticipantResponseDto {
    return {
      id: participant.id,
      userId: participant.userId,
      role: participant.role,
      shareAmount: participant.shareAmount,
      paidAmount: participant.paidAmount,
      isConfirmed: participant.isConfirmed,
      remainingAmount: participant.remainingAmount,
      isFullyPaid: participant.isFullyPaid,
      paymentPercentage: participant.paymentPercentage,
      user: {
        id: participant.user.id,
        firstName: participant.user.firstName,
        lastName: participant.user.lastName,
        mobile: participant.user.mobile,
        avatar: participant.user.avatar
      }
    }
  }

  private mapTransactionToResponse(transaction: DebtTransaction): TransactionResponseDto {
    return {
      id: transaction.id,
      debtId: transaction.debtId,
      payerId: transaction.payerId,
      payeeId: transaction.payeeId,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      paymentMethod: transaction.paymentMethod,
      transactionReference: transaction.transactionReference,
      completedAt: transaction.completedAt,
      createdAt: transaction.createdAt,
      formattedAmount: transaction.formattedAmount
    }
  }
}

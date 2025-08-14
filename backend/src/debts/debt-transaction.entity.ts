import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../auth/user.entity'
import { Debt } from './debt.entity'

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment'
}

@Entity('debt_transactions')
@Index(['debtId'])
@Index(['payerId'])
@Index(['payeeId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class DebtTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  debtId: string

  @Column({ type: 'uuid' })
  payerId: string

  @Column({ type: 'uuid' })
  payeeId: string

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number

  @Column({ type: 'enum', enum: TransactionType, default: TransactionType.PAYMENT })
  type: TransactionType

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionReference: string

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    receipt?: string
    notes?: string
    deviceInfo?: any
    location?: string
  }

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date

  @Column({ type: 'text', nullable: true })
  failureReason: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  // Relations
  @ManyToOne(() => Debt, debt => debt.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'debtId' })
  debt: Debt

  @ManyToOne(() => User, user => user.paidTransactions)
  @JoinColumn({ name: 'payerId' })
  payer: User

  @ManyToOne(() => User, user => user.receivedTransactions)
  @JoinColumn({ name: 'payeeId' })
  payee: User

  // Computed properties
  get isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED
  }

  get isPending(): boolean {
    return this.status === TransactionStatus.PENDING
  }

  get isFailed(): boolean {
    return this.status === TransactionStatus.FAILED
  }

  get formattedAmount(): string {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR'
    }).format(this.amount)
  }
}

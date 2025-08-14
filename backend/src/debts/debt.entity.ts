import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { User } from '../auth/user.entity'
import { DebtParticipant } from './debt-participant.entity'
import { DebtTransaction } from './debt-transaction.entity'

export enum DebtStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SETTLED = 'settled',
  CANCELLED = 'cancelled'
}

export enum DebtType {
  GROUP_EXPENSE = 'group_expense',
  PERSONAL_LOAN = 'personal_loan',
  SHARED_PURCHASE = 'shared_purchase'
}

@Entity('debts')
@Index(['creatorId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class Debt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number

  @Column({ type: 'enum', enum: DebtType, default: DebtType.GROUP_EXPENSE })
  type: DebtType

  @Column({ type: 'enum', enum: DebtStatus, default: DebtStatus.PENDING })
  status: DebtStatus

  @Column({ type: 'uuid' })
  creatorId: string

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string

  @Column({ type: 'date', nullable: true })
  dueDate: Date

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    category?: string
    tags?: string[]
    location?: string
    receipt?: string
    notes?: string
  }

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean

  @Column({ type: 'varchar', length: 50, nullable: true })
  recurringPattern: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  settledAt: Date

  // Relations
  @ManyToOne(() => User, user => user.debts)
  @JoinColumn({ name: 'creatorId' })
  creator: User

  @OneToMany(() => DebtParticipant, participant => participant.debt)
  participants: DebtParticipant[]

  @OneToMany(() => DebtTransaction, transaction => transaction.debt)
  transactions: DebtTransaction[]

  // Computed properties
  get isActive(): boolean {
    return this.status === DebtStatus.ACTIVE
  }

  get isSettled(): boolean {
    return this.status === DebtStatus.SETTLED
  }

  get remainingAmount(): number {
    if (!this.transactions) return this.totalAmount
    const paidAmount = this.transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    return this.totalAmount - paidAmount
  }
}

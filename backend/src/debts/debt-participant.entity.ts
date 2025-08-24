import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../auth/user.entity'
import { Debt } from './debt.entity'

export enum ParticipantRole {
  DEBTOR = 'debtor',
  CREDITOR = 'creditor',
  WITNESS = 'witness'
}

@Entity('debt_participants')
@Index(['debtId', 'userId'], { unique: true })
@Index(['debtId'])
@Index(['userId'])
@Index(['role'])
export class DebtParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  debtId: string

  @Column({ type: 'uuid' })
  userId: string

  @Column({ type: 'enum', enum: ParticipantRole, default: ParticipantRole.DEBTOR })
  role: ParticipantRole

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shareAmount: number

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number

  @Column({ type: 'boolean', default: false })
  isConfirmed: boolean

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    notes?: string
    paymentMethod?: string
    paymentReference?: string
  }

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  // Relations
  @ManyToOne(() => Debt, debt => debt.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'debtId' })
  debt: Debt

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'userId' })
  user: User

  // Computed properties
  get remainingAmount(): number {
    return this.shareAmount - this.paidAmount
  }

  get isFullyPaid(): boolean {
    return this.paidAmount >= this.shareAmount
  }

  get paymentPercentage(): number {
    if (this.shareAmount === 0) return 0
    return Math.min((this.paidAmount / this.shareAmount) * 100, 100)
  }
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm'
import { Exclude } from 'class-transformer'
import * as bcrypt from 'bcrypt'

@Entity('users')
@Index(['mobile'], { unique: true })
@Index(['nationalId'], { unique: true })
@Index(['email'], { unique: true, where: '"email" IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 20, unique: true })
  mobile: string

  @Column({ type: 'varchar', length: 10, unique: true, nullable: true })
  nationalId: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string

  @Column({ type: 'date', nullable: true })
  birthDate: Date

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: 'male' | 'female' | 'other'

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  province: string

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: 'user' | 'premium' | 'admin'

  @Column({ type: 'boolean', default: false })
  isVerified: boolean

  @Column({ type: 'boolean', default: false })
  isActive: boolean

  @Column({ type: 'boolean', default: false })
  isLocked: boolean

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp: string

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    language: 'fa' | 'en'
    theme: 'light' | 'dark'
    notifications: {
      sms: boolean
      email: boolean
      push: boolean
    }
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends'
      showBalance: boolean
    }
  }

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    registrationSource: 'mobile' | 'web' | 'admin'
    referralCode?: string
    deviceInfo?: any
  }

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date

  // Relations for debts - temporarily commented out to fix TypeScript errors
  // @OneToMany(() => import('../debts/debt.entity').then(m => m.Debt), debt => debt.creator)
  // debts: any[]

  // @OneToMany(() => import('../debts/debt-participant.entity').then(m => m.DebtParticipant), participant => participant.user)
  // debtParticipants: any[]

  // @OneToMany(() => import('../debts/debt-transaction.entity').then(m => m.DebtTransaction), transaction => transaction.payer)
  // paidTransactions: any[]

  // @OneToMany(() => import('../debts/debt-transaction.entity').then(m => m.DebtTransaction), transaction => transaction.payee)
  // receivedTransactions: any[]

  // Relations for groups - temporarily commented out to fix TypeScript errors
  // @OneToMany(() => import('../groups/group.entity').then(m => m.Group), group => group.creator)
  // createdGroups: any[]

  // @OneToMany(() => import('../groups/group-member.entity').then(m => m.GroupMember), member => member.user)
  // groupMemberships: any[]

  // @OneToMany(() => import('../groups/group-invitation.entity').then(m => m.GroupInvitation), invitation => invitation.inviter)
  // sentInvitations: any[]

  // Relations for notifications - temporarily commented out to fix TypeScript errors
  // @OneToMany(() => import('../notifications/notification.entity').then(m => m.Notification), notification => notification.user)
  // notifications: any[]

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 12)
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }

  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim()
  }

  get isComplete(): boolean {
    return !!(this.firstName && this.lastName && this.nationalId)
  }
} 
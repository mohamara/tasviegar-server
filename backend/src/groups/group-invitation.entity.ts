import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../auth/user.entity'
import { Group } from './group.entity'

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum InvitationType {
  MOBILE = 'mobile',
  EMAIL = 'email',
  CODE = 'code'
}

@Entity('group_invitations')
@Index(['groupId'])
@Index(['invitedBy'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class GroupInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  groupId: string

  @Column({ type: 'uuid' })
  invitedBy: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string

  @Column({ type: 'varchar', length: 10, nullable: true })
  inviteCode: string

  @Column({ type: 'enum', enum: InvitationType })
  type: InvitationType

  @Column({ type: 'enum', enum: InvitationStatus, default: InvitationStatus.PENDING })
  status: InvitationStatus

  @Column({ type: 'text', nullable: true })
  message: string

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    deviceInfo?: any
    ipAddress?: string
    userAgent?: string
    notes?: string
  }

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  // Relations
  @ManyToOne(() => Group, group => group.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group

  @ManyToOne(() => User, user => user.sentInvitations)
  @JoinColumn({ name: 'invitedBy' })
  inviter: User

  // Computed properties
  get isPending(): boolean {
    return this.status === InvitationStatus.PENDING
  }

  get isExpired(): boolean {
    return this.expiresAt && new Date() > this.expiresAt
  }

  get isActive(): boolean {
    return this.isPending && !this.isExpired
  }

  get inviteTarget(): string {
    return this.mobile || this.email || this.inviteCode
  }

  get expiresInHours(): number {
    if (!this.expiresAt) return 0
    const now = new Date()
    const diff = this.expiresAt.getTime() - now.getTime()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)))
  }
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../auth/user.entity'

export enum NotificationType {
  DEBT_CREATED = 'debt_created',
  DEBT_UPDATED = 'debt_updated',
  DEBT_SETTLED = 'debt_settled',
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_COMPLETED = 'transaction_completed',
  GROUP_INVITATION = 'group_invitation',
  GROUP_JOINED = 'group_joined',
  PAYMENT_REMINDER = 'payment_reminder',
  SYSTEM_MESSAGE = 'system_message'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  FAILED = 'failed'
}

@Entity('notifications')
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['priority'])
@Index(['createdAt'])
@Index(['userId', 'status'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  userId: string

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.NORMAL })
  priority: NotificationPriority

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text' })
  message: string

  @Column({ type: 'jsonb', nullable: true })
  data: {
    debtId?: string
    transactionId?: string
    groupId?: string
    amount?: number
    senderId?: string
    actionUrl?: string
    [key: string]: any
  }

  @Column({ type: 'jsonb', nullable: true })
  channels: {
    inApp: boolean
    email: boolean
    sms: boolean
    push: boolean
  }

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    templateId?: string
    retryCount?: number
    errorMessage?: string
    deviceInfo?: any
  }

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  // Relations
  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'userId' })
  user: User

  // Computed properties
  get isRead(): boolean {
    return this.status === NotificationStatus.READ
  }

  get isPending(): boolean {
    return this.status === NotificationStatus.PENDING
  }

  get isExpired(): boolean {
    return this.expiresAt && new Date() > this.expiresAt
  }

  get isUrgent(): boolean {
    return this.priority === NotificationPriority.URGENT
  }
}

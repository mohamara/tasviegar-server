import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { NotificationType, NotificationPriority } from './notification.entity'

@Entity('notification_templates')
@Index(['type'])
@Index(['language'])
@Index(['isActive'])
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType

  @Column({ type: 'varchar', length: 10, default: 'fa' })
  language: string

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text' })
  message: string

  @Column({ type: 'enum', enum: NotificationPriority, default: 'normal' })
  priority: NotificationPriority

  @Column({ type: 'jsonb', nullable: true })
  variables: {
    [key: string]: {
      type: 'string' | 'number' | 'date' | 'boolean'
      required: boolean
      defaultValue?: any
      description: string
    }
  }

  @Column({ type: 'jsonb', nullable: true })
  channels: {
    inApp: boolean
    email: boolean
    sms: boolean
    push: boolean
  }

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    category?: string
    tags?: string[]
    version?: string
    author?: string
    notes?: string
  }

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'int', default: 0 })
  usageCount: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  // Computed properties
  get hasVariables(): boolean {
    return this.variables && Object.keys(this.variables).length > 0
  }

  get isMultilingual(): boolean {
    return this.language !== 'fa'
  }

  get isHighPriority(): boolean {
    return this.priority === 'high' || this.priority === 'urgent'
  }
}

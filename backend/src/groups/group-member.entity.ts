import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../auth/user.entity'
import { Group } from './group.entity'

export enum MemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
  GUEST = 'guest'
}

export enum MemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  LEFT = 'left'
}

@Entity('group_members')
@Index(['groupId', 'userId'], { unique: true })
@Index(['groupId'])
@Index(['userId'])
@Index(['role'])
@Index(['status'])
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  groupId: string

  @Column({ type: 'uuid' })
  userId: string

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.PENDING })
  status: MemberStatus

  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'timestamp', nullable: true })
  joinedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    inviteMethod?: 'direct' | 'invitation' | 'code'
    invitedBy?: string
    permissions?: {
      canInvite: boolean
      canRemoveMembers: boolean
      canEditGroup: boolean
      canCreateDebts: boolean
    }
  }

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  // Relations
  @ManyToOne(() => Group, group => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group

  @ManyToOne(() => User, user => user.groupMemberships)
  @JoinColumn({ name: 'userId' })
  user: User

  // Computed properties
  get isActive(): boolean {
    return this.status === MemberStatus.ACTIVE
  }

  get isAdmin(): boolean {
    return this.role === MemberRole.ADMIN
  }

  get isModerator(): boolean {
    return this.role === MemberRole.MODERATOR || this.role === MemberRole.ADMIN
  }

  get canInvite(): boolean {
    return this.metadata?.permissions?.canInvite || this.isModerator
  }

  get canRemoveMembers(): boolean {
    return this.metadata?.permissions?.canRemoveMembers || this.isModerator
  }

  get canEditGroup(): boolean {
    return this.metadata?.permissions?.canEditGroup || this.isModerator
  }

  get canCreateDebts(): boolean {
    return this.metadata?.permissions?.canCreateDebts || this.isModerator
  }
}

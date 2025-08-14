import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { User } from '../auth/user.entity'
import { GroupMember } from './group-member.entity'
import { GroupInvitation } from './group-invitation.entity'

export enum GroupType {
  FAMILY = 'family',
  FRIENDS = 'friends',
  WORK = 'work',
  STUDY = 'study',
  OTHER = 'other'
}

export enum GroupPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  SECRET = 'secret'
}

@Entity('groups')
@Index(['creatorId'])
@Index(['type'])
@Index(['privacy'])
@Index(['createdAt'])
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'enum', enum: GroupType, default: GroupType.OTHER })
  type: GroupType

  @Column({ type: 'enum', enum: GroupPrivacy, default: GroupPrivacy.PRIVATE })
  privacy: GroupPrivacy

  @Column({ type: 'uuid' })
  creatorId: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string

  @Column({ type: 'varchar', length: 10, nullable: true })
  inviteCode: string

  @Column({ type: 'int', default: 0 })
  memberCount: number

  @Column({ type: 'int', default: 50 })
  maxMembers: number

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[]
    location?: string
    website?: string
    rules?: string[]
    settings?: {
      allowMemberInvites: boolean
      requireApproval: boolean
      allowDebtCreation: boolean
    }
  }

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date

  // Relations
  @ManyToOne(() => User, user => user.createdGroups)
  @JoinColumn({ name: 'creatorId' })
  creator: User

  @OneToMany(() => GroupMember, member => member.group)
  members: GroupMember[]

  @OneToMany(() => GroupInvitation, invitation => invitation.group)
  invitations: GroupInvitation[]

  // Computed properties
  get isFull(): boolean {
    return this.memberCount >= this.maxMembers
  }

  get canJoin(): boolean {
    return this.isActive && !this.isFull
  }

  get isPublic(): boolean {
    return this.privacy === GroupPrivacy.PUBLIC
  }
}

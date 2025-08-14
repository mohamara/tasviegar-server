import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Group, GroupType, GroupPrivacy } from './group.entity'
import { GroupMember, MemberRole, MemberStatus } from './group-member.entity'
import { GroupInvitation, InvitationStatus, InvitationType } from './group-invitation.entity'
import { User } from '../auth/user.entity'

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly memberRepository: Repository<GroupMember>,
    @InjectRepository(GroupInvitation)
    private readonly invitationRepository: Repository<GroupInvitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // Create new group
  async createGroup(creatorId: string, groupData: any): Promise<any> {
    const group = this.groupRepository.create({
      ...groupData,
      creatorId,
      inviteCode: this.generateInviteCode(),
      memberCount: 1
    })

    const savedGroup = await this.groupRepository.save(group)

    // Add creator as admin member
    await this.memberRepository.save(
      this.memberRepository.create({
        groupId: savedGroup.id,
        userId: creatorId,
        role: MemberRole.ADMIN,
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
        metadata: {
          inviteMethod: 'direct',
          permissions: {
            canInvite: true,
            canRemoveMembers: true,
            canEditGroup: true,
            canCreateDebts: true
          }
        }
      })
    )

    return this.getGroupById(savedGroup.id, creatorId)
  }

  // Get group by ID
  async getGroupById(groupId: string, userId: string): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user', 'creator']
    })

    if (!group) {
      throw new NotFoundException('گروه یافت نشد.')
    }

    // Check if user has access
    const hasAccess = group.creatorId === userId || 
                     group.members.some(m => m.userId === userId && m.isActive)
    
    if (!hasAccess && group.privacy === GroupPrivacy.PRIVATE) {
      throw new ForbiddenException('شما دسترسی به این گروه ندارید.')
    }

    return this.mapGroupToResponse(group)
  }

  // Get user's groups
  async getUserGroups(userId: string, query: any): Promise<any> {
    const { page = 1, limit = 10, type, privacy } = query
    const offset = (page - 1) * limit

    let queryBuilder = this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'members')
      .leftJoinAndSelect('members.user', 'user')
      .leftJoinAndSelect('group.creator', 'creator')
      .where('(group.creatorId = :userId OR members.userId = :userId)', { userId })

    if (type) {
      queryBuilder = queryBuilder.andWhere('group.type = :type', { type })
    }

    if (privacy) {
      queryBuilder = queryBuilder.andWhere('group.privacy = :privacy', { privacy })
    }

    const [groups, total] = await queryBuilder
      .orderBy('group.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount()

    return {
      groups: groups.map(group => this.mapGroupToResponse(group)),
      total,
      page,
      limit
    }
  }

  // Update group
  async updateGroup(groupId: string, userId: string, updateData: any): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId }
    })

    if (!group) {
      throw new NotFoundException('گروه یافت نشد.')
    }

    const member = await this.memberRepository.findOne({
      where: { groupId, userId }
    })

    if (!member?.canEditGroup && group.creatorId !== userId) {
      throw new ForbiddenException('شما مجوز ویرایش این گروه را ندارید.')
    }

    Object.assign(group, updateData)
    await this.groupRepository.save(group)

    return this.getGroupById(groupId, userId)
  }

  // Delete group
  async deleteGroup(groupId: string, userId: string): Promise<{ message: string }> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId }
    })

    if (!group) {
      throw new NotFoundException('گروه یافت نشد.')
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('فقط ایجادکننده می‌تواند گروه را حذف کند.')
    }

    await this.groupRepository.remove(group)

    return { message: 'گروه با موفقیت حذف شد.' }
  }

  // Invite user to group
  async inviteUser(groupId: string, inviterId: string, inviteData: any): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId }
    })

    if (!group) {
      throw new NotFoundException('گروه یافت نشد.')
    }

    const inviter = await this.memberRepository.findOne({
      where: { groupId, userId: inviterId }
    })

    if (!inviter?.canInvite && group.creatorId !== inviterId) {
      throw new ForbiddenException('شما مجوز دعوت کاربر را ندارید.')
    }

    if (group.isFull) {
      throw new BadRequestException('گروه پر شده است.')
    }

    // Check if user is already a member
    const existingMember = await this.memberRepository.findOne({
      where: { groupId, userId: inviteData.userId }
    })

    if (existingMember) {
      throw new BadRequestException('کاربر قبلاً عضو گروه است.')
    }

    // Create invitation
    const invitation = this.invitationRepository.create({
      groupId,
      invitedBy: inviterId,
      type: InvitationType.MOBILE,
      mobile: inviteData.mobile,
      message: inviteData.message,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      metadata: {
        deviceInfo: inviteData.deviceInfo,
        ipAddress: inviteData.ipAddress
      }
    })

    await this.invitationRepository.save(invitation)

    return { message: 'دعوت‌نامه ارسال شد.' }
  }

  // Accept group invitation
  async acceptInvitation(invitationId: string, userId: string): Promise<any> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['group']
    })

    if (!invitation) {
      throw new NotFoundException('دعوت‌نامه یافت نشد.')
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('دعوت‌نامه قبلاً استفاده شده است.')
    }

    if (invitation.isExpired) {
      throw new BadRequestException('دعوت‌نامه منقضی شده است.')
    }

    // Add user to group
    await this.memberRepository.save(
      this.memberRepository.create({
        groupId: invitation.groupId,
        userId,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
        metadata: {
          inviteMethod: invitation.type,
          invitedBy: invitation.invitedBy
        }
      })
    )

    // Update invitation status
    invitation.status = InvitationStatus.ACCEPTED
    invitation.acceptedAt = new Date()
    await this.invitationRepository.save(invitation)

    // Update group member count
    await this.groupRepository.increment({ id: invitation.groupId }, 'memberCount', 1)

    return { message: 'شما با موفقیت به گروه پیوستید.' }
  }

  // Reject group invitation
  async rejectInvitation(invitationId: string, userId: string): Promise<{ message: string }> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId }
    })

    if (!invitation) {
      throw new NotFoundException('دعوت‌نامه یافت نشد.')
    }

    invitation.status = InvitationStatus.REJECTED
    invitation.rejectedAt = new Date()
    await this.invitationRepository.save(invitation)

    return { message: 'دعوت‌نامه رد شد.' }
  }

  // Remove member from group
  async removeMember(groupId: string, adminId: string, memberId: string): Promise<{ message: string }> {
    const admin = await this.memberRepository.findOne({
      where: { groupId, userId: adminId }
    })

    if (!admin?.canRemoveMembers) {
      throw new ForbiddenException('شما مجوز حذف اعضا را ندارید.')
    }

    const member = await this.memberRepository.findOne({
      where: { groupId, userId: memberId }
    })

    if (!member) {
      throw new NotFoundException('عضو یافت نشد.')
    }

    if (member.isAdmin) {
      throw new BadRequestException('نمی‌توانید مدیر گروه را حذف کنید.')
    }

    member.status = MemberStatus.LEFT
    member.leftAt = new Date()
    await this.memberRepository.save(member)

    // Update group member count
    await this.groupRepository.decrement({ id: groupId }, 'memberCount', 1)

    return { message: 'عضو با موفقیت از گروه حذف شد.' }
  }

  // Get group statistics
  async getGroupStatistics(groupId: string, userId: string): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user']
    })

    if (!group) {
      throw new NotFoundException('گروه یافت نشد.')
    }

    const member = await this.memberRepository.findOne({
      where: { groupId, userId }
    })

    if (!member?.isActive && group.creatorId !== userId) {
      throw new ForbiddenException('شما دسترسی به این گروه ندارید.')
    }

    const activeMembers = group.members.filter(m => m.isActive)
    const pendingMembers = group.members.filter(m => m.status === MemberStatus.PENDING)

    return {
      totalMembers: group.memberCount,
      activeMembers: activeMembers.length,
      pendingMembers: pendingMembers.length,
      maxMembers: group.maxMembers,
      isFull: group.isFull,
      memberRoles: {
        admins: activeMembers.filter(m => m.isAdmin).length,
        moderators: activeMembers.filter(m => m.isModerator).length,
        members: activeMembers.filter(m => !m.isModerator).length
      }
    }
  }

  // Helper methods
  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  private mapGroupToResponse(group: Group): any {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      type: group.type,
      privacy: group.privacy,
      creatorId: group.creatorId,
      avatar: group.avatar,
      inviteCode: group.inviteCode,
      memberCount: group.memberCount,
      maxMembers: group.maxMembers,
      metadata: group.metadata,
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      isFull: group.isFull,
      canJoin: group.canJoin,
      isPublic: group.isPublic,
      creator: {
        id: group.creator?.id,
        firstName: group.creator?.firstName,
        lastName: group.creator?.lastName,
        mobile: group.creator?.mobile,
        avatar: group.creator?.avatar
      },
      members: group.members?.map(member => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        status: member.status,
        nickname: member.nickname,
        joinedAt: member.joinedAt,
        isActive: member.isActive,
        isAdmin: member.isAdmin,
        isModerator: member.isModerator,
        user: {
          id: member.user?.id,
          firstName: member.user?.firstName,
          lastName: member.user?.lastName,
          mobile: member.user?.mobile,
          avatar: member.user?.avatar
        }
      })) || []
    }
  }
}

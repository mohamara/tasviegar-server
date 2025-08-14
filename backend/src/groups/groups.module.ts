import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GroupsController } from './groups.controller'
import { GroupsService } from './groups.service'
import { Group } from './group.entity'
import { GroupMember } from './group-member.entity'
import { GroupInvitation } from './group-invitation.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMember, GroupInvitation])
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService]
})
export class GroupsModule {}

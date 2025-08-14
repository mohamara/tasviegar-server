import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DebtsController } from './debts.controller'
import { DebtsService } from './debts.service'
import { Debt } from './debt.entity'
import { DebtParticipant } from './debt-participant.entity'
import { DebtTransaction } from './debt-transaction.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Debt, DebtParticipant, DebtTransaction])
  ],
  controllers: [DebtsController],
  providers: [DebtsService],
  exports: [DebtsService]
})
export class DebtsModule {}

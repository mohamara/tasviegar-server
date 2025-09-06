import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common'

// In-memory storage for demo
const debts = new Map()
let nextId = 1

@Controller()
export class SimpleController {
  
  @Get('dashboard/stats')
  getDashboardStats() {
    return {
      totalDebts: 5,
      totalCredits: 3,
      pendingSettlements: 2,
      completedSettlements: 8,
      totalAmount: 15000000
    }
  }

  @Get('debts')
  getDebts() {
    return Array.from(debts.values())
  }

  @Post('debts')
  createDebt(@Body() debtData: any) {
    const id = nextId.toString()
    nextId++
    
    const debt = {
      id,
      ...debtData,
      status: 'pending',
      confirmationStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    debts.set(id, debt)
    return debt
  }

  @Get('debts/:id')
  getDebtById(@Param('id') id: string) {
    const debt = debts.get(id)
    if (!debt) {
      return { error: 'Debt not found' }
    }
    return debt
  }

  @Post('debts/:id/confirm')
  confirmDebt(@Param('id') id: string) {
    const debt = debts.get(id)
    if (!debt) {
      return { error: 'Debt not found' }
    }
    
    debt.confirmationStatus = 'confirmed'
    debt.status = 'approved'
    debt.updatedAt = new Date()
    
    debts.set(id, debt)
    return { message: 'Debt confirmed successfully', debt }
  }

  @Post('debts/:id/reject')
  rejectDebt(@Param('id') id: string) {
    const debt = debts.get(id)
    if (!debt) {
      return { error: 'Debt not found' }
    }
    
    debt.confirmationStatus = 'rejected'
    debt.status = 'rejected'
    debt.updatedAt = new Date()
    
    debts.set(id, debt)
    return { message: 'Debt rejected successfully', debt }
  }

  @Put('debts/:id')
  updateDebt(@Param('id') id: string, @Body() updateData: any) {
    const debt = debts.get(id)
    if (!debt) {
      return { error: 'Debt not found' }
    }
    
    Object.assign(debt, updateData)
    debt.updatedAt = new Date()
    
    debts.set(id, debt)
    return debt
  }

  @Delete('debts/:id')
  deleteDebt(@Param('id') id: string) {
    const debt = debts.get(id)
    if (!debt) {
      return { error: 'Debt not found' }
    }
    
    debts.delete(id)
    return { message: 'Debt deleted successfully' }
  }

  @Get('credits')
  getCredits() {
    return [
      {
        id: '1',
        amount: 2000000,
        description: 'پرداخت قسط',
        debtorId: 'user3',
        creditorId: 'user1',
        status: 'settled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  @Get('settlements')
  getSettlements() {
    return [
      {
        id: '1',
        chainId: 'chain1',
        participants: ['user1', 'user2', 'user3'],
        totalAmount: 10000000,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  @Get('groups')
  getGroups() {
    return [
      {
        id: '1',
        name: 'گروه خانواده',
        description: 'گروه خانوادگی',
        members: ['user1', 'user2', 'user3'],
        createdAt: new Date()
      }
    ]
  }

  @Get('notifications')
  getNotifications() {
    return [
      {
        id: '1',
        title: 'بدهی جدید',
        message: 'یک بدهی جدید برای شما ایجاد شده',
        type: 'debt',
        isRead: false,
        createdAt: new Date()
      }
    ]
  }
}

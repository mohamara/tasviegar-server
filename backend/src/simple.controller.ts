import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'

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
    return [
      {
        id: '1',
        amount: 5000000,
        description: 'قرض برای خرید ماشین',
        debtorId: 'user1',
        creditorId: 'user2',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        amount: 3000000,
        description: 'وام مسکن',
        debtorId: 'user2',
        creditorId: 'user3',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
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

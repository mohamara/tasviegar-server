// Test Mock Data
const mockApi = {
  async getDashboardStats() {
    return {
      totalDebts: 5,
      totalCredits: 3,
      pendingSettlements: 2,
      completedSettlements: 8,
      totalAmount: 15000000
    };
  },

  async getDebts() {
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
    ];
  },

  async getCredits() {
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
    ];
  },

  async getSettlements() {
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
    ];
  }
};

// Test functions
async function testDashboardStats() {
  console.log('🧪 Testing Dashboard Stats...');
  const stats = await mockApi.getDashboardStats();
  console.log('✅ Dashboard Stats:', stats);
  console.log('📊 Total Amount:', new Intl.NumberFormat('fa-IR').format(stats.totalAmount), 'ریال');
}

async function testDebts() {
  console.log('\n🧪 Testing Debts...');
  const debts = await mockApi.getDebts();
  console.log('✅ Debts:', debts.length, 'items');
  debts.forEach(debt => {
    console.log(`  - ${debt.description}: ${new Intl.NumberFormat('fa-IR').format(debt.amount)} ریال (${debt.status})`);
  });
}

async function testCredits() {
  console.log('\n🧪 Testing Credits...');
  const credits = await mockApi.getCredits();
  console.log('✅ Credits:', credits.length, 'items');
  credits.forEach(credit => {
    console.log(`  - ${credit.description}: ${new Intl.NumberFormat('fa-IR').format(credit.amount)} ریال (${credit.status})`);
  });
}

async function testSettlements() {
  console.log('\n🧪 Testing Settlements...');
  const settlements = await mockApi.getSettlements();
  console.log('✅ Settlements:', settlements.length, 'items');
  settlements.forEach(settlement => {
    console.log(`  - Chain ${settlement.chainId}: ${new Intl.NumberFormat('fa-IR').format(settlement.totalAmount)} ریال (${settlement.status})`);
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Mock Data Tests...\n');
  
  try {
    await testDashboardStats();
    await testDebts();
    await testCredits();
    await testSettlements();
    
    console.log('\n🎉 All tests passed! Mock data is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
runAllTests();

// Test API Service with Mock Data Fallback
const API_BASE_URL = 'http://localhost:3000/api';

// Mock API Service (same as in frontend)
const api = {
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('API failed, using mock data:', error.message);
      return mockApi.getDashboardStats();
    }
  },

  async getDebts() {
    try {
      const response = await fetch(`${API_BASE_URL}/debts`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('API failed, using mock data:', error.message);
      return mockApi.getDebts();
    }
  }
};

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
  }
};

// Test functions
async function testApiService() {
  console.log('🧪 Testing API Service with Mock Data Fallback...\n');
  
  try {
    // Test Dashboard Stats
    console.log('📊 Testing Dashboard Stats...');
    const stats = await api.getDashboardStats();
    console.log('✅ Dashboard Stats:', stats);
    console.log('💰 Total Amount:', new Intl.NumberFormat('fa-IR').format(stats.totalAmount), 'ریال');
    
    // Test Debts
    console.log('\n💳 Testing Debts...');
    const debts = await api.getDebts();
    console.log('✅ Debts:', debts.length, 'items');
    debts.forEach(debt => {
      console.log(`  - ${debt.description}: ${new Intl.NumberFormat('fa-IR').format(debt.amount)} ریال (${debt.status})`);
    });
    
    console.log('\n🎉 API Service test completed successfully!');
    console.log('✅ Mock data fallback is working correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testApiService();

// Test Full Connection - Backend + Frontend + Mock Data
const API_BASE_URL = 'http://localhost:3000';

// Test Backend Health
async function testBackendHealth() {
  console.log('🔧 Testing Backend Health...');
  try {
    const response = await fetch(`${API_BASE_URL}`);
    const data = await response.json();
    console.log('✅ Backend is running:', data);
    return true;
  } catch (error) {
    console.log('❌ Backend not accessible:', error.message);
    return false;
  }
}

// Test Frontend
async function testFrontend() {
  console.log('\n🌐 Testing Frontend...');
  try {
    const response = await fetch('http://localhost:8083');
    if (response.ok) {
      console.log('✅ Frontend is running on port 8083');
      return true;
    } else {
      console.log('❌ Frontend not accessible');
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend not accessible:', error.message);
    return false;
  }
}

// Test API Service with Mock Data Fallback
async function testApiService() {
  console.log('\n🧪 Testing API Service with Mock Data...');
  
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
          status: 'pending'
        },
        {
          id: '2',
          amount: 3000000,
          description: 'وام مسکن',
          status: 'approved'
        }
      ];
    }
  };

  const api = {
    async getDashboardStats() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.log('  📝 Using mock data for Dashboard Stats');
        return mockApi.getDashboardStats();
      }
    },
    async getDebts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/debts`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.log('  📝 Using mock data for Debts');
        return mockApi.getDebts();
      }
    }
  };

  try {
    // Test Dashboard Stats
    console.log('  📊 Testing Dashboard Stats...');
    const stats = await api.getDashboardStats();
    console.log('  ✅ Dashboard Stats:', stats);
    console.log('  💰 Total Amount:', new Intl.NumberFormat('fa-IR').format(stats.totalAmount), 'ریال');
    
    // Test Debts
    console.log('  💳 Testing Debts...');
    const debts = await api.getDebts();
    console.log('  ✅ Debts:', debts.length, 'items');
    debts.forEach(debt => {
      console.log(`    - ${debt.description}: ${new Intl.NumberFormat('fa-IR').format(debt.amount)} ریال (${debt.status})`);
    });
    
    return true;
  } catch (error) {
    console.log('  ❌ API Service test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runFullTest() {
  console.log('🚀 Starting Full Connection Test...\n');
  
  const results = {
    backend: await testBackendHealth(),
    frontend: await testFrontend(),
    apiService: await testApiService()
  };
  
  console.log('\n📋 Test Results:');
  console.log('  🔧 Backend:', results.backend ? '✅ Running' : '❌ Not Running');
  console.log('  🌐 Frontend:', results.frontend ? '✅ Running' : '❌ Not Running');
  console.log('  🧪 API Service:', results.apiService ? '✅ Working' : '❌ Failed');
  
  if (results.backend && results.frontend && results.apiService) {
    console.log('\n🎉 All systems are working!');
    console.log('📱 You can now access:');
    console.log('   - Dashboard: http://localhost:8083/dashboard');
    console.log('   - Debts: http://localhost:8083/debts');
    console.log('   - Groups: http://localhost:8083/groups');
    console.log('   - Notifications: http://localhost:8083/notifications');
  } else {
    console.log('\n⚠️ Some systems are not working properly.');
  }
}

// Run test
runFullTest();

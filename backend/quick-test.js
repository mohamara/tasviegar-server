#!/usr/bin/env node

/**
 * Quick Test Script for Tasviegar Backend
 * این اسکریپت برای تست سریع API های سیستم طراحی شده است
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let userId = '';

// Test data
const testUser = {
  mobile: '09123456789',
  password: 'password123'
};

const testDebt = {
  title: 'خرید ناهار گروهی',
  description: 'ناهار گروهی در رستوران',
  totalAmount: 500000,
  type: 'group_expense',
  currency: 'IRR',
  participants: [
    {
      userId: 'test-user-1',
      shareAmount: 200000,
      role: 'debtor'
    },
    {
      userId: 'test-user-2',
      shareAmount: 150000,
      role: 'debtor'
    },
    {
      userId: 'test-user-3',
      shareAmount: 150000,
      role: 'debtor'
    }
  ]
};

const testGroup = {
  name: 'گروه خانواده',
  description: 'گروه خانوادگی ما',
  type: 'family',
  privacy: 'private',
  maxMembers: 20
};

// Utility functions
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logError = (message, error = null) => {
  console.log(`\n❌ ${message}`);
  if (error) {
    console.log(error.response?.data || error.message);
  }
};

const logSuccess = (message, data = null) => {
  console.log(`\n✅ ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Test functions
async function testHealthCheck() {
  try {
    log('Testing Health Check...');
    const response = await axios.get(`${BASE_URL}/health`);
    logSuccess('Health Check passed', response.data);
    return true;
  } catch (error) {
    logError('Health Check failed', error);
    return false;
  }
}

async function testDatabaseConnection() {
  try {
    log('Testing Database Connection...');
    const response = await axios.get(`${BASE_URL}/health/database`);
    logSuccess('Database connection successful', response.data);
    return true;
  } catch (error) {
    logError('Database connection failed', error);
    return false;
  }
}

async function testUserRegistration() {
  try {
    log('Testing User Registration...');
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    logSuccess('User registration successful', response.data);
    userId = response.data.userId;
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      logSuccess('User already exists, continuing...');
      return true;
    }
    logError('User registration failed', error);
    return false;
  }
}

async function testUserLogin() {
  try {
    log('Testing User Login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    logSuccess('User login successful', response.data);
    authToken = response.data.accessToken;
    return true;
  } catch (error) {
    logError('User login failed', error);
    return false;
  }
}

async function testCreateDebt() {
  try {
    log('Testing Debt Creation...');
    const response = await axios.post(`${BASE_URL}/debts`, testDebt, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Debt creation successful', response.data);
    return response.data.id;
  } catch (error) {
    logError('Debt creation failed', error);
    return null;
  }
}

async function testGetDebts() {
  try {
    log('Testing Get Debts...');
    const response = await axios.get(`${BASE_URL}/debts?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Get debts successful', response.data);
    return true;
  } catch (error) {
    logError('Get debts failed', error);
    return false;
  }
}

async function testGetDebtStatistics() {
  try {
    log('Testing Get Debt Statistics...');
    const response = await axios.get(`${BASE_URL}/debts/statistics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Get debt statistics successful', response.data);
    return true;
  } catch (error) {
    logError('Get debt statistics failed', error);
    return false;
  }
}

async function testCreateGroup() {
  try {
    log('Testing Group Creation...');
    const response = await axios.post(`${BASE_URL}/groups`, testGroup, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Group creation successful', response.data);
    return response.data.id;
  } catch (error) {
    logError('Group creation failed', error);
    return null;
  }
}

async function testGetGroups() {
  try {
    log('Testing Get Groups...');
    const response = await axios.get(`${BASE_URL}/groups?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Get groups successful', response.data);
    return true;
  } catch (error) {
    logError('Get groups failed', error);
    return false;
  }
}

async function testSwaggerDocumentation() {
  try {
    log('Testing Swagger Documentation...');
    const response = await axios.get('http://localhost:3000/api/docs');
    logSuccess('Swagger documentation accessible', { status: response.status });
    return true;
  } catch (error) {
    logError('Swagger documentation not accessible', error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Tasviegar Backend Tests...\n');
  
  const results = {
    healthCheck: false,
    databaseConnection: false,
    userRegistration: false,
    userLogin: false,
    debtCreation: false,
    getDebts: false,
    debtStatistics: false,
    groupCreation: false,
    getGroups: false,
    swaggerDocs: false
  };

  // Basic health checks
  results.healthCheck = await testHealthCheck();
  results.databaseConnection = await testDatabaseConnection();
  
  if (!results.healthCheck || !results.databaseConnection) {
    logError('❌ Basic health checks failed. Please check if the server is running.');
    return;
  }

  // User management tests
  results.userRegistration = await testUserRegistration();
  results.userLogin = await testUserLogin();
  
  if (!results.userLogin) {
    logError('❌ User authentication failed. Cannot proceed with other tests.');
    return;
  }

  // Debt management tests
  const debtId = await testCreateDebt();
  results.debtCreation = !!debtId;
  results.getDebts = await testGetDebts();
  results.debtStatistics = await testGetDebtStatistics();

  // Group management tests
  const groupId = await testCreateGroup();
  results.groupCreation = !!groupId;
  results.getGroups = await testGetGroups();

  // Documentation test
  results.swaggerDocs = await testSwaggerDocumentation();

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${test}: ${status}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! System is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the logs above.');
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testDatabaseConnection,
  testUserRegistration,
  testUserLogin,
  testCreateDebt,
  testGetDebts,
  testGetDebtStatistics,
  testCreateGroup,
  testGetGroups,
  testSwaggerDocumentation
};

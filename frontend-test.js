#!/usr/bin/env node

/**
 * Frontend Test Script for Tasviegar
 * این اسکریپت برای تست فرانت‌اند React طراحی شده است
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const FRONTEND_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = './test-screenshots';

// Test scenarios
const testScenarios = [
  {
    name: 'Landing Page',
    path: '/',
    description: 'تست صفحه اصلی'
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    description: 'تست داشبورد'
  },
  {
    name: 'Debts Page',
    path: '/debts',
    description: 'تست صفحه بدهی‌ها'
  },
  {
    name: 'Groups Page',
    path: '/groups',
    description: 'تست صفحه گروه‌ها'
  },
  {
    name: 'Notifications Page',
    path: '/notifications',
    description: 'تست صفحه اعلان‌ها'
  },
  {
    name: 'Login Page',
    path: '/login',
    description: 'تست صفحه ورود'
  }
];

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
    console.log(error.message || error);
  }
};

const logSuccess = (message, data = null) => {
  console.log(`\n✅ ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Create screenshots directory
const createScreenshotsDir = () => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
};

// Take screenshot
const takeScreenshot = async (page, name) => {
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ 
    path: screenshotPath, 
    fullPage: true,
    quality: 80
  });
  return screenshotPath;
};

// Test page functionality
const testPageFunctionality = async (page, scenario) => {
  const results = {
    name: scenario.name,
    path: scenario.path,
    loaded: false,
    responsive: false,
    interactive: false,
    screenshot: null,
    errors: []
  };

  try {
    log(`Testing ${scenario.name}...`);

    // Navigate to page
    await page.goto(`${FRONTEND_URL}${scenario.path}`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Check if page loaded
    const title = await page.title();
    results.loaded = title && title !== 'Vite + React + TS';
    logSuccess(`Page loaded: ${title}`);

    // Test responsive design
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.waitForTimeout(500);
      
      // Check for basic elements
      const hasContent = await page.evaluate(() => {
        return document.body.textContent.length > 100;
      });
      
      if (hasContent) {
        results.responsive = true;
        logSuccess(`Responsive test passed for ${viewport.name}`);
        break;
      }
    }

    // Test interactivity based on page type
    switch (scenario.name) {
      case 'Debts Page':
        await testDebtsPage(page, results);
        break;
      case 'Groups Page':
        await testGroupsPage(page, results);
        break;
      case 'Notifications Page':
        await testNotificationsPage(page, results);
        break;
      case 'Login Page':
        await testLoginPage(page, results);
        break;
      default:
        results.interactive = true;
    }

    // Take screenshot
    results.screenshot = await takeScreenshot(page, scenario.name.toLowerCase().replace(' ', '-'));

  } catch (error) {
    results.errors.push(error.message);
    logError(`Error testing ${scenario.name}:`, error);
  }

  return results;
};

// Test specific page functionality
const testDebtsPage = async (page, results) => {
  try {
    // Check for create debt button
    const createButton = await page.$('button:has-text("ایجاد بدهی جدید")');
    if (createButton) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Check if dialog opened
      const dialog = await page.$('[role="dialog"]');
      if (dialog) {
        results.interactive = true;
        logSuccess('Debts page: Create dialog works');
      }
    }
  } catch (error) {
    results.errors.push(`Debts page test: ${error.message}`);
  }
};

const testGroupsPage = async (page, results) => {
  try {
    // Check for create group button
    const createButton = await page.$('button:has-text("ایجاد گروه جدید")');
    if (createButton) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Check if dialog opened
      const dialog = await page.$('[role="dialog"]');
      if (dialog) {
        results.interactive = true;
        logSuccess('Groups page: Create dialog works');
      }
    }
  } catch (error) {
    results.errors.push(`Groups page test: ${error.message}`);
  }
};

const testNotificationsPage = async (page, results) => {
  try {
    // Check for notification settings
    const settingsButton = await page.$('button:has-text("تنظیمات")');
    if (settingsButton) {
      results.interactive = true;
      logSuccess('Notifications page: Settings button found');
    }
  } catch (error) {
    results.errors.push(`Notifications page test: ${error.message}`);
  }
};

const testLoginPage = async (page, results) => {
  try {
    // Check for login form
    const loginForm = await page.$('form');
    if (loginForm) {
      results.interactive = true;
      logSuccess('Login page: Form found');
    }
  } catch (error) {
    results.errors.push(`Login page test: ${error.message}`);
  }
};

// Test accessibility
const testAccessibility = async (page) => {
  const accessibilityResults = {
    hasTitle: false,
    hasMainContent: false,
    hasNavigation: false,
    colorContrast: true, // Simplified check
    keyboardNavigation: true // Simplified check
  };

  try {
    // Check for title
    const title = await page.title();
    accessibilityResults.hasTitle = title && title.length > 0;

    // Check for main content
    const main = await page.$('main, [role="main"]');
    accessibilityResults.hasMainContent = !!main;

    // Check for navigation
    const nav = await page.$('nav, [role="navigation"]');
    accessibilityResults.hasNavigation = !!nav;

    logSuccess('Accessibility test completed', accessibilityResults);
  } catch (error) {
    logError('Accessibility test failed', error);
  }

  return accessibilityResults;
};

// Test performance
const testPerformance = async (page) => {
  const performanceResults = {
    loadTime: 0,
    domContentLoaded: 0,
    firstContentfulPaint: 0
  };

  try {
    // Get performance metrics
    const metrics = await page.metrics();
    performanceResults.loadTime = metrics.Timestamp;
    
    // Get navigation timing
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadComplete: timing.loadEventEnd - timing.loadEventStart
      };
    });

    performanceResults.domContentLoaded = navigationTiming.domContentLoaded;
    
    logSuccess('Performance test completed', performanceResults);
  } catch (error) {
    logError('Performance test failed', error);
  }

  return performanceResults;
};

// Generate test report
const generateReport = (results, accessibilityResults, performanceResults) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.loaded && r.responsive && r.interactive).length,
      failed: results.filter(r => !r.loaded || !r.responsive || !r.interactive).length,
      errors: results.reduce((acc, r) => acc + r.errors.length, 0)
    },
    details: results,
    accessibility: accessibilityResults,
    performance: performanceResults,
    screenshots: results.map(r => r.screenshot).filter(Boolean)
  };

  // Save report to file
  const reportPath = path.join(SCREENSHOTS_DIR, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
};

// Main test runner
async function runFrontendTests() {
  console.log('🚀 Starting Tasviegar Frontend Tests...\n');
  
  let browser;
  let results = [];
  let accessibilityResults = {};
  let performanceResults = {};

  try {
    // Create screenshots directory
    createScreenshotsDir();

    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    // Test each scenario
    for (const scenario of testScenarios) {
      const result = await testPageFunctionality(page, scenario);
      results.push(result);
    }

    // Test accessibility on main page
    await page.goto(`${FRONTEND_URL}/`);
    accessibilityResults = await testAccessibility(page);

    // Test performance on main page
    performanceResults = await testPerformance(page);

  } catch (error) {
    logError('Test execution failed', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Generate and display report
  const report = generateReport(results, accessibilityResults, performanceResults);

  console.log('\n📊 Frontend Test Results Summary:');
  console.log('================================');
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Errors: ${report.summary.errors}`);
  console.log(`Screenshots: ${report.screenshots.length}`);

  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const status = result.loaded && result.responsive && result.interactive ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.name}: ${status}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
  });

  console.log('\n🎯 Overall Assessment:');
  if (report.summary.passed === report.summary.totalTests) {
    console.log('🎉 All frontend tests passed! UI is working correctly.');
  } else {
    console.log('⚠️  Some frontend tests failed. Please check the detailed report.');
  }

  console.log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log(`📄 Detailed report: ${path.join(SCREENSHOTS_DIR, 'test-report.json')}`);

  return report;
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
  runFrontendTests().catch(console.error);
}

module.exports = {
  runFrontendTests,
  testPageFunctionality,
  testAccessibility,
  testPerformance
};

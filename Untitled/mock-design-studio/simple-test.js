#!/usr/bin/env node

/**
 * Simple Frontend Test Script for Tasviegar
 * این اسکریپت برای تست ساده فرانت‌اند React طراحی شده است
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const FRONTEND_DIR = './src';
const PAGES_DIR = './src/pages';
const COMPONENTS_DIR = './src/components';

// Test scenarios
const testScenarios = [
  {
    name: 'Pages Structure',
    description: 'بررسی ساختار صفحات',
    test: testPagesStructure
  },
  {
    name: 'Components Structure',
    description: 'بررسی ساختار کامپوننت‌ها',
    test: testComponentsStructure
  },
  {
    name: 'File Dependencies',
    description: 'بررسی وابستگی‌های فایل‌ها',
    test: testFileDependencies
  },
  {
    name: 'Package Dependencies',
    description: 'بررسی وابستگی‌های پکیج',
    test: testPackageDependencies
  },
  {
    name: 'TypeScript Configuration',
    description: 'بررسی تنظیمات TypeScript',
    test: testTypeScriptConfig
  },
  {
    name: 'Build Configuration',
    description: 'بررسی تنظیمات Build',
    test: testBuildConfig
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

// Check if file exists
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Check if directory exists
const dirExists = (dirPath) => {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
};

// Read file content
const readFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
};

// Get all files in directory
const getFilesInDir = (dirPath, extension = null) => {
  if (!dirExists(dirPath)) return [];
  
  try {
    const files = fs.readdirSync(dirPath);
    if (extension) {
      return files.filter(file => file.endsWith(extension));
    }
    return files;
  } catch (error) {
    return [];
  }
};

// Test pages structure
const testPagesStructure = () => {
  const results = {
    passed: false,
    details: {},
    errors: []
  };

  try {
    log('Testing pages structure...');

    // Check if pages directory exists
    if (!dirExists(PAGES_DIR)) {
      results.errors.push('Pages directory does not exist');
      return results;
    }

    // Get all page files
    const pageFiles = getFilesInDir(PAGES_DIR, '.tsx');
    const expectedPages = ['Debts.tsx', 'Groups.tsx', 'Notifications.tsx'];
    
    results.details.totalPages = pageFiles.length;
    results.details.expectedPages = expectedPages;
    results.details.foundPages = pageFiles;

    // Check for required pages
    const missingPages = expectedPages.filter(page => !pageFiles.includes(page));
    if (missingPages.length > 0) {
      results.errors.push(`Missing pages: ${missingPages.join(', ')}`);
    }

    // Check page content
    pageFiles.forEach(pageFile => {
      const pagePath = path.join(PAGES_DIR, pageFile);
      const content = readFile(pagePath);
      
      if (content) {
        // Check for React import
        if (!content.includes('import React')) {
          results.errors.push(`${pageFile}: Missing React import`);
        }
        
        // Check for export default
        if (!content.includes('export default')) {
          results.errors.push(`${pageFile}: Missing default export`);
        }
        
        // Check for component structure
        if (!content.includes('function') && !content.includes('const')) {
          results.errors.push(`${pageFile}: Missing component definition`);
        }
      } else {
        results.errors.push(`${pageFile}: Could not read file`);
      }
    });

    results.passed = results.errors.length === 0;
    logSuccess('Pages structure test completed', results.details);

  } catch (error) {
    results.errors.push(error.message);
    logError('Pages structure test failed', error);
  }

  return results;
};

// Test components structure
const testComponentsStructure = () => {
  const results = {
    passed: false,
    details: {},
    errors: []
  };

  try {
    log('Testing components structure...');

    // Check if components directory exists
    if (!dirExists(COMPONENTS_DIR)) {
      results.errors.push('Components directory does not exist');
      return results;
    }

    // Get all component files
    const componentFiles = getFilesInDir(COMPONENTS_DIR, '.tsx');
    const uiComponentFiles = getFilesInDir(path.join(COMPONENTS_DIR, 'ui'), '.tsx');
    
    results.details.totalComponents = componentFiles.length;
    results.details.uiComponents = uiComponentFiles.length;

    // Check for essential UI components
    const essentialComponents = [
      'button.tsx', 'card.tsx', 'input.tsx', 'dialog.tsx', 
      'badge.tsx', 'avatar.tsx', 'tabs.tsx', 'select.tsx'
    ];

    const missingComponents = essentialComponents.filter(comp => 
      !uiComponentFiles.includes(comp)
    );

    if (missingComponents.length > 0) {
      results.errors.push(`Missing UI components: ${missingComponents.join(', ')}`);
    }

    results.passed = results.errors.length === 0;
    logSuccess('Components structure test completed', results.details);

  } catch (error) {
    results.errors.push(error.message);
    logError('Components structure test failed', error);
  }

  return results;
};

// Test file dependencies
const testFileDependencies = () => {
  const results = {
    passed: false,
    details: {},
    errors: []
  };

  try {
    log('Testing file dependencies...');

    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.ts',
      'src/main.tsx',
      'src/App.tsx',
      'src/index.css'
    ];

    results.details.checkedFiles = requiredFiles;
    results.details.existingFiles = [];

    requiredFiles.forEach(file => {
      if (fileExists(file)) {
        results.details.existingFiles.push(file);
      } else {
        results.errors.push(`Missing file: ${file}`);
      }
    });

    results.passed = results.errors.length === 0;
    logSuccess('File dependencies test completed', results.details);

  } catch (error) {
    results.errors.push(error.message);
    logError('File dependencies test failed', error);
  }

  return results;
};

// Test package dependencies
const testPackageDependencies = () => {
  const results = {
    passed: false,
    details: {},
    errors: []
  };

  try {
    log('Testing package dependencies...');

    const packagePath = './package.json';
    if (!fileExists(packagePath)) {
      results.errors.push('package.json not found');
      return results;
    }

    const packageContent = readFile(packagePath);
    if (!packageContent) {
      results.errors.push('Could not read package.json');
      return results;
    }

    const packageJson = JSON.parse(packageContent);
    
    // Check for required dependencies
    const requiredDeps = [
      'react', 'react-dom', 'react-router-dom',
      '@radix-ui/react-dialog', '@radix-ui/react-button',
      'lucide-react', 'class-variance-authority'
    ];

    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
    );

    if (missingDeps.length > 0) {
      results.errors.push(`Missing dependencies: ${missingDeps.join(', ')}`);
    }

    results.details.totalDependencies = Object.keys(packageJson.dependencies || {}).length;
    results.details.totalDevDependencies = Object.keys(packageJson.devDependencies || {}).length;
    results.details.checkedDependencies = requiredDeps;

    results.passed = results.errors.length === 0;
    logSuccess('Package dependencies test completed', results.details);

  } catch (error) {
    results.errors.push(error.message);
    logError('Package dependencies test failed', error);
  }

  return results;
};

// Test TypeScript configuration
const testTypeScriptConfig = () => {
  const results = {
    passed: false,
    details: {},
    errors: []
  };

  try {
    log('Testing TypeScript configuration...');

    const tsConfigPath = './tsconfig.json';
    if (!fileExists(tsConfigPath)) {
      results.errors.push('tsconfig.json not found');
      return results;
    }

    const tsConfigContent = readFile(tsConfigPath);
    if (!tsConfigContent) {
      results.errors.push('Could not read tsconfig.json');
      return results;
    }

    const tsConfig = JSON.parse(tsConfigContent);
    
    // Check for required TypeScript settings
    const requiredSettings = {
      'compilerOptions.strict': true,
      'compilerOptions.jsx': 'react-jsx',
      'compilerOptions.moduleResolution': 'bundler'
    };

    Object.entries(requiredSettings).forEach(([setting, expectedValue]) => {
      const keys = setting.split('.');
      let current = tsConfig;
      
      for (const key of keys) {
        current = current?.[key];
        if (current === undefined) break;
      }
      
      if (current !== expectedValue) {
        results.errors.push(`TypeScript setting ${setting} should be ${expectedValue}, got ${current}`);
      }
    });

    results.details.compilerOptions = tsConfig.compilerOptions;
    results.passed = results.errors.length === 0;
    logSuccess('TypeScript configuration test completed', results.details);

  } catch (error) {
    results.errors.push(error.message);
    logError('TypeScript configuration test failed', error);
  }

  return results;
};

// Test build configuration
const testBuildConfig = () => {
  const results = {
    passed: false,
    details: {},
    errors: []
  };

  try {
    log('Testing build configuration...');

    // Check Vite config
    const viteConfigPath = './vite.config.ts';
    if (!fileExists(viteConfigPath)) {
      results.errors.push('vite.config.ts not found');
    } else {
      const viteContent = readFile(viteConfigPath);
      if (viteContent && !viteContent.includes('@vitejs/plugin-react')) {
        results.errors.push('Vite React plugin not configured');
      }
    }

    // Check Tailwind config
    const tailwindConfigPath = './tailwind.config.ts';
    if (!fileExists(tailwindConfigPath)) {
      results.errors.push('tailwind.config.ts not found');
    } else {
      const tailwindContent = readFile(tailwindConfigPath);
      if (tailwindContent && !tailwindContent.includes('content')) {
        results.errors.push('Tailwind content configuration missing');
      }
    }

    // Check package.json scripts
    const packagePath = './package.json';
    if (fileExists(packagePath)) {
      const packageContent = readFile(packagePath);
      if (packageContent) {
        const packageJson = JSON.parse(packageContent);
        const requiredScripts = ['dev', 'build', 'preview'];
        
        const missingScripts = requiredScripts.filter(script => 
          !packageJson.scripts?.[script]
        );

        if (missingScripts.length > 0) {
          results.errors.push(`Missing scripts: ${missingScripts.join(', ')}`);
        }

        results.details.scripts = packageJson.scripts;
      }
    }

    results.passed = results.errors.length === 0;
    logSuccess('Build configuration test completed', results.details);

  } catch (error) {
    results.errors.push(error.message);
    logError('Build configuration test failed', error);
  }

  return results;
};

// Generate test report
const generateReport = (results) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      errors: results.reduce((acc, r) => acc + r.errors.length, 0)
    },
    details: results
  };

  // Save report to file
  const reportPath = './test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
};

// Main test runner
async function runSimpleTests() {
  console.log('🚀 Starting Tasviegar Simple Frontend Tests...\n');
  
  const results = [];

  // Run all test scenarios
  for (const scenario of testScenarios) {
    log(`Running ${scenario.name}: ${scenario.description}`);
    const result = await scenario.test();
    result.name = scenario.name;
    result.description = scenario.description;
    results.push(result);
  }

  // Generate and display report
  const report = generateReport(results);

  console.log('\n📊 Simple Frontend Test Results Summary:');
  console.log('=======================================');
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Errors: ${report.summary.errors}`);

  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.name}: ${status}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
  });

  console.log('\n🎯 Overall Assessment:');
  if (report.summary.passed === report.summary.totalTests) {
    console.log('🎉 All simple frontend tests passed! Project structure is correct.');
  } else {
    console.log('⚠️  Some simple frontend tests failed. Please check the detailed report.');
  }

  console.log(`\n📄 Detailed report: ./test-report.json`);

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
  runSimpleTests().catch(console.error);
}

module.exports = {
  runSimpleTests,
  testPagesStructure,
  testComponentsStructure,
  testFileDependencies,
  testPackageDependencies,
  testTypeScriptConfig,
  testBuildConfig
};

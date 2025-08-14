#!/usr/bin/env node

/**
 * Simple Frontend Test Script for Tasviegar
 * این اسکریپت برای تست ساده فرانت‌اند React طراحی شده است
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Tasviegar Simple Frontend Tests...\n');

// Test results
const results = {
  pagesStructure: { passed: false, errors: [] },
  componentsStructure: { passed: false, errors: [] },
  fileDependencies: { passed: false, errors: [] },
  packageDependencies: { passed: false, errors: [] },
  buildConfig: { passed: false, errors: [] }
};

// Utility functions
const log = (message) => console.log(`🔍 ${message}`);
const logSuccess = (message) => console.log(`✅ ${message}`);
const logError = (message) => console.log(`❌ ${message}`);

// Check if file exists
const fileExists = (filePath) => fs.existsSync(filePath);

// Check if directory exists
const dirExists = (dirPath) => fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();

// Read file content
const readFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
};

// Get files in directory
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

// Test 1: Pages Structure
log('Testing pages structure...');
const pagesDir = './src/pages';
if (dirExists(pagesDir)) {
  const pageFiles = getFilesInDir(pagesDir, '.tsx');
  const expectedPages = ['Debts.tsx', 'Groups.tsx', 'Notifications.tsx'];
  
  console.log(`Found ${pageFiles.length} page files: ${pageFiles.join(', ')}`);
  
  const missingPages = expectedPages.filter(page => !pageFiles.includes(page));
  if (missingPages.length > 0) {
    results.pagesStructure.errors.push(`Missing pages: ${missingPages.join(', ')}`);
  } else {
    results.pagesStructure.passed = true;
    logSuccess('All expected pages found');
  }
} else {
  results.pagesStructure.errors.push('Pages directory does not exist');
}

// Test 2: Components Structure
log('Testing components structure...');
const componentsDir = './src/components';
if (dirExists(componentsDir)) {
  const componentFiles = getFilesInDir(componentsDir, '.tsx');
  const uiComponentFiles = getFilesInDir(path.join(componentsDir, 'ui'), '.tsx');
  
  console.log(`Found ${componentFiles.length} component files`);
  console.log(`Found ${uiComponentFiles.length} UI component files`);
  
  const essentialComponents = ['button.tsx', 'card.tsx', 'input.tsx', 'dialog.tsx'];
  const missingComponents = essentialComponents.filter(comp => !uiComponentFiles.includes(comp));
  
  if (missingComponents.length > 0) {
    results.componentsStructure.errors.push(`Missing UI components: ${missingComponents.join(', ')}`);
  } else {
    results.componentsStructure.passed = true;
    logSuccess('Essential UI components found');
  }
} else {
  results.componentsStructure.errors.push('Components directory does not exist');
}

// Test 3: File Dependencies
log('Testing file dependencies...');
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'src/main.tsx',
  'src/App.tsx'
];

const existingFiles = [];
requiredFiles.forEach(file => {
  if (fileExists(file)) {
    existingFiles.push(file);
  } else {
    results.fileDependencies.errors.push(`Missing file: ${file}`);
  }
});

if (results.fileDependencies.errors.length === 0) {
  results.fileDependencies.passed = true;
  logSuccess(`All required files found (${existingFiles.length}/${requiredFiles.length})`);
} else {
  console.log(`Found ${existingFiles.length}/${requiredFiles.length} required files`);
}

// Test 4: Package Dependencies
log('Testing package dependencies...');
const packagePath = './package.json';
if (fileExists(packagePath)) {
  const packageContent = readFile(packagePath);
  if (packageContent) {
    try {
      const packageJson = JSON.parse(packageContent);
      const requiredDeps = ['react', 'react-dom', 'react-router-dom', 'lucide-react'];
      
      const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );
      
      if (missingDeps.length > 0) {
        results.packageDependencies.errors.push(`Missing dependencies: ${missingDeps.join(', ')}`);
      } else {
        results.packageDependencies.passed = true;
        logSuccess('All required dependencies found');
      }
      
      console.log(`Total dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
      console.log(`Total dev dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
    } catch (error) {
      results.packageDependencies.errors.push('Could not parse package.json');
    }
  } else {
    results.packageDependencies.errors.push('Could not read package.json');
  }
} else {
  results.packageDependencies.errors.push('package.json not found');
}

// Test 5: Build Configuration
log('Testing build configuration...');
const viteConfigPath = './vite.config.ts';
const tailwindConfigPath = './tailwind.config.ts';

if (fileExists(viteConfigPath)) {
  const viteContent = readFile(viteConfigPath);
  if (viteContent && viteContent.includes('@vitejs/plugin-react')) {
    logSuccess('Vite React plugin configured');
  } else {
    results.buildConfig.errors.push('Vite React plugin not configured');
  }
} else {
  results.buildConfig.errors.push('vite.config.ts not found');
}

if (fileExists(tailwindConfigPath)) {
  const tailwindContent = readFile(tailwindConfigPath);
  if (tailwindContent && tailwindContent.includes('content')) {
    logSuccess('Tailwind configuration found');
  } else {
    results.buildConfig.errors.push('Tailwind content configuration missing');
  }
} else {
  results.buildConfig.errors.push('tailwind.config.ts not found');
}

// Check package.json scripts
if (fileExists(packagePath)) {
  const packageContent = readFile(packagePath);
  if (packageContent) {
    try {
      const packageJson = JSON.parse(packageContent);
      const requiredScripts = ['dev', 'build', 'preview'];
      const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script]);
      
      if (missingScripts.length > 0) {
        results.buildConfig.errors.push(`Missing scripts: ${missingScripts.join(', ')}`);
      } else {
        logSuccess('All required scripts found');
      }
    } catch (error) {
      results.buildConfig.errors.push('Could not parse package.json for scripts');
    }
  }
}

if (results.buildConfig.errors.length === 0) {
  results.buildConfig.passed = true;
}

// Generate summary
console.log('\n📊 Test Results Summary:');
console.log('========================');

const allTests = Object.keys(results);
const passedTests = allTests.filter(test => results[test].passed);
const failedTests = allTests.filter(test => !results[test].passed);

console.log(`Total Tests: ${allTests.length}`);
console.log(`Passed: ${passedTests.length}`);
console.log(`Failed: ${failedTests.length}`);

console.log('\n📋 Detailed Results:');
allTests.forEach((test, index) => {
  const status = results[test].passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${index + 1}. ${test}: ${status}`);
  if (results[test].errors.length > 0) {
    console.log(`   Errors: ${results[test].errors.join(', ')}`);
  }
});

console.log('\n🎯 Overall Assessment:');
if (passedTests.length === allTests.length) {
  console.log('🎉 All frontend tests passed! Project structure is correct.');
} else {
  console.log('⚠️  Some frontend tests failed. Please check the errors above.');
}

// Save report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests: allTests.length,
    passed: passedTests.length,
    failed: failedTests.length
  },
  details: results
};

fs.writeFileSync('./test-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed report saved to: ./test-report.json');

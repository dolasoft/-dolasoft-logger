#!/usr/bin/env node

/**
 * Test runner for browser-core bundle
 * This script runs the browser tests and provides a summary
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 DolaSoft Logger Browser Tests');
console.log('==================================');

// Check if dist directory exists
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ Dist directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Check if browser-core files exist
const browserCoreJs = path.join(distPath, 'browser-core.js');
const browserCoreEsm = path.join(distPath, 'browser-core.esm.js');

if (!fs.existsSync(browserCoreJs)) {
  console.log('❌ browser-core.js not found. Please run "npm run build" first.');
  process.exit(1);
}

if (!fs.existsSync(browserCoreEsm)) {
  console.log('❌ browser-core.esm.js not found. Please run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Build files found');

// Run the Node.js test
console.log('\n🔧 Running Node.js tests...');
try {
  const result = execSync('node tests/browser/test-browser-core.mjs', { 
    stdio: 'pipe',
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8'
  });
  console.log(result);
  console.log('✅ Node.js tests passed');
} catch (error) {
  console.log('❌ Node.js tests failed');
  console.log(error.stdout || error.message);
  process.exit(1);
}

// Provide instructions for browser testing
console.log('\n🌐 Browser Testing Instructions');
console.log('================================');
console.log('1. Open tests/browser/test-browser.html in a web browser');
console.log('2. Click the test buttons to run individual tests');
console.log('3. Check the test results in the output area');
console.log('\n📁 Test files location:');
console.log(`   HTML: ${path.join(__dirname, 'browser', 'test-browser.html')}`);
console.log(`   Node.js: ${path.join(__dirname, 'browser', 'test-browser-core.js')}`);

console.log('\n🎉 All automated tests passed!');
console.log('   Run the HTML test in a browser for complete testing.');

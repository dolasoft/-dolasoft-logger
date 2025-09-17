#!/usr/bin/env node

// Simple test runner for development
const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running DolaSoft Logger Tests with Vitest...\n');

try {
  // Run tests
  execSync('npx vitest run', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname)
  });
  
  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('\n❌ Tests failed:', error.message);
  process.exit(1);
}

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version type from command line
const versionType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

console.log(`🚀 Releasing ${versionType} version...`);

try {
  // 1. Run tests
  console.log('🧪 Running tests...');
  execSync('npm run test:run', { stdio: 'inherit' });

  // 2. Build package
  console.log('🔨 Building package...');
  execSync('npm run build:prod', { stdio: 'inherit' });

  // 3. Update version
  console.log(`📦 Updating version (${versionType})...`);
  execSync(`npm version ${versionType}`, { stdio: 'inherit' });

  // 4. Push to GitHub
  console.log('📤 Pushing to GitHub...');
  execSync('git push && git push --tags', { stdio: 'inherit' });

  console.log('✅ Release process completed!');
  console.log('🔗 Check GitHub Actions for automated NPM publishing');

} catch (error) {
  console.error('❌ Release failed:', error.message);
  process.exit(1);
}

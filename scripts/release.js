#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get version type from command line
const versionType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

console.log(`🚀 Releasing ${versionType} version...`);

try {
  // 1. Run all checks (lint, type-check, tests, build)
  console.log('🔍 Running all checks...');
  execSync('npm run check', { stdio: 'inherit' });

  // 2. Update version
  console.log(`📦 Updating version (${versionType})...`);
  execSync(`npm version ${versionType}`, { stdio: 'inherit' });

  // 3. Push to GitHub
  console.log('📤 Pushing to GitHub...');
  execSync('git push && git push --tags', { stdio: 'inherit' });

  console.log('✅ Release process completed!');
  console.log('🔗 Check GitHub Actions for automated NPM publishing');

} catch (error) {
  console.error('❌ Release failed:', error.message);
  process.exit(1);
}

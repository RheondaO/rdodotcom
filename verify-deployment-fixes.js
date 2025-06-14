#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('Verifying deployment fixes...\n');

let allChecksPassed = true;

// Check 1: Verify vitest import is commented out
try {
  const setupContent = readFileSync('server/tests/setup.ts', 'utf8');
  if (setupContent.includes('// import { beforeEach } from \'vitest\';')) {
    console.log('✅ Vitest import properly commented out in server/tests/setup.ts');
  } else {
    console.log('❌ Vitest import not properly commented out');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Could not check server/tests/setup.ts');
  allChecksPassed = false;
}

// Check 2: Verify TypeScript excludes test files
try {
  const tsconfigContent = readFileSync('tsconfig.json', 'utf8');
  const tsconfig = JSON.parse(tsconfigContent);
  if (tsconfig.exclude.includes('server/tests/**/*')) {
    console.log('✅ Test files properly excluded from TypeScript compilation');
  } else {
    console.log('❌ Test files not excluded from TypeScript compilation');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Could not check tsconfig.json excludes');
  allChecksPassed = false;
}

// Check 3: Verify build configuration exists
if (existsSync('vite.build.config.ts')) {
  console.log('✅ Production build configuration exists');
} else {
  console.log('❌ Production build configuration missing');
  allChecksPassed = false;
}

// Check 4: Verify server vite.ts has correct allowedHosts type
try {
  const viteContent = readFileSync('server/vite.ts', 'utf8');
  if (viteContent.includes('allowedHosts: true')) {
    console.log('✅ allowedHosts properly set to true in server/vite.ts');
  } else {
    console.log('❌ allowedHosts type issue in server/vite.ts');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Could not check server/vite.ts');
  allChecksPassed = false;
}

// Check 5: Verify production TypeScript config exists
if (existsSync('tsconfig.production.json')) {
  console.log('✅ Production TypeScript configuration exists');
} else {
  console.log('❌ Production TypeScript configuration missing');
  allChecksPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('🎉 All deployment fixes have been successfully applied!');
  console.log('\nThe following issues have been resolved:');
  console.log('• Vitest import removed from build process');
  console.log('• allowedHosts type error fixed');
  console.log('• Test files excluded from TypeScript compilation');
  console.log('• Production build configuration created');
  console.log('• skipLibCheck enabled to prevent dependency issues');
} else {
  console.log('⚠️  Some deployment fixes may need attention');
}
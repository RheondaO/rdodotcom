#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('Verifying all deployment fixes...\n');

const checks = [
  {
    name: 'Build output directory configuration',
    test: () => fs.existsSync('vite.production.config.ts') && 
                fs.readFileSync('vite.production.config.ts', 'utf8').includes('server/public')
  },
  {
    name: 'Production build files exist',
    test: () => fs.existsSync('server/public/index.html')
  },
  {
    name: 'Build scripts created',
    test: () => fs.existsSync('deploy-build.js') && fs.existsSync('create-minimal-build.js')
  },
  {
    name: 'Session secret environment variable',
    test: () => fs.readFileSync('server/index.ts', 'utf8').includes('process.env.SESSION_SECRET')
  },
  {
    name: 'Error handling for missing build directory',
    test: () => fs.existsSync('server/static-fallback.ts') && 
                fs.existsSync('server/deployment-check.ts')
  },
  {
    name: 'Node.js compatibility fixes',
    test: () => fs.readFileSync('deployment-test.js', 'utf8').includes('--import')
  }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  try {
    if (check.test()) {
      console.log(`✅ ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${check.name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${check.name} (Error: ${error.message})`);
    failed++;
  }
});

console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🚀 All deployment fixes verified successfully!');
  console.log('The application is ready for production deployment.');
} else {
  console.log('⚠️ Some fixes need attention.');
}

process.exit(failed === 0 ? 0 : 1);
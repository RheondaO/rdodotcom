#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import fs from 'fs';

console.log('Testing production deployment...');

// Test 1: Check build directory exists
const buildExists = fs.existsSync('server/public/index.html');
console.log(`✅ Build directory check: ${buildExists ? 'PASS' : 'FAIL'}`);

if (!buildExists) {
  console.log('❌ No build found. Creating minimal build...');
  process.exit(1);
}

// Test 2: Start server in production mode
console.log('Starting server in production mode...');
const server = spawn('node', ['--import', 'tsx/esm', 'server/index.ts'], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'pipe'
});

let serverOutput = '';
server.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

// Wait for server to start
await setTimeout(3000);

// Test 3: Check if server is responding
try {
  const response = await fetch('http://localhost:5000/');
  const status = response.status;
  const contentType = response.headers.get('content-type');
  
  console.log(`✅ Server response check: ${status === 200 ? 'PASS' : 'FAIL'} (${status})`);
  console.log(`✅ Content type check: ${contentType?.includes('html') ? 'PASS' : 'FAIL'} (${contentType})`);
  
  if (status === 200) {
    console.log('🚀 Production deployment test PASSED');
  } else {
    console.log('❌ Production deployment test FAILED');
  }
} catch (error) {
  console.log('❌ Server connection failed:', error.message);
}

// Cleanup
server.kill();
process.exit(0);
#!/usr/bin/env node

// Direct tsx execution to completely avoid Node.js loader issues
// This is the most reliable approach for production deployment

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

console.log('Starting application with direct tsx execution...');

// Use tsx directly - no Node.js loaders needed
const child = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

// Graceful shutdown
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
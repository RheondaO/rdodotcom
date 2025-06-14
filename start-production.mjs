#!/usr/bin/env node

// Production startup script that replaces npm start to fix Node.js loader deprecation
// Uses modern --import flag instead of deprecated --loader

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

console.log('Starting Belle Journal application in production mode...');

// Use modern --import flag instead of deprecated --loader
const child = spawn('node', [
  '--import', 'tsx/esm',
  join(__dirname, 'server/index.ts')
], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`Server terminated by signal: ${signal}`);
  } else if (code !== 0) {
    console.error(`Server exited with code: ${code}`);
    process.exit(code);
  }
  process.exit(0);
});

// Handle graceful shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  child.kill(signal);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGHUP', shutdown);
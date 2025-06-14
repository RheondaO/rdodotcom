#!/usr/bin/env node

// Production startup script that properly handles tsx imports
// This script replaces the need for --loader tsx/esm with modern --import

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server with proper tsx import handling
const serverPath = join(__dirname, 'server', 'index.ts');

const child = spawn('node', ['--import', 'tsx/esm', serverPath], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});
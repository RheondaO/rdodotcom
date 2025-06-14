#!/usr/bin/env node

// Production-ready start script that handles Node.js loader deprecation
// This script replaces the problematic npm start command in deployments

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('Starting Belle Journal application...');
console.log('Environment:', process.env.NODE_ENV);

// Use tsx directly instead of node with deprecated loader
const args = [
  join(__dirname, 'node_modules', '.bin', 'tsx'),
  join(__dirname, 'server', 'index.ts')
];

const child = spawn('node', args, {
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

// Handle graceful shutdowns
const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  child.kill(signal);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGHUP', () => shutdown('SIGHUP'));
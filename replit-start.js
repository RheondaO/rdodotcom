#!/usr/bin/env node

// Replit-optimized production start script
// Designed specifically for Replit's deployment infrastructure

const { spawn } = require('child_process');
const path = require('path');

// Force production environment
process.env.NODE_ENV = 'production';

console.log('Belle Journal - Starting production server...');

// Primary method: Use tsx directly
const startWithTsx = () => {
  const child = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirname
  });

  child.on('error', (error) => {
    console.error('tsx startup failed:', error.message);
    console.log('Attempting fallback method...');
    startWithImport();
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log('tsx exited with code:', code);
      console.log('Attempting fallback method...');
      startWithImport();
    } else {
      process.exit(0);
    }
  });

  return child;
};

// Fallback method: Use modern --import flag
const startWithImport = () => {
  const child = spawn('node', [
    '--import', 'tsx/esm',
    path.join(__dirname, 'server/index.ts')
  ], {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirname
  });

  child.on('error', (error) => {
    console.error('Import method failed:', error.message);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  return child;
};

// Start the application
const server = startWithTsx();

// Handle shutdown signals
const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  server.kill(signal);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGHUP', () => shutdown('SIGHUP'));
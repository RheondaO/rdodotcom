#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

console.log('Starting debug build process...');

// Clean previous build
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned dist directory');
}

try {
  // Skip TypeScript compilation and go directly to Vite build
  console.log('Building with Vite (skipping TypeScript checks)...');
  execSync('npx vite build --mode production', { 
    stdio: 'inherit',
    timeout: 60000 // 60 second timeout
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

console.log('Starting production build process...');

// Clean previous build artifacts
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned dist directory');
}

try {
  // Use the optimized vite build config that skips TypeScript compilation
  console.log('Building with optimized Vite configuration...');
  execSync('npx vite build --config vite.build.config.ts', { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });
  console.log('Production build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.log('Trying fallback build method...');
  
  try {
    // Fallback: direct vite build without TypeScript checks
    execSync('npx vite build --mode production', { 
      stdio: 'inherit',
      timeout: 120000
    });
    console.log('Fallback build completed successfully!');
  } catch (fallbackError) {
    console.error('Fallback build also failed:', fallbackError.message);
    process.exit(1);
  }
}
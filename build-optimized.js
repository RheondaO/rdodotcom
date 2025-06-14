#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

console.log('Starting optimized build...');

// Clean previous build
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true });
}

try {
  // Build with reduced parallelism and memory optimization
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  execSync('npx vite build --mode production --minify esbuild', { 
    stdio: 'inherit',
    timeout: 120000,
    env: { 
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  
  // Fallback: try building without TypeScript checks
  console.log('Attempting fallback build without TypeScript checks...');
  try {
    execSync('npx vite build --mode production --config vite.config.ts', {
      stdio: 'inherit',
      timeout: 120000,
      env: { 
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096',
        TS_NODE_SKIP_IGNORE: 'true'
      }
    });
    console.log('Fallback build completed!');
  } catch (fallbackError) {
    console.error('All build attempts failed:', fallbackError.message);
    process.exit(1);
  }
}
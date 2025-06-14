#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Building application for production...');

try {
  // Build using the production config
  console.log('Building with production configuration...');
  execSync('npx vite build --config vite.production.config.ts', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Verify build output exists
  const buildPath = path.resolve('server/public');
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build completed successfully');
    console.log(`📁 Static files generated in: ${buildPath}`);
    
    // List generated files
    const files = fs.readdirSync(buildPath);
    console.log(`📄 Generated ${files.length} files:`, files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
  } else {
    console.error('❌ Build directory not found after build');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
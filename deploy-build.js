#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for deployment...');

try {
  // Use the standard vite build but ensure output goes to correct location
  console.log('Running standard build...');
  execSync('npx vite build --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Check if build went to dist/public (default location)
  const defaultBuildPath = path.resolve('dist/public');
  const targetBuildPath = path.resolve('server/public');
  
  if (fs.existsSync(defaultBuildPath)) {
    console.log('Moving build files to server/public...');
    
    // Ensure target directory exists and is empty
    if (fs.existsSync(targetBuildPath)) {
      fs.rmSync(targetBuildPath, { recursive: true, force: true });
    }
    fs.mkdirSync(path.dirname(targetBuildPath), { recursive: true });
    
    // Move the files
    fs.renameSync(defaultBuildPath, targetBuildPath);
    
    // Verify files exist
    const files = fs.readdirSync(targetBuildPath);
    console.log(`✅ Deployment build complete: ${files.length} files in server/public`);
    
    // Clean up empty dist directory
    if (fs.existsSync('dist') && fs.readdirSync('dist').length === 0) {
      fs.rmSync('dist', { recursive: true });
    }
  } else if (fs.existsSync(targetBuildPath)) {
    const files = fs.readdirSync(targetBuildPath);
    console.log(`✅ Build already in correct location: ${files.length} files`);
  } else {
    console.error('❌ Build output not found in expected locations');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
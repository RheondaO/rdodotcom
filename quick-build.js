#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Quick production build...');

const buildProcess = spawn('npx', ['vite', 'build', '--config', 'vite.production.config.ts'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'production' }
});

let buildOutput = '';
buildProcess.stdout.on('data', (data) => {
  buildOutput += data.toString();
  // Only show important messages
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.includes('built in') || line.includes('✓') || line.includes('error')) {
      console.log(line);
    }
  });
});

buildProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    const buildPath = path.resolve('server/public');
    if (fs.existsSync(buildPath)) {
      console.log('✅ Build completed successfully');
      const files = fs.readdirSync(buildPath);
      console.log(`📁 Generated ${files.length} files in server/public`);
    } else {
      console.log('⚠️ Build completed but files not in expected location');
    }
  } else {
    console.error(`❌ Build failed with code ${code}`);
  }
  process.exit(code);
});
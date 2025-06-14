#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync, writeFileSync } from 'fs';

console.log('Creating minimal build configuration...');

// Clean build directory
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true });
}

// Create ultra-minimal vite config for deployment
const minimalConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
    },
  },
  root: "client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    target: 'es2020'
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});`;

writeFileSync('vite.minimal.config.ts', minimalConfig);
console.log('Created minimal Vite configuration');

try {
  console.log('Running build with minimal config...');
  execSync('npx vite build --config vite.minimal.config.ts', { 
    stdio: 'inherit',
    timeout: 60000
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
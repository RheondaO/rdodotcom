#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync, writeFileSync } from 'fs';
import path from 'path';

console.log('Implementing deployment fixes...');

// Clean any existing build artifacts
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned existing build artifacts');
}

// Create optimized tsconfig for production build
const productionTsConfig = {
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "skipLibCheck": true,
    "noEmit": false,
    "declaration": false,
    "incremental": false,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["client/src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.*", "server/**/*"]
};

writeFileSync('tsconfig.build.json', JSON.stringify(productionTsConfig, null, 2));
console.log('Created optimized TypeScript configuration');

// Create minimal vite config for production
const minimalViteConfig = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: path.resolve(process.cwd(), "client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
          'query': ['@tanstack/react-query'],
          'charts': ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2020'
  },
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
`;

writeFileSync('vite.build.config.ts', minimalViteConfig);
console.log('Created optimized Vite configuration');

try {
  // Set memory limits and build with optimized configuration
  process.env.NODE_OPTIONS = '--max-old-space-size=8192';
  
  console.log('Starting production build...');
  execSync('npx vite build --config vite.build.config.ts --mode production', {
    stdio: 'inherit',
    timeout: 180000, // 3 minutes
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=8192',
      VITE_BUILD_TARGET: 'production'
    }
  });
  
  console.log('Build completed successfully!');
  
  // Verify build output
  if (existsSync('dist/public/index.html')) {
    console.log('Build verification passed - index.html exists');
  } else {
    throw new Error('Build verification failed - missing index.html');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
// Modern ESM production start script using .mjs extension
// This bypasses the loader deprecation issue entirely

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Belle Journal in production mode...');

// Check if tsx is available
const tsxPath = join(rootDir, 'node_modules', '.bin', 'tsx');
const hasTsx = existsSync(tsxPath);

if (!hasTsx) {
  console.error('❌ tsx not found. Please ensure dependencies are installed.');
  process.exit(1);
}

// Start server using tsx directly (no deprecated loaders)
const serverPath = join(__dirname, 'index.ts');
const child = spawn('node', [tsxPath, serverPath], {
  stdio: 'inherit',
  env: process.env,
  cwd: rootDir
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`🔄 Server terminated by signal: ${signal}`);
  } else if (code !== 0) {
    console.error(`❌ Server exited with code: ${code}`);
    process.exit(code);
  }
  console.log('✅ Server shutdown complete');
  process.exit(0);
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`📡 Received ${signal}, initiating graceful shutdown...`);
  child.kill(signal);
  
  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.log('⚠️ Force killing server after timeout');
    child.kill('SIGKILL');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('SIGTERM');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('SIGTERM');
});
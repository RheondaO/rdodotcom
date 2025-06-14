// Production server entry point that avoids Node.js loader deprecation
// This file uses pure JavaScript to bootstrap the TypeScript server

import { register } from 'tsx/esm/api';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

// Register tsx for TypeScript compilation
register();

// Import and run the main server
const serverPath = pathToFileURL(join(__dirname, 'index.ts')).href;
await import(serverPath);
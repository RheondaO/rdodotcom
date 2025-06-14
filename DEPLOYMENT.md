# Deployment Guide - Node.js Loader Fix

## Issue Fixed
The deployment was failing due to Node.js deprecating the `--loader` flag in favor of `--import`. The original package.json contained:
```json
"start": "NODE_ENV=production node --loader tsx/esm server/index.ts"
```

## Solutions Implemented

### 1. Direct tsx Execution (Recommended)
Created `start.js` - a production-ready startup script that uses tsx directly:
```bash
node start.js
```

### 2. ESM Module Alternative
Created `server/start.mjs` - modern ESM approach with comprehensive error handling:
```bash
node server/start.mjs
```

### 3. Shell Script Fallback
Created `production-start.sh` for environments preferring shell scripts:
```bash
./production-start.sh
```

### 4. Docker Support
Added `Dockerfile` with proper Node.js 20 support and tsx integration.

## Deployment Commands

### For Replit Deployments
The deployment system can now use any of these commands:
- `node start.js` (primary recommendation)
- `node server/start.mjs` (ESM alternative)
- `npx tsx server/index.ts` (direct tsx)

### Manual Testing
To test the production build locally:
```bash
NODE_ENV=production node start.js
```

## Environment Variables
All scripts properly handle:
- `NODE_ENV=production`
- `PORT=5000` (Replit standard)
- Database and session configurations

## Error Handling
Each startup script includes:
- Graceful shutdown handling
- Process error recovery
- Timeout protection
- Comprehensive logging

## Verification
The deployment readiness check passes with:
✅ Deployment ready: minimal build with 2 files

All scripts avoid the deprecated `--loader` flag and use modern Node.js import mechanisms.
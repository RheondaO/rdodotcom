#!/bin/bash

# Final deployment script for Belle Journal
# Handles Node.js loader deprecation with multiple fallback methods

set -e

echo "Belle Journal - Production Deployment Starting..."

# Set production environment
export NODE_ENV=production

# Build the application first
echo "Building application..."
npm run build

# Start the server using the most reliable method
echo "Starting production server..."

# Primary method: Direct tsx execution
if npx tsx --version >/dev/null 2>&1; then
    echo "Using direct tsx execution (recommended method)"
    exec npx tsx server/index.ts
fi

# Fallback 1: Modern --import flag
if node --help | grep -q "import" 2>/dev/null; then
    echo "Using modern --import flag"
    exec node --import tsx/esm server/index.ts
fi

# Fallback 2: Custom startup script
echo "Using custom startup wrapper"
exec node tsx-start.mjs
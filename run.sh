#!/bin/bash

# Production run script for Replit deployment
# Handles Node.js loader deprecation by using modern startup methods

set -e

echo "Starting Belle Journal production deployment..."

# Set production environment
export NODE_ENV=production

# Method 1: Try direct tsx execution (most reliable)
if command -v npx >/dev/null 2>&1; then
    echo "Using direct tsx execution..."
    exec npx tsx server/index.ts
fi

# Method 2: Fallback to modern --import flag
if command -v node >/dev/null 2>&1; then
    echo "Using modern --import flag..."
    exec node --import tsx/esm server/index.ts
fi

# Method 3: Last resort - use our custom startup script
echo "Using custom startup script..."
exec node tsx-start.mjs
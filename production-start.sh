#!/bin/bash

# Production startup script that uses tsx directly instead of node with loaders
# This avoids the deprecated --loader flag issue entirely

export NODE_ENV=production

# Use tsx directly to run the TypeScript server
exec npx tsx server/index.ts
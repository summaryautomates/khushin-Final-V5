#!/bin/bash
# Production startup script for KHUSHIN e-commerce platform

# Set production environment
export NODE_ENV=production

# Set default port if not already set
if [ -z "$PORT" ]; then
  export PORT=8080
  echo "Setting default PORT to 8080"
fi

# Check for SESSION_SECRET
if [ -z "$SESSION_SECRET" ]; then
  export SESSION_SECRET="a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289"
  echo "WARNING: Using default SESSION_SECRET. For security, set a real secret in production."
fi

echo "Starting KHUSHIN in production mode..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "SESSION_SECRET: [HIDDEN]"

# Check if dist/index.js exists
if [ ! -f "dist/index.js" ]; then
  echo "Error: dist/index.js not found. Run 'npm run build' first."
  exit 1
fi

# Start the server
node dist/index.js
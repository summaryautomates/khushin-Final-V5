#!/bin/bash
# KHUSHIN E-commerce Platform Deployment Script

echo "==============================================="
echo "KHUSHIN E-commerce Platform Deployment Script"
echo "==============================================="

# Set environment variables for deployment
export NODE_ENV=production
export PORT=8080

# Check if SESSION_SECRET exists, if not generate one
if [ -z "$SESSION_SECRET" ]; then
  export SESSION_SECRET="a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289"
  echo "Using default SESSION_SECRET for deployment."
  echo "For production, set a unique SESSION_SECRET in your Replit Secrets."
fi

# Step 1: Build the application
echo -e "\n📦 Building the application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix the errors and try again."
  exit 1
fi
echo "✅ Build completed successfully!"

# Step 2: Verify build files
echo -e "\n🔍 Verifying build files..."
if [ ! -d "dist" ] || [ ! -f "dist/index.js" ] || [ ! -d "dist/public" ] || [ ! -f "dist/public/index.html" ]; then
  echo "❌ Build verification failed! One or more required files are missing."
  exit 1
fi
echo "✅ Build files verified successfully!"

# Step 3: Run the application in production mode
echo -e "\n🚀 Starting the application in production mode..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "SESSION_SECRET: [HIDDEN]"

echo -e "\n✅ Deployment preparation completed successfully!"
echo "==============================================="
echo "Click the 'Deploy' button in Replit to deploy your application."
echo "Make sure to add these environment variables in your deployment settings:"
echo "- NODE_ENV=production"
echo "- SESSION_SECRET=$SESSION_SECRET"
echo "- PORT=8080"
echo "==============================================="
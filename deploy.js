#!/usr/bin/env node
// Deployment script for KHUSHIN e-commerce platform
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('================================');
console.log('KHUSHIN DEPLOYMENT SCRIPT');
console.log('================================');

// Step 1: Build the application
console.log('\n📦 Step 1: Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Verify build artifacts
console.log('\n🔍 Step 2: Verifying build artifacts...');
const distDir = path.resolve(process.cwd(), 'dist');
const distIndexFile = path.join(distDir, 'index.js');
const distPublicDir = path.join(distDir, 'public');
const distIndexHtml = path.join(distPublicDir, 'index.html');

if (!fs.existsSync(distDir) || !fs.existsSync(distIndexFile) || 
    !fs.existsSync(distPublicDir) || !fs.existsSync(distIndexHtml)) {
  console.error('❌ Build verification failed! One or more required files are missing.');
  process.exit(1);
}
console.log('✅ Build artifacts verified successfully!');

// Step 3: Set required environment variables for production
console.log('\n🔧 Step 3: Setting up environment variables...');

// Set NODE_ENV=production for the current process
process.env.NODE_ENV = 'production';
console.log('✅ NODE_ENV set to production');

// Check for SESSION_SECRET
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️ No SESSION_SECRET found. Using a temporary one for this session.');
  process.env.SESSION_SECRET = 'a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289';
  console.log('To set a permanent SESSION_SECRET, add it to your Replit Secrets.');
}

// Set PORT to 8080 if not already set
if (!process.env.PORT) {
  process.env.PORT = '8080';
  console.log('✅ PORT set to 8080');
}

console.log('\n🚀 Deployment preparation complete!');
console.log('================================');
console.log('You can now click the "Deploy" button in Replit to deploy your application.');
console.log('Make sure to add these environment variables in your deployment settings:');
console.log('- NODE_ENV=production');
console.log('- SESSION_SECRET=a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289');
console.log('- PORT=8080');
console.log('================================');
#!/usr/bin/env node
// Advanced deployment script with environment variable configuration
// This script prepares and runs the application in production mode

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('===========================================================');
console.log('KHUSH.IN PRODUCTION DEPLOYMENT SCRIPT (ENVIRONMENT FOCUSED)');
console.log('===========================================================');

// Step 1: Set critical environment variables
console.log('\n📋 Step 1: Setting critical environment variables...');
process.env.NODE_ENV = 'production';
process.env.PORT = '8080';

// Check if SESSION_SECRET exists, if not use the default one
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289';
  console.log('- Using default SESSION_SECRET (create a unique one for production)');
} else {
  console.log('- Using existing SESSION_SECRET from environment');
}

console.log('✅ Environment variables set:');
console.log(`- NODE_ENV = ${process.env.NODE_ENV}`);
console.log(`- PORT = ${process.env.PORT}`);
console.log('- SESSION_SECRET = [hidden]');

// Step 2: Build the application with production settings
console.log('\n📦 Step 2: Building application with production settings...');
try {
  console.log('- Running build command...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '8080'
    }
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Verify build artifacts
console.log('\n🔍 Step 3: Verifying build artifacts...');
const distDir = path.resolve(__dirname, 'dist');
const distIndexFile = path.join(distDir, 'index.js');
const distPublicDir = path.join(distDir, 'public');
const distIndexHtml = path.join(distPublicDir, 'index.html');
const distAssetsDir = path.join(distPublicDir, 'assets');

// Check if build directories and files exist
if (!fs.existsSync(distDir)) {
  console.error('❌ Build verification failed! Dist directory not found');
  process.exit(1);
}

if (!fs.existsSync(distIndexFile)) {
  console.error('❌ Build verification failed! dist/index.js not found');
  process.exit(1);
}

if (!fs.existsSync(distPublicDir)) {
  console.error('❌ Build verification failed! dist/public directory not found');
  process.exit(1);
}

if (!fs.existsSync(distIndexHtml)) {
  console.error('❌ Build verification failed! dist/public/index.html not found');
  process.exit(1);
}

if (!fs.existsSync(distAssetsDir)) {
  console.error('❌ Build verification failed! dist/public/assets directory not found');
  process.exit(1);
}

console.log('✅ All required build files verified!');

// Check index.html for src reference
try {
  const indexHtmlContent = fs.readFileSync(distIndexHtml, 'utf8');
  if (indexHtmlContent.includes('src="/src/main.tsx"')) {
    console.error('❌ Error: index.html still contains reference to source files!');
    console.error('   This will cause a blank screen in production.');
    process.exit(1);
  } else if (indexHtmlContent.includes('src="/assets/')) {
    console.log('✅ index.html properly references built assets');
  }
} catch (error) {
  console.error('❌ Error reading index.html:', error.message);
}

// Step 4: Create test script for deployment
const testScriptPath = path.join(__dirname, 'test-production.js');
const testScriptContent = `
#!/usr/bin/env node
// Production test script
// Run this in your deployed environment to verify everything is working

process.env.NODE_ENV = 'production';
process.env.PORT = '8080';

console.log('========================================');
console.log('PRODUCTION ENVIRONMENT VERIFICATION');
console.log('========================================');
console.log('Checking environment variables:');
console.log(\`NODE_ENV = \${process.env.NODE_ENV}\`);
console.log(\`PORT = \${process.env.PORT}\`);
console.log(\`SESSION_SECRET present = \${Boolean(process.env.SESSION_SECRET)}\`);
console.log('========================================');
console.log('Starting server in production mode...');

// Import and run the server
import('./dist/index.js')
  .then(() => {
    console.log('Server imported successfully');
  })
  .catch(error => {
    console.error('Error importing server:', error);
    process.exit(1);
  });
`;

try {
  fs.writeFileSync(testScriptPath, testScriptContent, 'utf8');
  fs.chmodSync(testScriptPath, '755');
  console.log('✅ Created test-production.js script for verifying deployment');
} catch (error) {
  console.error('⚠️ Could not create test script:', error.message);
}

// Final instructions
console.log('\n===========================================================');
console.log('DEPLOYMENT PREPARATION COMPLETE');
console.log('===========================================================');
console.log('\nTo deploy the application:');
console.log('1. Click the "Deploy" button in the Replit interface');
console.log('2. Add these environment variables in the deployment settings:');
console.log('   - NODE_ENV=production');
console.log('   - PORT=8080');
console.log('   - SESSION_SECRET=a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289');
console.log('\nTo test the production build locally:');
console.log('   node test-production.js');
console.log('===========================================================');
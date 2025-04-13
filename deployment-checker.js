// Deployment environment checker
import os from 'os';
import fs from 'fs';
import path from 'path';

console.log('================================');
console.log('DEPLOYMENT ENVIRONMENT CHECKER');
console.log('================================');

// Check for critical environment variables
const requiredEnvVars = ['NODE_ENV', 'SESSION_SECRET', 'PORT', 'DATABASE_URL'];
console.log('\nEnvironment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✓ Set' : '✗ Missing'}`);
});

// Check dist directory
console.log('\nChecking build files:');
const distDir = path.resolve(process.cwd(), 'dist');
const distPublicDir = path.resolve(distDir, 'public');

console.log(`dist directory exists: ${fs.existsSync(distDir) ? '✓ Yes' : '✗ No'}`);
if (fs.existsSync(distDir)) {
  console.log(`dist/index.js exists: ${fs.existsSync(path.join(distDir, 'index.js')) ? '✓ Yes' : '✗ No'}`);
}

console.log(`dist/public directory exists: ${fs.existsSync(distPublicDir) ? '✓ Yes' : '✗ No'}`);
if (fs.existsSync(distPublicDir)) {
  console.log(`dist/public/index.html exists: ${fs.existsSync(path.join(distPublicDir, 'index.html')) ? '✓ Yes' : '✗ No'}`);
}

// Check system info
console.log('\nSystem Information:');
console.log(`Node.js version: ${process.version}`);
console.log(`Hostname: ${os.hostname()}`);
console.log(`Platform: ${process.platform}`);
console.log(`Memory: ${Math.round(os.totalmem() / (1024 * 1024))} MB total, ${Math.round(os.freemem() / (1024 * 1024))} MB free`);

console.log('\n================================');
console.log('DEPLOYMENT CHECKER COMPLETE');
console.log('================================');
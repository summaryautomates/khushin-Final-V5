#!/usr/bin/env node

// Deployment script for KHUSHIN e-commerce platform

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('==============================')
console.log('KHUSHIN Deployment Script')
console.log('==============================')

// Step 1: Build the application
console.log('\nStep 1: Building the application...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('Build succeeded.')
} catch (err) {
  console.error('Build failed:', err.message)
  process.exit(1)
}

// Step 2: Verify build output
console.log('\nStep 2: Verifying build output...')
const root = process.cwd()
const distPath = path.resolve(root, 'dist')
const mainJs = path.join(distPath, 'index.js')
const publicDir = path.join(distPath, 'public')
const indexHtml = path.join(publicDir, 'index.html')

if (
  !fs.existsSync(distPath) ||
  !fs.existsSync(mainJs) ||
  !fs.existsSync(publicDir) ||
  !fs.existsSync(indexHtml)
) {
  console.error('Build verification failed. Missing required files.')
  process.exit(1)
}
console.log('All required build files found.')

// Step 3: Set environment variables
console.log('\nStep 3: Setting environment variables...')

process.env.NODE_ENV = 'production'
console.log('NODE_ENV set to production.')

if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289'
  console.warn('SESSION_SECRET not set. Using temporary default.')
  console.log('Set your SESSION_SECRET permanently in Replit Secrets.')
}

if (!process.env.PORT) {
  process.env.PORT = '8080'
  console.log('PORT set to 8080.')
}

console.log('\nEnvironment is ready for deployment.')
console.log('==============================')
console.log('Before deploying, make sure your environment has:')
console.log('- NODE_ENV=production')
console.log('- SESSION_SECRET=a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289')
console.log('- PORT=8080')
console.log('==============================')

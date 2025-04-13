#!/usr/bin/env node
// Production starter script for KHUSHIN e-commerce platform
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure we're in production mode
process.env.NODE_ENV = 'production';

// Set default SESSION_SECRET if not provided
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289';
  console.warn('Warning: Using default SESSION_SECRET. For security, set a real secret in production.');
}

// Set default PORT if not provided
if (!process.env.PORT) {
  process.env.PORT = '8080';
  console.log('Port set to 8080');
}

// Verify dist directory exists
const distDir = path.resolve(process.cwd(), 'dist');
const indexFile = path.join(distDir, 'index.js');

if (!fs.existsSync(distDir) || !fs.existsSync(indexFile)) {
  console.error('Error: Build files not found. Run "npm run build" before starting in production mode.');
  process.exit(1);
}

console.log('Starting KHUSHIN e-commerce platform in production mode...');
console.log(`Environment: NODE_ENV=${process.env.NODE_ENV}`);
console.log(`Port: ${process.env.PORT}`);

// Start the server
const server = spawn('node', [indexFile], {
  env: process.env,
  stdio: 'inherit'
});

// Handle server events
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process signals
process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down gracefully...');
  server.kill('SIGTERM');
});
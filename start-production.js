// Production server startup script
console.log('Starting application in production mode...');
const { spawn } = require('child_process');

// Set NODE_ENV environment variable to production
process.env.NODE_ENV = 'production';

// Start the server
const server = spawn('node', ['dist/index.js'], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle process signals to properly shutdown the server
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down server...');
  server.kill('SIGTERM');
});
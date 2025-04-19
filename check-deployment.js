#!/usr/bin/env node
// Simple deployment environment checker
// Run this on your deployed site to verify environment variables

console.log('==================================================');
console.log('KHUSH.IN DEPLOYMENT ENVIRONMENT CHECKER');
console.log('==================================================');
console.log('');

// Check NODE_ENV
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️ WARNING: NODE_ENV is not set to production!');
  console.log('   This will cause the application to load source files');
  console.log('   instead of built files, resulting in a blank screen.');
} else {
  console.log('✅ NODE_ENV correctly set to production');
}

console.log('');

// Check PORT
console.log('PORT:', process.env.PORT || 'Not set');
if (!process.env.PORT) {
  console.log('⚠️ WARNING: PORT is not set!');
  console.log('   The application may use a different port than expected.');
} else {
  console.log('✅ PORT is set');
}

console.log('');

// Check SESSION_SECRET
if (!process.env.SESSION_SECRET) {
  console.log('⚠️ WARNING: SESSION_SECRET is not set!');
  console.log('   This may cause authentication issues.');
} else {
  console.log('✅ SESSION_SECRET is set');
}

console.log('');
console.log('==================================================');
console.log('Deployment Recommendation:');
console.log('');
if (process.env.NODE_ENV !== 'production' || !process.env.PORT || !process.env.SESSION_SECRET) {
  console.log('Set the following environment variables in your Replit deployment settings:');
  console.log('');
  console.log('NODE_ENV=production');
  console.log('PORT=8080');
  console.log('SESSION_SECRET=a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289');
  console.log('');
  console.log('After setting these, rebuild and redeploy the application.');
} else {
  console.log('All required environment variables are set correctly.');
  console.log('If you still see a blank screen, check server logs for other errors.');
}
console.log('==================================================');
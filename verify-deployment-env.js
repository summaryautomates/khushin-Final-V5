#!/usr/bin/env node
// Deployment environment variable verification script
// This script checks environment variables crucial for proper deployment

console.log('========================================');
console.log('DEPLOYMENT ENVIRONMENT VARIABLE CHECKER');
console.log('========================================');

const REQUIRED_VARS = [
  { name: 'NODE_ENV', value: 'production', critical: true },
  { name: 'PORT', value: '8080', critical: true },
  { name: 'SESSION_SECRET', value: undefined, critical: true },
  { name: 'DATABASE_URL', value: undefined, critical: true }
];

let hasErrors = false;

console.log('\nChecking required environment variables:');
REQUIRED_VARS.forEach(({ name, value, critical }) => {
  const envValue = process.env[name];
  
  if (!envValue) {
    console.log(`❌ ${name}: NOT SET ${critical ? '(CRITICAL)' : ''}`);
    hasErrors = critical;
  } else if (value && envValue !== value) {
    console.log(`⚠️ ${name}: SET but incorrect value - Expected: ${value}, Got: ${envValue}`);
    hasErrors = critical;
  } else {
    console.log(`✅ ${name}: CORRECTLY SET ${value ? `to ${value}` : ''}`);
  }
});

// Explicitly check for production mode
if (process.env.NODE_ENV !== 'production') {
  console.log('\n❌ CRITICAL ERROR: NODE_ENV is not set to "production"');
  console.log('   This will cause the deployment to use development mode instead of production mode,');
  console.log('   resulting in a blank screen or errors when deployed.');
  hasErrors = true;
}

console.log('\n========================================');
if (hasErrors) {
  console.log('❌ VERIFICATION FAILED! Please fix errors.');
  console.log('========================================');
  process.exit(1);
} else {
  console.log('✅ VERIFICATION PASSED! Ready for deployment.');
  console.log('========================================');
}
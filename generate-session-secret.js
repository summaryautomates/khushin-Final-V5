// Generate a secure random session secret
import crypto from 'crypto';

const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sessionSecret = generateSecret();
console.log('Generated SESSION_SECRET:');
console.log(sessionSecret);
console.log('\nAdd this to your deployment environment variables.');
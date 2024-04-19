const crypto = require('crypto');

export function generateRandomApiKey() {
  const prefix = 'FLWSECK-';
  const suffix = '-X';
  
  // Generate 16 bytes of random data
  const randomBytes = crypto.randomBytes(16);
  
  // Convert the random bytes to hexadecimal representation
  const randomHex = randomBytes.toString('hex');

  // Return concatenated prefix, random hexadecimal string, and suffix
  return `${prefix}${randomHex}${suffix}`;
}

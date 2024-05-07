const crypto = require('crypto');

export function generateRandomApiKey() {
  const prefix = 'APISECK-';
  const suffix = '-X';
  
  // Generate 16 bytes of random data
  const randomBytes = crypto.randomBytes(16);
  
  // Convert the random bytes to hexadecimal representation
  const randomHex = randomBytes.toString('hex');

  // Return concatenated prefix, random hexadecimal string, and suffix
  return `${prefix}${randomHex}${suffix}`;
}

// eslint-disable-next-line no-unused-vars
export function singleInvocationThrottle<T extends (...args: any[]) => void>(func: T, delay: number) {
  let lastExecutedTime = 0;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutedTime;

    if (timeSinceLastExecution >= delay) {
      // If enough time has passed since the last call, invoke the function
      func.apply(this, args);
      lastExecutedTime = now;
    }
  };
}

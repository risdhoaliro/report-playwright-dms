export const waitTime = {
    SHORT: 5000,    // 5 seconds for quick operations
    MEDIUM: 10000,  // 10 seconds for medium operations
    LONG: 30000,    // 30 seconds for long operations
} as const;

// Environment URLs
const ENV = process.env.ENV || 'staging'; // default to staging if not specified
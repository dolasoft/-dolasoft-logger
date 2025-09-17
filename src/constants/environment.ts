/**
 * Environment constants for consistent environment checking
 */
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
} as const;

export type Environment = typeof ENVIRONMENT[keyof typeof ENVIRONMENT];

/**
 * Check if current environment is development
 */
export const isDevelopment = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT;
  }
  return true; // Default to development in browser
};

/**
 * Check if current environment is production
 */
export const isProduction = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;
  }
  return false; // Default to not production in browser
};

/**
 * Check if current environment is test
 */
export const isTest = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === ENVIRONMENT.TEST;
  }
  return false; // Default to not test in browser
};

/**
 * Get current environment
 */
export const getCurrentEnvironment = (): Environment => {
  if (typeof process !== 'undefined' && process.env) {
    return (process.env.NODE_ENV as Environment) || ENVIRONMENT.DEVELOPMENT;
  }
  return ENVIRONMENT.DEVELOPMENT; // Default to development in browser
};

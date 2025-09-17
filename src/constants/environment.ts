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
  return process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT;
};

/**
 * Check if current environment is production
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;
};

/**
 * Check if current environment is test
 */
export const isTest = (): boolean => {
  return process.env.NODE_ENV === ENVIRONMENT.TEST;
};

/**
 * Get current environment
 */
export const getCurrentEnvironment = (): Environment => {
  return (process.env.NODE_ENV as Environment) || ENVIRONMENT.DEVELOPMENT;
};

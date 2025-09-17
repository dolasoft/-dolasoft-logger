/**
 * Environment constants for consistent environment checking
 */
export declare const ENVIRONMENT: {
    readonly DEVELOPMENT: "development";
    readonly PRODUCTION: "production";
    readonly TEST: "test";
};
export type Environment = typeof ENVIRONMENT[keyof typeof ENVIRONMENT];
/**
 * Check if current environment is development
 */
export declare const isDevelopment: () => boolean;
/**
 * Check if current environment is production
 */
export declare const isProduction: () => boolean;
/**
 * Check if current environment is test
 */
export declare const isTest: () => boolean;
/**
 * Get current environment
 */
export declare const getCurrentEnvironment: () => Environment;
//# sourceMappingURL=environment.d.ts.map
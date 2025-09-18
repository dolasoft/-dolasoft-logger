import { LoggerConfig, LogLevel, LogStrategy } from './types';

/**
 * Check if we're in production
 */
function isProduction(): boolean {
  // Check Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  
  // Check browser environment
  if (typeof window !== 'undefined') {
    return !window.location?.hostname?.includes('localhost') && 
           window.location?.hostname !== '127.0.0.1';
  }
  
  // Default to development if we can't determine
  return false;
}

/**
 * Simple default configuration
 */
export const DEFAULT_CONFIG: LoggerConfig = {
  strategy: LogStrategy.CONSOLE,
  level: isProduction() ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: !isProduction(), // Only console in development
  enableMemory: false,
  enableFile: isProduction(), // Only file logging in production
  enableDatabase: false,
  enableRemote: false,
  format: 'json', // JSON format for production
  maxMemoryEntries: 100,
  maxDatabaseEntries: 1000,
  maxFileEntries: 1000,
  remoteEndpoint: '/api/logs',
  filePath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5, // Keep 5 rotated files
};

export function createConfig(overrides: Partial<LoggerConfig> = {}): LoggerConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

export function validateConfig(config: LoggerConfig): string[] {
  const errors: string[] = [];
  
  if (config.maxMemoryEntries && config.maxMemoryEntries < 1) {
    errors.push('maxMemoryEntries must be greater than 0');
  }
  
  return errors;
}
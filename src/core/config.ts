import { LoggerConfig, LogLevel, LogStrategy } from './types';

/**
 * Check if we're in production
 */
function isProduction(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  return false;
}

/**
 * Simple default configuration
 */
export const DEFAULT_CONFIG: LoggerConfig = {
  strategy: LogStrategy.CONSOLE,
  level: isProduction() ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsole: true,
  enableMemory: false,
  enableFile: false,
  enableDatabase: false,
  enableRemote: false,
  format: 'pretty',
  maxMemoryEntries: 100,
  maxDatabaseEntries: 1000,
  maxFileEntries: 1000,
  remoteEndpoint: '/api/logs',
  filePath: './logs/app.log',
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
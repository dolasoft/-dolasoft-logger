import { LoggerConfig, LogLevel, LogStrategy } from './types';

// Default configuration
export const DEFAULT_CONFIG: LoggerConfig = {
  strategy: process.env.NODE_ENV === 'production' ? LogStrategy.HYBRID : LogStrategy.CONSOLE,
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  maxMemoryEntries: parseInt(process.env.LOG_MAX_MEMORY_ENTRIES || '1000'),
  maxDatabaseEntries: parseInt(process.env.LOG_MAX_DATABASE_ENTRIES || '10000'),
  maxFileEntries: parseInt(process.env.LOG_MAX_FILE_ENTRIES || '5000'),
  enableConsole: process.env.NODE_ENV !== 'production',
  enableDatabase: true,
  enableFile: process.env.NODE_ENV === 'production',
  databaseTable: 'error_logs',
  filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || '10485760'), // 10MB
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
  includeStack: true,
  includeMetadata: true
};

export function createConfig(overrides: Partial<LoggerConfig> = {}): LoggerConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

export function validateConfig(config: LoggerConfig): string[] {
  const errors: string[] = [];

  if (config.maxMemoryEntries && config.maxMemoryEntries < 1) {
    errors.push('maxMemoryEntries must be greater than 0');
  }

  if (config.maxDatabaseEntries && config.maxDatabaseEntries < 1) {
    errors.push('maxDatabaseEntries must be greater than 0');
  }

  if (config.maxFileEntries && config.maxFileEntries < 1) {
    errors.push('maxFileEntries must be greater than 0');
  }

  if (config.maxFileSize && config.maxFileSize < 1024) {
    errors.push('maxFileSize must be at least 1KB');
  }

  if (config.maxFiles && config.maxFiles < 1) {
    errors.push('maxFiles must be greater than 0');
  }

  if (config.filePath && !config.filePath.endsWith('.log')) {
    errors.push('filePath should end with .log extension');
  }

  return errors;
}

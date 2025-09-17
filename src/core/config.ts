import { LoggerConfig, LogLevel, LogStrategy } from './types';

// Helper function to safely access process.env
function getEnvVar(key: string, defaultValue: string): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
}

function isProduction(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  return false;
}

// Default configuration
export const DEFAULT_CONFIG: LoggerConfig = {
  strategy: isProduction() ? LogStrategy.HYBRID : LogStrategy.CONSOLE,
  level: isProduction() ? LogLevel.WARN : LogLevel.DEBUG,
  maxMemoryEntries: parseInt(getEnvVar('LOG_MAX_MEMORY_ENTRIES', '1000')),
  maxDatabaseEntries: parseInt(getEnvVar('LOG_MAX_DATABASE_ENTRIES', '10000')),
  maxFileEntries: parseInt(getEnvVar('LOG_MAX_FILE_ENTRIES', '5000')),
  enableConsole: !isProduction(),
  enableDatabase: true,
  enableFile: isProduction(),
  databaseTable: 'error_logs',
  filePath: getEnvVar('LOG_FILE_PATH', './logs/app.log'),
  maxFileSize: parseInt(getEnvVar('LOG_MAX_FILE_SIZE', '10485760')), // 10MB
  maxFiles: parseInt(getEnvVar('LOG_MAX_FILES', '5')),
  format: isProduction() ? 'json' : 'pretty',
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

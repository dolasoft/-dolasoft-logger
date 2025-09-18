// Simple Logger - Main Entry Point
// Universal logging - works everywhere, no setup needed
export { log, getLogger, SimpleLogger } from './simple-logger';

// Next.js Logger - Optimized for Next.js applications
export { logger as nextjsLogger, NextJSLogger, getLoggerInstance } from './nextjs-logger-class';

// React integration (optional)
export { useLogger } from './use-logger';

// Advanced usage (optional)
export { ConsoleAdapter } from './adapters/console';
export { FileAdapter } from './adapters/file';
export { RemoteAdapter } from './adapters/remote';
export { generateUUID, generateShortId, generateRequestId } from './utils/uuid';
export { createConfig, validateConfig } from './core/config';

// Base classes for custom implementations
export { BaseLogger } from './core/base-logger';

// Export enums as values (not just types)
export { LogLevel, LogStrategy } from './core/types';
export type { LoggerConfig, LogEntry } from './core/types';

// Default export - the universal log object
export { log as default } from './simple-logger';
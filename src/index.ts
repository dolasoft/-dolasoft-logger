// Simple Logger - Main Entry Point
// Universal logging - works everywhere, no setup needed
export { log, getLogger, SimpleLogger } from './simple-logger';

// React integration (optional)
export { useLogger } from './use-logger';

// Advanced usage (optional)
export { ConsoleAdapter } from './adapters/console';
export { FileAdapter } from './adapters/file';
export { RemoteAdapter } from './adapters/remote';
export { generateUUID, generateShortId, generateRequestId } from './utils/uuid';
export { createConfig, validateConfig } from './core/config';
export type { LoggerConfig, LogLevel, LogStrategy, LogEntry } from './core/types';

// Default export - the universal log object
export { log as default } from './simple-logger';
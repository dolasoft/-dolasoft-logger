// Simple Logger - Main Entry Point
export { SimpleLogger, getLogger, log } from './simple-logger';
export { SimpleLoggerProvider, useLogger } from './simple-react-provider';
export { ConsoleAdapter } from './adapters/console';
export { FileAdapter } from './adapters/file';
export { generateUUID, generateShortId, generateRequestId } from './utils/uuid';
export { createConfig, validateConfig } from './core/config';
export type { LoggerConfig, LogLevel, LogStrategy, LogEntry } from './core/types';

// Default export
import { getLogger } from './simple-logger';
export default getLogger;
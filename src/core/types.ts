export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export enum LogStrategy {
  CONSOLE = 'console',
  MEMORY = 'memory',
  DATABASE = 'database',
  FILE = 'file',
  HYBRID = 'hybrid',
  REMOTE = 'remote'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string;
  context?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  requestId?: string;
  appSlug?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
}

export interface LoggerConfig {
  strategy: LogStrategy;
  level: LogLevel;
  maxMemoryEntries?: number;
  maxDatabaseEntries?: number;
  maxFileEntries?: number;
  enableConsole?: boolean;
  enableDatabase?: boolean;
  enableFile?: boolean;
  databaseTable?: string;
  filePath?: string;
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  format?: 'json' | 'text' | 'pretty';
  includeStack?: boolean;
  includeMetadata?: boolean;
}

export interface LogAdapter {
  name: string;
  log(entry: LogEntry): Promise<void>;
  configure?(config: Partial<LoggerConfig>): void;
  cleanup?(): Promise<void>;
}

export interface DatabaseAdapter extends LogAdapter {
  name: 'database';
  query?(filters: LogQueryFilters): Promise<LogEntry[]>;
  clear?(): Promise<void>;
}

export interface LogQueryFilters {
  level?: LogLevel;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  appSlug?: string;
  limit?: number;
  offset?: number;
}

export interface LogStats {
  memory: number;
  database: number;
  file: number;
  errors: number;
  maxMemory: number;
  maxDatabase: number;
  maxFile: number;
}

export type LogMethod = (
  message: string,
  context?: Record<string, unknown>,
  metadata?: Record<string, unknown>
) => void;

export type ErrorLogMethod = (
  message: string,
  error?: Error,
  context?: Record<string, unknown>,
  metadata?: Record<string, unknown>
) => void;

declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
declare enum LogStrategy {
    CONSOLE = "console",
    MEMORY = "memory",
    DATABASE = "database",
    FILE = "file",
    HYBRID = "hybrid"
}
interface LogEntry {
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
interface LoggerConfig {
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
    maxFileSize?: number;
    maxFiles?: number;
    format?: 'json' | 'text' | 'pretty';
    includeStack?: boolean;
    includeMetadata?: boolean;
}
interface LogStats {
    memory: number;
    database: number;
    file: number;
    errors: number;
    maxMemory: number;
    maxDatabase: number;
    maxFile: number;
}
type LogMethod = (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => void;
type ErrorLogMethod = (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => void;

declare class LoggerService {
    private static instance;
    private config;
    private adapters;
    private constructor();
    /**
     * Get the singleton instance of LoggerService
     */
    static getInstance(config?: Partial<LoggerConfig>): LoggerService;
    /**
     * Create a new instance (for testing or multiple loggers)
     */
    static create(config?: Partial<LoggerConfig>): LoggerService;
    /**
     * Reset the singleton instance (useful for testing)
     */
    static reset(): void;
    private initializeAdapters;
    private shouldLog;
    private createLogEntry;
    private generateId;
    private log;
    debug(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    fatal(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    getLogs(adapterName?: string, limit?: number): Promise<LogEntry[]>;
    getErrorLogs(limit?: number): Promise<LogEntry[]>;
    clearLogs(adapterName?: string): Promise<void>;
    getStats(): LogStats;
    updateConfig(newConfig: Partial<LoggerConfig>): void;
    cleanup(): Promise<void>;
}

interface NextJSClientLoggerOptions {
    appSlug?: string;
    userId?: string;
    requestId?: string;
    logger?: LoggerService;
    enableConsole?: boolean;
    enableRemote?: boolean;
    remoteEndpoint?: string;
    strategy?: LogStrategy;
    level?: LogLevel;
}
declare function useNextJSClientLogger(options?: NextJSClientLoggerOptions): {
    debug: LogMethod;
    info: LogMethod;
    warn: LogMethod;
    error: ErrorLogMethod;
    fatal: ErrorLogMethod;
};
declare class NextJSClientLogger {
    private logger;
    private appSlug?;
    private userId?;
    private requestId?;
    private enableRemote;
    private remoteEndpoint;
    constructor(options?: NextJSClientLoggerOptions);
    private createContext;
    private sendToRemote;
    debug(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    fatal(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
}
declare function createNextJSClientLogger(options?: NextJSClientLoggerOptions): NextJSClientLogger;

export { NextJSClientLogger, createNextJSClientLogger, useNextJSClientLogger };
export type { NextJSClientLoggerOptions };

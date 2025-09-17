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
interface LogAdapter {
    name: string;
    log(entry: LogEntry): Promise<void>;
    configure?(config: Partial<LoggerConfig>): void;
    cleanup?(): Promise<void>;
}
interface LogQueryFilters {
    level?: LogLevel;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    appSlug?: string;
    limit?: number;
    offset?: number;
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

declare function createConfig(overrides?: Partial<LoggerConfig>): LoggerConfig;
declare function validateConfig(config: LoggerConfig): string[];

declare class ConsoleAdapter implements LogAdapter {
    name: string;
    private config;
    configure(config: Partial<LoggerConfig>): void;
    log(entry: LogEntry): Promise<void>;
}

declare class MemoryAdapter implements LogAdapter {
    name: string;
    private config;
    private logs;
    configure(config: Partial<LoggerConfig>): void;
    log(entry: LogEntry): Promise<void>;
    getLogs(limit?: number): LogEntry[];
    getErrorLogs(limit?: number): LogEntry[];
    clear(): void;
    getStats(): {
        count: number;
        errors: number;
        maxEntries: number;
    };
}

declare class DatabaseAdapter implements LogAdapter {
    name: string;
    private config;
    private logs;
    configure(config: Partial<LoggerConfig>): void;
    log(entry: LogEntry): Promise<void>;
    query(filters?: LogQueryFilters): Promise<LogEntry[]>;
    clear(): Promise<void>;
    getStats(): {
        count: number;
        errors: number;
        maxEntries: number;
    };
}

interface FileAdapterConfig {
    filePath?: string;
    directory?: string;
    fileName?: string;
    maxFileSize?: number;
    maxFiles?: number;
    enableRotation?: boolean;
    enableCompression?: boolean;
    logLevels?: LogLevel[];
    includeTimestamp?: boolean;
    includeLevel?: boolean;
    format?: 'json' | 'text' | 'pretty';
    overwrite?: boolean;
    append?: boolean;
}
declare class FileAdapter implements LogAdapter {
    name: string;
    private config;
    private fileConfig;
    private logs;
    private filePath;
    private currentFileSize;
    configure(config: Partial<LoggerConfig> & Partial<FileAdapterConfig>): void;
    private setupFilePath;
    private ensureDirectoryExists;
    log(entry: LogEntry): Promise<void>;
    private writeToFile;
    private formatLogEntry;
    private rotateIfNeeded;
    private rotateFile;
    getStats(): {
        count: number;
        errors: number;
        maxEntries: number;
        filePath: string;
    };
    cleanup(): Promise<void>;
}

interface UseLoggerOptions {
    appSlug?: string;
    userId?: string;
    requestId?: string;
    logger?: LoggerService;
}
declare function useLogger(options?: UseLoggerOptions): {
    debug: LogMethod;
    info: LogMethod;
    warn: LogMethod;
    error: ErrorLogMethod;
    fatal: ErrorLogMethod;
};

interface NextRequest {
    method: string;
    url: string;
    headers: Headers;
    body: ReadableStream<Uint8Array> | null;
    nextUrl: URL;
    cookies: Map<string, string>;
}

declare class ServerLogger {
    private static instance;
    private requestId;
    private appSlug?;
    private userId?;
    private logger;
    private constructor();
    static getInstance(logger?: LoggerService): ServerLogger;
    /**
     * Reset the singleton instance (useful for testing)
     */
    static reset(): void;
    setRequestContext(request?: NextRequest): void;
    private generateId;
    private extractAppSlug;
    private extractUserId;
    private createContext;
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>): void;
    fatal(message: string, error?: Error, context?: Record<string, unknown>): void;
}
declare function getServerLogger(request?: NextRequest, logger?: LoggerService): ServerLogger;
declare const logApiError: (request: NextRequest, message: string, error?: Error, context?: Record<string, unknown>, logger?: LoggerService) => void;
declare const logApiInfo: (request: NextRequest, message: string, context?: Record<string, unknown>, logger?: LoggerService) => void;
declare const logApiWarn: (request: NextRequest, message: string, context?: Record<string, unknown>, logger?: LoggerService) => void;

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

interface Request {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body: unknown;
    params: Record<string, string>;
    query: Record<string, string | string[] | undefined>;
    ip?: string;
    user?: unknown;
    get: (name: string) => string | undefined;
}
interface Response {
    statusCode: number;
    status: (code: number) => Response;
    json: (data: unknown) => Response;
    send: (data: unknown) => Response;
    end: (chunk?: unknown, encoding?: string) => Response;
    setHeader: (name: string, value: string | number | string[]) => Response;
    on: (event: string, listener: (error: Error) => void) => Response;
    locals: Record<string, unknown>;
}
interface NextFunction {
    (error?: Error): void;
}

declare function createLoggingMiddleware(logger?: LoggerService): (req: Request, res: Response, next: NextFunction) => void;
declare function createErrorHandler(logger?: LoggerService): (error: Error, req: Request, res: Response, _next: NextFunction) => void;
declare function createExpressLogger(config?: Partial<LoggerConfig>): LoggerService;

/**
 * Generate a UUID v4 string
 * Uses native crypto.randomUUID when available (Node.js 15.6.0+, modern browsers)
 * Falls back to Math.random() implementation for older environments
 */
declare function generateUUID(): string;
/**
 * Generate a shorter ID (8 characters) for request IDs
 */
declare function generateShortId(): string;
/**
 * Generate a request ID with optional prefix
 */
declare function generateRequestId(prefix?: string): string;

/**
 * Singleton Manager for managing all logger singletons
 * Useful for testing and cleanup
 */
declare class SingletonManager {
    /**
     * Reset all logger singletons
     * Useful for testing to ensure clean state
     */
    static resetAll(): void;
    /**
     * Get the current state of all singletons
     */
    static getState(): {
        loggerService: LoggerService;
        serverLogger: ServerLogger;
    };
    /**
     * Check if all singletons are properly initialized
     */
    static isInitialized(): boolean;
}
/**
 * Convenience function to reset all singletons
 */
declare const resetAllSingletons: typeof SingletonManager.resetAll;
/**
 * Convenience function to check if all singletons are initialized
 */
declare const areSingletonsInitialized: typeof SingletonManager.isInitialized;

declare function getLogger(config?: Partial<LoggerConfig>): LoggerService;
declare const logError: (message: string, error?: Error, context?: Record<string, unknown>) => void;
declare const logInfo: (message: string, context?: Record<string, unknown>) => void;
declare const logWarn: (message: string, context?: Record<string, unknown>) => void;
declare const logDebug: (message: string, context?: Record<string, unknown>) => void;
declare const logFatal: (message: string, error?: Error, context?: Record<string, unknown>) => void;

export { ConsoleAdapter, DatabaseAdapter, FileAdapter, LogLevel, LogStrategy, LoggerService, MemoryAdapter, NextJSClientLogger, ServerLogger, SingletonManager, areSingletonsInitialized, createConfig, createErrorHandler, createExpressLogger, createLoggingMiddleware, createNextJSClientLogger, getLogger as default, generateRequestId, generateShortId, generateUUID, getLogger, getServerLogger, logApiError, logApiInfo, logApiWarn, logDebug, logError, logFatal, logInfo, logWarn, resetAllSingletons, useLogger, useNextJSClientLogger, validateConfig };
export type { ErrorLogMethod, LogAdapter, LogEntry, LogMethod, LogQueryFilters, LogStats, LoggerConfig };

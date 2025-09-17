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

export { createErrorHandler, createExpressLogger, createLoggingMiddleware };
export type { NextFunction, Request, Response };

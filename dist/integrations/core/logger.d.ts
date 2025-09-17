import { LogEntry, LoggerConfig, LogStats } from './types';
export declare class LoggerService {
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
//# sourceMappingURL=logger.d.ts.map
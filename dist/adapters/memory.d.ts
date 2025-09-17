import { LogAdapter, LogEntry, LoggerConfig } from '../core/types';
export declare class MemoryAdapter implements LogAdapter {
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
//# sourceMappingURL=memory.d.ts.map
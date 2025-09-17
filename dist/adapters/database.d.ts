import { LogAdapter, LogEntry, LoggerConfig, LogQueryFilters } from '../core/types';
export declare class DatabaseAdapter implements LogAdapter {
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
//# sourceMappingURL=database.d.ts.map
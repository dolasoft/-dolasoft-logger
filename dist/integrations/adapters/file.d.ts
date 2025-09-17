import { LogAdapter, LogEntry, LoggerConfig, LogLevel } from '../core/types';
export interface FileAdapterConfig {
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
export declare class FileAdapter implements LogAdapter {
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
//# sourceMappingURL=file.d.ts.map
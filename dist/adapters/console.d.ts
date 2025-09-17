import { LogAdapter, LogEntry, LoggerConfig } from '../core/types';
export declare class ConsoleAdapter implements LogAdapter {
    name: string;
    private config;
    configure(config: Partial<LoggerConfig>): void;
    log(entry: LogEntry): Promise<void>;
}
//# sourceMappingURL=console.d.ts.map
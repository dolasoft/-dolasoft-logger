import { LogAdapter, LogEntry, LoggerConfig, LogLevel } from '../core/types';

export class MemoryAdapter implements LogAdapter {
  name = 'memory';
  private config: Partial<LoggerConfig> = {};
  private logs: LogEntry[] = [];

  configure(config: Partial<LoggerConfig>): void {
    this.config = config;
  }

  async log(entry: LogEntry): Promise<void> {
    this.logs.push(entry);
    
    // Keep only the last N entries
    const maxEntries = this.config.maxMemoryEntries || 1000;
    if (this.logs.length > maxEntries) {
      this.logs = this.logs.slice(-maxEntries);
    }
  }

  getLogs(limit?: number): LogEntry[] {
    const logs = this.logs.slice();
    return limit ? logs.slice(-limit) : logs;
  }

  getErrorLogs(limit?: number): LogEntry[] {
    const errorLogs = this.logs.filter(log => log.level >= LogLevel.ERROR);
    return limit ? errorLogs.slice(-limit) : errorLogs;
  }

  clear(): void {
    this.logs = [];
  }

  getStats() {
    const errorCount = this.logs.filter(log => log.level >= LogLevel.ERROR).length;
    return {
      count: this.logs.length,
      errors: errorCount,
      maxEntries: this.config.maxMemoryEntries || 1000
    };
  }
}

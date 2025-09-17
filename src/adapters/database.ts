import { LogAdapter, LogEntry, LoggerConfig, LogLevel, LogQueryFilters } from '../core/types';

export class DatabaseAdapter implements LogAdapter {
  name = 'database';
  private config: Partial<LoggerConfig> = {};
  private logs: LogEntry[] = [];

  configure(config: Partial<LoggerConfig>): void {
    this.config = config;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.config.enableDatabase) return;

    // Only store ERROR and FATAL logs in database by default
    if (entry.level < LogLevel.ERROR) return;

    try {
      this.logs.push(entry);
      
      // Enforce strict limit with rotation
      const maxEntries = this.config.maxDatabaseEntries || 10000;
      if (this.logs.length > maxEntries) {
        // Remove oldest entries, keeping only the most recent
        this.logs = this.logs.slice(-maxEntries);
      }

      // In a real implementation, this would use your database client
      // For now, we're using in-memory storage with strict limits
      // TODO: Implement actual database storage with proper rotation
      
    } catch (error) {
      // Fallback to console if database logging fails
      console.error('Database logging failed:', error);
    }
  }

  async query(filters: LogQueryFilters = {}): Promise<LogEntry[]> {
    let filteredLogs = this.logs.slice();

    if (filters.level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= filters.level!);
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.appSlug) {
      filteredLogs = filteredLogs.filter(log => log.appSlug === filters.appSlug);
    }

    // Apply pagination
    if (filters.offset) {
      filteredLogs = filteredLogs.slice(filters.offset);
    }

    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  async clear(): Promise<void> {
    this.logs = [];
  }

  getStats() {
    const errorCount = this.logs.filter(log => log.level >= LogLevel.ERROR).length;
    return {
      count: this.logs.length,
      errors: errorCount,
      maxEntries: this.config.maxDatabaseEntries || 10000
    };
  }
}

import { LogAdapter, LogEntry, LoggerConfig, LogLevel } from '../core/types';

export class ConsoleAdapter implements LogAdapter {
  name = 'console';
  private config: Partial<LoggerConfig> = {};

  configure(config: Partial<LoggerConfig>): void {
    this.config = config;
  }

  private isDevelopment(): boolean {
    // Allow override for testing
    if (this.config.forceConsole) {
      return true;
    }
    
    // Check Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
    }
    
    // Check browser environment
    if (typeof window !== 'undefined') {
      return window.location?.hostname === 'localhost' || 
             window.location?.hostname === '127.0.0.1' ||
             window.location?.hostname?.includes('localhost');
    }
    
    // Default to development if we can't determine
    return true;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.config.enableConsole) return;

    // Only log to console in development
    const isDevelopment = this.isDevelopment();
    
    if (!isDevelopment) return;

    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const metadataStr = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';

    let logMessage = `[${timestamp}] ${levelName}: ${entry.message}${contextStr}${metadataStr}`;

    if (entry.error && this.config.includeStack) {
      logMessage += `\nError: ${entry.error.message}`;
      if (entry.stack) {
        logMessage += `\nStack: ${entry.stack}`;
      }
    }

    // Use appropriate console method based on log level
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}

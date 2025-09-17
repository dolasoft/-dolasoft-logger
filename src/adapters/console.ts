import { LogAdapter, LogEntry, LoggerConfig, LogLevel } from '../core/types';

export class ConsoleAdapter implements LogAdapter {
  name = 'console';
  private config: Partial<LoggerConfig> = {};

  configure(config: Partial<LoggerConfig>): void {
    this.config = config;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.config.enableConsole) return;

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

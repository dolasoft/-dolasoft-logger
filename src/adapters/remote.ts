import { LogAdapter, LogEntry, LoggerConfig, LogLevel } from '../core/types';

export interface RemoteAdapterConfig {
  url: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export class RemoteAdapter implements LogAdapter {
  name = 'remote';
  private config: Partial<LoggerConfig> = {};
  private remoteConfig: RemoteAdapterConfig | null = null;

  configure(config: Partial<LoggerConfig>): void {
    this.config = config;
    this.remoteConfig = config.remoteConfig as RemoteAdapterConfig;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.remoteConfig) return;

    // Check if fetch is available (works in modern browsers and Node.js 18+)
    if (typeof fetch === 'undefined') {
      console.warn('RemoteAdapter: fetch is not available in this environment');
      return;
    }

    try {
      const payload = this.formatLogEntry(entry);
      
      // Create AbortController for timeout if AbortSignal.timeout is not available
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.remoteConfig!.timeout || 5000);
      
      const response = await fetch(this.remoteConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.remoteConfig.apiKey && { 'Authorization': `Bearer ${this.remoteConfig.apiKey}` }),
          ...this.remoteConfig.headers
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Remote logging failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Remote logging timeout');
      } else {
        console.error('Failed to send log to remote service:', error);
      }
    }
  }

  private formatLogEntry(entry: LogEntry): Record<string, unknown> {
    return {
      timestamp: entry.timestamp.toISOString(),
      level: LogLevel[entry.level].toLowerCase(),
      message: entry.message,
      source: entry.source,
      context: entry.context,
      metadata: entry.metadata,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack
      } : undefined,
      tags: {
        level: LogLevel[entry.level].toLowerCase(),
        source: entry.source
      }
    };
  }
}

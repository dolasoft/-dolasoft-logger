import { LogAdapter, LogEntry, LoggerConfig, LogLevel } from '../core/types';

export class FileAdapter implements LogAdapter {
  name = 'file';
  private config: Partial<LoggerConfig> = {};
  private filePath: string = '';
  private isNodeEnv: boolean = false;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB default
  private maxFiles: number = 5; // Keep 5 files max

  constructor() {
    // Detect if we're in Node.js environment
    this.isNodeEnv = typeof process !== 'undefined' && 
                     !!process.versions?.node && 
                     typeof window === 'undefined';
  }

  configure(config: Partial<LoggerConfig>): void {
    this.config = config;
    this.filePath = config.filePath || './logs/app.log';
    this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = config.maxFiles || 5;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile) return;

    // Only work in Node.js environment
    if (!this.isNodeEnv) {
      console.warn('FileAdapter: File logging is only available in Node.js environment');
      return;
    }

    try {
      // Dynamic import for Node.js only
      const { promises: fs } = await import('fs');
      const { dirname } = await import('path');
      
      // Ensure directory exists
      await fs.mkdir(dirname(this.filePath), { recursive: true });

      // Check if file needs rotation
      await this.rotateIfNeeded(fs);

      const logLine = this.formatLogEntry(entry);
      await fs.appendFile(this.filePath, logLine + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private async rotateIfNeeded(fs: typeof import('fs').promises): Promise<void> {
    try {
      const stats = await fs.stat(this.filePath);
      if (stats.size >= this.maxFileSize) {
        await this.rotateFiles(fs);
      }
    } catch {
      // File doesn't exist yet, no rotation needed
    }
  }

  private async rotateFiles(fs: typeof import('fs').promises): Promise<void> {
    const { dirname, basename, extname } = await import('path');
    const dir = dirname(this.filePath);
    const baseName = basename(this.filePath, extname(this.filePath));
    const ext = extname(this.filePath);

    // Rotate existing files
    for (let i = this.maxFiles - 1; i > 0; i--) {
      const oldFile = `${dir}/${baseName}.${i}${ext}`;
      const newFile = `${dir}/${baseName}.${i + 1}${ext}`;
      
      try {
        await fs.rename(oldFile, newFile);
      } catch {
        // File doesn't exist, continue
      }
    }

    // Move current file to .1
    const rotatedFile = `${dir}/${baseName}.1${ext}`;
    try {
      await fs.rename(this.filePath, rotatedFile);
    } catch {
      // File doesn't exist, continue
    }

    // Remove files beyond maxFiles
    for (let i = this.maxFiles + 1; i <= this.maxFiles + 2; i++) {
      const fileToRemove = `${dir}/${baseName}.${i}${ext}`;
      try {
        await fs.unlink(fileToRemove);
      } catch {
        // File doesn't exist, continue
      }
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    
    const logData = {
      timestamp,
      level: levelName,
      message: entry.message,
      source: entry.source,
      context: entry.context,
      metadata: entry.metadata,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack
      } : undefined
    };

    return JSON.stringify(logData);
  }
}

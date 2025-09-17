import { LogAdapter, LogEntry, LoggerConfig, LogLevel } from '../core/types';
import * as fs from 'fs';
import * as path from 'path';

export interface FileAdapterConfig {
  filePath?: string;
  directory?: string;
  fileName?: string;
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  enableRotation?: boolean;
  enableCompression?: boolean;
  logLevels?: LogLevel[]; // Only log specific levels
  includeTimestamp?: boolean;
  includeLevel?: boolean;
  format?: 'json' | 'text' | 'pretty';
  overwrite?: boolean; // Overwrite existing files
  append?: boolean; // Append to existing files
}

export class FileAdapter implements LogAdapter {
  name = 'file';
  private config: Partial<LoggerConfig> = {};
  private fileConfig: FileAdapterConfig = {};
  private logs: LogEntry[] = [];
  private filePath: string = '';
  private currentFileSize: number = 0;

  configure(config: Partial<LoggerConfig> & Partial<FileAdapterConfig>): void {
    this.config = {
      enableFile: config.enableFile || false,
      ...config
    };
    this.fileConfig = {
      filePath: config.filePath || './logs/app.log',
      directory: config.directory || './logs',
      fileName: config.fileName || 'app.log',
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      maxFiles: config.maxFiles || 5,
      enableRotation: config.enableRotation !== undefined ? config.enableRotation : true,
      enableCompression: config.enableCompression || false,
      logLevels: config.logLevels || [LogLevel.ERROR, LogLevel.FATAL], // Use provided logLevels or default to errors only
      includeTimestamp: config.includeTimestamp !== undefined ? config.includeTimestamp : true,
      includeLevel: config.includeLevel !== undefined ? config.includeLevel : true,
      format: config.format || 'json',
      overwrite: config.overwrite || false,
      append: config.append !== undefined ? config.append : true
    };

    this.setupFilePath();
    this.ensureDirectoryExists();
  }

  private setupFilePath(): void {
    if (this.fileConfig.filePath) {
      this.filePath = this.fileConfig.filePath;
    } else if (this.fileConfig.directory && this.fileConfig.fileName) {
      this.filePath = path.join(this.fileConfig.directory, this.fileConfig.fileName);
    } else {
      this.filePath = './logs/app.log';
    }
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile) return;

    // Check if we should log this level
    if (this.fileConfig.logLevels && !this.fileConfig.logLevels.includes(entry.level)) {
      return;
    }

    try {
      this.logs.push(entry);
      
      // Keep only the last N entries in memory
      const maxEntries = this.config.maxFileEntries || 5000;
      if (this.logs.length > maxEntries) {
        this.logs = this.logs.slice(-maxEntries);
      }
      
      // Write to file
      await this.writeToFile(entry);
      
      // Check file size and rotate if needed
      if (this.fileConfig.enableRotation) {
        await this.rotateIfNeeded();
      }
      
    } catch (error) {
      console.error('File logging failed:', error);
    }
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    const logLine = this.formatLogEntry(entry);
    
    // Check if file exists and handle overwrite/append modes
    const fileExists = fs.existsSync(this.filePath);
    
    if (this.fileConfig.overwrite && !fileExists) {
      // Create new file
      fs.writeFileSync(this.filePath, logLine + '\n');
      this.currentFileSize = logLine.length + 1;
    } else if (this.fileConfig.append || fileExists) {
      // Append to existing file
      fs.appendFileSync(this.filePath, logLine + '\n');
      this.currentFileSize += logLine.length + 1;
    } else {
      // Overwrite existing file
      fs.writeFileSync(this.filePath, logLine + '\n');
      this.currentFileSize = logLine.length + 1;
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const baseLog: Record<string, unknown> = {};

    // Add timestamp if enabled
    if (this.fileConfig.includeTimestamp !== false) {
      baseLog.timestamp = entry.timestamp.toISOString();
    }

    // Add level if enabled
    if (this.fileConfig.includeLevel !== false) {
      baseLog.level = LogLevel[entry.level];
    }

    // Always include message
    baseLog.message = entry.message;

    // Add optional fields
    if (entry.context) baseLog.context = entry.context;
    if (entry.metadata) baseLog.metadata = entry.metadata;
    if (entry.userId) baseLog.userId = entry.userId;
    if (entry.requestId) baseLog.requestId = entry.requestId;
    if (entry.appSlug) baseLog.appSlug = entry.appSlug;
    if (entry.error) baseLog.error = entry.error.message;
    if (entry.stack) baseLog.stack = entry.stack;

    const format = this.fileConfig.format || 'json';

    if (format === 'json') {
      return JSON.stringify(baseLog);
    } else if (format === 'pretty') {
      return JSON.stringify(baseLog, null, 2);
    } else {
      // Text format
      const timestamp = this.fileConfig.includeTimestamp !== false ? `[${baseLog.timestamp}] ` : '';
      const level = this.fileConfig.includeLevel !== false ? `${baseLog.level} ` : '';
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
      const metadataStr = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
      return `${timestamp}${level}${baseLog.message}${contextStr}${metadataStr}`;
    }
  }

  private async rotateIfNeeded(): Promise<void> {
    try {
      const stats = fs.statSync(this.filePath);
      const maxFileSize = this.fileConfig.maxFileSize || 10 * 1024 * 1024; // 10MB
      
      if (stats.size > maxFileSize) {
        await this.rotateFile();
      }
    } catch (error) {
      console.error('FileAdapter.rotateIfNeeded failed:', error);
    }
  }

  private async rotateFile(): Promise<void> {
    const maxFiles = this.fileConfig.maxFiles || 5;
    const basePath = this.filePath.replace('.log', '');
    
    // Rotate existing files
    for (let i = maxFiles - 1; i > 0; i--) {
      const oldFile = `${basePath}.${i}.log`;
      const newFile = `${basePath}.${i + 1}.log`;
      
      if (fs.existsSync(oldFile)) {
        if (i === maxFiles - 1) {
          // Delete the oldest file
          fs.unlinkSync(oldFile);
        } else {
          // Move to next number
          fs.renameSync(oldFile, newFile);
        }
      }
    }
    
    // Move current file to .1
    if (fs.existsSync(this.filePath)) {
      fs.renameSync(this.filePath, `${basePath}.1.log`);
      this.currentFileSize = 0; // Reset file size counter
    }
  }

  getStats() {
    const errorCount = this.logs.filter(log => log.level >= LogLevel.ERROR).length;
    return {
      count: this.logs.length,
      errors: errorCount,
      maxEntries: this.config.maxFileEntries || 5000,
      filePath: this.filePath
    };
  }

  async cleanup(): Promise<void> {
    // Cleanup any resources if needed
  }
}

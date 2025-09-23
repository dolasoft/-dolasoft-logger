export interface LogLevel {
  level: 'debug' | 'info' | 'warn' | 'error';
}

export interface LogEntry extends LogLevel {
  timestamp: string;
  message: string;
  context?: unknown;
  metadata?: unknown;
}

export interface TraceStep {
  timestamp: string;
  duration?: number;
  level: 'start' | 'complete' | 'error' | 'info';
  emoji?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ExecutionStep {
  stepId: string;
  stepName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
  status: 'started' | 'completed' | 'failed';
  error?: string;
}

export interface Session {
  id: string;
  type: 'trace' | 'execution' | 'general';
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  steps: (TraceStep | ExecutionStep | LogEntry)[];
  metadata?: Record<string, unknown>;
}

export const LOG_MODES = {
  CONSOLE: 'console',
  ROUTE: 'route',
  BOTH: 'both',
  NONE: 'none',
} as const;

export type LogMode = (typeof LOG_MODES)[keyof typeof LOG_MODES];

export interface UnifiedLoggerConfig {
  logMode?: LogMode;
  routeUrl?: string;
  maxLogs?: number;
  maxSessions?: number;
  sensitiveFields?: string[];
}

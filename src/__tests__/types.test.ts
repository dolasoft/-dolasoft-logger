import { describe, it, expect } from 'vitest';
import type {
  LogLevel,
  LogEntry,
  TraceStep,
  ExecutionStep,
  Session,
  LogMode,
  UnifiedLoggerConfig,
} from '../types';

describe('Type Definitions', () => {
  describe('LogLevel', () => {
    it('should accept valid log levels', () => {
      const validLevels: LogLevel[] = [
        { level: 'debug' },
        { level: 'info' },
        { level: 'warn' },
        { level: 'error' },
      ];

      validLevels.forEach(level => {
        expect(level.level).toMatch(/^(debug|info|warn|error)$/);
      });
    });
  });

  describe('LogEntry', () => {
    it('should have required and optional fields', () => {
      const entry: LogEntry = {
        level: 'info',
        timestamp: new Date().toISOString(),
        message: 'Test message',
      };

      expect(entry.level).toBeDefined();
      expect(entry.timestamp).toBeDefined();
      expect(entry.message).toBeDefined();
      expect(entry.context).toBeUndefined();
      expect(entry.metadata).toBeUndefined();
    });

    it('should accept context and metadata', () => {
      const entry: LogEntry = {
        level: 'debug',
        timestamp: new Date().toISOString(),
        message: 'Debug info',
        context: { userId: 123 },
        metadata: { source: 'test' },
      };

      expect(entry.context).toEqual({ userId: 123 });
      expect(entry.metadata).toEqual({ source: 'test' });
    });
  });

  describe('TraceStep', () => {
    it('should have valid trace levels', () => {
      const levels: TraceStep['level'][] = [
        'start',
        'complete',
        'error',
        'info',
      ];

      levels.forEach(level => {
        const step: TraceStep = {
          timestamp: new Date().toISOString(),
          level,
          message: 'Test step',
        };

        expect(step.level).toBe(level);
      });
    });

    it('should support optional fields', () => {
      const step: TraceStep = {
        timestamp: new Date().toISOString(),
        level: 'complete',
        message: '✅ Done',
        duration: 123,
        emoji: '✅',
        metadata: { records: 100 },
      };

      expect(step.duration).toBe(123);
      expect(step.emoji).toBe('✅');
      expect(step.metadata).toEqual({ records: 100 });
    });
  });

  describe('ExecutionStep', () => {
    it('should track execution status', () => {
      const statuses: ExecutionStep['status'][] = [
        'started',
        'completed',
        'failed',
      ];

      statuses.forEach(status => {
        const step: ExecutionStep = {
          stepId: 'step-1',
          stepName: 'Test Step',
          startTime: Date.now(),
          status,
        };

        expect(step.status).toBe(status);
      });
    });

    it('should support timing and error information', () => {
      const step: ExecutionStep = {
        stepId: 'step-2',
        stepName: 'Failed Step',
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        duration: 1000,
        status: 'failed',
        error: 'Connection timeout',
        metadata: { attempt: 3 },
      };

      expect(step.duration).toBe(1000);
      expect(step.error).toBe('Connection timeout');
      expect(step.metadata).toEqual({ attempt: 3 });
    });
  });

  describe('Session', () => {
    it('should support different session types', () => {
      const types: Session['type'][] = ['trace', 'execution', 'general'];

      types.forEach(type => {
        const session: Session = {
          id: `session-${type}`,
          type,
          startTime: new Date().toISOString(),
          steps: [],
        };

        expect(session.type).toBe(type);
      });
    });

    it('should accept mixed step types', () => {
      const logEntry: LogEntry = {
        level: 'info',
        timestamp: new Date().toISOString(),
        message: 'Log',
      };

      const traceStep: TraceStep = {
        timestamp: new Date().toISOString(),
        level: 'start',
        message: 'Start',
      };

      const execStep: ExecutionStep = {
        stepId: 'exec-1',
        stepName: 'Execute',
        startTime: Date.now(),
        status: 'started',
      };

      const session: Session = {
        id: 'mixed-session',
        type: 'general',
        startTime: new Date().toISOString(),
        steps: [logEntry, traceStep, execStep],
      };

      expect(session.steps).toHaveLength(3);
    });
  });

  describe('LogMode', () => {
    it('should only accept valid log modes', () => {
      const modes: LogMode[] = ['console', 'route', 'both', 'none'];

      modes.forEach(mode => {
        expect(mode).toMatch(/^(console|route|both|none)$/);
      });
    });
  });

  describe('UnifiedLoggerConfig', () => {
    it('should accept all configuration options', () => {
      const config: UnifiedLoggerConfig = {
        logMode: 'both',
        routeUrl: 'https://api.example.com/logs',
        maxLogs: 500,
        maxSessions: 50,
        sensitiveFields: ['password', 'apiKey'],
      };

      expect(config.logMode).toBe('both');
      expect(config.routeUrl).toBe('https://api.example.com/logs');
      expect(config.maxLogs).toBe(500);
      expect(config.maxSessions).toBe(50);
      expect(config.sensitiveFields).toEqual(['password', 'apiKey']);
    });

    it('should allow partial configuration', () => {
      const minimalConfig: UnifiedLoggerConfig = {
        logMode: 'console',
      };

      const emptyConfig: UnifiedLoggerConfig = {};

      expect(minimalConfig.logMode).toBe('console');
      expect(emptyConfig).toEqual({});
    });
  });
});

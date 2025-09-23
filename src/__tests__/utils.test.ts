import { describe, it, expect } from 'vitest';
import { sanitizeData } from '../utils/sanitize';
import {
  sortSessionsDesc,
  sortSessionEntriesDesc,
} from '../utils/session-utils';
import type { Session } from '../types';

describe('Utility Functions', () => {
  describe('sanitizeData', () => {
    it('should remove sensitive fields', () => {
      const data = {
        username: 'john',
        password: 'secret123',
        apiKey: 'key-123',
        email: 'john@example.com',
      };

      const sanitized = sanitizeData(['password', 'apiKey'], data);

      expect(sanitized).toEqual({
        username: 'john',
        email: 'john@example.com',
      });
    });

    it('should handle case-insensitive field matching', () => {
      const data = {
        UserPassword: 'secret',
        API_KEY: 'key-123',
        passwordHash: 'hash123',
      };

      const sanitized = sanitizeData(['password', 'apikey'], data);

      expect(sanitized).toEqual({
        API_KEY: 'key-123', // 'apikey' doesn't match 'API_KEY' with underscore
      });
    });

    it('should return undefined for undefined input', () => {
      const result = sanitizeData(['password'], undefined);
      expect(result).toBeUndefined();
    });

    it('should return empty object for null input', () => {
      const result = sanitizeData(['password'], null);
      expect(result).toEqual({});
    });

    it('should return empty object for non-object input', () => {
      expect(sanitizeData(['password'], 'string')).toEqual({});
      expect(sanitizeData(['password'], 123)).toEqual({});
      expect(sanitizeData(['password'], true)).toEqual({});
    });

    it('should return empty object for arrays', () => {
      const result = sanitizeData(['password'], ['a', 'b', 'c']);
      expect(result).toEqual({});
    });

    it('should handle nested objects (shallow sanitization)', () => {
      const data = {
        user: {
          name: 'john',
          password: 'secret',
        },
        password: 'another-secret',
      };

      const sanitized = sanitizeData(['password'], data);

      expect(sanitized).toEqual({
        user: {
          name: 'john',
          password: 'secret', // Nested password is not removed
        },
      });
    });

    it('should handle empty sensitive fields array', () => {
      const data = {
        password: 'secret',
        apiKey: 'key',
      };

      const sanitized = sanitizeData([], data);

      expect(sanitized).toEqual(data);
    });
  });

  describe('sortSessionsDesc', () => {
    it('should sort sessions by start time descending', () => {
      const sessions: Session[] = [
        {
          id: 's1',
          type: 'trace',
          startTime: '2023-01-01T10:00:00Z',
          steps: [],
        },
        {
          id: 's2',
          type: 'trace',
          startTime: '2023-01-01T12:00:00Z',
          steps: [],
        },
        {
          id: 's3',
          type: 'trace',
          startTime: '2023-01-01T11:00:00Z',
          steps: [],
        },
      ];

      const sorted = sortSessionsDesc(sessions);

      expect(sorted.map(s => s.id)).toEqual(['s2', 's3', 's1']);
    });

    it('should sort by id when timestamps are equal', () => {
      const sessions: Session[] = [
        {
          id: 'b-session',
          type: 'trace',
          startTime: '2023-01-01T10:00:00Z',
          steps: [],
        },
        {
          id: 'a-session',
          type: 'trace',
          startTime: '2023-01-01T10:00:00Z',
          steps: [],
        },
        {
          id: 'c-session',
          type: 'trace',
          startTime: '2023-01-01T10:00:00Z',
          steps: [],
        },
      ];

      const sorted = sortSessionsDesc(sessions);

      expect(sorted.map(s => s.id)).toEqual([
        'c-session',
        'b-session',
        'a-session',
      ]);
    });

    it('should handle empty array', () => {
      const sorted = sortSessionsDesc([]);
      expect(sorted).toEqual([]);
    });

    it('should not modify original array', () => {
      const sessions: Session[] = [
        {
          id: 's1',
          type: 'trace',
          startTime: '2023-01-01T10:00:00Z',
          steps: [],
        },
        {
          id: 's2',
          type: 'trace',
          startTime: '2023-01-01T12:00:00Z',
          steps: [],
        },
      ];

      const original = [...sessions];
      sortSessionsDesc(sessions);

      expect(sessions).toEqual(original);
    });
  });

  describe('sortSessionEntriesDesc', () => {
    it('should sort session entries by start time descending', () => {
      const entries: Array<[string, Session]> = [
        [
          'key1',
          {
            id: 's1',
            type: 'trace',
            startTime: '2023-01-01T10:00:00Z',
            steps: [],
          },
        ],
        [
          'key2',
          {
            id: 's2',
            type: 'trace',
            startTime: '2023-01-01T12:00:00Z',
            steps: [],
          },
        ],
        [
          'key3',
          {
            id: 's3',
            type: 'trace',
            startTime: '2023-01-01T11:00:00Z',
            steps: [],
          },
        ],
      ];

      const sorted = sortSessionEntriesDesc(entries);

      expect(sorted.map(e => e[0])).toEqual(['key2', 'key3', 'key1']);
    });

    it('should sort by key when timestamps are equal', () => {
      const entries: Array<[string, Session]> = [
        [
          'b-key',
          {
            id: 's1',
            type: 'trace',
            startTime: '2023-01-01T10:00:00Z',
            steps: [],
          },
        ],
        [
          'a-key',
          {
            id: 's2',
            type: 'trace',
            startTime: '2023-01-01T10:00:00Z',
            steps: [],
          },
        ],
        [
          'c-key',
          {
            id: 's3',
            type: 'trace',
            startTime: '2023-01-01T10:00:00Z',
            steps: [],
          },
        ],
      ];

      const sorted = sortSessionEntriesDesc(entries);

      expect(sorted.map(e => e[0])).toEqual(['c-key', 'b-key', 'a-key']);
    });

    it('should handle empty array', () => {
      const sorted = sortSessionEntriesDesc([]);
      expect(sorted).toEqual([]);
    });

    it('should not modify original array', () => {
      const entries: Array<[string, Session]> = [
        [
          'key1',
          {
            id: 's1',
            type: 'trace',
            startTime: '2023-01-01T10:00:00Z',
            steps: [],
          },
        ],
        [
          'key2',
          {
            id: 's2',
            type: 'trace',
            startTime: '2023-01-01T12:00:00Z',
            steps: [],
          },
        ],
      ];

      const original = [...entries];
      sortSessionEntriesDesc(entries);

      expect(entries).toEqual(original);
    });
  });
});

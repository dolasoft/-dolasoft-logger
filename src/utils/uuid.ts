/**
 * Generate a UUID v4 string
 * Uses native crypto.randomUUID when available (Node.js 15.6.0+, modern browsers)
 * Falls back to Math.random() implementation for older environments
 */
export function generateUUID(): string {
  // Check for Node.js crypto.randomUUID (Node.js 15.6.0+)
  if (typeof require !== 'undefined') {
    try {
      const { randomUUID } = require('crypto');
      return randomUUID();
    } catch {
      // crypto module not available, fall through to browser check
    }
  }
  
  // Check for browser crypto.randomUUID (modern browsers)
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  
  // Fallback implementation using Math.random() for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a shorter ID (8 characters) for request IDs
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Generate a request ID with optional prefix
 */
export function generateRequestId(prefix?: string): string {
  const id = generateShortId();
  return prefix ? `${prefix}-${id}` : id;
}

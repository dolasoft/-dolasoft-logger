/**
 * Generate a UUID v4 string
 * Uses native crypto.randomUUID when available (Node.js 15.6.0+, modern browsers)
 * Falls back to Math.random() implementation for older environments
 */
export declare function generateUUID(): string;
/**
 * Generate a shorter ID (8 characters) for request IDs
 */
export declare function generateShortId(): string;
/**
 * Generate a request ID with optional prefix
 */
export declare function generateRequestId(prefix?: string): string;
//# sourceMappingURL=uuid.d.ts.map
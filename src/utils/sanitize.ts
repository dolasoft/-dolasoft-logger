export function sanitizeData(
  sensitiveFields: string[],
  data?: unknown
): Record<string, unknown> | undefined {
  if (data === undefined) return undefined;
  if (data === null) return {};

  if (typeof data === 'object' && !Array.isArray(data)) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const isSensitive = sensitiveFields.some(field =>
        key.toLowerCase().includes(field.toLowerCase())
      );
      if (!isSensitive) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return {};
}

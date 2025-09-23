import type { LogEntry } from '../types';

export async function sendToRoute(
  routeUrl: string,
  entry: LogEntry
): Promise<void> {
  // fire-and-forget
  await fetch(routeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).catch(() => {
    // Silently ignore errors to prevent infinite loops
  });
}

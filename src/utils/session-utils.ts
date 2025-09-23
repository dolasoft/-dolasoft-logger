import type { Session } from '../types';

export function sortSessionsDesc(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => {
    const diff =
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime();

    if (diff !== 0) return diff;

    return b.id.localeCompare(a.id);
  });
}

export function sortSessionEntriesDesc(
  entries: Array<[string, Session]>
): Array<[string, Session]> {
  return [...entries].sort((a, b) => {
    const diff =
      new Date(b[1].startTime).getTime() - new Date(a[1].startTime).getTime();

    if (diff !== 0) return diff;

    return b[0].localeCompare(a[0]);
  });
}

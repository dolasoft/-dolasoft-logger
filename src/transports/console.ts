import type { LogLevel } from '../types';

type ConsoleMethod = 'log' | 'debug' | 'warn' | 'error';

const methodMap: Record<LogLevel['level'], ConsoleMethod> = {
  debug: 'debug',
  info: 'log',
  warn: 'warn',
  error: 'error',
};

export function writeToConsole(
  level: LogLevel['level'],
  output: string,
  context?: unknown,
  metadata?: unknown
): void {
  (console as Pick<Console, ConsoleMethod>)[methodMap[level]](
    output,
    context,
    metadata
  );
}

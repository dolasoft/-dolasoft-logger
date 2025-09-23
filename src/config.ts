import { LOG_MODES, type LogMode, type UnifiedLoggerConfig } from './types';

const VALID_LOG_MODES = new Set<LogMode>(Object.values(LOG_MODES));

const DEFAULTS: Required<
  Pick<
    UnifiedLoggerConfig,
    'logMode' | 'routeUrl' | 'maxLogs' | 'maxSessions' | 'sensitiveFields'
  >
> = {
  logMode: LOG_MODES.CONSOLE,
  routeUrl: 'http://localhost:3000/api/logs',
  maxLogs: 1000,
  maxSessions: 100,
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'key',
    'apiKey',
    'auth',
    'authorization',
  ],
};

export interface ResolvedLoggerConfig {
  isProduction: boolean;
  logMode: LogMode;
  routeUrl: string;
  maxLogs: number;
  maxSessions: number;
  sensitiveFields: string[];
}

export function resolveLoggerConfig(
  env: NodeJS.ProcessEnv,
  config?: UnifiedLoggerConfig
): ResolvedLoggerConfig {
  const envLogModeRaw = env.LOG_MODE?.trim();
  const envLogMode =
    envLogModeRaw && VALID_LOG_MODES.has(envLogModeRaw as LogMode)
      ? (envLogModeRaw as LogMode)
      : undefined;

  const envRouteUrl = env.LOG_ROUTE_URL?.trim() ? env.LOG_ROUTE_URL : undefined;

  const parsePositiveInt = (value?: string): number | undefined => {
    if (!value) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  };

  const envMaxLogs = parsePositiveInt(env.LOG_MAX_LOGS);
  const envMaxSessions = parsePositiveInt(env.LOG_MAX_SESSIONS);

  const envSensitiveFields = env.LOG_SENSITIVE_FIELDS
    ? env.LOG_SENSITIVE_FIELDS.split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : undefined;

  return {
    isProduction: env.NODE_ENV === 'production',
    logMode: envLogMode ?? config?.logMode ?? DEFAULTS.logMode,
    routeUrl: envRouteUrl ?? config?.routeUrl ?? DEFAULTS.routeUrl,
    maxLogs: envMaxLogs ?? config?.maxLogs ?? DEFAULTS.maxLogs,
    maxSessions: envMaxSessions ?? config?.maxSessions ?? DEFAULTS.maxSessions,
    sensitiveFields:
      envSensitiveFields ?? config?.sensitiveFields ?? DEFAULTS.sensitiveFields,
  };
}

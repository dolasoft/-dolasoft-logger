import { LoggerService } from '../core';
import type { LogMethod, ErrorLogMethod } from '../core/types';
interface UseLoggerOptions {
    appSlug?: string;
    userId?: string;
    requestId?: string;
    logger?: LoggerService;
}
export declare function useLogger(options?: UseLoggerOptions): {
    debug: LogMethod;
    info: LogMethod;
    warn: LogMethod;
    error: ErrorLogMethod;
    fatal: ErrorLogMethod;
};
export type { UseLoggerOptions };
//# sourceMappingURL=react.d.ts.map
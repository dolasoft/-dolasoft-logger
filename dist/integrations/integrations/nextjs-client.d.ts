import { ClientLoggerService } from '../core/client-logger';
import { LogLevel, LogStrategy } from '../core/types';
import type { LogMethod, ErrorLogMethod } from '../core/types';
interface NextJSClientLoggerOptions {
    appSlug?: string;
    userId?: string;
    requestId?: string;
    logger?: ClientLoggerService;
    enableConsole?: boolean;
    enableRemote?: boolean;
    remoteEndpoint?: string;
    strategy?: LogStrategy;
    level?: LogLevel;
}
export declare function useNextJSClientLogger(options?: NextJSClientLoggerOptions): {
    debug: LogMethod;
    info: LogMethod;
    warn: LogMethod;
    error: ErrorLogMethod;
    fatal: ErrorLogMethod;
};
export declare class NextJSClientLogger {
    private logger;
    private appSlug?;
    private userId?;
    private requestId?;
    private enableRemote;
    private remoteEndpoint;
    constructor(options?: NextJSClientLoggerOptions);
    private createContext;
    private sendToRemote;
    debug(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    fatal(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
}
export declare function createNextJSClientLogger(options?: NextJSClientLoggerOptions): NextJSClientLogger;
export type { NextJSClientLoggerOptions };
export { LogLevel, LogStrategy };
//# sourceMappingURL=nextjs-client.d.ts.map
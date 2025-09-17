interface NextRequest {
    method: string;
    url: string;
    headers: Headers;
    body: ReadableStream<Uint8Array> | null;
    nextUrl: URL;
    cookies: Map<string, string>;
}
import { LoggerService } from '../core';
declare class ServerLogger {
    private static instance;
    private requestId;
    private appSlug?;
    private userId?;
    private logger;
    private constructor();
    static getInstance(logger?: LoggerService): ServerLogger;
    /**
     * Reset the singleton instance (useful for testing)
     */
    static reset(): void;
    setRequestContext(request?: NextRequest): void;
    private generateId;
    private extractAppSlug;
    private extractUserId;
    private createContext;
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>): void;
    fatal(message: string, error?: Error, context?: Record<string, unknown>): void;
}
export declare function getServerLogger(request?: NextRequest, logger?: LoggerService): ServerLogger;
export declare const logApiError: (request: NextRequest, message: string, error?: Error, context?: Record<string, unknown>, logger?: LoggerService) => void;
export declare const logApiInfo: (request: NextRequest, message: string, context?: Record<string, unknown>, logger?: LoggerService) => void;
export declare const logApiWarn: (request: NextRequest, message: string, context?: Record<string, unknown>, logger?: LoggerService) => void;
export { ServerLogger };
//# sourceMappingURL=nextjs.d.ts.map
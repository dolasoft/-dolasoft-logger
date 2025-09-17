interface Request {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body: unknown;
    params: Record<string, string>;
    query: Record<string, string | string[] | undefined>;
    ip?: string;
    user?: unknown;
    get: (name: string) => string | undefined;
}
interface Response {
    statusCode: number;
    status: (code: number) => Response;
    json: (data: unknown) => Response;
    send: (data: unknown) => Response;
    end: (chunk?: unknown, encoding?: string) => Response;
    setHeader: (name: string, value: string | number | string[]) => Response;
    on: (event: string, listener: (error: Error) => void) => Response;
    locals: Record<string, unknown>;
}
interface NextFunction {
    (error?: Error): void;
}
import { LoggerService } from '../core';
export declare function createLoggingMiddleware(logger?: LoggerService): (req: Request, res: Response, next: NextFunction) => void;
export declare function createErrorHandler(logger?: LoggerService): (error: Error, req: Request, res: Response, _next: NextFunction) => void;
export declare function createExpressLogger(config?: Partial<import('../core/types').LoggerConfig>): LoggerService;
export type { Request, Response, NextFunction };
//# sourceMappingURL=express.d.ts.map
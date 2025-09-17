// Express types - these will be available when express is installed
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
import { LogStrategy } from '../core/types';
import { generateRequestId } from '../utils/uuid';
import { isProduction } from '../constants/environment';

// Express middleware for request logging
export function createLoggingMiddleware(logger?: LoggerService) {
  const loggerInstance = logger || LoggerService.getInstance();

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || generateId();
    
    // Add request ID to response headers
    res.setHeader('x-request-id', requestId);

    // Log request start
    loggerInstance.info('Request started', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk?: unknown, encoding?: string) {
      const duration = Date.now() - startTime;
      
      loggerInstance.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        requestId
      });

      // Call original end method and return the result
      return originalEnd.call(this, chunk, encoding);
    };

    // Log errors
    res.on('error', (error: Error) => {
      loggerInstance.error('Response error', error, {
        method: req.method,
        url: req.url,
        requestId
      });
    });

    next();
  };
}

// Express error handler middleware
export function createErrorHandler(logger?: LoggerService) {
  const loggerInstance = logger || LoggerService.getInstance();

  return (error: Error, req: Request, res: Response, next: NextFunction): void => {
    const requestId = req.headers['x-request-id'] as string || generateId();

    loggerInstance.error('Unhandled error', error, {
      method: req.method,
      url: req.url,
      requestId,
      stack: error.stack
    });

    // Don't expose error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(500).json({
      error: 'Internal Server Error',
      requestId,
      ...(isDevelopment && { message: error.message, stack: error.stack })
    });
  };
}

// Helper function to create a logger instance for Express
export function createExpressLogger(config?: Partial<import('../core/types').LoggerConfig>) {
  return LoggerService.getInstance({
    strategy: LogStrategy.HYBRID,
    enableConsole: true,
    enableDatabase: true,
    enableFile: isProduction(),
    ...config
  });
}

// Utility function to generate request IDs
function generateId(): string {
  return generateRequestId('req');
}

// Export types for TypeScript users
export type { Request, Response, NextFunction };

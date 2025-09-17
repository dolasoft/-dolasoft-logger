// Next.js types - these will be available when next is installed
interface NextRequest {
  method: string;
  url: string;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  nextUrl: URL;
  cookies: Map<string, string>;
}
import { LoggerService } from '../core';
import { generateRequestId } from '../utils/uuid';

// Server-side logger singleton with request context
class ServerLogger {
  private static instance: ServerLogger;
  private requestId: string = '';
  private appSlug?: string;
  private userId?: string;
  private logger: LoggerService;

  private constructor(logger?: LoggerService) {
    this.logger = logger || LoggerService.getInstance();
  }

  static getInstance(logger?: LoggerService): ServerLogger {
    if (!ServerLogger.instance) {
      ServerLogger.instance = new ServerLogger(logger);
    }
    return ServerLogger.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    ServerLogger.instance = null as unknown as ServerLogger;
  }

  // Set context for current request
  setRequestContext(request?: NextRequest) {
    this.requestId = request?.headers.get('x-request-id') || this.generateId();
    this.appSlug = this.extractAppSlug(request);
    this.userId = this.extractUserId(request);
  }

  private generateId(): string {
    return generateRequestId('req');
  }

  private extractAppSlug(request?: NextRequest): string | undefined {
    if (!request) return undefined;
    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    
    // Extract app slug from URL patterns like /api/apps/[slug] or /[appSlug]/feedback
    const appSlugIndex = pathSegments.findIndex(segment => segment === 'apps') + 1;
    if (appSlugIndex > 0 && pathSegments[appSlugIndex]) {
      return pathSegments[appSlugIndex];
    }
    
    // Check for appSlug in the first segment after API
    const apiIndex = pathSegments.findIndex(segment => segment === 'api');
    if (apiIndex > 0 && pathSegments[apiIndex + 1] && pathSegments[apiIndex + 1] !== 'admin') {
      return pathSegments[apiIndex + 1];
    }
    
    return undefined;
  }

  private extractUserId(request?: NextRequest): string | undefined {
    if (!request) return undefined;
    
    // Extract from headers, cookies, or JWT token
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      // In a real implementation, you'd decode the JWT token here
      return 'user-from-token';
    }
    
    return undefined;
  }

  private createContext(additionalContext?: Record<string, unknown>): Record<string, unknown> {
    return {
      requestId: this.requestId,
      appSlug: this.appSlug,
      userId: this.userId,
      ...additionalContext
    };
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.logger.debug(message, this.createContext(context));
  }

  info(message: string, context?: Record<string, unknown>) {
    this.logger.info(message, this.createContext(context));
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.logger.warn(message, this.createContext(context));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.logger.error(message, error, this.createContext(context));
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>) {
    this.logger.fatal(message, error, this.createContext(context));
  }
}

// Singleton instance
const serverLogger = ServerLogger.getInstance();

// Convenience function for API routes - sets context and returns singleton
export function getServerLogger(request?: NextRequest, logger?: LoggerService): ServerLogger {
  const instance = logger ? ServerLogger.getInstance(logger) : serverLogger;
  instance.setRequestContext(request);
  return instance;
}

// Convenience functions for common API logging patterns
export const logApiError = (request: NextRequest, message: string, error?: Error, context?: Record<string, unknown>, logger?: LoggerService) => {
  const instance = logger ? ServerLogger.getInstance(logger) : serverLogger;
  instance.setRequestContext(request);
  instance.error(message, error, context);
};

export const logApiInfo = (request: NextRequest, message: string, context?: Record<string, unknown>, logger?: LoggerService) => {
  const instance = logger ? ServerLogger.getInstance(logger) : serverLogger;
  instance.setRequestContext(request);
  instance.info(message, context);
};

export const logApiWarn = (request: NextRequest, message: string, context?: Record<string, unknown>, logger?: LoggerService) => {
  const instance = logger ? ServerLogger.getInstance(logger) : serverLogger;
  instance.setRequestContext(request);
  instance.warn(message, context);
};

// Export the ServerLogger class for advanced usage
export { ServerLogger };

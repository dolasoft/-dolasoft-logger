import { LoggerService } from '../core/logger';
import { ServerLogger } from '../integrations/nextjs';

/**
 * Singleton Manager for managing all logger singletons
 * Useful for testing and cleanup
 */
export class SingletonManager {
  /**
   * Reset all logger singletons
   * Useful for testing to ensure clean state
   */
  static resetAll(): void {
    LoggerService.reset();
    ServerLogger.reset();
  }

  /**
   * Get the current state of all singletons
   */
  static getState() {
    return {
      loggerService: LoggerService.getInstance(),
      serverLogger: ServerLogger.getInstance(),
    };
  }

  /**
   * Check if all singletons are properly initialized
   */
  static isInitialized(): boolean {
    try {
      LoggerService.getInstance();
      ServerLogger.getInstance();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Convenience function to reset all singletons
 */
export const resetAllSingletons = SingletonManager.resetAll;

/**
 * Convenience function to check if all singletons are initialized
 */
export const areSingletonsInitialized = SingletonManager.isInitialized;

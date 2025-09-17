import { LoggerService } from '../core/logger';
import { ServerLogger } from '../integrations/nextjs';
/**
 * Singleton Manager for managing all logger singletons
 * Useful for testing and cleanup
 */
export declare class SingletonManager {
    /**
     * Reset all logger singletons
     * Useful for testing to ensure clean state
     */
    static resetAll(): void;
    /**
     * Get the current state of all singletons
     */
    static getState(): {
        loggerService: LoggerService;
        serverLogger: ServerLogger;
    };
    /**
     * Check if all singletons are properly initialized
     */
    static isInitialized(): boolean;
}
/**
 * Convenience function to reset all singletons
 */
export declare const resetAllSingletons: typeof SingletonManager.resetAll;
/**
 * Convenience function to check if all singletons are initialized
 */
export declare const areSingletonsInitialized: typeof SingletonManager.isInitialized;
//# sourceMappingURL=singleton-manager.d.ts.map
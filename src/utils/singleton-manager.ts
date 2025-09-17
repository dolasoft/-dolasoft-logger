/**
 * Generic Singleton Manager for managing logger singletons
 * Uses dependency injection to work with any logger service
 */
export class SingletonManager {
  private static loggerServices: Map<string, { reset: () => void; getInstance: () => unknown }> = new Map();
  private static registrationConfig: Map<string, { condition?: () => boolean; priority?: number }> = new Map();

  /**
   * Register a logger service for management with optional conditions
   */
  static registerLogger(
    name: string, 
    loggerService: { reset: () => void; getInstance: () => unknown },
    options?: { condition?: () => boolean; priority?: number }
  ): void {
    this.loggerServices.set(name, loggerService);
    if (options) {
      this.registrationConfig.set(name, options);
    }
  }

  /**
   * Register logger only if condition is met
   */
  static registerLoggerIf(
    name: string,
    condition: () => boolean,
    loggerService: { reset: () => void; getInstance: () => unknown },
    priority?: number
  ): void {
    this.registerLogger(name, loggerService, { condition, priority });
  }

  /**
   * Register logger only for specific environment
   */
  static registerLoggerForEnvironment(
    name: string,
    environment: 'browser' | 'node' | 'both',
    loggerService: { reset: () => void; getInstance: () => unknown },
    priority?: number
  ): void {
    const condition = (): boolean => {
      const isBrowser = typeof window !== 'undefined';
      const isNode = typeof process !== 'undefined' && process.versions?.node;
      
      switch (environment) {
        case 'browser':
          return isBrowser;
        case 'node':
          return Boolean(isNode);
        case 'both':
          return true;
        default:
          return false;
      }
    };
    
    this.registerLogger(name, loggerService, { condition, priority });
  }

  /**
   * Register logger based on configuration
   */
  static registerLoggerWithConfig(
    name: string,
    config: Record<string, unknown>,
    loggerService: { reset: () => void; getInstance: () => unknown },
    priority?: number
  ): void {
    const condition = () => {
      // Check if the logger should be active based on config
      const enableKey = `enable${name.charAt(0).toUpperCase() + name.slice(1)}`;
      return config[enableKey] === true;
    };
    
    this.registerLogger(name, loggerService, { condition, priority });
  }

  /**
   * Register logger only if specific feature is enabled
   */
  static registerLoggerForFeature(
    name: string,
    feature: string,
    loggerService: { reset: () => void; getInstance: () => unknown },
    priority?: number
  ): void {
    const condition = () => {
      // Check environment variables or feature flags
      if (typeof process !== 'undefined' && process.env) {
        return process.env[`ENABLE_${feature.toUpperCase()}`] === 'true' || 
               process.env.NODE_ENV === 'development';
      }
      return false; // Default to disabled in browser
    };
    
    this.registerLogger(name, loggerService, { condition, priority });
  }

  /**
   * Get active loggers (those that meet their conditions)
   */
  private static getActiveLoggers(): Map<string, { reset: () => void; getInstance: () => unknown }> {
    const activeLoggers = new Map();
    
    this.loggerServices.forEach((service, name) => {
      const config = this.registrationConfig.get(name);
      if (!config || !config.condition || config.condition()) {
        activeLoggers.set(name, service);
      }
    });
    
    return activeLoggers;
  }

  /**
   * Reset all active logger singletons
   * Useful for testing to ensure clean state
   */
  static resetAll(): void {
    this.getActiveLoggers().forEach(service => service.reset());
  }

  /**
   * Reset a specific logger singleton (only if it's active)
   */
  static resetLogger(name: string): void {
    const activeLoggers = this.getActiveLoggers();
    const service = activeLoggers.get(name);
    if (service) {
      service.reset();
    }
  }

  /**
   * Get the current state of all active singletons
   */
  static getState(): Record<string, unknown> {
    const state: Record<string, unknown> = {};
    this.getActiveLoggers().forEach((service, name) => {
      try {
        state[name] = service.getInstance();
      } catch {
        state[name] = null;
      }
    });
    return state;
  }

  /**
   * Check if all active singletons are properly initialized
   */
  static isInitialized(): boolean {
    try {
      this.getActiveLoggers().forEach(service => service.getInstance());
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a specific singleton is initialized and active
   */
  static isLoggerInitialized(name: string): boolean {
    try {
      const activeLoggers = this.getActiveLoggers();
      const service = activeLoggers.get(name);
      if (service) {
        service.getInstance();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get list of active logger names
   */
  static getActiveLoggerNames(): string[] {
    return Array.from(this.getActiveLoggers().keys());
  }

  /**
   * Check if a logger is active (meets its conditions)
   */
  static isLoggerActive(name: string): boolean {
    const config = this.registrationConfig.get(name);
    return !config || !config.condition || config.condition();
  }

  /**
   * Clear all registered services (useful for testing)
   */
  static clear(): void {
    this.loggerServices.clear();
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

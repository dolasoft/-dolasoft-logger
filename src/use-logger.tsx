// Simple React Hook - just returns the singleton logger
import { getLogger, SimpleLogger } from './simple-logger';

export const useLogger = (): SimpleLogger => {
  return getLogger();
};

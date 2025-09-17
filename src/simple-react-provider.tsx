// Simple React Provider - just provides the logger
import React, { createContext, useContext, ReactNode } from 'react';
import { getLogger, SimpleLogger } from './simple-logger';
import { LogLevel, LogStrategy } from './core/types';

interface SimpleLoggerProviderProps {
  children: ReactNode;
  level?: LogLevel;
  strategy?: LogStrategy;
}

const LoggerContext = createContext<SimpleLogger | undefined>(undefined);

export const SimpleLoggerProvider: React.FC<SimpleLoggerProviderProps> = ({
  children,
  level,
  strategy,
}) => {
  const logger = getLogger({ level, strategy });

  return (
    <LoggerContext.Provider value={logger}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLogger = (): SimpleLogger => {
  const context = useContext(LoggerContext);
  if (context === undefined) {
    throw new Error('useLogger must be used within a SimpleLoggerProvider');
  }
  return context;
};

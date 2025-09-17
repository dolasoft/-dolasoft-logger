# @dolasoftfree/logger

[![npm version](https://badge.fury.io/js/%40dolasoftfree%2Flogger.svg)](https://badge.fury.io/js/%40dolasoftfree%2Flogger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

**Simple, universal logging library for React, Next.js, and Node.js applications.**

## 🚀 Quick Start

### Universal Logger (Works Everywhere)

```tsx
import { log, getLogger } from '@dolasoftfree/logger';

// Simple logging - works everywhere
log.info('User logged in', { userId: '123' });
log.error('API call failed', error, { endpoint: '/api/users' });

// Or get a logger instance
const logger = getLogger();
logger.debug('Debug message', { context: 'user-action' });
```

### React Integration

```tsx
import { SimpleLoggerProvider, useLogger } from '@dolasoftfree/logger';

function App() {
  return (
    <SimpleLoggerProvider>
      <MyComponent />
    </SimpleLoggerProvider>
  );
}

function MyComponent() {
  const logger = useLogger();
  
  const handleClick = () => {
    logger.info('Button clicked', { buttonId: 'cta' });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## 📦 Installation

```bash
npm install @dolasoftfree/logger
# or
yarn add @dolasoftfree/logger
# or
pnpm add @dolasoftfree/logger
```

## 🎯 Key Features

- **Universal Compatibility**: Works in Node.js, Browser, React, Next.js
- **Zero Configuration**: Works out of the box with smart defaults
- **TypeScript First**: Full type safety
- **Lightweight**: Minimal bundle size
- **Simple API**: Just `log.info()`, `log.error()`, etc.

## 🌍 Environment Usage

### Node.js
```javascript
import { log, getLogger } from '@dolasoftfree/logger';

// Simple logging
log.info('Server started', { port: 3000 });

// Advanced usage
const logger = getLogger({ level: 'debug' });
logger.debug('Database connected');
```

### Browser (ESM)
```javascript
import { log, getLogger } from '@dolasoftfree/logger';

// Works in all modern browsers
log.info('Page loaded', { url: window.location.href });
```

### Browser (UMD)
```html
<script src="https://unpkg.com/@dolasoftfree/logger/dist/browser.js"></script>
<script>
  // Available as window.DolaSoftLogger
  const { log, getLogger } = window.DolaSoftLogger;
  log.info('Page loaded');
</script>
```

### Next.js
```tsx
// app/layout.tsx
import { SimpleLoggerProvider } from '@dolasoftfree/logger';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SimpleLoggerProvider>
          {children}
        </SimpleLoggerProvider>
      </body>
    </html>
  );
}

// app/page.tsx
import { useLogger } from '@dolasoftfree/logger';

export default function Page() {
  const logger = useLogger();
  
  return <button onClick={() => logger.info('Button clicked')}>
    Click me
  </button>;
}
```

## 🎨 Available Methods

### Basic Logging
```typescript
const logger = getLogger();

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
logger.fatal('Fatal error', error);
```

### Convenience Functions
```typescript
import { log } from '@dolasoftfree/logger';

// Direct logging without getting a logger instance
log.debug('Debug message');
log.info('Info message');
log.warn('Warning message');
log.error('Error message', error);
log.fatal('Fatal error', error);
```

### Context and Metadata
```typescript
// Include context data
logger.info('User action', { userId: '123', action: 'login' });

// Include metadata
logger.info('API call', { userId: '123' }, { endpoint: '/api/users', duration: 150 });

// Include error details
logger.error('API failed', error, { endpoint: '/api/users' });
```

## 🔧 Configuration

### Simple Configuration
```typescript
const logger = getLogger({
  level: 'debug',        // Log level: debug, info, warn, error, fatal
  enableConsole: true,   // Enable console logging
  enableFile: false,     // Enable file logging (Node.js only)
  enableMemory: false,   // Enable memory logging
  enableDatabase: false, // Enable database logging
  enableRemote: false,   // Enable remote logging
  format: 'pretty'       // Format: pretty, json
});
```

### React Provider Configuration
```tsx
<SimpleLoggerProvider 
  level="debug"
  strategy="console"
>
  <App />
</SimpleLoggerProvider>
```

## 🎯 Log Levels

- **DEBUG** (0): Detailed information for debugging
- **INFO** (1): General information about application flow
- **WARN** (2): Warning messages for potential issues
- **ERROR** (3): Error messages for handled exceptions
- **FATAL** (4): Fatal errors that cause application termination

## 🔄 Log Strategies

- **CONSOLE**: Log to console only
- **FILE**: Log to file only (Node.js only)
- **MEMORY**: Store logs in memory
- **DATABASE**: Store logs in database
- **REMOTE**: Send logs to API endpoint
- **HYBRID**: Use multiple adapters simultaneously

## 🚀 Examples

### Complete React App
```tsx
import React from 'react';
import { SimpleLoggerProvider, useLogger } from '@dolasoftfree/logger';

function App() {
  return (
    <SimpleLoggerProvider>
      <Header />
      <Main />
      <Footer />
    </SimpleLoggerProvider>
  );
}

function Header() {
  const logger = useLogger();
  
  const handleLogoClick = () => {
    logger.info('Logo clicked', { page: 'homepage' });
  };

  return <div onClick={handleLogoClick}>My App</div>;
}

function Main() {
  const logger = useLogger();
  
  const handleApiCall = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      
      logger.info('Data loaded successfully', { count: data.length });
    } catch (error) {
      logger.error('Failed to load data', error, { endpoint: '/api/data' });
    }
  };

  return <button onClick={handleApiCall}>Load Data</button>;
}
```

### Node.js Express
```javascript
import express from 'express';
import { getLogger } from '@dolasoftfree/logger';

const app = express();
const logger = getLogger({ enableFile: true });

app.get('/api/users', (req, res) => {
  logger.info('API endpoint called', { endpoint: '/api/users' });
  res.json({ users: [] });
});

app.listen(3000, () => {
  logger.info('Server started', { port: 3000 });
});
```

## 📚 API Reference

### SimpleLogger
```typescript
class SimpleLogger {
  debug(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  fatal(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  updateConfig(config: Partial<LoggerConfig>): void;
}
```

### SimpleLoggerProvider
```typescript
interface SimpleLoggerProviderProps {
  children: ReactNode;
  level?: LogLevel;
  strategy?: LogStrategy;
}
```

### Convenience Functions
```typescript
const log = {
  debug: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => void;
  error: (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => void;
  fatal: (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => void;
};
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- 🐛 Issues: [GitHub Issues](https://github.com/dolasoft/-dolasoft-logger/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/dolasoft/-dolasoft-logger/wiki)

---

Made with ❤️ by [DolaSoft](https://github.com/dolasoft)
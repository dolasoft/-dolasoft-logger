# @dolasoftfree/logger - Usage Examples

This document contains comprehensive examples of how to use `@dolasoftfree/logger` in different environments and frameworks.

## 🌐 Browser Examples

### UMD Script Tag (Vanilla JavaScript)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Logger Example</title>
  <script src="https://unpkg.com/@dolasoftfree/logger/dist/browser-core.js"></script>
</head>
<body>
  <button id="logBtn">Log Message</button>
  <script>
    // Use the global DolaSoftLoggerCore
    const logger = window.DolaSoftLoggerCore.getLogger({
      level: window.DolaSoftLoggerCore.LogLevel.DEBUG
    });

    document.getElementById('logBtn').addEventListener('click', () => {
      logger.info('Button clicked!', { timestamp: Date.now() });
      logger.error('Test error', new Error('Something went wrong'));
    });
  </script>
</body>
</html>
```

### ES Modules (Modern Browser)
```javascript
// main.js
import { getLogger, LogLevel, LogStrategy } from '@dolasoftfree/logger/browser-core';

const logger = getLogger({
  level: LogLevel.DEBUG,
  strategy: LogStrategy.CONSOLE
});

// Log some messages
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', new Error('Test error'));

// Use convenience functions
import { logDebug, logInfo, logWarn, logError } from '@dolasoftfree/logger/browser-core';

logDebug('Quick debug message');
logInfo('Quick info message');
logWarn('Quick warning message');
logError('Quick error message', new Error('Test error'));
```

### React with Browser Bundle
```tsx
// App.tsx
import React from 'react';
import { getLogger, LogLevel } from '@dolasoftfree/logger/browser-core';

const logger = getLogger({
  level: LogLevel.DEBUG
});

function App() {
  const handleClick = () => {
    logger.info('Button clicked in React app');
  };

  return (
    <div>
      <h1>My App</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}

export default App;
```

## 🚀 Quick Start Examples

### Zero Config (Recommended)

```tsx
import { SmartProvider, useZeroConfigLogger } from '@dolasoftfree/logger';

function App() {
  return (
    <SmartProvider>
      <MyComponent />
    </SmartProvider>
  );
}

function MyComponent() {
  const { logger, logUserAction, logError, logPerformance } = useZeroConfigLogger();
  
  const handleClick = () => {
    logger.info('Button clicked');
    logUserAction('button_click', { buttonId: 'cta' });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Simple Config

```tsx
import { SimpleLoggerProvider, useSimpleLogger } from '@dolasoftfree/logger';

function App() {
  return (
    <SimpleLoggerProvider 
      appSlug="my-app"
      userId="user-123"
      remoteEndpoint="/api/logs"
    >
      <MyComponent />
    </SimpleLoggerProvider>
  );
}
```

## 📚 Framework Examples

### React with Zero Config Adapters

```tsx
import React from 'react';
import {
  ConsoleProvider,    // Console logging (dev only)
  MemoryProvider,     // Memory logging (both dev/prod)
  FileProvider,       // File logging (both dev/prod)
  RemoteProvider,     // Remote logging (prod only)
  HybridProvider,     // Full featured (both dev/prod)
  SmartProvider,      // Smart choice (RECOMMENDED)
  useZeroConfigLogger
} from '@dolasoftfree/logger';

// Console Logger (Development only)
function ConsoleApp() {
  return (
    <ConsoleProvider>
      <MyComponent />
    </ConsoleProvider>
  );
}

// Memory Logger (Temporary storage)
function MemoryApp() {
  return (
    <MemoryProvider>
      <MyComponent />
    </MemoryProvider>
  );
}

// File Logger (Persistent storage)
function FileApp() {
  return (
    <FileProvider>
      <MyComponent />
    </FileProvider>
  );
}

// Remote Logger (API monitoring)
function RemoteApp() {
  return (
    <RemoteProvider>
      <MyComponent />
    </RemoteProvider>
  );
}

// Hybrid Logger (Full featured)
function HybridApp() {
  return (
    <HybridProvider>
      <MyComponent />
    </HybridProvider>
  );
}

// Smart Logger (RECOMMENDED - Best of both worlds)
function SmartApp() {
  return (
    <SmartProvider>
      <MyComponent />
    </SmartProvider>
  );
}

function MyComponent() {
  const { logger, logUserAction, logError, logPerformance } = useZeroConfigLogger();
  
  const handleClick = () => {
    logger.info('Button clicked');
    logUserAction('button_click', { buttonId: 'cta' });
  };

  const handleApiCall = async () => {
    const startTime = Date.now();
    try {
      await fetch('/api/data');
      logPerformance('api_call', Date.now() - startTime);
    } catch (error) {
      logError('API call failed', error as Error);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Click me</button>
      <button onClick={handleApiCall}>Call API</button>
    </div>
  );
}
```

### Next.js Integration

#### Client Side
```tsx
'use client';
import { SmartProvider, useZeroConfigLogger } from '@dolasoftfree/logger';

export default function ClientPage() {
  return (
    <SmartProvider>
      <ClientComponent />
    </SmartProvider>
  );
}

function ClientComponent() {
  const { logger, logUserAction } = useZeroConfigLogger();
  
  return (
    <button onClick={() => logUserAction('page_view', { page: 'client' })}>
      Log Page View
    </button>
  );
}
```

#### Server Side
```typescript
import { getServerLogger } from '@dolasoftfree/logger/nextjs';

export default async function ServerPage() {
  const logger = getServerLogger();
  
  logger.info('Server page rendered', {
    timestamp: new Date().toISOString(),
    page: 'server'
  });

  return <div>Server Page</div>;
}
```

#### API Routes
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerLogger } from '@dolasoftfree/logger/nextjs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const logger = getServerLogger();
  
  logger.info('API request received', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent']
  });
  
  res.json({ success: true });
}
```

### Vue.js Integration

```javascript
import { createApp } from 'vue';
import { getLogger } from '@dolasoftfree/logger';

const app = createApp({
  setup() {
    const logger = getLogger({
      strategy: 'console',
      level: 'DEBUG',
      enableConsole: true
    });
    
    const handleClick = () => {
      logger.info('Vue button clicked');
    };
    
    return { handleClick };
  }
});

app.mount('#app');
```

### Angular Integration

```typescript
import { Component, OnInit } from '@angular/core';
import { getLogger, LogLevel } from '@dolasoftfree/logger';

@Component({
  selector: 'app-root',
  template: '<button (click)="handleClick()">Click me</button>'
})
export class AppComponent implements OnInit {
  private logger = getLogger({
    strategy: 'console',
    level: LogLevel.DEBUG,
    enableConsole: true
  });

  ngOnInit() {
    this.logger.info('Angular app initialized');
  }

  handleClick() {
    this.logger.info('Angular button clicked');
  }
}
```

## 🖥️ Environment Examples

### Vanilla JavaScript (Node.js)

```javascript
const { getLogger, logInfo, logError, LogLevel } = require('@dolasoftfree/logger');

// Basic usage
const logger = getLogger();

logger.info('Application started');
logger.warn('This is a warning');
logger.error('Something went wrong', new Error('Test error'));

// With context
logger.info('User action', { 
  userId: 'user-123', 
  action: 'login',
  timestamp: new Date().toISOString()
});

// Convenience functions
logInfo('Quick info message');
logError('Quick error message', new Error('Test error'));

// Custom configuration
const customLogger = getLogger({
  strategy: 'console',
  level: LogLevel.DEBUG,
  enableConsole: true
});

customLogger.debug('Debug message');
customLogger.info('Info message');
```

### Express.js Integration

```javascript
const express = require('express');
const { createExpressLogger, createLoggingMiddleware } = require('@dolasoftfree/logger');

const app = express();

// Add logging middleware
app.use(createLoggingMiddleware());

// Create express logger
const logger = createExpressLogger();

app.get('/api/users', async (req, res) => {
  logger.info('Fetching users', { userId: req.user?.id });
  
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    logger.error('Failed to fetch users', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  logger.info('Server started on port 3000');
});
```

### Browser HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>DolaSoft Logger Example</title>
  <script src="https://unpkg.com/@dolasoftfree/logger/dist/index.umd.js"></script>
</head>
<body>
  <h1>Logger Example</h1>
  <button onclick="testLogging()">Test Logging</button>
  
  <script>
    const { getLogger, LogLevel } = DolaSoftLogger;
    
    const logger = getLogger({
      strategy: 'console',
      level: LogLevel.DEBUG,
      enableConsole: true
    });
    
    function testLogging() {
      logger.info('Button clicked');
      logger.warn('This is a warning');
      logger.error('This is an error', new Error('Test error'));
    }
  </script>
</body>
</html>
```

## 🔧 Direct Logger Usage

### Zero Config Loggers

```typescript
import {
  createConsoleLogger,    // Console logging (dev only)
  createMemoryLogger,     // Memory logging (both dev/prod)
  createFileLogger,       // File logging (both dev/prod)
  createRemoteLogger,     // Remote logging (prod only)
  createHybridLogger,     // Full featured (both dev/prod)
  createSmartLogger,      // Smart choice (RECOMMENDED)
  Loggers
} from '@dolasoftfree/logger';

// Direct usage
const consoleLogger = createConsoleLogger();
const memoryLogger = createMemoryLogger();
const fileLogger = createFileLogger();
const remoteLogger = createRemoteLogger();
const hybridLogger = createHybridLogger();
const smartLogger = createSmartLogger(); // RECOMMENDED

// Or use the object
const logger = Loggers.smart(); // RECOMMENDED

// Start logging immediately
logger.info('Hello World');
logger.error('Something failed', error);
```

### Custom Configuration

```typescript
import { getLogger, LogLevel, LogStrategy } from '@dolasoftfree/logger';

// Custom console logger
const consoleLogger = getLogger({
  strategy: LogStrategy.CONSOLE,
  level: LogLevel.DEBUG,
  enableConsole: true
});

// Custom file logger
const fileLogger = getLogger({
  strategy: LogStrategy.FILE,
  level: LogLevel.WARN,
  enableFile: true,
  filePath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  format: 'json'
});

// Custom hybrid logger
const hybridLogger = getLogger({
  strategy: LogStrategy.HYBRID,
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  enableMemory: true,
  maxMemoryEntries: 100,
  filePath: './logs/hybrid.log'
});
```

## 📊 Logger Comparison

| Logger | Development | Production | Use Case | Zero Config |
|--------|-------------|------------|----------|-------------|
| **Console** | ✅ Full logging | ❌ No logging | Debugging | ✅ Yes |
| **Memory** | 50 entries | 10 entries | Temporary logs | ✅ Yes |
| **File** | `./logs/dev/` | `./logs/prod/` | Persistent logs | ✅ Yes |
| **Remote** | ❌ Disabled | ✅ `/api/logs` | API monitoring | ✅ Yes |
| **Hybrid** | Console+Memory+File | File+Remote | Full featured | ✅ Yes |
| **Smart** | Console+Memory | File+Remote | Best of both | ✅ Yes |

## 🎯 Quick Selection Guide

**For most use cases:**
```tsx
// Use Smart Logger - automatically chooses the best strategy
<SmartProvider>
  <App />
</SmartProvider>
```

**For specific needs:**
```tsx
// Console: Development debugging only
<ConsoleProvider>
  <App />
</ConsoleProvider>

// File: Persistent logging
<FileProvider>
  <App />
</FileProvider>

// Remote: API monitoring
<RemoteProvider>
  <App />
</RemoteProvider>
```

## 🔄 Environment Behavior

### Development Environment
- **Console Logging**: ✅ Enabled (full debugging)
- **Memory Logging**: ✅ Enabled (50 entries max)
- **File Logging**: ✅ Enabled (./logs/dev/)
- **Remote Logging**: ❌ Disabled (no API calls)
- **Log Level**: DEBUG (shows all logs)

### Production Environment
- **Console Logging**: ❌ Disabled (no console pollution)
- **Memory Logging**: ❌ Disabled (prevents memory overflow)
- **File Logging**: ✅ Enabled (./logs/prod/)
- **Remote Logging**: ✅ Enabled (sends to /api/logs)
- **Log Level**: WARN (only warnings and errors)

## 🚀 Advanced Examples

### Error Handling

```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();

try {
  // Some risky operation
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    operation: 'riskyOperation',
    userId: 'user-123',
    timestamp: new Date().toISOString()
  });
  
  // Re-throw or handle as needed
  throw error;
}
```

### Performance Monitoring

```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();

async function performOperation() {
  const startTime = Date.now();
  
  try {
    const result = await someAsyncOperation();
    
    logger.info('Operation completed', {
      duration: Date.now() - startTime,
      operation: 'someAsyncOperation',
      success: true
    });
    
    return result;
  } catch (error) {
    logger.error('Operation failed', error, {
      duration: Date.now() - startTime,
      operation: 'someAsyncOperation',
      success: false
    });
    
    throw error;
  }
}
```

### User Action Tracking

```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();

function trackUserAction(action: string, context: Record<string, unknown>) {
  logger.info(`User action: ${action}`, {
    action,
    userId: getCurrentUserId(),
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    ...context
  });
}

// Usage
trackUserAction('button_click', { buttonId: 'cta', page: 'home' });
trackUserAction('form_submit', { formId: 'contact', fields: 5 });
trackUserAction('page_view', { page: 'products', category: 'electronics' });
```

---

For more detailed API information, see [API_REFERENCE.md](API_REFERENCE.md).

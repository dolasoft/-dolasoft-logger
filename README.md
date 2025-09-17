# @dolasoftfree/logger

[![npm version](https://badge.fury.io/js/%40dolasoftfree%2Flogger.svg)](https://badge.fury.io/js/%40dolasoftfree%2Flogger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/dolasoft/-dolasoft-logger/ci.yml)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dolasoftfree/logger?label=bundle%20size&color=green)](https://bundlephobia.com/package/@dolasoftfree/logger@1.0.2)
[![Performance](https://img.shields.io/badge/performance-🚀%20ultra%20lightweight-brightgreen)](https://bundlephobia.com/package/@dolasoftfree/logger@1.0.2)

**Enterprise-grade logging library with zero-configuration setup for React, Next.js, and Node.js applications.**

## 🚀 Performance Highlights

- **Ultra Lightweight**: Only **1.1KB gzipped** - smaller than most utility libraries!
- **Zero Dependencies**: No external dependencies to bloat your bundle
- **Tree Shakeable**: Only import what you need
- **TypeScript First**: Full type safety with zero runtime overhead
- **Production Ready**: Optimized for performance in production environments

[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dolasoftfree/logger?label=minified%20%2B%20gzipped&color=green)](https://bundlephobia.com/package/@dolasoftfree/logger@1.0.2)

## ✨ Features

- 🚀 **Zero Configuration**: Works out of the box with smart defaults
- 🎯 **Production Ready**: No console logging in production, prevents memory overflow
- 🔌 **Multiple Adapters**: Console, Memory, Database, File, Remote
- ⚡ **Framework Integrations**: React, Next.js, Express
- 📊 **Structured Logging**: JSON and text formats with context enrichment
- 🔄 **Log Rotation**: Automatic file rotation with size limits
- 📈 **Performance**: Async logging with batching
- 🛡️ **TypeScript**: Full type safety and IntelliSense
- 📦 **Zero Dependencies**: Lightweight and fast
- 🌐 **Universal**: Works in any JavaScript/TypeScript environment

## 🚀 Quick Start

### Zero Configuration (Recommended)

**Just wrap your app and start logging - no configuration needed!**

```tsx
import { ZeroConfigLoggerProvider, useZeroConfigLogger } from '@dolasoftfree/logger';

function App() {
  return (
    <ZeroConfigLoggerProvider>
      <MyComponent />
    </ZeroConfigLoggerProvider>
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
      logError('API call failed', error);
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

**That's it!** The logger automatically:
- ✅ **Development**: Console logging + memory (50 entries max)
- ✅ **Production**: Remote logging only (no console, no memory overflow)
- ✅ **Smart Environment Detection**: Automatically switches behavior
- ✅ **Type Safe**: Full TypeScript support
- ✅ **Memory Safe**: Prevents memory overflow

## 📦 Installation

```bash
npm install @dolasoftfree/logger
# or
yarn add @dolasoftfree/logger
# or
pnpm add @dolasoftfree/logger
```

## 🎯 Two Approaches

### 1. Zero Config (90% of use cases)

**Perfect for most applications - no configuration needed:**

```tsx
import { ZeroConfigLoggerProvider, useZeroConfigLogger } from '@dolasoftfree/logger';

<ZeroConfigLoggerProvider>
  <App />
</ZeroConfigLoggerProvider>
```

### 2. Simple Config (When you need control)

**For when you need specific customization:**

```tsx
import { SimpleLoggerProvider, useSimpleLogger } from '@dolasoftfree/logger';

<SimpleLoggerProvider 
  appSlug="my-custom-app"
  userId="user-123"
  remoteEndpoint="/api/custom-logs"
  maxMemoryEntries={100}
>
  <App />
</SimpleLoggerProvider>
```

## 📊 Comparison

| Feature | Zero Config | Simple Config |
|---------|-------------|---------------|
| **Setup** | `ZeroConfigLoggerProvider` | `SimpleLoggerProvider` |
| **Configuration** | None required | Minimal props |
| **App Slug** | `'app'` (default) | Customizable |
| **User ID** | Auto-generated | Customizable |
| **Remote Endpoint** | `'/api/logs'` | Customizable |
| **Memory Limit** | 50 entries | Customizable |
| **Use Case** | 90% of apps | When you need control |

## 🔧 Easy Setup for All Environments

### 🚀 Zero Config Setup (All Environments)

#### React (Client-side)
```tsx
import { ZeroConfigLoggerProvider, useZeroConfigLogger } from '@dolasoftfree/logger';

function App() {
  return (
    <ZeroConfigLoggerProvider>
      <MyComponent />
    </ZeroConfigLoggerProvider>
  );
}

function MyComponent() {
  const { logger, logUserAction, logError } = useZeroConfigLogger();
  
  const handleClick = () => {
    logger.info('Button clicked');
    logUserAction('button_click', { buttonId: 'cta' });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

#### Next.js (Full-stack)
```tsx
// app/layout.tsx - Client-side provider
import { ZeroConfigLoggerProvider } from '@dolasoftfree/logger';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ZeroConfigLoggerProvider>
          {children}
        </ZeroConfigLoggerProvider>
      </body>
    </html>
  );
}

// app/api/users/route.ts - Server-side
import { getServerLogger } from '@dolasoftfree/logger/nextjs';

export async function GET(request: NextRequest) {
  const logger = getServerLogger(request);
  
  logger.info('API called');
  
  try {
    return Response.json({ users: [] });
  } catch (error) {
    logger.error('API error', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

#### Node.js (Server-side)
```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();

logger.info('Server started');
logger.error('Database error', error, { query: 'SELECT * FROM users' });
```

#### Express (Server-side)
```typescript
import express from 'express';
import { createLoggingMiddleware, createErrorHandler } from '@dolasoftfree/logger/express';

const app = express();

// Zero config middleware - just add it!
app.use(createLoggingMiddleware());
app.use(createErrorHandler());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

#### Vanilla JavaScript (Browser)
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { getLogger } from 'https://unpkg.com/@dolasoftfree/logger/dist/index.esm.js';
    
    const logger = getLogger();
    logger.info('Page loaded');
    
    document.getElementById('button').addEventListener('click', () => {
      logger.info('Button clicked');
    });
  </script>
</head>
<body>
  <button id="button">Click me</button>
</body>
</html>
```

### ⚙️ Simple Config Setup (When You Need Control)

#### React with Custom Config
```tsx
import { SimpleLoggerProvider, useSimpleLogger } from '@dolasoftfree/logger';

function App() {
  return (
    <SimpleLoggerProvider 
      appSlug="my-custom-app"
      userId="user-123"
      remoteEndpoint="/api/custom-logs"
      maxMemoryEntries={100}
    >
      <MyComponent />
    </SimpleLoggerProvider>
  );
}
```

#### Node.js with Custom Config
```typescript
import { LoggerService, LogLevel, LogStrategy } from '@dolasoftfree/logger';

const logger = new LoggerService({
  strategy: LogStrategy.HYBRID,
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  filePath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5
});

logger.info('Custom configured server started');
```

## 📊 Environment Comparison

| Environment | Zero Config | Simple Config | Server/Client | Console | Memory | Remote |
|-------------|-------------|---------------|---------------|---------|--------|--------|
| **React** | `ZeroConfigLoggerProvider` | `SimpleLoggerProvider` | Client | Dev only | Dev only | Prod only |
| **Next.js** | `ZeroConfigLoggerProvider` + `getServerLogger` | Custom config | Both | Dev only | Dev only | Prod only |
| **Node.js** | `getLogger()` | `new LoggerService()` | Server | Always | Always | Never |
| **Express** | `createLoggingMiddleware()` | Custom config | Server | Always | Always | Never |
| **Vanilla JS** | `getLogger()` | `new LoggerService()` | Client | Dev only | Dev only | Prod only |

## 🎯 Quick Start Guide

### 1. Choose Your Environment

**React/Next.js (Client-side):**
```tsx
// Zero config - works out of the box
<ZeroConfigLoggerProvider>
  <App />
</ZeroConfigLoggerProvider>
```

**Node.js/Express (Server-side):**
```typescript
// Zero config - works out of the box
import { getLogger } from '@dolasoftfree/logger';
const logger = getLogger();
```

**Vanilla JavaScript:**
```html
<!-- Zero config - works out of the box -->
<script type="module">
  import { getLogger } from '@dolasoftfree/logger';
  const logger = getLogger();
</script>
```

### 2. Start Logging

```typescript
// Basic logging
logger.info('Hello World');
logger.error('Something failed', error);

// Specialized logging (React/Next.js only)
const { logUserAction, logError, logPerformance } = useZeroConfigLogger();
logUserAction('button_click', { buttonId: 'cta' });
logPerformance('api_call', 150);
```

### 3. That's It! 🎉

The logger automatically handles:
- ✅ Environment detection (dev vs prod)
- ✅ Memory management (prevents overflow)
- ✅ Console safety (disabled in production)
- ✅ Level filtering (DEBUG in dev, WARN in prod)
- ✅ Context enrichment (user, request, app info)

## 🎯 Zero Config Adapters (All Adapters!)

**Every adapter now has zero-config setup - just choose your adapter and start logging!**

### React Providers (Zero Config)

```tsx
import {
  ConsoleProvider,    // Console logging (dev only)
  MemoryProvider,     // Memory logging (both dev/prod)
  FileProvider,       // File logging (both dev/prod)
  RemoteProvider,     // Remote logging (prod only)
  HybridProvider,     // Full featured (both dev/prod)
  SmartProvider,      // Smart choice (RECOMMENDED)
  useLogger
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
  const { logger, logUserAction, logError, logPerformance } = useLogger();
  
  const handleClick = () => {
    logger.info('Button clicked');
    logUserAction('button_click', { buttonId: 'cta' });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Direct Loggers (Zero Config)

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

### Logger Comparison

| Logger | Development | Production | Use Case | Zero Config |
|--------|-------------|------------|----------|-------------|
| **Console** | ✅ Full logging | ❌ No logging | Debugging | ✅ Yes |
| **Memory** | 50 entries | 10 entries | Temporary logs | ✅ Yes |
| **File** | `./logs/dev/` | `./logs/prod/` | Persistent logs | ✅ Yes |
| **Remote** | ❌ Disabled | ✅ `/api/logs` | API monitoring | ✅ Yes |
| **Hybrid** | Console+Memory+File | File+Remote | Full featured | ✅ Yes |
| **Smart** | Console+Memory | File+Remote | Best of both | ✅ Yes |

### Quick Logger Selection

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

### Next.js API Routes

```typescript
import { getServerLogger } from '@dolasoftfree/logger/nextjs';

export async function GET(request: NextRequest) {
  const logger = getServerLogger(request);
  
  logger.info('API endpoint called');
  
  try {
    // Your logic here
    return Response.json({ success: true });
  } catch (error) {
    logger.error('API error', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### Express Middleware

```typescript
import express from 'express';
import { createLoggingMiddleware, createErrorHandler } from '@dolasoftfree/logger/express';

const app = express();

app.use(createLoggingMiddleware());
app.use(createErrorHandler());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

## 🎨 Available Methods

### Basic Logging

```typescript
const { logger } = useZeroConfigLogger();

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
logger.fatal('Fatal error', error);
```

### Specialized Logging

```typescript
const { logUserAction, logError, logPerformance } = useZeroConfigLogger();

// User action tracking
logUserAction('button_click', { 
  buttonId: 'cta-button',
  page: 'homepage' 
});

// Error logging with context
logError('API call failed', error, {
  endpoint: '/api/users',
  retryCount: 0
});

// Performance monitoring
logPerformance('database_query', 150, {
  query: 'SELECT * FROM users',
  recordCount: 1000
});
```

## 🔧 Configuration Options

### Zero Config (Default Values)

```typescript
// These are the defaults - no configuration needed!
{
  appSlug: 'app',
  enableConsole: isDevelopment(), // true in dev, false in prod
  enableRemote: isProduction(), // false in dev, true in prod
  remoteEndpoint: '/api/logs',
  strategy: isDevelopment() ? 'console' : 'remote',
  level: isProduction() ? 'warn' : 'debug',
  maxMemoryEntries: 50
}
```

### Simple Config (Customizable)

```typescript
<SimpleLoggerProvider 
  appSlug="my-app"                    // Custom app identifier
  userId="user-123"                   // User identifier
  requestId="req-456"                 // Request identifier
  enableConsole={true}                // Override console logging
  maxMemoryEntries={100}              // Memory limit
  remoteEndpoint="/api/custom-logs"   // Custom API endpoint
>
  <App />
</SimpleLoggerProvider>
```

## 🌍 Environment Behavior

### Development
- ✅ **Console Logging**: All logs printed to console
- ✅ **Memory Logging**: 50 entries max for debugging
- ✅ **Log Level**: DEBUG (shows all logs)
- ✅ **Strategy**: CONSOLE

### Production
- ❌ **Console Logging**: Disabled (no console pollution)
- ❌ **Memory Logging**: Disabled (prevents memory overflow)
- ✅ **Remote Logging**: Sends to `/api/logs` endpoint
- ✅ **Log Level**: WARN (only warnings and errors)
- ✅ **Strategy**: REMOTE

## 📊 Logging Flow Table

| Scenario | Environment | Log Level | Console | Memory | Remote | Strategy | Example |
|----------|-------------|-----------|---------|--------|--------|----------|---------|
| **Client Error** | Development | DEBUG | ✅ Yes | ✅ Yes (50 max) | ❌ No | CONSOLE | `logger.error('API failed', error)` → Console + Memory |
| **Client Error** | Production | WARN | ❌ No | ❌ No | ✅ Yes | REMOTE | `logger.error('API failed', error)` → `/api/logs` endpoint |
| **Client Info** | Development | DEBUG | ✅ Yes | ✅ Yes (50 max) | ❌ No | CONSOLE | `logger.info('Button clicked')` → Console + Memory |
| **Client Info** | Production | WARN | ❌ No | ❌ No | ❌ No | REMOTE | `logger.info('Button clicked')` → Filtered out (below WARN) |
| **Client Debug** | Development | DEBUG | ✅ Yes | ✅ Yes (50 max) | ❌ No | CONSOLE | `logger.debug('Debug info')` → Console + Memory |
| **Client Debug** | Production | WARN | ❌ No | ❌ No | ❌ No | REMOTE | `logger.debug('Debug info')` → Filtered out (below WARN) |
| **Client Warn** | Development | DEBUG | ✅ Yes | ✅ Yes (50 max) | ❌ No | CONSOLE | `logger.warn('Deprecated API')` → Console + Memory |
| **Client Warn** | Production | WARN | ❌ No | ❌ No | ✅ Yes | REMOTE | `logger.warn('Deprecated API')` → `/api/logs` endpoint |
| **Client Fatal** | Development | DEBUG | ✅ Yes | ✅ Yes (50 max) | ❌ No | CONSOLE | `logger.fatal('App crash', error)` → Console + Memory |
| **Client Fatal** | Production | WARN | ❌ No | ❌ No | ✅ Yes | REMOTE | `logger.fatal('App crash', error)` → `/api/logs` endpoint |
| **Server Error** | Development | DEBUG | ✅ Yes | ✅ Yes (50 max) | ❌ No | CONSOLE | `logger.error('DB error', error)` → Console + Memory |
| **Server Error** | Production | WARN | ✅ Yes | ✅ Yes (50 max) | ❌ No | CONSOLE | `logger.error('DB error', error)` → Console + Memory |
| **Server Info** | Development | DEBUG | ✅ Yes | ✅ Yes (50 max) | ❌ No | CONSOLE | `logger.info('Server started')` → Console + Memory |
| **Server Info** | Production | WARN | ✅ Yes | ✅ Yes (50 max) | ❌ No | CONSOLE | `logger.info('Server started')` → Filtered out (below WARN) |

### 🔄 Flow Examples

#### Development Client Error Flow
```
User clicks button → logger.error('API failed', error) 
    ↓
1. Console: [2023-01-01T00:00:00.000Z] ERROR API failed {"error": "Connection failed"}
2. Memory: Stored in memory (up to 50 entries)
3. Remote: Not sent (disabled in development)
```

#### Production Client Error Flow
```
User clicks button → logger.error('API failed', error)
    ↓
1. Console: Nothing (disabled in production)
2. Memory: Nothing (disabled in production)
3. Remote: POST /api/logs with error data
```

#### Development Client Info Flow
```
User clicks button → logger.info('Button clicked')
    ↓
1. Console: [2023-01-01T00:00:00.000Z] INFO Button clicked
2. Memory: Stored in memory (up to 50 entries)
3. Remote: Not sent (disabled in development)
```

#### Production Client Info Flow
```
User clicks button → logger.info('Button clicked')
    ↓
1. Console: Nothing (disabled in production)
2. Memory: Nothing (disabled in production)
3. Remote: Nothing (INFO level filtered out in production)
```

### 🎯 Key Points

- **Client-side**: Behavior changes based on environment (dev vs prod)
- **Server-side**: Always uses console + memory (no remote logging)
- **Memory Safety**: Client-side memory limited to 50 entries in dev, 0 in prod
- **Console Safety**: Client-side console disabled in production
- **Level Filtering**: Production only shows WARN and ERROR levels
- **Remote Logging**: Only enabled for client-side in production

### 🔄 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOGGING FLOW DIAGRAM                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐
│   CLIENT SIDE   │    │   SERVER SIDE   │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  logger.error() │    │  logger.error() │
│  logger.info()  │    │  logger.info()  │
│  logger.warn()  │    │  logger.warn()  │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   ENVIRONMENT   │    │   ENVIRONMENT   │
│   DETECTION     │    │   DETECTION     │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  DEVELOPMENT    │    │  DEVELOPMENT    │
│  PRODUCTION     │    │  PRODUCTION     │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  CONSOLE +      │    │  CONSOLE +      │
│  MEMORY         │    │  MEMORY         │
│  (50 entries)   │    │  (50 entries)   │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  ✅ Console     │    │  ✅ Console     │
│  ✅ Memory      │    │  ✅ Memory      │
│  ❌ Remote      │    │  ❌ Remote      │
└─────────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUMMARY                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ • CLIENT DEV:  Console + Memory (50 entries)                              │
│ • CLIENT PROD: Remote API only (no console, no memory)                    │
│ • SERVER:      Console + Memory (both dev and prod)                       │
│ • LEVELS:      DEV=DEBUG, PROD=WARN (filters out INFO/DEBUG in prod)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📚 API Reference

### Zero Config Provider

```typescript
interface ZeroConfigLoggerProviderProps {
  children: ReactNode;
  // No props required - zero configuration!
}
```

### Simple Config Provider

```typescript
interface SimpleLoggerProviderProps {
  children: ReactNode;
  appSlug?: string;              // Default: 'app'
  userId?: string;               // Optional user ID
  requestId?: string;            // Optional request ID
  enableConsole?: boolean;       // Override console logging
  maxMemoryEntries?: number;     // Memory limit (default: 50)
  remoteEndpoint?: string;       // API endpoint (default: '/api/logs')
}
```

### Logger Methods

```typescript
interface LoggerMethods {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  fatal(message: string, error?: Error, context?: Record<string, unknown>): void;
}

interface SpecializedMethods {
  logUserAction(action: string, context?: Record<string, unknown>): void;
  logError(message: string, error?: Error, context?: Record<string, unknown>): void;
  logPerformance(operation: string, duration: number, context?: Record<string, unknown>): void;
}
```

## 🎯 Log Levels

- **DEBUG** (0): Detailed information for debugging
- **INFO** (1): General information about application flow
- **WARN** (2): Warning messages for potential issues
- **ERROR** (3): Error messages for handled exceptions
- **FATAL** (4): Fatal errors that cause application termination

## 🔄 Log Strategies

- **CONSOLE**: Log to console only (development)
- **MEMORY**: Store logs in memory (development)
- **REMOTE**: Send logs to API endpoint (production)
- **HYBRID**: Use multiple adapters simultaneously

## 🚀 Examples

### Complete React App

```tsx
import React from 'react';
import { ZeroConfigLoggerProvider, useZeroConfigLogger } from '@dolasoftfree/logger';

function App() {
  return (
    <ZeroConfigLoggerProvider>
      <Header />
      <Main />
      <Footer />
    </ZeroConfigLoggerProvider>
  );
}

function Header() {
  const { logUserAction } = useZeroConfigLogger();
  
  const handleLogoClick = () => {
    logUserAction('logo_click', { page: 'homepage' });
  };

  return <div onClick={handleLogoClick}>My App</div>;
}

function Main() {
  const { logger, logError, logPerformance } = useZeroConfigLogger();
  
  const handleApiCall = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      
      logPerformance('api_call', Date.now() - startTime, {
        endpoint: '/api/data',
        status: response.status
      });
      
      logger.info('Data loaded successfully', { count: data.length });
    } catch (error) {
      logError('Failed to load data', error, {
        endpoint: '/api/data',
        retryCount: 0
      });
    }
  };

  return <button onClick={handleApiCall}>Load Data</button>;
}

function Footer() {
  const { logger } = useZeroConfigLogger();
  
  const handleLinkClick = (link: string) => {
    logger.info('Footer link clicked', { link });
  };

  return (
    <footer>
      <a onClick={() => handleLinkClick('privacy')}>Privacy</a>
      <a onClick={() => handleLinkClick('terms')}>Terms</a>
    </footer>
  );
}
```

### Next.js App Router

```tsx
// app/layout.tsx
import { ZeroConfigLoggerProvider } from '@dolasoftfree/logger';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ZeroConfigLoggerProvider>
          {children}
        </ZeroConfigLoggerProvider>
      </body>
    </html>
  );
}

// app/page.tsx
'use client';
import { useZeroConfigLogger } from '@dolasoftfree/logger';

export default function HomePage() {
  const { logger, logUserAction } = useZeroConfigLogger();
  
  const handleClick = () => {
    logger.info('Home page button clicked');
    logUserAction('homepage_cta', { buttonId: 'get-started' });
  };

  return (
    <div>
      <h1>Welcome to My App</h1>
      <button onClick={handleClick}>Get Started</button>
    </div>
  );
}
```

## 📖 Examples

For comprehensive usage examples across different frameworks and environments, see [EXAMPLES.md](EXAMPLES.md).

### Quick Examples

**Zero Config (Recommended):**
```tsx
import { SmartProvider, useZeroConfigLogger } from '@dolasoftfree/logger';

function App() {
  return (
    <SmartProvider>
      <MyComponent />
    </SmartProvider>
  );
}
```

**Direct Usage:**
```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();
logger.info('Hello World');
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 🐛 Issues: [GitHub Issues](https://github.com/dolasoft/-dolasoft-logger/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/dolasoft/-dolasoft-logger/wiki)

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

Made with ❤️ by [DolaSoft](https://github.com/dolasoft)
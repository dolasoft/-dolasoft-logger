# @dolasoftfree/logger - API Reference

## 🚀 Quick Start

### Zero Configuration (Recommended)

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
  
  logger.info('Hello World');
  logUserAction('button_click', { buttonId: 'cta' });
}
```

### Simple Configuration

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

## 📚 Core API

### Zero Config Adapters

**All adapters now have zero-config setup - just choose your adapter and start logging!**

#### React Providers

```typescript
// Console Provider (Development only)
<ConsoleProvider>
  <App />
</ConsoleProvider>

// Memory Provider (Temporary storage)
<MemoryProvider>
  <App />
</MemoryProvider>

// File Provider (Persistent storage)
<FileProvider>
  <App />
</FileProvider>

// Remote Provider (API monitoring)
<RemoteProvider>
  <App />
</RemoteProvider>

// Hybrid Provider (Full featured)
<HybridProvider>
  <App />
</HybridProvider>

// Smart Provider (RECOMMENDED)
<SmartProvider>
  <App />
</SmartProvider>
```

#### Direct Loggers

```typescript
import { 
  createConsoleLogger,
  createMemoryLogger,
  createFileLogger,
  createRemoteLogger,
  createHybridLogger,
  createSmartLogger,
  Loggers
} from '@dolasoftfree/logger';

// Direct usage
const logger = createSmartLogger(); // RECOMMENDED
const consoleLogger = createConsoleLogger();
const fileLogger = createFileLogger();

// Or use the object
const logger = Loggers.smart(); // RECOMMENDED

// Start logging immediately
logger.info('Hello World');
logger.error('Something failed', error);
```

#### Logger Comparison

| Logger | Development | Production | Use Case | Zero Config |
|--------|-------------|------------|----------|-------------|
| **Console** | ✅ Full logging | ❌ No logging | Debugging | ✅ Yes |
| **Memory** | 50 entries | 10 entries | Temporary logs | ✅ Yes |
| **File** | `./logs/dev/` | `./logs/prod/` | Persistent logs | ✅ Yes |
| **Remote** | ❌ Disabled | ✅ `/api/logs` | API monitoring | ✅ Yes |
| **Hybrid** | Console+Memory+File | File+Remote | Full featured | ✅ Yes |
| **Smart** | Console+Memory | File+Remote | Best of both | ✅ Yes |

### ZeroConfigLoggerProvider

**Zero-configuration React provider - works out of the box**

```typescript
interface ZeroConfigLoggerProviderProps {
  children: ReactNode;
  // No props required - zero configuration!
}

// Usage
<ZeroConfigLoggerProvider>
  <App />
</ZeroConfigLoggerProvider>
```

**Default Configuration:**
- **Development**: Console logging + memory (50 entries max)
- **Production**: Remote logging only (no console, no memory overflow)
- **App Slug**: `'app'`
- **Remote Endpoint**: `'/api/logs'`
- **Log Level**: DEBUG (dev) / WARN (prod)
- **Strategy**: CONSOLE (dev) / REMOTE (prod)

### SimpleLoggerProvider

**Configurable React provider for customization**

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

// Usage
<SimpleLoggerProvider 
  appSlug="my-custom-app"
  userId="user-123"
  remoteEndpoint="/api/custom-logs"
  maxMemoryEntries={100}
>
  <App />
</SimpleLoggerProvider>
```

### useZeroConfigLogger Hook

**Zero-configuration logger hook**

```typescript
interface ZeroConfigLoggerContextType {
  logger: LoggerMethods;
  logUserAction: (action: string, context?: Record<string, unknown>) => void;
  logError: (message: string, error?: Error, context?: Record<string, unknown>) => void;
  logPerformance: (operation: string, duration: number, context?: Record<string, unknown>) => void;
}

// Usage
function MyComponent() {
  const { logger, logUserAction, logError, logPerformance } = useZeroConfigLogger();
  
  // Basic logging
  logger.info('Button clicked');
  
  // Specialized logging
  logUserAction('button_click', { buttonId: 'cta' });
  logError('API failed', error, { endpoint: '/api/users' });
  logPerformance('api_call', 150, { endpoint: '/api/data' });
}
```

### useSimpleLogger Hook

**Configurable logger hook**

```typescript
interface SimpleLoggerContextType {
  logger: LoggerMethods;
  logUserAction: (action: string, context?: Record<string, unknown>) => void;
  logError: (message: string, error?: Error, context?: Record<string, unknown>) => void;
  logPerformance: (operation: string, duration: number, context?: Record<string, unknown>) => void;
}

// Usage
function MyComponent() {
  const { logger, logUserAction, logError, logPerformance } = useSimpleLogger();
  
  // Same API as useZeroConfigLogger
  logger.info('Button clicked');
  logUserAction('button_click', { buttonId: 'cta' });
}
```

## 🔧 Logger Methods

### Basic Logging Methods

```typescript
interface LoggerMethods {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  fatal(message: string, error?: Error, context?: Record<string, unknown>): void;
}

// Examples
logger.debug('Debug information', { userId: '123' });
logger.info('User logged in', { userId: '123', sessionId: '456' });
logger.warn('Deprecated API used', { api: 'old-endpoint' });
logger.error('Database error', new Error('Connection failed'), { query: 'SELECT * FROM users' });
logger.fatal('Application crash', new Error('Out of memory'), { memoryUsage: '95%' });
```

### Specialized Logging Methods

```typescript
interface SpecializedMethods {
  logUserAction(action: string, context?: Record<string, unknown>): void;
  logError(message: string, error?: Error, context?: Record<string, unknown>): void;
  logPerformance(operation: string, duration: number, context?: Record<string, unknown>): void;
}

// Examples
logUserAction('button_click', { 
  buttonId: 'cta-button',
  page: 'homepage',
  userId: 'user-123'
});

logError('API call failed', error, {
  endpoint: '/api/users',
  method: 'GET',
  statusCode: 500,
  retryCount: 0
});

logPerformance('database_query', 150, {
  query: 'SELECT * FROM users WHERE active = true',
  recordCount: 1000,
  tableName: 'users'
});
```

## 🌍 Environment Behavior

### Development Environment

```typescript
// Default behavior in development
{
  enableConsole: true,           // Console logging enabled
  enableRemote: false,           // Remote logging disabled
  strategy: 'console',           // Console strategy
  level: 'debug',                // DEBUG level (shows all logs)
  maxMemoryEntries: 50           // 50 entries in memory
}
```

### Production Environment

```typescript
// Default behavior in production
{
  enableConsole: false,          // Console logging disabled
  enableRemote: true,            // Remote logging enabled
  strategy: 'remote',            // Remote strategy
  level: 'warn',                 // WARN level (only warnings and errors)
  maxMemoryEntries: 0            // No memory logging
}
```

## 🔌 Framework Integrations

### React (Zero Config)

```tsx
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

### Next.js API Routes

```typescript
import { getServerLogger } from '@dolasoftfree/logger/nextjs';

export async function GET(request: NextRequest) {
  const logger = getServerLogger(request);
  
  logger.info('API endpoint called', {
    method: 'GET',
    url: request.url
  });
  
  try {
    // Your logic here
    return Response.json({ success: true });
  } catch (error) {
    logger.error('API error', error, {
      endpoint: '/api/users',
      method: 'GET'
    });
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### Express Middleware

```typescript
import express from 'express';
import { createLoggingMiddleware, createErrorHandler } from '@dolasoftfree/logger/express';

const app = express();

// Request logging middleware
app.use(createLoggingMiddleware());

// Error handling middleware
app.use(createErrorHandler());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

## 🎯 Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,    // Detailed information for debugging
  INFO = 1,     // General information about application flow
  WARN = 2,     // Warning messages for potential issues
  ERROR = 3,    // Error messages for handled exceptions
  FATAL = 4     // Fatal errors that cause application termination
}
```

## 🔄 Log Strategies

```typescript
enum LogStrategy {
  CONSOLE = 'console',    // Console only (development)
  MEMORY = 'memory',      // Memory storage (development)
  REMOTE = 'remote',      // Remote API endpoint (production)
  HYBRID = 'hybrid'       // Multiple adapters simultaneously
}
```

## 📊 Advanced Usage

### Node.js (Server-side)

```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();

logger.info('Server started', { port: 3000 });
logger.error('Database error', error, { query: 'SELECT * FROM users' });
```

### Custom Configuration

```typescript
import { SimpleLoggerProvider } from '@dolasoftfree/logger';

// Custom configuration
<SimpleLoggerProvider 
  appSlug="my-enterprise-app"
  userId="user-123"
  requestId="req-456"
  enableConsole={true}              // Override environment detection
  maxMemoryEntries={200}            // Increase memory limit
  remoteEndpoint="/api/enterprise-logs"  // Custom endpoint
>
  <App />
</SimpleLoggerProvider>
```

### Error Tracking

```typescript
const { logError } = useZeroConfigLogger();

try {
  await riskyOperation();
} catch (error) {
  logError('Operation failed', error, {
    operation: 'riskyOperation',
    userId: 'user-123',
    timestamp: new Date().toISOString()
  });
}
```

### Performance Monitoring

```typescript
const { logPerformance } = useZeroConfigLogger();

const startTime = Date.now();
await fetch('/api/data');
const duration = Date.now() - startTime;

logPerformance('api_call', duration, {
  endpoint: '/api/data',
  method: 'GET',
  statusCode: 200
});
```

### User Action Tracking

```typescript
const { logUserAction } = useZeroConfigLogger();

const handleButtonClick = (buttonId: string) => {
  logUserAction('button_click', {
    buttonId,
    page: 'homepage',
    userId: 'user-123',
    timestamp: new Date().toISOString()
  });
};
```

## 🔧 Utility Functions

### Convenience Functions

```typescript
import { logInfo, logError, logWarn, logDebug, logFatal } from '@dolasoftfree/logger';

logInfo('Quick info message');
logError('Quick error', new Error('Test error'));
logWarn('Quick warning');
logDebug('Quick debug');
logFatal('Quick fatal', new Error('Critical error'));
```

### UUID Generation

```typescript
import { generateUUID, generateShortId, generateRequestId } from '@dolasoftfree/logger';

const uuid = generateUUID();           // '123e4567-e89b-12d3-a456-426614174000'
const shortId = generateShortId();     // 'abc123'
const requestId = generateRequestId('req'); // 'req_abc123'
```

## 📝 Log Formats

### JSON Format (Default)

```json
{
  "timestamp": "2023-01-01T00:00:00.000Z",
  "level": "INFO",
  "message": "User logged in",
  "context": { "userId": "123" },
  "metadata": { "sessionId": "456" }
}
```

### Console Format (Development)

```
[2023-01-01T00:00:00.000Z] INFO User logged in {"userId":"123"} {"sessionId":"456"}
```

## 🚀 Best Practices

### 1. Use Zero Config for Most Cases

```tsx
// ✅ Recommended for 90% of use cases
<ZeroConfigLoggerProvider>
  <App />
</ZeroConfigLoggerProvider>
```

### 2. Use Simple Config for Customization

```tsx
// ✅ When you need specific control
<SimpleLoggerProvider 
  appSlug="my-app"
  userId="user-123"
  remoteEndpoint="/api/logs"
>
  <App />
</SimpleLoggerProvider>
```

### 3. Use Specialized Methods

```tsx
// ✅ Use specialized methods for better context
logUserAction('button_click', { buttonId: 'cta' });
logError('API failed', error, { endpoint: '/api/users' });
logPerformance('db_query', 150, { query: 'SELECT * FROM users' });
```

### 4. Provide Rich Context

```tsx
// ✅ Good - rich context
logger.info('User action', {
  action: 'login',
  userId: 'user-123',
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  page: 'homepage'
});

// ❌ Avoid - minimal context
logger.info('User action');
```

## 📦 Installation

```bash
npm install @dolasoftfree/logger
# or
yarn add @dolasoftfree/logger
# or
pnpm add @dolasoftfree/logger
```

## 🛡️ TypeScript Support

Full TypeScript support with comprehensive type definitions and IntelliSense.

## 🌐 Browser Support

Works in all modern browsers and Node.js environments.

## 📦 Zero Dependencies

Lightweight library with no external dependencies.
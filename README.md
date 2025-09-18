# @dolasoftfree/logger

[![npm version](https://badge.fury.io/js/%40dolasoftfree%2Flogger.svg)](https://badge.fury.io/js/%40dolasoftfree%2Flogger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CI](https://github.com/dolasoft/-dolasoft-logger/workflows/CI/badge.svg)](https://github.com/dolasoft/-dolasoft-logger/actions)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/@dolasoftfree/logger)](https://bundlephobia.com/package/@dolasoftfree/logger)

**Universal logging library that works everywhere - zero configuration required.**

## 🚀 Quick Start

```bash
npm install @dolasoftfree/logger
```

```typescript
import { log } from '@dolasoftfree/logger';

// Works immediately - zero config needed
log.info('User logged in', { userId: '123' });
log.error('API failed', error, { endpoint: '/api/users' });
```

## ✨ What's New in v2.0.3

- **🎯 Fixed Enum Exports**: `LogLevel` and `LogStrategy` now properly exported
- **🔧 Zero Configuration**: Automatic environment detection and setup
- **📱 Next.js Optimized**: `nextjsLogger` with separate dev/prod log files
- **🏷️ Global App Context**: Set `appSlug` globally, `userId`/`requestId` per-call
- **⚡ Performance**: Optimized logger calls and reduced duplication
- **🧪 Enhanced Types**: Better TypeScript support with proper exports
- **🏗️ BaseLogger Class**: Inheritance-based logger implementations
- **📦 New Exports**: `BaseLogger`, `NextJSLogger`, `nextjsLogger`

## 📦 Available Exports

| Export | Description | Usage |
|--------|-------------|-------|
| `log` | Universal logger (zero config) | `import { log } from '@dolasoftfree/logger'` |
| `nextjsLogger` | Next.js optimized logger | `import { nextjsLogger } from '@dolasoftfree/logger'` |
| `BaseLogger` | Base class for custom loggers | `import { BaseLogger } from '@dolasoftfree/logger'` |
| `NextJSLogger` | Next.js logger class | `import { NextJSLogger } from '@dolasoftfree/logger'` |
| `LogLevel`, `LogStrategy` | Enums for configuration | `import { LogLevel, LogStrategy } from '@dolasoftfree/logger'` |
| `getLogger` | Create logger instances | `import { getLogger } from '@dolasoftfree/logger'` |

## 📋 Usage Table

| Method | Description | Example |
|--------|-------------|---------|
| `log.debug()` | Debug information | `log.debug('Processing data', { step: 1 })` |
| `log.info()` | General information | `log.info('User action', { userId: '123' })` |
| `log.warn()` | Warning messages | `log.warn('Rate limit approaching', { count: 95 })` |
| `log.error()` | Error messages | `log.error('API failed', error, { endpoint: '/api' })` |
| `log.fatal()` | Fatal errors | `log.fatal('Database down', error, { service: 'db' })` |

## 🌍 Environment Support

| Environment | Console | File | Remote | Notes |
|-------------|---------|------|--------|-------|
| **Browser** | ✅ Dev only | ❌ | ✅ | Console only in development |
| **Node.js** | ✅ Dev only | ✅ | ✅ | File logging with rotation |
| **React** | ✅ Dev only | ❌ | ✅ | Use `useLogger()` hook |
| **Next.js** | ✅ Dev only | ✅ SSR | ✅ | Works in both client/server |
| **SSR** | ✅ Dev only | ✅ | ✅ | Server-side rendering |

## ⚙️ Configuration

### Zero Configuration (Recommended)
The logger works out of the box with sensible defaults:

```typescript
import { log } from '@dolasoftfree/logger';

// Works immediately - no setup needed
log.info('App started');
```

### Advanced Configuration
Configure once at your app's entry point:

```typescript
import { getLogger, LogLevel, LogStrategy } from '@dolasoftfree/logger';

// Configure once at app start
getLogger({
  strategy: LogStrategy.CONSOLE,
  level: LogLevel.INFO,
  enableConsole: true,     // Console logging (dev only by default)
  enableFile: true,        // File logging (Node.js only)
  enableRemote: true,      // Remote logging (Sentry, etc.)
  appSlug: 'my-app',       // Global app identifier
  filePath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,             // Keep 5 rotated files
  remoteConfig: {
    url: 'https://your-api.com/logs',
    apiKey: 'your-api-key'
  }
});
```

### Next.js Specific Configuration
For Next.js apps, use the optimized logger:

```typescript
import { nextjsLogger } from '@dolasoftfree/logger';

// Zero config - automatically detects server/client
nextjsLogger.info('User action', { 
  userId: 'user-123',      // Per-call context
  requestId: 'req-456',    // Per-call context
  action: 'login'          // Regular context
});
```

## 🎯 What to Expect

### Development Mode
- **Console logs**: Pretty formatted, colored output
- **File logs**: JSON format in `./logs/app.log`
- **Remote logs**: Sent to your API endpoint

### Production Mode
- **Console logs**: Disabled (performance)
- **File logs**: JSON format with rotation
- **Remote logs**: Sent to your API endpoint

### File Rotation
- **Max size**: 10MB per file (configurable)
- **Max files**: 5 files (configurable)
- **Format**: `app.log`, `app.1.log`, `app.2.log`, etc.

## 🎨 Log Levels

| Level | Value | When to Use |
|-------|-------|-------------|
| `DEBUG` | 0 | Detailed debugging information |
| `INFO` | 1 | General application flow |
| `WARN` | 2 | Potential issues or warnings |
| `ERROR` | 3 | Handled exceptions and errors |
| `FATAL` | 4 | Fatal errors that crash the app |

## 📦 Bundle Size

- **Minified**: ~5KB gzipped
- **Zero dependencies** (except TypeScript types)
- **Tree-shakeable** - only import what you use
- **Production ready** - optimized builds with proper exports

## 🚀 Examples

### React Usage
```tsx
import { log, useLogger } from '@dolasoftfree/logger';

// Option 1: Direct usage (recommended)
function MyComponent() {
  const handleClick = () => {
    log.info('Button clicked', { buttonId: 'cta' });
  };
  return <button onClick={handleClick}>Click me</button>;
}

// Option 2: Hook (if you prefer)
function MyComponent() {
  const logger = useLogger();
  
  const handleClick = () => {
    logger.info('Button clicked', { buttonId: 'cta' });
  };
  return <button onClick={handleClick}>Click me</button>;
}
```

### Next.js (Zero Config)
```tsx
// app/page.tsx
import { nextjsLogger } from '@dolasoftfree/logger';

export default function Page() {
  return (
    <button onClick={() => nextjsLogger.info('Button clicked', { 
      userId: 'user-123',
      component: 'Button' 
    })}>
      Click me
    </button>
  );
}
```

### Next.js (API Routes)
```typescript
// app/api/users/route.ts
import { nextjsLogger } from '@dolasoftfree/logger';

export async function GET(request: Request) {
  nextjsLogger.info('API called', {
    userId: 'user-123',
    requestId: 'req-456',
    endpoint: '/api/users'
  });
  
  return Response.json({ users: [] });
}
```

### Custom Logger with Base Class
Create your own logger by extending the BaseLogger class:

```typescript
// utils/custom-logger.ts
import { BaseLogger, LogLevel, LogStrategy, LoggerConfig } from '@dolasoftfree/logger';

class MyCustomLogger extends BaseLogger {
  private isServer: boolean;
  private isProduction: boolean;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.isServer = typeof window === 'undefined';
    this.isProduction = process.env.NODE_ENV === 'production';
    super(config);
  }

  protected createConfig(overrides: Partial<LoggerConfig>): LoggerConfig {
    return {
      strategy: LogStrategy.CONSOLE,
      level: this.isProduction ? LogLevel.INFO : LogLevel.DEBUG,
      enableConsole: true,
      enableFile: this.isServer && this.isProduction,
      enableDatabase: false,
      enableRemote: false,
      enableMemory: false,
      format: this.isProduction ? 'json' : 'pretty',
      filePath: this.isProduction ? './logs/my-app-prod.log' : './logs/my-app-dev.log',
      maxFileSize: 10 * 1024 * 1024,
      maxFiles: 5,
      includeStack: true,
      includeMetadata: true,
      includeTimestamp: true,
      includeLevel: true,
      appSlug: process.env.APP_SLUG || 'my-custom-app',
      ...overrides
    };
  }

  protected initializeAdapters() {
    // Add your custom adapters here
    // The base class handles the core logging logic
  }

  protected getSource(): string {
    return this.isServer ? 'my-app-server' : 'my-app-client';
  }
}

// Create singleton instance
const customLogger = new MyCustomLogger();

export default customLogger;
```

### Benefits of Base Class Approach

✅ **Eliminates Duplication**: Common logging logic is shared  
✅ **Consistent Interface**: All loggers have the same API  
✅ **Easy Customization**: Override only what you need  
✅ **Type Safety**: Full TypeScript support  
✅ **Maintainable**: Changes to base class benefit all loggers  
✅ **Testable**: Easy to mock and test individual loggers

### Usage with Custom Logger
```typescript
// app/page.tsx
import { customLogger } from '@/utils/logger';

export default function Page() {
  return (
    <button onClick={() => customLogger.info('Custom log', { 
      userId: 'user-123',
      component: 'Button' 
    })}>
      Click me
    </button>
  );
}
```

### Browser (UMD)
```html
<!-- Load from CDN or local file -->
<script src="https://unpkg.com/@dolasoftfree/logger/dist/browser.js"></script>
<script>
  // Available as window.DolaSoftLogger
  const { log, getLogger } = window.DolaSoftLogger;
  
  log.info('Page loaded', { url: window.location.href });
</script>
```

### Node.js/Express
```javascript
import { log, getLogger } from '@dolasoftfree/logger';

// Configure once
getLogger({ enableFile: true, level: 'info' });

app.get('/api/users', (req, res) => {
  log.info('API called', { endpoint: '/api/users', ip: req.ip });
  res.json({ users: [] });
});
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [DolaSoft](https://github.com/dolasoft)
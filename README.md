# @dolasoftfree/logger

[![npm version](https://badge.fury.io/js/%40dolasoftfree%2Flogger.svg)](https://badge.fury.io/js/%40dolasoftfree%2Flogger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

**Universal logging library that works everywhere - no setup required.**

## 🚀 Quick Start

```bash
npm install @dolasoftfree/logger
```

```typescript
import { log } from '@dolasoftfree/logger';

// Works immediately - no setup needed
log.info('User logged in', { userId: '123' });
log.error('API failed', error, { endpoint: '/api/users' });
```

## ✨ What's New in v2.0.1

- **🎯 New Remote Adapter**: Send logs to external APIs (Sentry, DataDog, etc.)
- **📁 Enhanced File Adapter**: Better file rotation and error handling
- **🔧 Improved Configuration**: More flexible setup options
- **⚡ Better Performance**: Optimized for production use
- **🧪 Comprehensive Tests**: 64 tests covering all adapters

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

Configure once at your app's entry point:

```typescript
import { getLogger } from '@dolasoftfree/logger';

// Configure once at app start
getLogger({
  level: 'info',           // Log level: debug, info, warn, error, fatal
  enableConsole: true,     // Console logging (dev only by default)
  enableFile: true,        // File logging (Node.js only)
  enableRemote: true,      // Remote logging (Sentry, etc.)
  forceConsole: false,     // Force console logging (for testing)
  filePath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,             // Keep 5 rotated files
  remoteConfig: {
    url: 'https://your-api.com/logs',
    apiKey: 'your-api-key'
  }
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

### Next.js
```tsx
// app/layout.tsx
import { getLogger } from '@dolasoftfree/logger';

// Configure once
getLogger({ level: 'info' });

// app/page.tsx
import { log } from '@dolasoftfree/logger';

export default function Page() {
  return (
    <button onClick={() => log.info('Button clicked')}>
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
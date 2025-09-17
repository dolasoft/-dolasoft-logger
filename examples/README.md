# DolaSoft Logger Examples

This directory contains examples of how to use `@dolasoft/logger` in different environments and frameworks.

## Examples

### Universal Usage
- **`vanilla-js.js`** - Vanilla JavaScript (CommonJS)
- **`vanilla-ts.ts`** - TypeScript example
- **`node-js.js`** - Node.js with Express integration
- **`browser-js.html`** - Browser HTML example

### Framework Examples
- **`vue-js.js`** - Vue.js integration
- **`angular.ts`** - Angular integration
- **`react-js.js`** - React integration (coming soon)
- **`svelte.js`** - Svelte integration (coming soon)

### Advanced Examples
- **`express-middleware.js`** - Express.js middleware
- **`nextjs-api.js`** - Next.js API routes
- **`nextjs-client.js`** - Next.js client components
- **`serverless.js`** - Serverless functions

## Running Examples

### Node.js Examples
```bash
# Install dependencies
npm install

# Run TypeScript example
npx ts-node examples/vanilla-ts.ts

# Run JavaScript example
node examples/vanilla-js.js
```

### Browser Examples
```bash
# Serve the HTML file
npx serve examples/browser-js.html
# or
python -m http.server 8000
# then open http://localhost:8000/examples/browser-js.html
```

### Framework Examples
```bash
# Vue.js
cd examples/vue-project
npm install
npm run dev

# Angular
cd examples/angular-project
npm install
ng serve
```

## Key Features Demonstrated

- ✅ **Universal compatibility** - Works everywhere
- ✅ **Framework integrations** - React, Vue, Angular, etc.
- ✅ **Environment awareness** - Dev vs production
- ✅ **Error handling** - Global error catching
- ✅ **Context enrichment** - Automatic metadata
- ✅ **Performance** - Async logging
- ✅ **Testing** - Singleton management

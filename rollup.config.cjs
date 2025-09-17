const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const dts = require('rollup-plugin-dts').default;

const packageJson = require('./package.json');

// Check if we're building for production
const isProduction = process.env.NODE_ENV === 'production';

// Base plugins for all builds
const basePlugins = [
  resolve({
    preferBuiltins: true
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: ['**/*.test.ts', '**/*.test.tsx']
  })
];

// Add minification for production
const getPlugins = (external = []) => {
  const plugins = [...basePlugins];
  
  if (isProduction) {
    plugins.push(
      terser({
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
          reserved: ['LoggerService', 'LogLevel', 'LogStrategy'] // Keep important class names
        },
        format: {
          comments: false // Remove comments
        }
      })
    );
  }
  
  return plugins;
};

module.exports = [
  // Main build (Node.js + Browser)
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: getPlugins(),
    external: ['react', 'next', 'crypto']
  },
  // Browser build (excludes Node.js-only features) - UMD format for browser
  {
    input: 'src/browser.ts',
    output: [
      {
        file: 'dist/browser.js',
        format: 'umd',
        name: 'DolaSoftLogger',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/browser.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: getPlugins(),
    external: ['react', 'next', 'crypto', 'fs', 'path']
  },
  // Browser core build (no React dependencies) - UMD format for browser
  {
    input: 'src/browser-core.ts',
    output: [
      {
        file: 'dist/browser-core.js',
        format: 'umd',
        name: 'DolaSoftLoggerCore',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/browser-core.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: getPlugins(),
    external: ['crypto', 'fs', 'path']
  },
  // React integration
  {
    input: 'src/integrations/react.ts',
    output: [
      {
        file: 'dist/integrations/react.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/integrations/react.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: getPlugins(),
    external: ['react']
  },
  // Next.js integration
  {
    input: 'src/integrations/nextjs.ts',
    output: [
      {
        file: 'dist/integrations/nextjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/integrations/nextjs.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: getPlugins(),
    external: ['next']
  },
  // Next.js client integration
  {
    input: 'src/integrations/nextjs-client.ts',
    output: [
      {
        file: 'dist/integrations/nextjs-client.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/integrations/nextjs-client.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: getPlugins(),
    external: ['react']
  },
  // Express integration
  {
    input: 'src/integrations/express.ts',
    output: [
      {
        file: 'dist/integrations/express.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/integrations/express.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: getPlugins(),
    external: ['express']
  },
  // Type definitions
  {
    input: 'dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/browser.d.ts',
    output: [{ file: 'dist/browser.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/browser-core.d.ts',
    output: [{ file: 'dist/browser-core.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/integrations/react.d.ts',
    output: [{ file: 'dist/integrations/react.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/integrations/nextjs.d.ts',
    output: [{ file: 'dist/integrations/nextjs.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/integrations/nextjs-client.d.ts',
    output: [{ file: 'dist/integrations/nextjs-client.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/integrations/express.d.ts',
    output: [{ file: 'dist/integrations/express.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  }
];
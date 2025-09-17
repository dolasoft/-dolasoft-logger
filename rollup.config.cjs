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
  // Browser build (UMD for script tags)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/browser.js',
        format: 'umd',
        name: 'DolaSoftLogger',
        sourcemap: true,
        exports: 'named'
      }
    ],
    plugins: getPlugins(),
    external: ['react', 'crypto', 'fs', 'path']
  },
  // Type definitions
  {
    input: 'dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  }
];
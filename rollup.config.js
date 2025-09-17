import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');

export default [
  // Main build
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
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx']
      })
    ],
    external: ['react', 'next', 'crypto']
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
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx']
      })
    ],
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
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx']
      })
    ],
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
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx']
      })
    ],
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
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx']
      })
    ],
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

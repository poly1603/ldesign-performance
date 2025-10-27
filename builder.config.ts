import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',

  output: {
    format: ['esm', 'cjs'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'vite',
    'rollup',
    'commander',
    'chalk',
    'ora',
    'cli-table3',
    'boxen',
    'fast-glob',
    'gzip-size',
    'pretty-bytes',
    'rollup-plugin-visualizer',
    'web-vitals',
    /^@ldesign\//,
    /^node:.*/,
  ],
})



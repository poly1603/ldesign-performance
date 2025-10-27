/**
 * 默认性能配置
 */
import type { PerformanceConfig } from '../types'

export const defaultConfig: PerformanceConfig = {
  budgets: {
    bundles: [
      {
        name: 'main',
        maxSize: '300kb',
        warningSize: '250kb',
      },
    ],
    metrics: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      fcp: 1800,
      tti: 3800,
      tbt: 300,
    },
  },

  analyze: {
    openAnalyzer: false,
    generateReport: true,
    outputDir: '.performance',
    formats: ['html', 'json'],
  },

  optimize: {
    images: true,
    fonts: true,
    css: true,
    js: true,
  },

  outDir: 'dist',
  verbose: false,
}



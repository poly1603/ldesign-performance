/**
 * Vite 插件使用示例
 */
import { defineConfig } from 'vite'
import { performancePlugin } from '@ldesign/performance'

export default defineConfig({
  plugins: [
    performancePlugin({
      enabled: true,
      config: {
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
      },
    }),
  ],
})



/**
 * @ldesign/performance 配置示例
 * 
 * 将此文件重命名为 performance.config.js 或 performance.config.ts 使用
 */

export default {
  // ==================== 性能预算配置 ====================
  budgets: {
    // 打包文件预算
    bundles: [
      {
        name: 'main',          // 打包文件名称（支持模糊匹配）
        maxSize: '300kb',      // 最大体积
        warningSize: '250kb',  // 警告阈值（可选）
      },
      {
        name: 'vendor',
        maxSize: '500kb',
      },
    ],

    // 性能指标预算（Web Vitals）
    metrics: {
      lcp: 2500,  // Largest Contentful Paint (ms)
      fid: 100,   // First Input Delay (ms)
      cls: 0.1,   // Cumulative Layout Shift
      fcp: 1800,  // First Contentful Paint (ms)
      tti: 3800,  // Time to Interactive (ms)
      tbt: 300,   // Total Blocking Time (ms)
    },
  },

  // ==================== 分析配置 ====================
  analyze: {
    // 是否打开可视化分析器
    openAnalyzer: false,

    // 是否生成报告
    generateReport: true,

    // 报告输出目录
    outputDir: '.performance',

    // 报告格式
    // 可选: 'html', 'json', 'markdown', 'cli'
    formats: ['html', 'json'],
  },

  // ==================== 优化配置 ====================
  optimize: {
    // 图片优化检查
    images: true,

    // 字体优化检查
    fonts: true,

    // CSS 优化检查
    css: true,

    // JavaScript 优化检查
    js: true,
  },

  // ==================== 其他选项 ====================

  // 构建输出目录
  outDir: 'dist',

  // 是否启用详细日志
  verbose: false,
}

// ==================== TypeScript 配置示例 ====================
/*
// performance.config.ts
import { defineConfig } from '@ldesign/performance'

export default defineConfig({
  budgets: {
    bundles: [
      { name: 'main', maxSize: '300kb' },
    ],
    metrics: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
    },
  },
  analyze: {
    generateReport: true,
    formats: ['html', 'json'],
  },
})
*/

// ==================== 最小配置示例 ====================
/*
export default {
  budgets: {
    bundles: [
      { name: 'main', maxSize: '300kb' },
    ],
  },
}
*/

// ==================== CI/CD 配置示例 ====================
/*
// 适合 CI 环境的配置
export default {
  budgets: {
    bundles: [
      { name: 'main', maxSize: '300kb' },
      { name: 'vendor', maxSize: '500kb' },
    ],
  },
  analyze: {
    generateReport: true,
    formats: ['json'],  // CI 中只生成 JSON
  },
  verbose: false,
}
*/


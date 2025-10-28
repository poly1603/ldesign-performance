# 简介

`@ldesign/performance` 是一个企业级的前端性能优化工具包,为现代 Web 应用提供全面、智能的性能分析和优化解决方案。

## 特点

### 🎯 全面性

- **42+ 核心模块**: 覆盖资源优化、代码质量、网络性能、安全合规等各个方面
- **多维度分析**: 从图片、字体、CSS、JavaScript 到缓存策略、框架优化
- **完整工具链**: 分析器、优化器、报告器、监控器一应俱全

### 🚀 智能化

- **自动检测**: 智能识别性能瓶颈和优化机会
- **最佳实践**: 内置业界公认的性能优化规则
- **框架感知**: 针对 React、Vue、Angular、Svelte 提供专项建议

### 🔧 易用性

- **零配置启动**: 开箱即用的默认配置
- **灵活定制**: 完善的配置选项和插件系统
- **多种集成**: Vite 插件、CLI 命令、CI/CD 支持

### 📊 可视化

- **实时仪表板**: WebSocket + ECharts 实时监控
- **丰富报告**: HTML、JSON、Markdown、PDF 多格式输出
- **趋势分析**: 历史数据对比和性能回归检测

## 核心模块

### 优化规则引擎

提供 20+ 预定义优化规则:

- 图片优化 (WebP、AVIF、尺寸、懒加载)
- 字体优化 (子集化、preload、font-display)
- CSS 优化 (压缩、关键 CSS、未使用样式)
- JavaScript 优化 (代码分割、Tree Shaking、懒加载)
- 缓存策略 (HTTP 缓存、Service Worker)
- 资源提示 (preload、prefetch、preconnect)

### 分析器套件

- **BundleAnalyzer**: 打包体积分析
- **ImageAnalyzer**: 图片格式和优化分析
- **CSSAnalyzer**: 样式表分析和优化建议
- **JSAnalyzer**: JavaScript 代码质量分析
- **SecurityAnalyzer**: 安全和合规性检测
- **FrameworkAnalyzer**: 框架特定优化分析
- **CacheAnalyzer**: 缓存策略分析
- **NetworkAnalyzer**: 网络性能分析

### 监控系统

- **PerformanceMonitor**: 实时性能指标监控
- **MemoryMonitor**: 内存使用监控和泄漏检测
- **TrendAnalyzer**: 历史数据分析和趋势预测
- **Dashboard Server**: WebSocket 实时仪表板

### 报告生成

- **HTMLReporter**: 交互式 HTML 报告
- **JSONReporter**: 结构化数据输出
- **MarkdownReporter**: Markdown 格式报告
- **PDFReporter**: PDF 报告生成

## 使用场景

### 开发阶段

```typescript
// 实时监控开发环境性能
import { startDashboard } from '@ldesign/performance'

startDashboard({
  port: 3000,
  watchDir: './src'
})
```

### 构建阶段

```typescript
// vite.config.ts
import { performancePlugin } from '@ldesign/performance'

export default {
  plugins: [
    performancePlugin({
      budgets: { totalSize: 500 * 1024 },
      failOnError: true
    })
  ]
}
```

### CI/CD 阶段

```bash
# 在持续集成中检查性能
npm run build
npx performance-check --budget=budgets.json --fail
```

### 生产监控

```typescript
// 导出 Prometheus 指标
import { PrometheusExporter } from '@ldesign/performance'

const exporter = new PrometheusExporter()
app.get('/metrics', (req, res) => {
  res.send(exporter.export())
})
```

## 与其他工具的对比

| 特性 | @ldesign/performance | Lighthouse | Webpack Bundle Analyzer |
|------|---------------------|------------|------------------------|
| 构建时分析 | ✅ | ❌ | ✅ |
| 运行时监控 | ✅ | ✅ | ❌ |
| 安全检测 | ✅ | ⚠️ | ❌ |
| 框架优化 | ✅ | ❌ | ❌ |
| 实时仪表板 | ✅ | ❌ | ⚠️ |
| CI/CD 集成 | ✅ | ✅ | ⚠️ |
| 自定义扩展 | ✅ | ⚠️ | ⚠️ |
| TypeScript | ✅ | ⚠️ | ❌ |

## 系统要求

- Node.js >= 16.0.0
- TypeScript >= 4.5.0 (可选)
- 现代浏览器 (用于仪表板)

## 下一步

- [快速开始](/guide/getting-started) - 5 分钟集成到项目
- [核心概念](/guide/concepts) - 理解工具的核心设计
- [配置指南](/guide/configuration) - 深入配置选项
- [API 参考](/api/overview) - 完整 API 文档

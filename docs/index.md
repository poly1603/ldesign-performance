---
layout: home

hero:
  name: "@ldesign/performance"
  text: 企业级前端性能优化工具包
  tagline: 全面、智能、易用的性能分析与优化解决方案
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/performance

features:
  - icon: 🚀
    title: 全面的性能分析
    details: 涵盖资源优化、代码质量、网络性能、缓存策略等42+核心模块
  
  - icon: 🔒
    title: 安全合规检测
    details: 自动检测敏感信息泄露、依赖漏洞、许可证合规性和CSP配置
  
  - icon: 🎯
    title: 框架深度优化
    details: 针对React、Vue、Angular、Svelte提供专项优化建议
  
  - icon: 📊
    title: 实时可视化
    details: 基于WebSocket和ECharts的实时性能监控仪表板
  
  - icon: 📈
    title: 趋势分析
    details: 完整的历史数据追踪、对比分析和性能回归检测
  
  - icon: 🔧
    title: 灵活集成
    details: 支持Vite插件、CLI命令、CI/CD集成和Prometheus导出
  
  - icon: 📝
    title: 丰富报告
    details: 支持HTML、JSON、Markdown、PDF等多种格式的详细报告
  
  - icon: ⚡
    title: 性能预算
    details: 设置资源大小、数量、加载时间等多维度预算并自动告警
  
  - icon: 🎨
    title: TypeScript 原生
    details: 完整类型支持，提供卓越的开发体验和代码提示
---

## 快速安装

```bash
# npm
npm install @ldesign/performance --save-dev

# yarn
yarn add @ldesign/performance --dev

# pnpm
pnpm add @ldesign/performance -D
```

## 一分钟上手

```typescript
import { PerformanceOptimizer } from '@ldesign/performance'

const optimizer = new PerformanceOptimizer({
  rootDir: './dist',
  budgets: {
    totalSize: 500 * 1024, // 500KB
    jsSize: 200 * 1024,
    cssSize: 50 * 1024
  }
})

const result = await optimizer.analyze()
console.log(`Performance Score: ${result.score}/100`)
```

## 核心特性

### 🎯 多维度分析

- **资源优化**: 图片、字体、CSS、JavaScript优化建议
- **代码质量**: 重复代码、未使用代码、复杂度分析
- **网络性能**: 关键渲染路径、HTTP/2、资源提示
- **缓存策略**: HTTP缓存、Service Worker、静态资源缓存
- **安全合规**: 敏感信息、漏洞扫描、许可证检查

### 📊 实时监控

```typescript
import { startDashboard } from '@ldesign/performance'

startDashboard({
  port: 3000,
  updateInterval: 1000
})
```

访问 `http://localhost:3000` 查看实时性能仪表板

### 🔧 Vite 集成

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

### 🚦 CI/CD 集成

```yaml
# .github/workflows/performance.yml
- name: Performance Analysis
  run: |
    npm run build
    npx performance-check --budget=budgets.json --fail
```

## 为什么选择 @ldesign/performance？

✅ **企业级完整性**: 42+核心模块，覆盖性能优化全场景  
✅ **生产就绪**: 完整的错误处理、日志系统和测试覆盖  
✅ **高度可扩展**: 插件化架构，轻松自定义规则和分析器  
✅ **现代技术栈**: TypeScript、ESM、零依赖核心  
✅ **开箱即用**: 预设最佳实践配置，5分钟快速集成  
✅ **持续维护**: 活跃的社区和定期更新  

## 社区与支持

- [GitHub Issues](https://github.com/ldesign/performance/issues)
- [Discussions](https://github.com/ldesign/performance/discussions)
- [Changelog](https://github.com/ldesign/performance/blob/main/CHANGELOG.md)

## 许可证

[MIT License](https://github.com/ldesign/performance/blob/main/LICENSE)

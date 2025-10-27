# @ldesign/performance Examples

这个目录包含了 `@ldesign/performance` 的各种使用示例。

## 示例列表

### 1. basic-usage.ts
基础使用示例，展示如何：
- 收集构建指标
- 生成优化建议
- 创建性能报告

```bash
ts-node examples/basic-usage.ts
```

### 2. vite-plugin.ts
Vite 插件配置示例，展示如何：
- 在 Vite 项目中集成性能分析
- 配置性能预算
- 自定义报告输出

```bash
# 在 vite.config.ts 中使用此配置
```

### 3. custom-rules.ts
自定义优化规则示例，展示如何：
- 创建自定义优化规则
- 将规则添加到优化引擎
- 生成特定于项目的建议

```bash
ts-node examples/custom-rules.ts
```

## CLI 使用

### 分析构建产物
```bash
npx ldesign-performance analyze
npx ldesign-performance analyze --dir dist --output .perf
npx ldesign-performance analyze --format html json markdown
```

### 生成报告
```bash
npx ldesign-performance report
npx ldesign-performance report --format html
```

### 监控运行时性能（即将推出）
```bash
npx ldesign-performance monitor --url http://localhost:3000
```

## 配置文件

创建 `performance.config.js` 或 `performance.config.ts`：

```javascript
export default {
  budgets: {
    bundles: [
      { name: 'main', maxSize: '300kb' },
      { name: 'vendor', maxSize: '500kb' },
    ],
    metrics: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
    },
  },
  analyze: {
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
}
```

## API 使用

### 程序化 API

```typescript
import {
  MetricsCollector,
  OptimizationEngine,
  BudgetManager,
  HtmlReporter,
} from '@ldesign/performance'

// 收集指标
const collector = new MetricsCollector()
const buildMetrics = await collector.endBuildMetrics('./dist')

// 生成建议
const optimizer = new OptimizationEngine()
const suggestions = optimizer.generateSuggestions(buildMetrics)

// 检查预算
const budgetManager = new BudgetManager()
const results = budgetManager.check(budgetConfig, buildMetrics)

// 生成报告
const reporter = new HtmlReporter()
reporter.generate(report, './reports')
```

## 更多信息

查看主 [README.md](../README.md) 获取完整文档。



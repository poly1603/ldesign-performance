# 核心概念

理解 `@ldesign/performance` 的核心概念将帮助你更好地使用和扩展工具。

## 架构概览

```
┌─────────────────────────────────────────────────┐
│           Performance Optimizer                 │
│  (协调器 - 统一入口和流程编排)                   │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌──────┐    ┌─────────┐  ┌─────────┐
│Rules │    │Analyzers│  │Monitors │
│Engine│    │         │  │         │
└───┬──┘    └────┬────┘  └────┬────┘
    │            │            │
    └────────────┼────────────┘
                 │
                 ▼
         ┌───────────────┐
         │   Reporters   │
         │  (报告生成器)  │
         └───────────────┘
```

## 核心组件

### 1. Performance Optimizer (优化器)

优化器是整个系统的入口点和协调器,负责:

- 加载配置
- 协调各个分析器和规则引擎
- 汇总分析结果
- 计算性能评分
- 生成优化建议

```typescript
const optimizer = new PerformanceOptimizer({
  rootDir: './dist',
  budgets: { /* ... */ },
  rules: { /* ... */ }
})

const result = await optimizer.analyze()
```

### 2. Rules Engine (规则引擎)

规则引擎包含预定义的优化规则,每个规则:

- 检查特定的性能问题
- 生成问题描述和严重程度
- 提供优化建议

**规则类别**:

- **Image Rules**: 图片格式、尺寸、懒加载
- **Font Rules**: 字体子集化、preload、font-display
- **CSS Rules**: 压缩、关键CSS、未使用样式
- **JS Rules**: 代码分割、Tree Shaking、懒加载
- **Cache Rules**: HTTP缓存、Service Worker
- **Resource Hints**: preload、prefetch、preconnect

**规则结构**:

```typescript
interface OptimizationRule {
  id: string
  name: string
  category: 'image' | 'font' | 'css' | 'js' | 'cache' | 'network'
  severity: 'error' | 'warning' | 'info'
  
  check(context: AnalysisContext): Promise<RuleResult>
  fix?(context: AnalysisContext): Promise<void>
}
```

### 3. Analyzers (分析器)

分析器负责收集和分析特定领域的数据:

#### BundleAnalyzer
分析打包产物的整体情况:
- 总体积和各类型资源占比
- 文件数量统计
- 依赖关系分析

#### ImageAnalyzer
图片资源分析:
- 格式检测 (JPEG, PNG, WebP, AVIF)
- 尺寸和文件大小
- 优化潜力评估

#### CSSAnalyzer
样式表分析:
- 选择器复杂度
- 未使用的样式
- 重复规则检测
- 关键CSS识别

#### JSAnalyzer
JavaScript 代码分析:
- 代码复杂度
- 重复代码检测
- 未使用的导出
- 代码分割机会

#### SecurityAnalyzer
安全和合规性分析:
- 敏感信息泄露 (API密钥、令牌等)
- 依赖漏洞扫描
- 许可证合规性检查
- CSP配置检测

#### FrameworkAnalyzer
框架特定优化:
- React: Hooks使用、组件拆分、懒加载
- Vue: Composition API、异步组件
- Angular: 懒加载模块、AOT编译
- Svelte: 编译优化、Store使用

#### CacheAnalyzer
缓存策略分析:
- HTTP缓存头配置
- Service Worker策略
- 静态资源缓存

#### NetworkAnalyzer
网络性能分析:
- 资源加载顺序
- 关键渲染路径
- HTTP/2使用情况
- 资源提示建议

### 4. Monitors (监控器)

监控器用于运行时性能追踪:

#### PerformanceMonitor
实时性能指标监控:
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)
- TTFB (Time to First Byte)

#### MemoryMonitor
内存使用监控:
- 堆内存使用
- 内存泄漏检测
- GC活动追踪

#### TrendAnalyzer
历史趋势分析:
- 性能指标变化趋势
- 回归检测
- 对比分析

### 5. Reporters (报告器)

报告器将分析结果转换为不同格式:

- **HTMLReporter**: 交互式HTML报告
- **JSONReporter**: 结构化JSON数据
- **MarkdownReporter**: Markdown格式
- **PDFReporter**: PDF报告
- **PrometheusExporter**: Prometheus指标格式

## 核心流程

### 分析流程

```typescript
// 1. 初始化
const optimizer = new PerformanceOptimizer(config)

// 2. 收集数据
const context = await optimizer.collectContext()

// 3. 执行分析
const results = await Promise.all([
  bundleAnalyzer.analyze(context),
  imageAnalyzer.analyze(context),
  cssAnalyzer.analyze(context),
  // ... 其他分析器
])

// 4. 应用规则
const ruleResults = await rulesEngine.check(context, results)

// 5. 计算评分
const score = scoreCalculator.calculate(ruleResults)

// 6. 生成建议
const suggestions = suggestionGenerator.generate(ruleResults)

// 7. 返回结果
return {
  score,
  results,
  suggestions,
  issues: ruleResults.filter(r => r.failed)
}
```

### 评分系统

性能评分基于多个维度计算:

```typescript
interface ScoreWeights {
  bundleSize: 0.25,      // 打包大小 25%
  codeQuality: 0.20,     // 代码质量 20%
  networkPerf: 0.20,     // 网络性能 20%
  caching: 0.15,         // 缓存策略 15%
  security: 0.10,        // 安全性 10%
  accessibility: 0.10    // 可访问性 10%
}

score = Σ (categoryScore × weight)
```

评分等级:
- **90-100**: 优秀 🟢
- **70-89**: 良好 🟡
- **50-69**: 需要改进 🟠
- **0-49**: 较差 🔴

## 配置系统

### 预算配置

性能预算定义了各项资源的限制:

```typescript
interface PerformanceBudgets {
  // 资源大小
  totalSize?: number      // 总大小
  jsSize?: number         // JS大小
  cssSize?: number        // CSS大小
  imageSize?: number      // 图片大小
  fontSize?: number       // 字体大小
  
  // 资源数量
  maxRequests?: number    // 最大请求数
  maxJSFiles?: number     // 最大JS文件数
  maxCSSFiles?: number    // 最大CSS文件数
  
  // 性能指标
  maxLoadTime?: number    // 最大加载时间
  maxRenderTime?: number  // 最大渲染时间
  
  // Core Web Vitals
  maxLCP?: number         // 最大LCP
  maxFID?: number         // 最大FID
  maxCLS?: number         // 最大CLS
}
```

### 规则配置

可以启用/禁用特定规则:

```typescript
interface RulesConfig {
  imageOptimization?: boolean
  fontOptimization?: boolean
  cssOptimization?: boolean
  jsOptimization?: boolean
  caching?: boolean
  security?: boolean
  framework?: boolean
}
```

## 扩展机制

### 自定义规则

```typescript
import { OptimizationRule } from '@ldesign/performance'

class CustomRule implements OptimizationRule {
  id = 'custom-rule'
  name = 'My Custom Rule'
  category = 'custom'
  severity = 'warning'
  
  async check(context) {
    // 实现检查逻辑
    return {
      passed: true,
      message: 'Check passed',
      suggestions: []
    }
  }
  
  async fix(context) {
    // 实现自动修复逻辑
  }
}

// 注册自定义规则
optimizer.addRule(new CustomRule())
```

### 自定义分析器

```typescript
import { Analyzer } from '@ldesign/performance'

class CustomAnalyzer implements Analyzer {
  async analyze(context) {
    // 实现分析逻辑
    return {
      // 返回分析结果
    }
  }
}

optimizer.addAnalyzer(new CustomAnalyzer())
```

### 插件系统

```typescript
interface Plugin {
  name: string
  version: string
  
  install(optimizer: PerformanceOptimizer): void
}

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  install(optimizer) {
    // 添加规则、分析器、钩子等
    optimizer.addRule(/* ... */)
    optimizer.hooks.beforeAnalyze.tap('my-plugin', () => {
      // 钩子逻辑
    })
  }
}

optimizer.use(myPlugin)
```

## 钩子系统

工具提供了多个钩子点用于自定义行为:

```typescript
optimizer.hooks = {
  beforeAnalyze,     // 分析前
  afterAnalyze,      // 分析后
  beforeRule,        // 规则检查前
  afterRule,         // 规则检查后
  beforeReport,      // 报告生成前
  afterReport        // 报告生成后
}

optimizer.hooks.beforeAnalyze.tap('my-hook', async (context) => {
  console.log('Starting analysis...')
})
```

## 下一步

- 查看[优化规则](/guide/optimization-rules)了解所有内置规则
- 阅读[分析器](/guide/analyzers)深入了解各分析器
- 学习[配置指南](/guide/configuration)进行高级配置
- 探索[API参考](/api/overview)了解完整API

# API 总览

`@ldesign/performance` 提供了完整的 TypeScript API,涵盖性能分析、优化、监控和报告的各个方面。

## 主要导出

### 核心类

```typescript
import {
  PerformanceOptimizer,  // 主优化器
  RulesEngine,          // 规则引擎
  ScoreCalculator       // 评分计算器
} from '@ldesign/performance'
```

### 分析器

```typescript
import {
  BundleAnalyzer,      // 打包分析
  ImageAnalyzer,       // 图片分析
  CSSAnalyzer,         // CSS分析
  JSAnalyzer,          // JS分析
  SecurityAnalyzer,    // 安全分析
  FrameworkAnalyzer,   // 框架分析
  CacheAnalyzer,       // 缓存分析
  NetworkAnalyzer      // 网络分析
} from '@ldesign/performance'
```

### 监控器

```typescript
import {
  PerformanceMonitor,  // 性能监控
  MemoryMonitor,       // 内存监控
  TrendAnalyzer        // 趋势分析
} from '@ldesign/performance'
```

### 报告器

```typescript
import {
  HTMLReporter,        // HTML报告
  JSONReporter,        // JSON报告
  MarkdownReporter,    // Markdown报告
  PDFReporter,         // PDF报告
  PrometheusExporter   // Prometheus导出
} from '@ldesign/performance'
```

### 规则

```typescript
import {
  // 图片规则
  ImageFormatRule,
  ImageSizeRule,
  ImageLazyLoadingRule,
  
  // 字体规则
  FontSubsettingRule,
  FontPreloadRule,
  FontDisplayRule,
  
  // CSS规则
  CSSMinificationRule,
  CriticalCSSRule,
  UnusedCSSRule,
  
  // JS规则
  CodeSplittingRule,
  TreeShakingRule,
  JSLazyLoadingRule,
  
  // 缓存规则
  HTTPCachingRule,
  ServiceWorkerRule,
  
  // 资源提示规则
  PreloadRule,
  PrefetchRule,
  PreconnectRule
} from '@ldesign/performance'
```

### 工具函数

```typescript
import {
  calculateScore,      // 计算评分
  formatBytes,        // 格式化字节
  formatDuration,     // 格式化时长
  detectFramework,    // 检测框架
  analyzeBundle      // 分析打包
} from '@ldesign/performance'
```

### 类型定义

```typescript
import type {
  PerformanceConfig,
  AnalysisResult,
  OptimizationRule,
  RuleResult,
  PerformanceBudgets,
  AnalyzerResult,
  MonitorMetrics
} from '@ldesign/performance'
```

## PerformanceOptimizer

主入口类,协调所有分析和优化工作。

### 构造函数

```typescript
constructor(config: PerformanceConfig)
```

**参数**:

```typescript
interface PerformanceConfig {
  rootDir: string                    // 分析目录
  budgets?: PerformanceBudgets      // 性能预算
  rules?: RulesConfig               // 规则配置
  analyzers?: string[]              // 启用的分析器
  outputDir?: string                // 输出目录
  verbose?: boolean                 // 详细日志
}
```

### 方法

#### analyze()

执行完整的性能分析。

```typescript
async analyze(): Promise<AnalysisResult>
```

**返回**:

```typescript
interface AnalysisResult {
  score: number                     // 综合评分 0-100
  timestamp: number                 // 分析时间戳
  duration: number                  // 分析耗时(ms)
  
  // 各维度评分
  scores: {
    bundleSize: number
    codeQuality: number
    networkPerf: number
    caching: number
    security: number
  }
  
  // 分析结果
  bundle: BundleAnalysisResult
  images: ImageAnalysisResult[]
  css: CSSAnalysisResult[]
  js: JSAnalysisResult[]
  security: SecurityAnalysisResult
  
  // 问题和建议
  issues: Issue[]
  suggestions: string[]
  
  // 预算检查
  budgetStatus: BudgetStatus
}
```

**示例**:

```typescript
const optimizer = new PerformanceOptimizer({
  rootDir: './dist',
  budgets: {
    totalSize: 500 * 1024
  }
})

const result = await optimizer.analyze()

console.log(`Score: ${result.score}/100`)
console.log(`Issues: ${result.issues.length}`)
```

#### addRule()

添加自定义规则。

```typescript
addRule(rule: OptimizationRule): void
```

**示例**:

```typescript
optimizer.addRule(new MyCustomRule())
```

#### addAnalyzer()

添加自定义分析器。

```typescript
addAnalyzer(analyzer: Analyzer): void
```

#### use()

使用插件。

```typescript
use(plugin: Plugin): void
```

## 分析器 API

### BundleAnalyzer

分析打包产物的整体情况。

```typescript
class BundleAnalyzer {
  async analyze(rootDir: string): Promise<BundleAnalysisResult>
}

interface BundleAnalysisResult {
  totalSize: number
  jsSize: number
  cssSize: number
  imageSize: number
  fontSize: number
  otherSize: number
  
  fileCount: number
  jsFileCount: number
  cssFileCount: number
  
  dependencies: Dependency[]
  duplicates: DuplicateModule[]
}
```

**示例**:

```typescript
const analyzer = new BundleAnalyzer()
const result = await analyzer.analyze('./dist')

console.log(`Total: ${result.totalSize / 1024} KB`)
console.log(`JS: ${result.jsSize / 1024} KB`)
```

### ImageAnalyzer

分析图片资源。

```typescript
class ImageAnalyzer {
  async analyze(rootDir: string): Promise<ImageAnalysisResult[]>
}

interface ImageAnalysisResult {
  path: string
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'svg'
  size: number
  dimensions?: { width: number; height: number }
  
  canOptimize: boolean
  potentialSavings: number
  suggestions: string[]
}
```

### SecurityAnalyzer

安全和合规性分析。

```typescript
class SecurityAnalyzer {
  async analyze(rootDir: string): Promise<SecurityAnalysisResult>
}

interface SecurityAnalysisResult {
  sensitiveInfo: SensitiveInfoDetection[]
  vulnerabilities: Vulnerability[]
  licenses: LicenseInfo[]
  csp: CSPAnalysis
  
  score: number
  issues: SecurityIssue[]
}

interface SensitiveInfoDetection {
  type: 'api_key' | 'token' | 'password' | 'secret'
  location: string
  severity: 'high' | 'medium' | 'low'
  message: string
}
```

### FrameworkAnalyzer

框架特定优化分析。

```typescript
class FrameworkAnalyzer {
  constructor(options: {
    framework: 'react' | 'vue' | 'angular' | 'svelte'
  })
  
  async analyze(rootDir: string): Promise<FrameworkAnalysisResult>
}

interface FrameworkAnalysisResult {
  framework: string
  version?: string
  
  // React特定
  hookIssues?: HookIssue[]
  componentSplitting?: ComponentSplittingSuggestion[]
  
  // Vue特定
  compositionApiUsage?: number
  asyncComponents?: AsyncComponentAnalysis[]
  
  suggestions: string[]
  score: number
}
```

## 监控器 API

### PerformanceMonitor

实时性能监控。

```typescript
class PerformanceMonitor {
  start(): void
  stop(): void
  
  getMetrics(): PerformanceMetrics
  
  on(event: string, handler: (data: any) => void): void
}

interface PerformanceMetrics {
  fcp: number  // First Contentful Paint
  lcp: number  // Largest Contentful Paint
  cls: number  // Cumulative Layout Shift
  fid: number  // First Input Delay
  ttfb: number // Time to First Byte
  
  timestamp: number
}
```

**示例**:

```typescript
const monitor = new PerformanceMonitor()

monitor.on('metric', (metrics) => {
  console.log(`LCP: ${metrics.lcp}ms`)
})

monitor.start()
```

### TrendAnalyzer

历史趋势分析。

```typescript
class TrendAnalyzer {
  async analyze(
    historyDir: string,
    options?: TrendAnalysisOptions
  ): Promise<TrendAnalysisResult>
}

interface TrendAnalysisResult {
  current: AnalysisResult
  previous?: AnalysisResult
  
  changes: {
    score: number
    totalSize: number
    // ...
  }
  
  regression: boolean
  trends: Trend[]
}
```

## 报告器 API

### HTMLReporter

生成交互式HTML报告。

```typescript
class HTMLReporter {
  async generate(
    result: AnalysisResult,
    outputPath: string,
    options?: HTMLReporterOptions
  ): Promise<void>
}

interface HTMLReporterOptions {
  title?: string
  theme?: 'light' | 'dark'
  includeCharts?: boolean
  includeDetails?: boolean
}
```

### PrometheusExporter

导出Prometheus格式指标。

```typescript
class PrometheusExporter {
  export(result: AnalysisResult): string
  
  exportMetrics(metrics: Record<string, number>): string
}
```

**示例**:

```typescript
const exporter = new PrometheusExporter()
const metrics = exporter.export(result)

// 在Express中使用
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain')
  res.send(metrics)
})
```

## 实用工具 API

### calculateScore()

计算性能评分。

```typescript
function calculateScore(
  results: Partial<AnalysisResult>,
  weights?: ScoreWeights
): number
```

### formatBytes()

格式化字节大小。

```typescript
function formatBytes(bytes: number, decimals?: number): string

formatBytes(1024)       // "1 KB"
formatBytes(1536, 2)    // "1.50 KB"
formatBytes(1048576)    // "1 MB"
```

### detectFramework()

检测项目使用的框架。

```typescript
function detectFramework(rootDir: string): Promise<FrameworkInfo>

interface FrameworkInfo {
  name: 'react' | 'vue' | 'angular' | 'svelte' | 'unknown'
  version?: string
  confidence: number  // 0-1
}
```

## 插件 API

### Vite插件

```typescript
import { performancePlugin } from '@ldesign/performance'

function performancePlugin(
  options?: PerformancePluginOptions
): Plugin

interface PerformancePluginOptions {
  budgets?: PerformanceBudgets
  failOnError?: boolean
  reportPath?: string
  dashboard?: boolean
}
```

### Dashboard

```typescript
import { startDashboard } from '@ldesign/performance'

function startDashboard(
  options: DashboardOptions
): Promise<DashboardServer>

interface DashboardOptions {
  port?: number
  distDir?: string
  updateInterval?: number
  open?: boolean
}
```

## 类型参考

完整的类型定义请查看 [类型定义](/api/types) 页面。

## 下一步

- 查看各个模块的详细API文档
- 浏览[示例代码](/examples/basic)
- 阅读[最佳实践](/guide/best-practices)

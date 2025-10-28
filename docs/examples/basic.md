# 基础使用示例

这里展示 `@ldesign/performance` 的各种基础使用场景和代码示例。

## 快速分析

最简单的使用方式:

```typescript
import { PerformanceOptimizer } from '@ldesign/performance'

const optimizer = new PerformanceOptimizer({
  rootDir: './dist'
})

const result = await optimizer.analyze()

console.log(`Performance Score: ${result.score}/100`)
```

## 设置性能预算

定义性能预算并检查是否超出:

```typescript
import { PerformanceOptimizer } from '@ldesign/performance'

const optimizer = new PerformanceOptimizer({
  rootDir: './dist',
  budgets: {
    totalSize: 500 * 1024,    // 500KB
    jsSize: 200 * 1024,       // 200KB
    cssSize: 50 * 1024,       // 50KB
    imageSize: 200 * 1024,    // 200KB
    maxRequests: 20,          // 最多20个请求
    maxLoadTime: 3000         // 最大加载时间3秒
  }
})

const result = await optimizer.analyze()

// 检查预算状态
if (!result.budgetStatus.passed) {
  console.error('❌ Budget exceeded!')
  result.budgetStatus.violations.forEach(v => {
    console.error(`  ${v.metric}: ${v.actual} > ${v.budget}`)
  })
  process.exit(1)
}

console.log('✅ All budgets passed!')
```

## 生成报告

### HTML 报告

```typescript
import { 
  PerformanceOptimizer,
  HTMLReporter 
} from '@ldesign/performance'

const optimizer = new PerformanceOptimizer({
  rootDir: './dist'
})

const result = await optimizer.analyze()

// 生成HTML报告
const reporter = new HTMLReporter()
await reporter.generate(result, './reports/performance.html', {
  title: 'My App Performance Report',
  theme: 'light',
  includeCharts: true
})

console.log('HTML report generated!')
```

### JSON 报告

```typescript
import { JSONReporter } from '@ldesign/performance'

const reporter = new JSONReporter()
await reporter.generate(result, './reports/performance.json', {
  pretty: true,
  includeRawData: true
})
```

### Markdown 报告

```typescript
import { MarkdownReporter } from '@ldesign/performance'

const reporter = new MarkdownReporter()
await reporter.generate(result, './reports/PERFORMANCE.md', {
  includeCharts: false,
  includeSuggestions: true
})
```

### 多格式报告

一次生成多种格式:

```typescript
import { 
  HTMLReporter,
  JSONReporter,
  MarkdownReporter 
} from '@ldesign/performance'

const reporters = [
  new HTMLReporter(),
  new JSONReporter(),
  new MarkdownReporter()
]

const outputs = [
  './reports/performance.html',
  './reports/performance.json',
  './reports/PERFORMANCE.md'
]

await Promise.all(
  reporters.map((reporter, i) => 
    reporter.generate(result, outputs[i])
  )
)

console.log('All reports generated!')
```

## 分析特定资源

### 分析图片

```typescript
import { ImageAnalyzer } from '@ldesign/performance'

const analyzer = new ImageAnalyzer()
const images = await analyzer.analyze('./dist')

console.log(`Total images: ${images.length}`)

// 找出可优化的图片
const optimizable = images.filter(img => img.canOptimize)

console.log(`\nCan optimize ${optimizable.length} images:`)
optimizable.forEach(img => {
  console.log(`  ${img.path}`)
  console.log(`    Current: ${img.size / 1024} KB`)
  console.log(`    Can save: ${img.potentialSavings / 1024} KB`)
  console.log(`    Suggestions: ${img.suggestions.join(', ')}`)
})
```

### 分析打包体积

```typescript
import { BundleAnalyzer, formatBytes } from '@ldesign/performance'

const analyzer = new BundleAnalyzer()
const result = await analyzer.analyze('./dist')

console.log('Bundle Analysis:')
console.log(`  Total Size: ${formatBytes(result.totalSize)}`)
console.log(`  JS Size: ${formatBytes(result.jsSize)}`)
console.log(`  CSS Size: ${formatBytes(result.cssSize)}`)
console.log(`  Image Size: ${formatBytes(result.imageSize)}`)
console.log(`  Font Size: ${formatBytes(result.fontSize)}`)

// 检查重复模块
if (result.duplicates.length > 0) {
  console.log('\n⚠️  Duplicate modules found:')
  result.duplicates.forEach(dup => {
    console.log(`  ${dup.name} (${dup.count} times, ${formatBytes(dup.totalSize)})`)
  })
}
```

### CSS 分析

```typescript
import { CSSAnalyzer } from '@ldesign/performance'

const analyzer = new CSSAnalyzer()
const cssFiles = await analyzer.analyze('./dist')

cssFiles.forEach(file => {
  console.log(`\n${file.path}`)
  console.log(`  Size: ${file.size / 1024} KB`)
  console.log(`  Selectors: ${file.selectorCount}`)
  console.log(`  Complexity: ${file.complexity}`)
  
  if (file.unusedRules > 0) {
    console.log(`  ⚠️  Unused rules: ${file.unusedRules}`)
  }
  
  if (file.duplicateRules > 0) {
    console.log(`  ⚠️  Duplicate rules: ${file.duplicateRules}`)
  }
})
```

### JavaScript 分析

```typescript
import { JSAnalyzer } from '@ldesign/performance'

const analyzer = new JSAnalyzer()
const jsFiles = await analyzer.analyze('./dist')

jsFiles.forEach(file => {
  console.log(`\n${file.path}`)
  console.log(`  Size: ${file.size / 1024} KB`)
  console.log(`  Complexity: ${file.complexity}`)
  
  if (file.duplicateCode > 0) {
    console.log(`  ⚠️  Duplicate code: ${file.duplicateCode} lines`)
  }
  
  if (file.unusedExports.length > 0) {
    console.log(`  ⚠️  Unused exports: ${file.unusedExports.join(', ')}`)
  }
  
  if (file.suggestions.length > 0) {
    console.log(`  💡 Suggestions:`)
    file.suggestions.forEach(s => console.log(`    - ${s}`))
  }
})
```

## 安全检测

```typescript
import { SecurityAnalyzer } from '@ldesign/performance'

const analyzer = new SecurityAnalyzer()
const result = await analyzer.analyze('./dist')

console.log(`Security Score: ${result.score}/100\n`)

// 敏感信息检测
if (result.sensitiveInfo.length > 0) {
  console.error('🔒 Sensitive information detected:')
  result.sensitiveInfo.forEach(info => {
    console.error(`  [${info.severity}] ${info.type} at ${info.location}`)
    console.error(`    ${info.message}`)
  })
}

// 漏洞扫描
if (result.vulnerabilities.length > 0) {
  console.error('\n🚨 Vulnerabilities found:')
  result.vulnerabilities.forEach(vuln => {
    console.error(`  [${vuln.severity}] ${vuln.package}@${vuln.version}`)
    console.error(`    ${vuln.title}`)
    console.error(`    Fix: ${vuln.recommendation}`)
  })
}

// 许可证检查
const nonCompliant = result.licenses.filter(l => !l.compliant)
if (nonCompliant.length > 0) {
  console.warn('\n⚠️  License compliance issues:')
  nonCompliant.forEach(lic => {
    console.warn(`  ${lic.package}: ${lic.license}`)
  })
}

// CSP 配置
if (result.csp.issues.length > 0) {
  console.warn('\n📋 CSP configuration issues:')
  result.csp.issues.forEach(issue => {
    console.warn(`  - ${issue}`)
  })
}
```

## 框架特定优化

### React 项目

```typescript
import { FrameworkAnalyzer } from '@ldesign/performance'

const analyzer = new FrameworkAnalyzer({
  framework: 'react'
})

const result = await analyzer.analyze('./dist')

console.log(`React optimization score: ${result.score}/100\n`)

// Hook 使用问题
if (result.hookIssues && result.hookIssues.length > 0) {
  console.log('⚠️  Hook issues:')
  result.hookIssues.forEach(issue => {
    console.log(`  ${issue.type} at ${issue.location}`)
    console.log(`    ${issue.message}`)
  })
}

// 组件拆分建议
if (result.componentSplitting && result.componentSplitting.length > 0) {
  console.log('\n💡 Component splitting suggestions:')
  result.componentSplitting.forEach(s => {
    console.log(`  ${s.component}: Can be split into ${s.suggestion}`)
  })
}

// 通用建议
if (result.suggestions.length > 0) {
  console.log('\n💡 Optimization suggestions:')
  result.suggestions.forEach(s => console.log(`  - ${s}`))
}
```

### Vue 项目

```typescript
import { FrameworkAnalyzer } from '@ldesign/performance'

const analyzer = new FrameworkAnalyzer({
  framework: 'vue'
})

const result = await analyzer.analyze('./dist')

console.log(`Vue optimization score: ${result.score}/100\n`)

if (result.compositionApiUsage !== undefined) {
  console.log(`Composition API usage: ${result.compositionApiUsage}%`)
}

if (result.asyncComponents && result.asyncComponents.length > 0) {
  console.log('\n📦 Async component opportunities:')
  result.asyncComponents.forEach(comp => {
    console.log(`  ${comp.name}: ${comp.suggestion}`)
  })
}
```

## 缓存策略分析

```typescript
import { CacheAnalyzer } from '@ldesign/performance'

const analyzer = new CacheAnalyzer()
const result = await analyzer.analyze('./dist')

console.log('Cache Strategy Analysis:\n')

// HTTP 缓存
console.log('HTTP Caching:')
result.httpCache.forEach(cache => {
  console.log(`  ${cache.file}`)
  console.log(`    Cache-Control: ${cache.cacheControl || 'Not set'}`)
  console.log(`    Max-Age: ${cache.maxAge || 'N/A'}`)
  if (cache.issues.length > 0) {
    console.log(`    Issues: ${cache.issues.join(', ')}`)
  }
})

// Service Worker
if (result.serviceWorker) {
  console.log('\nService Worker:')
  console.log(`  Strategy: ${result.serviceWorker.strategy}`)
  console.log(`  Cached resources: ${result.serviceWorker.cachedResources.length}`)
} else {
  console.log('\n⚠️  No Service Worker detected')
}

// 静态资源缓存
console.log('\nStatic Resource Caching:')
result.staticCache.forEach(cache => {
  console.log(`  ${cache.pattern}: ${cache.strategy}`)
})
```

## 网络性能分析

```typescript
import { NetworkAnalyzer } from '@ldesign/performance'

const analyzer = new NetworkAnalyzer()
const result = await analyzer.analyze('./dist')

console.log('Network Performance Analysis:\n')

// 关键渲染路径
console.log('Critical Rendering Path:')
console.log(`  Critical resources: ${result.criticalPath.length}`)
result.criticalPath.forEach(res => {
  console.log(`    ${res.path} (${res.type})`)
})

// HTTP/2
console.log(`\nHTTP/2 enabled: ${result.http2Enabled ? '✅' : '❌'}`)
if (!result.http2Enabled) {
  console.log('  💡 Enable HTTP/2 for better performance')
}

// 资源提示
if (result.resourceHints.preload.length > 0) {
  console.log('\n💡 Recommended preloads:')
  result.resourceHints.preload.forEach(hint => {
    console.log(`  <link rel="preload" href="${hint.url}" as="${hint.as}">`)
  })
}

if (result.resourceHints.prefetch.length > 0) {
  console.log('\n💡 Recommended prefetches:')
  result.resourceHints.prefetch.forEach(hint => {
    console.log(`  <link rel="prefetch" href="${hint.url}">`)
  })
}

if (result.resourceHints.preconnect.length > 0) {
  console.log('\n💡 Recommended preconnects:')
  result.resourceHints.preconnect.forEach(hint => {
    console.log(`  <link rel="preconnect" href="${hint.url}">`)
  })
}
```

## 监控和趋势

### 实时监控

```typescript
import { PerformanceMonitor } from '@ldesign/performance'

const monitor = new PerformanceMonitor()

// 监听性能指标
monitor.on('metric', (metrics) => {
  console.log('Performance Metrics:')
  console.log(`  FCP: ${metrics.fcp}ms`)
  console.log(`  LCP: ${metrics.lcp}ms`)
  console.log(`  CLS: ${metrics.cls}`)
  console.log(`  FID: ${metrics.fid}ms`)
  console.log(`  TTFB: ${metrics.ttfb}ms`)
})

// 监听告警
monitor.on('alert', (alert) => {
  console.warn(`⚠️  Alert: ${alert.metric} exceeded threshold`)
  console.warn(`  Current: ${alert.value}, Threshold: ${alert.threshold}`)
})

monitor.start()

// 运行一段时间后停止
setTimeout(() => {
  const finalMetrics = monitor.getMetrics()
  monitor.stop()
  
  console.log('\nFinal metrics:', finalMetrics)
}, 60000) // 60秒
```

### 历史趋势分析

```typescript
import { TrendAnalyzer } from '@ldesign/performance'

const analyzer = new TrendAnalyzer()

const result = await analyzer.analyze('./performance-history', {
  days: 30,          // 分析最近30天
  compareWith: 7     // 与7天前对比
})

console.log('Trend Analysis:\n')

console.log('Current vs Previous:')
console.log(`  Score: ${result.changes.score > 0 ? '📈' : '📉'} ${result.changes.score}`)
console.log(`  Total Size: ${result.changes.totalSize > 0 ? '📈' : '📉'} ${result.changes.totalSize} bytes`)

if (result.regression) {
  console.error('\n🚨 Performance regression detected!')
}

// 显示趋势
console.log('\nTrends:')
result.trends.forEach(trend => {
  const emoji = trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️'
  console.log(`  ${emoji} ${trend.metric}: ${trend.change}`)
})
```

## 完整工作流示例

```typescript
import {
  PerformanceOptimizer,
  HTMLReporter,
  JSONReporter,
  PrometheusExporter
} from '@ldesign/performance'

async function performanceWorkflow() {
  console.log('🚀 Starting performance analysis...\n')
  
  // 1. 配置并分析
  const optimizer = new PerformanceOptimizer({
    rootDir: './dist',
    budgets: {
      totalSize: 500 * 1024,
      jsSize: 200 * 1024,
      cssSize: 50 * 1024
    },
    verbose: true
  })
  
  const result = await optimizer.analyze()
  
  // 2. 输出结果摘要
  console.log(`\n📊 Performance Score: ${result.score}/100`)
  console.log(`⏱️  Analysis Duration: ${result.duration}ms\n`)
  
  // 3. 检查预算
  if (!result.budgetStatus.passed) {
    console.error('❌ Budget violations:')
    result.budgetStatus.violations.forEach(v => {
      console.error(`  ${v.metric}: ${v.actual} > ${v.budget}`)
    })
  } else {
    console.log('✅ All budgets passed!')
  }
  
  // 4. 显示问题
  if (result.issues.length > 0) {
    console.log(`\n⚠️  Found ${result.issues.length} issues:`)
    result.issues.slice(0, 5).forEach(issue => {
      console.log(`  [${issue.severity}] ${issue.message}`)
    })
    if (result.issues.length > 5) {
      console.log(`  ... and ${result.issues.length - 5} more`)
    }
  }
  
  // 5. 显示建议
  if (result.suggestions.length > 0) {
    console.log(`\n💡 Top ${Math.min(5, result.suggestions.length)} suggestions:`)
    result.suggestions.slice(0, 5).forEach(s => {
      console.log(`  - ${s}`)
    })
  }
  
  // 6. 生成报告
  console.log('\n📝 Generating reports...')
  
  const htmlReporter = new HTMLReporter()
  await htmlReporter.generate(result, './reports/performance.html')
  console.log('  ✓ HTML report: ./reports/performance.html')
  
  const jsonReporter = new JSONReporter()
  await jsonReporter.generate(result, './reports/performance.json')
  console.log('  ✓ JSON report: ./reports/performance.json')
  
  // 7. 导出 Prometheus 指标
  const exporter = new PrometheusExporter()
  const metrics = exporter.export(result)
  
  // 可以将 metrics 发送到 Prometheus 或写入文件
  await Bun.write('./reports/metrics.txt', metrics)
  console.log('  ✓ Metrics exported: ./reports/metrics.txt')
  
  // 8. 决定是否失败构建
  if (result.score < 70) {
    console.error('\n❌ Performance score below threshold (70)')
    process.exit(1)
  }
  
  console.log('\n✅ Performance analysis completed successfully!')
}

performanceWorkflow().catch(error => {
  console.error('Error during performance analysis:', error)
  process.exit(1)
})
```

## 下一步

- 查看 [Vite 集成示例](/examples/vite)
- 学习 [自定义规则](/examples/custom-rules)
- 探索 [CI/CD 集成](/examples/ci-cd)
- 了解 [实时仪表板](/examples/dashboard)

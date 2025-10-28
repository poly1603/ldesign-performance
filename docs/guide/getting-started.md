# 快速开始

本指南将帮助你在 5 分钟内将 `@ldesign/performance` 集成到项目中。

## 安装

::: code-group

```bash [npm]
npm install @ldesign/performance --save-dev
```

```bash [yarn]
yarn add @ldesign/performance --dev
```

```bash [pnpm]
pnpm add @ldesign/performance -D
```

:::

## 基础使用

### 1. 分析构建产物

创建一个简单的分析脚本:

```typescript
// scripts/analyze-performance.ts
import { PerformanceOptimizer } from '@ldesign/performance'

async function analyze() {
  const optimizer = new PerformanceOptimizer({
    rootDir: './dist',
    budgets: {
      totalSize: 500 * 1024, // 500KB
      jsSize: 200 * 1024,    // 200KB
      cssSize: 50 * 1024,    // 50KB
      imageSize: 200 * 1024  // 200KB
    }
  })

  const result = await optimizer.analyze()
  
  console.log(`\n📊 Performance Score: ${result.score}/100\n`)
  
  if (result.issues.length > 0) {
    console.log('⚠️  Issues found:')
    result.issues.forEach(issue => {
      console.log(`  - ${issue.message}`)
    })
  }
  
  if (result.suggestions.length > 0) {
    console.log('\n💡 Suggestions:')
    result.suggestions.forEach(suggestion => {
      console.log(`  - ${suggestion}`)
    })
  }
}

analyze()
```

运行分析:

```bash
npm run build
tsx scripts/analyze-performance.ts
```

### 2. 生成 HTML 报告

```typescript
import { PerformanceOptimizer, HTMLReporter } from '@ldesign/performance'

const optimizer = new PerformanceOptimizer({
  rootDir: './dist'
})

const result = await optimizer.analyze()

// 生成 HTML 报告
const reporter = new HTMLReporter()
await reporter.generate(result, './reports/performance.html')

console.log('Report generated at ./reports/performance.html')
```

### 3. 集成到 Vite

在 `vite.config.ts` 中添加插件:

```typescript
import { defineConfig } from 'vite'
import { performancePlugin } from '@ldesign/performance'

export default defineConfig({
  plugins: [
    performancePlugin({
      budgets: {
        totalSize: 500 * 1024
      },
      failOnError: false, // 开发环境不阻塞构建
      reportPath: './reports/performance.html'
    })
  ]
})
```

现在每次构建时都会自动分析性能:

```bash
npm run build
```

### 4. 添加 npm scripts

在 `package.json` 中添加便捷脚本:

```json
{
  "scripts": {
    "build": "vite build",
    "analyze": "npm run build && tsx scripts/analyze-performance.ts",
    "perf:report": "tsx scripts/analyze-performance.ts",
    "perf:watch": "tsx scripts/watch-performance.ts"
  }
}
```

## 配置性能预算

创建 `performance.config.js`:

```javascript
export default {
  budgets: {
    // 资源大小限制
    totalSize: 500 * 1024,      // 总体积 500KB
    jsSize: 200 * 1024,         // JS 200KB
    cssSize: 50 * 1024,         // CSS 50KB
    imageSize: 200 * 1024,      // 图片 200KB
    fontSize: 100 * 1024,       // 字体 100KB
    
    // 资源数量限制
    maxRequests: 20,            // 最多 20 个请求
    maxJSFiles: 5,              // 最多 5 个 JS 文件
    maxCSSFiles: 2,             // 最多 2 个 CSS 文件
    
    // 性能指标
    maxLoadTime: 3000,          // 最大加载时间 3s
    maxRenderTime: 1500         // 最大渲染时间 1.5s
  },
  
  rules: {
    imageOptimization: true,
    fontOptimization: true,
    cssOptimization: true,
    jsOptimization: true,
    caching: true
  }
}
```

使用配置文件:

```typescript
import config from './performance.config.js'
import { PerformanceOptimizer } from '@ldesign/performance'

const optimizer = new PerformanceOptimizer(config)
```

## 启动实时仪表板

创建 `scripts/dashboard.ts`:

```typescript
import { startDashboard } from '@ldesign/performance'

startDashboard({
  port: 3000,
  distDir: './dist',
  updateInterval: 2000, // 每 2 秒更新一次
  open: true            // 自动打开浏览器
})
```

运行仪表板:

```bash
tsx scripts/dashboard.ts
```

访问 `http://localhost:3000` 查看实时性能监控。

## CI/CD 集成

### GitHub Actions

创建 `.github/workflows/performance.yml`:

```yaml
name: Performance Check

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Performance Analysis
        run: npm run analyze
        
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: reports/
```

### GitLab CI

创建 `.gitlab-ci.yml`:

```yaml
performance:
  stage: test
  script:
    - npm ci
    - npm run build
    - npm run analyze
  artifacts:
    paths:
      - reports/
    expire_in: 1 week
```

## 常见使用场景

### 场景 1: 检查打包体积

```typescript
import { BundleAnalyzer } from '@ldesign/performance'

const analyzer = new BundleAnalyzer()
const result = await analyzer.analyze('./dist')

console.log(`Total Size: ${result.totalSize / 1024} KB`)
console.log(`JS Size: ${result.jsSize / 1024} KB`)
console.log(`CSS Size: ${result.cssSize / 1024} KB`)
```

### 场景 2: 优化图片

```typescript
import { ImageAnalyzer } from '@ldesign/performance'

const analyzer = new ImageAnalyzer()
const images = await analyzer.analyze('./dist')

images.forEach(img => {
  if (img.canOptimize) {
    console.log(`${img.path}: Can save ${img.potentialSavings / 1024} KB`)
  }
})
```

### 场景 3: 检测安全问题

```typescript
import { SecurityAnalyzer } from '@ldesign/performance'

const analyzer = new SecurityAnalyzer()
const result = await analyzer.analyze('./dist')

if (result.vulnerabilities.length > 0) {
  console.error('Security vulnerabilities found!')
  process.exit(1)
}
```

### 场景 4: 框架特定优化

```typescript
import { FrameworkAnalyzer } from '@ldesign/performance'

const analyzer = new FrameworkAnalyzer({
  framework: 'react' // 或 'vue', 'angular', 'svelte'
})

const result = await analyzer.analyze('./dist')
console.log(result.suggestions)
```

## 下一步

现在你已经完成了基础集成,可以:

- 📖 阅读[核心概念](/guide/concepts)了解工作原理
- ⚙️ 查看[配置指南](/guide/configuration)进行深度定制
- 🎯 探索[优化规则](/guide/optimization-rules)了解所有可用规则
- 📊 学习[实时监控](/guide/monitoring)设置持续性能监控
- 🔧 查看[API 参考](/api/overview)了解完整 API

## 需要帮助?

- [GitHub Issues](https://github.com/ldesign/performance/issues)
- [Discussions](https://github.com/ldesign/performance/discussions)
- [示例项目](/examples/basic)

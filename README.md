# @ldesign/performance

> 🚀 性能与代码分析工具 - 整合了 @ldesign/analyzer 的所有功能

**v1.0.0 重大更新**: 本包已整合 `@ldesign/analyzer` 的所有功能，提供统一的性能优化和代码分析解决方案。

## ⚠️ 迁移说明

如果你之前使用 `@ldesign/analyzer`，请迁移到 `@ldesign/performance`：

```bash
# 卸载旧包
pnpm remove @ldesign/analyzer

# 安装新包
pnpm add -D @ldesign/performance
```

所有 `@ldesign/analyzer` 的功能现在都可以通过 `@ldesign/performance/analyzer` 访问。CLI 命令 `ldesign-analyzer` 仍然可用。

## ✨ 特性

### 性能优化功能

- 📊 **构建分析** - 深度分析打包产物，识别性能瓶颈
- 📈 **性能指标** - 完整的构建时间和体积追踪
- 🚀 **智能建议** - 基于规则引擎的优化建议系统
- 📋 **多格式报告** - 支持 HTML、JSON、Markdown、CLI 多种报告格式
- 🤖 **CI/CD 集成** - 性能预算控制，自动化性能检查
- 🔍 **Vite 插件** - 无缝集成到 Vite 构建流程
- ⚡ **优化规则库** - 内置多种优化规则，可扩展

### 代码分析功能（来自 @ldesign/analyzer v1.0+）

- 🔬 **代码质量分析** - 代码复杂度、代码异味、死代码检测
- 🕸️ **依赖分析** - 循环依赖检测、依赖关系图、重复依赖检测
- 📦 **打包体积分析** - 模块大小、Asset分析、TreeMap可视化
- 🔐 **安全扫描** - 敏感信息检测、许可证检查、漏洞扫描
- 📊 **可视化** - 依赖图、Sunburst图、TreeMap图、趋势分析
- 🏗️ **多解析器** - 支持 Webpack、Rollup、Vite 构建产物解析

## 📦 安装

```bash
npm install @ldesign/performance --save-dev
# or
pnpm add -D @ldesign/performance
```

## 🚀 快速开始

### 方式 1: CLI 命令

分析构建产物：

```bash
npx ldesign-performance analyze
```

指定选项：

```bash
npx ldesign-performance analyze --dir dist --format html json --output .perf
```

### 方式 2: Vite 插件

在 `vite.config.ts` 中配置：

```typescript
import { defineConfig } from 'vite'
import { performancePlugin } from '@ldesign/performance'

export default defineConfig({
  plugins: [
    performancePlugin({
      config: {
        budgets: {
          bundles: [
            { name: 'main', maxSize: '300kb' },
          ],
        },
        analyze: {
          generateReport: true,
          formats: ['html', 'json'],
        },
      },
    }),
  ],
})
```

### 方式 3: 程序化 API

```typescript
import { MetricsCollector, OptimizationEngine, HtmlReporter } from '@ldesign/performance'

// 收集构建指标
const collector = new MetricsCollector()
const buildMetrics = await collector.endBuildMetrics('./dist')

// 生成优化建议
const optimizer = new OptimizationEngine()
const suggestions = optimizer.generateSuggestions(buildMetrics)

// 生成报告
const reporter = new HtmlReporter()
reporter.generate(report, './reports')
```

## ⚙️ 配置

创建 `performance.config.js` 或 `performance.config.ts`：

```javascript
export default {
  // 性能预算
  budgets: {
    bundles: [
      {
        name: 'main',
        maxSize: '300kb',
        warningSize: '250kb',
      },
    ],
    metrics: {
      lcp: 2500,  // Largest Contentful Paint
      fid: 100,   // First Input Delay
      cls: 0.1,   // Cumulative Layout Shift
      fcp: 1800,  // First Contentful Paint
      tti: 3800,  // Time to Interactive
      tbt: 300,   // Total Blocking Time
    },
  },
  
  // 分析配置
  analyze: {
    openAnalyzer: false,
    generateReport: true,
    outputDir: '.performance',
    formats: ['html', 'json'],
  },
  
  // 优化配置
  optimize: {
    images: true,
    fonts: true,
    css: true,
    js: true,
  },
  
  // 其他选项
  outDir: 'dist',
  verbose: false,
}
```

## 📊 优化规则

内置以下优化规则：

**核心规则**
- **Bundle Size Rule** - 打包体积优化建议
- **Code Splitting Rule** - 代码分割策略建议
- **Tree Shaking Rule** - Tree-shaking 优化
- **Lazy Loading Rule** - 懒加载实施建议

**资源优化**
- **Image Optimization Rule** - 图片压缩和格式优化
- **CSS Optimization Rule** - CSS 体积、关键 CSS、未使用样式检测
- **Font Optimization Rule** - 字体子集化、WOFF2 格式、font-display 策略

**性能优化**
- **Compression Rule** - Gzip/Brotli 压缩优化
- **Third Party Script Rule** - 第三方脚本延迟加载、Facade 模式

### 自定义规则

```typescript
import { OptimizationEngine, type OptimizationRule } from '@ldesign/performance'

class MyCustomRule implements OptimizationRule {
  id = 'my-rule'
  name = 'My Custom Rule'
  category = 'other'

  check(metrics) {
    // 实现检查逻辑
    return []
  }
}

const optimizer = new OptimizationEngine()
optimizer.addRule(new MyCustomRule())
```

## 📋 报告格式

### HTML 报告
交互式、可视化的 HTML 报告，包含完整的性能分析和建议。

### JSON 报告
机器可读的 JSON 格式，适合集成到 CI/CD 流程。

### Markdown 报告
便于文档化的 Markdown 格式报告。

### CLI 报告
美观的终端输出，支持颜色和表格。

## 🔧 CLI 命令

### analyze
```bash
ldesign-performance analyze [options]

Options:
  -d, --dir <directory>     构建输出目录 (default: "dist")
  -c, --config <path>       配置文件路径
  -o, --output <directory>  报告输出目录 (default: ".performance")
  -f, --format <formats...> 报告格式 (default: ["html", "json"])
  -v, --verbose             详细输出
```

### monitor
运行时性能监控，支持 Lighthouse 和 Web Vitals 收集：

```bash
ldesign-performance monitor [options]

Options:
  -u, --url <url>           监控的 URL
  -o, --output <directory>  报告输出目录
  -v, --verbose             详细输出
```

### report
```bash
ldesign-performance report [options]

Options:
  -i, --input <path>        输入报告数据文件
  -o, --output <directory>  报告输出目录
  -f, --format <format>     报告格式 (default: "cli")
```

## 🎯 使用场景

### CI/CD 集成

#### GitHub Actions

```yaml
- name: Build
  run: npm run build

- name: Performance Analysis
  id: perf
  run: npx ldesign-performance analyze --format json

- name: Check Budget
  run: |
    if [ $? -ne 0 ]; then
      echo "Performance budget exceeded!"
      exit 1
    fi

- name: Comment PR
  uses: actions/github-script@v6
  if: github.event_name == 'pull_request'
  with:
    script: |
      const fs = require('fs')
      const report = JSON.parse(fs.readFileSync('.performance/report.json', 'utf8'))
      // 使用 GitHubActionsReporter 生成评论
```

#### 历史趋势分析

```typescript
import { HistoryManager, TrendAnalyzer } from '@ldesign/performance'

// 保存历史记录
const history = new HistoryManager('.performance')
await history.addEntry(report, {
  commit: process.env.GIT_COMMIT,
  branch: process.env.GIT_BRANCH,
})

// 分析趋势
const analyzer = new TrendAnalyzer()
const trends = analyzer.analyzeTrends(await history.getHistory(30))

// 检测回归
if (trends.regressions.length > 0) {
  console.error('⚠️ Performance regressions detected!')
  for (const regression of trends.regressions) {
    console.log(`- ${regression.metric}: ${regression.changePercentage}%`)
  }
}
```

#### Prometheus Metrics 导出

```typescript
import { PrometheusExporter } from '@ldesign/performance'

const exporter = new PrometheusExporter('my_app')
const metrics = exporter.generateMetrics(report)
const text = exporter.formatPrometheusText(metrics)

// 导出到文件
exporter.exportToFile(report, './metrics.prom')

// 或通过 HTTP 推送到 Pushgateway
```

### 开发流程

1. 配置性能预算
2. 集成 Vite 插件
3. 每次构建自动分析
4. 查看优化建议
5. 实施优化
6. 验证效果

## 📚 示例

查看 [examples/](./examples/) 目录获取更多示例：

- `basic-usage.ts` - 基础 API 使用
- `vite-plugin.ts` - Vite 插件配置
- `custom-rules.ts` - 自定义优化规则

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

MIT © LDesign Team

---

**@ldesign/performance** - 让你的应用性能飞起来！ 🚀

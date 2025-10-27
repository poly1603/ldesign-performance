# 🚀 @ldesign/performance 快速开始指南

## 5 分钟快速体验

### 步骤 1: 安装

在你的项目中安装：

```bash
pnpm add -D @ldesign/performance
```

### 步骤 2: 分析你的构建产物

构建你的项目后，运行分析命令：

```bash
# 先构建项目
pnpm build

# 然后分析
npx ldesign-performance analyze
```

就这么简单！你会看到：
- 📊 构建指标（时间、体积、压缩率）
- 💰 预算检查结果（如果配置了）
- 💡 优化建议（按优先级排序）

### 步骤 3: 查看详细报告

分析完成后，打开生成的 HTML 报告：

```bash
open .performance/performance-report-*.html
```

你会看到一个漂亮的交互式报告！

## 进阶使用

### 配置性能预算

创建 `performance.config.js`：

```javascript
export default {
  budgets: {
    bundles: [
      { name: 'main', maxSize: '300kb' },
    ],
  },
}
```

再次运行分析，如果超过预算会警告你！

### 集成到 Vite

在 `vite.config.ts` 中：

```typescript
import { performancePlugin } from '@ldesign/performance'

export default defineConfig({
  plugins: [
    performancePlugin(),
  ],
})
```

现在每次生产构建都会自动分析！

### 自定义报告格式

```bash
# 生成 Markdown 格式
npx ldesign-performance analyze --format markdown

# 只生成 JSON（用于 CI/CD）
npx ldesign-performance analyze --format json

# 同时生成多种格式
npx ldesign-performance analyze --format html json markdown
```

## CI/CD 集成

在 GitHub Actions 中：

```yaml
- name: Build
  run: pnpm build

- name: Performance Check
  run: npx ldesign-performance analyze --format json
```

如果性能预算失败，CI 会自动失败！

## 常用命令

```bash
# 基础分析
npx ldesign-performance analyze

# 指定输出目录
npx ldesign-performance analyze --dir dist --output .perf

# 详细输出
npx ldesign-performance analyze --verbose

# 查看帮助
npx ldesign-performance --help
npx ldesign-performance analyze --help
```

## 下一步

- 📖 阅读完整 [README.md](./README.md)
- 🔧 查看 [配置选项](./README.md#%EF%B8%8F-配置)
- 💡 了解 [优化规则](./README.md#-优化规则)
- 🎯 探索 [示例代码](./examples/)

## 常见问题

### Q: 报告保存在哪里？
A: 默认在 `.performance/` 目录，可以通过 `--output` 选项修改。

### Q: 如何只检查预算不生成报告？
A: 在配置中设置 `analyze.generateReport: false`。

### Q: 支持 Webpack 吗？
A: 目前主要支持 Vite，Webpack 支持计划中。

### Q: 如何添加自定义优化规则？
A: 查看 [examples/custom-rules.ts](./examples/custom-rules.ts)。

## 需要帮助？

- 📖 查看 [完整文档](./README.md)
- 🐛 [报告问题](https://github.com/ldesign/ldesign/issues)
- 💬 [讨论区](https://github.com/ldesign/ldesign/discussions)

---

**开始优化你的应用性能吧！** 🚀


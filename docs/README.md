# @ldesign/performance Documentation

这是 `@ldesign/performance` 包的完整文档站点,使用 VitePress 构建。

## 📁 文档结构

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress 配置
├── index.md               # 首页
├── guide/                 # 指南
│   ├── introduction.md    # 简介
│   ├── getting-started.md # 快速开始
│   ├── concepts.md        # 核心概念
│   ├── optimization-rules.md
│   ├── analyzers.md
│   ├── reporters.md
│   ├── budgets.md
│   ├── security.md
│   ├── frameworks.md
│   ├── caching.md
│   ├── monitoring.md
│   ├── trends.md
│   ├── vite-plugin.md
│   ├── ci-cd.md
│   ├── prometheus.md
│   ├── configuration.md
│   ├── cli.md
│   ├── best-practices.md
│   └── troubleshooting.md
├── api/                   # API 参考
│   ├── overview.md        # API 总览
│   ├── rules.md          # 规则 API
│   ├── analyzers.md      # 分析器 API
│   ├── reporters.md      # 报告器 API
│   ├── utils.md          # 工具函数 API
│   └── types.md          # 类型定义
└── examples/             # 示例
    ├── basic.md          # 基础使用
    ├── vite.md           # Vite 集成
    ├── custom-rules.md   # 自定义规则
    ├── ci-cd.md          # CI/CD 集成
    └── dashboard.md      # 实时仪表板
```

## 🚀 本地运行

### 安装依赖

```bash
cd docs
npm install
# or
pnpm install
```

### 启动开发服务器

```bash
npm run docs:dev
```

访问 `http://localhost:5173` 查看文档。

### 构建文档

```bash
npm run docs:build
```

构建产物在 `.vitepress/dist` 目录。

### 预览构建

```bash
npm run docs:preview
```

## 📝 文档内容

### 指南部分

- **开始**
  - [简介](./guide/introduction.md) - 工具概览和特性
  - [快速开始](./guide/getting-started.md) - 5分钟集成指南
  - [核心概念](./guide/concepts.md) - 架构和设计理念

- **核心功能**
  - 优化规则 - 20+ 内置优化规则
  - 分析器 - 8大分析器详解
  - 报告生成 - 多种报告格式
  - 预算管理 - 性能预算配置

- **高级功能**
  - 安全检测 - 敏感信息和漏洞扫描
  - 框架优化 - React/Vue/Angular/Svelte
  - 缓存策略 - HTTP缓存和Service Worker
  - 实时监控 - 性能指标监控
  - 历史趋势 - 性能回归检测

- **集成**
  - Vite 插件 - 构建时集成
  - CI/CD - GitHub Actions/GitLab CI
  - Prometheus - 指标导出

- **其他**
  - 配置 - 完整配置选项
  - CLI 命令 - 命令行工具
  - 最佳实践 - 使用建议
  - 故障排查 - 常见问题解答

### API 参考

- [总览](./api/overview.md) - 完整 API 导出
- 优化规则 API
- 分析器 API
- 报告器 API
- 工具函数
- TypeScript 类型定义

### 示例代码

- [基础使用](./examples/basic.md) - 常见场景示例
- Vite 集成示例
- 自定义规则示例
- CI/CD 集成示例
- 实时仪表板示例

## 🎨 主题定制

文档使用 VitePress 默认主题,可以在 `.vitepress/config.ts` 中自定义:

- 导航栏
- 侧边栏
- 搜索功能
- 主题颜色
- Logo 和图标

## 📚 编写文档

### Markdown 增强

VitePress 支持:

- ✅ GitHub 风格 Markdown
- ✅ 代码块语法高亮
- ✅ 自定义容器 (tip, warning, danger)
- ✅ 表格
- ✅ Emoji
- ✅ 目录 (TOC)
- ✅ Frontmatter
- ✅ Vue 组件

### 代码块示例

```typescript
// 使用语言标识
import { PerformanceOptimizer } from '@ldesign/performance'

const optimizer = new PerformanceOptimizer({
  rootDir: './dist'
})
```

### 自定义容器

```markdown
::: tip 提示
这是一个提示容器
:::

::: warning 注意
这是一个警告容器
:::

::: danger 危险
这是一个危险容器
:::

::: details 点击展开
这是一个可折叠的详情容器
:::
```

### Code Groups

```markdown
::: code-group

```bash [npm]
npm install @ldesign/performance
\```

```bash [yarn]
yarn add @ldesign/performance
\```

```bash [pnpm]
pnpm add @ldesign/performance
\```

:::
```

## 🔗 相关链接

- [主仓库](https://github.com/ldesign/performance)
- [npm 包](https://www.npmjs.com/package/@ldesign/performance)
- [VitePress 文档](https://vitepress.dev/)

## 📄 许可证

MIT License

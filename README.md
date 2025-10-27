# @ldesign/performance

> 🚀 全方位的性能优化工具，让你的应用飞起来

## ✨ 特性

- 📊 **构建分析** - webpack-bundle-analyzer 集成
- 📈 **性能监控** - Core Web Vitals 指标追踪
- 🚀 **资源优化** - 图片懒加载、代码分割建议
- 📋 **性能报告** - 生成详细的性能优化报告
- 🤖 **CI 集成** - 性能预算控制，自动化性能测试
- 🔍 **性能诊断** - 自动发现性能瓶颈
- ⚡ **优化建议** - 智能提供优化方案

## 📦 安装

```bash
npm install @ldesign/performance --save-dev
```

## 🚀 快速开始

### 分析构建产物

```bash
npx ldesign-performance analyze
```

### 监控运行时性能

```bash
npx ldesign-performance monitor
```

### 生成性能报告

```bash
npx ldesign-performance report
```

## ⚙️ 配置

创建 `performance.config.js`：

```javascript
module.exports = {
  // 性能预算
  budgets: {
    bundles: [
      {
        name: 'main',
        maxSize: '300kb',
      },
    ],
    metrics: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
    },
  },
  
  // 分析配置
  analyze: {
    openAnalyzer: true,
    generateReport: true,
  },
  
  // 优化配置
  optimize: {
    images: true,
    fonts: true,
    css: true,
    js: true,
  },
};
```

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

MIT © LDesign Team
@ldesign/performance - Performance optimization tool

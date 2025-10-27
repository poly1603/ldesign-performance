# Contributing to @ldesign/performance

感谢你对 @ldesign/performance 的贡献！

## 开发设置

### 1. 安装依赖

```bash
pnpm install
```

### 2. 开发模式

```bash
pnpm dev
```

### 3. 运行测试

```bash
pnpm test
pnpm test:coverage
```

### 4. 构建

```bash
pnpm build
```

## 项目结构

```
src/
├── analyzers/      # 构建分析器
├── budget/         # 性能预算管理
├── cli/            # CLI 命令
├── config/         # 配置系统
├── metrics/        # 指标收集器
├── optimizer/      # 优化建议引擎
│   └── rules/      # 优化规则
├── plugins/        # Vite 插件
├── reporters/      # 报告生成器
├── types/          # TypeScript 类型
└── utils/          # 工具函数
```

## 添加新的优化规则

1. 在 `src/optimizer/rules/` 创建新规则文件
2. 实现 `OptimizationRule` 接口
3. 在 `src/optimizer/rules/index.ts` 导出
4. 在 `OptimizationEngine` 中注册

示例：

```typescript
import type { OptimizationRule, OptimizationSuggestion, BuildMetrics } from '../../types'

export class MyCustomRule implements OptimizationRule {
  id = 'my-custom-rule'
  name = 'My Custom Rule'
  category = 'other' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    // 实现你的检查逻辑
    return []
  }
}
```

## 添加新的报告格式

1. 在 `src/reporters/` 创建新的 Reporter 类
2. 实现 `generate` 方法
3. 在 CLI 和插件中集成

## 编码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加类型注释
- 编写单元测试
- 保持代码简洁清晰

## 提交规范

使用 Conventional Commits 格式：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `test:` 测试相关
- `refactor:` 代码重构
- `chore:` 构建/工具相关

## 测试

所有新功能都应该包含测试：

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFeature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true)
  })
})
```

## 问题和建议

如有问题或建议，请创建 Issue。

## 许可证

通过贡献代码，你同意你的代码将在 MIT 许可证下发布。



/**
 * 自定义优化规则示例
 */
import {
  OptimizationEngine,
  type OptimizationRule,
  type OptimizationSuggestion,
  type BuildMetrics
} from '@ldesign/performance'

// 自定义规则：检查 CSS 文件数量
class CssCountRule implements OptimizationRule {
  id = 'css-count'
  name = 'CSS File Count'
  category = 'other' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const cssFiles = metrics.assets.filter(a => a.type === 'css')

    if (cssFiles.length > 5) {
      return [{
        id: 'css-count-too-many',
        title: 'Too Many CSS Files',
        description: `Found ${cssFiles.length} CSS files. Consider consolidating.`,
        priority: 'medium',
        category: 'other',
        impact: 'Multiple CSS files increase HTTP requests.',
        implementation: [
          'Combine CSS files',
          'Use CSS modules',
          'Enable CSS code splitting strategically',
        ],
      }]
    }

    return []
  }
}

async function main() {
  const optimizer = new OptimizationEngine()

  // 添加自定义规则
  optimizer.addRule(new CssCountRule())

  // 使用优化器
  // const suggestions = optimizer.generateSuggestions(buildMetrics)
  console.log('Custom rule added successfully!')
}

main().catch(console.error)



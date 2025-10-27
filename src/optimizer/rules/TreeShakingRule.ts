/**
 * Tree-shaking 优化规则
 */
import type { OptimizationRule, OptimizationSuggestion, BuildMetrics } from '../../types'
import { formatBytes } from '../../utils/formatUtils'

export class TreeShakingRule implements OptimizationRule {
  id = 'tree-shaking'
  name = 'Tree Shaking'
  category = 'tree-shaking' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 检查压缩率（间接指标）
    const compressionRatio = metrics.totalGzipSize / metrics.totalSize

    if (compressionRatio > 0.65) {
      suggestions.push({
        id: 'tree-shaking-potential',
        title: 'Tree Shaking May Be Ineffective',
        description: 'High compression ratio suggests potential for dead code elimination.',
        priority: 'medium',
        category: 'tree-shaking',
        impact: 'Unused code increases bundle size and parsing time.',
        implementation: [
          'Ensure "sideEffects" is properly configured in package.json',
          'Use ES modules instead of CommonJS',
          'Import only what you need: import { specific } from "library"',
          'Review and remove unused imports',
          'Check that production mode is enabled',
        ],
      })
    }

    // 检查是否有明显的库引入模式问题
    // 这需要更深入的模块分析，这里提供通用建议
    if (metrics.bundles.some(b => b.size > 300 * 1024)) {
      suggestions.push({
        id: 'tree-shaking-library-imports',
        title: 'Optimize Library Imports',
        description: 'Large bundles may contain unused library code.',
        priority: 'low',
        category: 'tree-shaking',
        impact: 'Importing entire libraries when only using parts wastes bandwidth.',
        implementation: [
          'Use barrel imports carefully (avoid import * as)',
          'For lodash, use lodash-es or import individual functions',
          'For moment.js, consider date-fns or dayjs',
          'Review large dependencies and their tree-shaking support',
        ],
        estimatedSavings: formatBytes(metrics.totalSize * 0.15),
      })
    }

    return suggestions
  }
}



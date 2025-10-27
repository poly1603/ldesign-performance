/**
 * 打包体积优化规则
 */
import type { OptimizationRule, OptimizationSuggestion, BuildMetrics } from '../../types'
import { formatBytes } from '../../utils/formatUtils'

export class BundleSizeRule implements OptimizationRule {
  id = 'bundle-size'
  name = 'Bundle Size Optimization'
  category = 'bundle-size' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 检查总体积
    if (metrics.totalSize > 1024 * 1024) { // > 1MB
      const priority = metrics.totalSize > 2 * 1024 * 1024 ? 'critical' : 'high'
      suggestions.push({
        id: 'bundle-size-large-total',
        title: 'Large Total Bundle Size',
        description: `Total bundle size is ${formatBytes(metrics.totalSize)}, which exceeds the recommended 1MB threshold.`,
        priority,
        category: 'bundle-size',
        impact: 'Affects initial load time and user experience, especially on slow connections.',
        implementation: [
          'Enable code splitting with dynamic imports',
          'Implement lazy loading for non-critical features',
          'Remove unused dependencies',
          'Use lighter alternatives for heavy libraries',
        ],
        estimatedSavings: formatBytes(metrics.totalSize * 0.3), // 预估可减少 30%
      })
    }

    // 检查单个大文件
    for (const bundle of metrics.bundles) {
      if (bundle.size > 500 * 1024) { // > 500KB
        suggestions.push({
          id: `bundle-size-large-${bundle.name}`,
          title: `Large Bundle: ${bundle.name}`,
          description: `Bundle ${bundle.name} is ${formatBytes(bundle.size)}, which is quite large.`,
          priority: bundle.size > 1024 * 1024 ? 'high' : 'medium',
          category: 'bundle-size',
          impact: 'Large individual bundles slow down loading and parsing.',
          implementation: [
            'Split this bundle using dynamic imports',
            'Move large dependencies to separate chunks',
            'Consider lazy loading this module',
          ],
          estimatedSavings: formatBytes(bundle.size * 0.4),
        })
      }
    }

    // 检查压缩率
    const compressionRatio = metrics.totalGzipSize / metrics.totalSize
    if (compressionRatio > 0.7) {
      suggestions.push({
        id: 'bundle-size-low-compression',
        title: 'Low Compression Ratio',
        description: `Compression ratio is ${(compressionRatio * 100).toFixed(1)}%, which suggests suboptimal minification.`,
        priority: 'medium',
        category: 'bundle-size',
        impact: 'Poor compression leads to larger file transfers.',
        implementation: [
          'Ensure minification is enabled in production',
          'Enable tree-shaking to remove dead code',
          'Remove console.log and debug code',
          'Use Brotli compression in addition to Gzip',
        ],
      })
    }

    return suggestions
  }
}



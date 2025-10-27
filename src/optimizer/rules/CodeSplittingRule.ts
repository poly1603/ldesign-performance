/**
 * 代码分割规则
 */
import type { OptimizationRule, OptimizationSuggestion, BuildMetrics } from '../../types'

export class CodeSplittingRule implements OptimizationRule {
  id = 'code-splitting'
  name = 'Code Splitting'
  category = 'code-splitting' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 检查是否使用了代码分割
    const hasCodeSplitting = metrics.bundles.length > 2
    const entryBundles = metrics.bundles.filter(b => b.isEntry)

    if (!hasCodeSplitting && entryBundles.length === 1) {
      suggestions.push({
        id: 'code-splitting-not-used',
        title: 'No Code Splitting Detected',
        description: 'All code appears to be in a single bundle. Consider implementing code splitting.',
        priority: 'high',
        category: 'code-splitting',
        impact: 'Single bundle means users download all code upfront, even for unused features.',
        implementation: [
          'Use dynamic imports: import("./module")',
          'Split vendor code from application code',
          'Implement route-based code splitting',
          'Configure manual chunks in build config',
        ],
      })
    }

    // 检查 vendor chunk
    const vendorChunk = metrics.bundles.find(b =>
      b.name.includes('vendor') ||
      b.name.includes('node_modules')
    )

    if (!vendorChunk && metrics.bundles.length > 1) {
      suggestions.push({
        id: 'code-splitting-no-vendor',
        title: 'Separate Vendor Code',
        description: 'Vendor dependencies are not separated into their own chunk.',
        priority: 'medium',
        category: 'code-splitting',
        impact: 'Vendor code changes less frequently and should be cached separately.',
        implementation: [
          'Configure manualChunks to separate vendor code',
          'Example: manualChunks: { vendor: [/node_modules/] }',
        ],
      })
    }

    // 检查是否有过多的小 chunks
    const smallChunks = metrics.bundles.filter(b => b.size < 10 * 1024) // < 10KB
    if (smallChunks.length > 10) {
      suggestions.push({
        id: 'code-splitting-too-many-small-chunks',
        title: 'Too Many Small Chunks',
        description: `${smallChunks.length} chunks are smaller than 10KB, which may cause overhead.`,
        priority: 'low',
        category: 'code-splitting',
        impact: 'Too many small chunks increases HTTP overhead and may hurt performance.',
        implementation: [
          'Consolidate small chunks',
          'Set minChunkSize in build configuration',
          'Review code splitting strategy',
        ],
      })
    }

    return suggestions
  }
}



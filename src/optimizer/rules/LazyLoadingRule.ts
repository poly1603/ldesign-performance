/**
 * 懒加载优化规则
 */
import type { OptimizationRule, OptimizationSuggestion, BuildMetrics } from '../../types'
import { formatBytes } from '../../utils/formatUtils'

export class LazyLoadingRule implements OptimizationRule {
  id = 'lazy-loading'
  name = 'Lazy Loading'
  category = 'lazy-loading' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    const images = metrics.assets.filter(a => a.type === 'image')
    const fonts = metrics.assets.filter(a => a.type === 'font')
    const entrySize = metrics.bundles.filter(b => b.isEntry)
      .reduce((sum, b) => sum + b.size, 0)

    // 建议图片懒加载
    if (images.length > 5) {
      suggestions.push({
        id: 'lazy-loading-images',
        title: 'Implement Image Lazy Loading',
        description: `${images.length} images detected. Consider lazy loading images below the fold.`,
        priority: 'medium',
        category: 'lazy-loading',
        impact: 'Lazy loading images reduces initial page load time.',
        implementation: [
          'Use loading="lazy" attribute on <img> tags',
          'Implement Intersection Observer for custom lazy loading',
          'Prioritize above-the-fold images with loading="eager"',
          'Use placeholder images or blurred previews',
        ],
        estimatedSavings: formatBytes(
          images.reduce((sum, img) => sum + img.size, 0) * 0.6
        ),
      })
    }

    // 建议字体懒加载
    if (fonts.length > 2) {
      suggestions.push({
        id: 'lazy-loading-fonts',
        title: 'Optimize Font Loading',
        description: `${fonts.length} font files detected. Consider optimizing font loading strategy.`,
        priority: 'low',
        category: 'lazy-loading',
        impact: 'Unoptimized font loading can cause FOIT (Flash of Invisible Text).',
        implementation: [
          'Use font-display: swap or optional',
          'Preload critical fonts',
          'Subset fonts to include only used characters',
          'Consider system fonts for body text',
        ],
      })
    }

    // 建议路由懒加载
    if (entrySize > 500 * 1024 && metrics.bundles.length <= 2) {
      suggestions.push({
        id: 'lazy-loading-routes',
        title: 'Implement Route-Based Code Splitting',
        description: 'Large entry bundle suggests routes are not lazily loaded.',
        priority: 'high',
        category: 'lazy-loading',
        impact: 'Loading all routes upfront delays time to interactive.',
        implementation: [
          'Use dynamic imports for route components',
          'React: lazy(() => import("./Route"))',
          'Vue: () => import("./Route.vue")',
          'Split by route in your router configuration',
        ],
        estimatedSavings: formatBytes(entrySize * 0.5),
      })
    }

    // 建议组件懒加载
    if (entrySize > 300 * 1024) {
      suggestions.push({
        id: 'lazy-loading-components',
        title: 'Consider Component-Level Lazy Loading',
        description: 'Large components or features could be lazily loaded.',
        priority: 'medium',
        category: 'lazy-loading',
        impact: 'Lazy loading non-critical components improves initial load.',
        implementation: [
          'Identify heavy components (modals, charts, editors)',
          'Load them only when needed with dynamic imports',
          'Show loading states during component load',
          'Consider using React.lazy or Vue defineAsyncComponent',
        ],
      })
    }

    return suggestions
  }
}



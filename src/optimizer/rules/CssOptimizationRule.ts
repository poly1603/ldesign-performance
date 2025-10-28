/**
 * CSS 优化规则
 */
import type { BuildMetrics, OptimizationSuggestion, OptimizationRule } from '../../types'
import { formatBytes } from '../../utils/formatUtils'

export class CssOptimizationRule implements OptimizationRule {
  id = 'css-optimization'
  name = 'CSS Optimization'
  category = 'css-optimization' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 检查CSS文件大小
    const cssAssets = metrics.assets.filter(a => a.type === 'css')
    const totalCssSize = cssAssets.reduce((sum, a) => sum + a.size, 0)

    // CSS文件总大小过大
    if (totalCssSize > 300 * 1024) {
      suggestions.push({
        id: 'css-size-large',
        title: 'CSS总体积过大',
        description: `CSS文件总体积为 ${formatBytes(totalCssSize)}，超过推荐值 300KB`,
        priority: 'high',
        category: 'css-optimization',
        impact: '大型CSS文件会延长首次渲染时间',
        implementation: [
          '使用CSS Modules或CSS-in-JS减少未使用的样式',
          '启用PurgeCSS或类似工具移除未使用的CSS',
          '考虑将CSS分割为关键CSS和非关键CSS',
          '使用CSS压缩工具（如cssnano）',
        ],
        estimatedSavings: `可节省约 ${formatBytes(totalCssSize * 0.3)}`,
      })
    }

    // 检查单个CSS文件是否过大
    for (const asset of cssAssets) {
      if (asset.size > 150 * 1024) {
        suggestions.push({
          id: `css-file-large-${asset.name}`,
          title: `CSS文件 ${asset.name} 体积过大`,
          description: `文件大小: ${formatBytes(asset.size)}`,
          priority: 'medium',
          category: 'css-optimization',
          impact: '单个大型CSS文件会阻塞渲染',
          implementation: [
            '拆分CSS为多个较小的文件',
            '按路由或组件进行代码分割',
            '提取关键CSS内联到HTML',
            '懒加载非关键CSS',
          ],
          estimatedSavings: `可节省约 ${formatBytes(asset.size * 0.25)}`,
        })
      }
    }

    // 检查是否有重复的CSS
    if (cssAssets.length > 3) {
      suggestions.push({
        id: 'css-duplication',
        title: '可能存在CSS重复',
        description: `检测到 ${cssAssets.length} 个CSS文件，可能存在样式重复`,
        priority: 'medium',
        category: 'css-optimization',
        impact: '重复的CSS增加了下载和解析时间',
        implementation: [
          '使用CSS预处理器（Sass/Less）共享变量和mixins',
          '建立统一的设计系统和组件库',
          '使用工具检测和合并重复的样式规则',
          '考虑使用Tailwind CSS等原子化CSS方案',
        ],
      })
    }

    // 建议关键CSS提取
    if (totalCssSize > 50 * 1024 && cssAssets.length > 0) {
      suggestions.push({
        id: 'css-critical-extraction',
        title: '提取关键CSS',
        description: '将首屏渲染所需的关键CSS内联到HTML，延迟加载其他CSS',
        priority: 'high',
        category: 'css-optimization',
        impact: '显著提升首次内容绘制（FCP）和最大内容绘制（LCP）',
        implementation: [
          '使用 critical 或 critters 工具提取关键CSS',
          '将关键CSS内联到 <head> 标签',
          '使用 preload 预加载完整CSS文件',
          '使用 media="print" onload="this.media=\'all\'" 延迟加载非关键CSS',
        ],
      })
    }

    return suggestions
  }
}


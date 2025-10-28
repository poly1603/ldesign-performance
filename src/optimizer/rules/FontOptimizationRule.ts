/**
 * 字体优化规则
 */
import type { BuildMetrics, OptimizationSuggestion, OptimizationRule } from '../../types'
import { formatBytes } from '../../utils/formatUtils'

export class FontOptimizationRule implements OptimizationRule {
  id = 'font-optimization'
  name = 'Font Optimization'
  category = 'font-optimization' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 检查字体文件
    const fontAssets = metrics.assets.filter(a => a.type === 'font')
    const totalFontSize = fontAssets.reduce((sum, a) => sum + a.size, 0)

    if (fontAssets.length === 0) {
      return suggestions
    }

    // 字体文件总大小过大
    if (totalFontSize > 500 * 1024) {
      suggestions.push({
        id: 'font-size-large',
        title: '字体文件总体积过大',
        description: `字体文件总体积为 ${formatBytes(totalFontSize)}，超过推荐值 500KB`,
        priority: 'high',
        category: 'font-optimization',
        impact: '大型字体文件会延长页面加载时间，可能导致文本闪烁（FOIT/FOUT）',
        implementation: [
          '使用字体子集化（subsetting）只包含需要的字符',
          '使用 WOFF2 格式（最佳压缩率）',
          '考虑使用系统字体栈代替自定义字体',
          '使用可变字体（Variable Fonts）代替多个字重文件',
        ],
        estimatedSavings: `可节省约 ${formatBytes(totalFontSize * 0.5)}`,
      })
    }

    // 检查单个字体文件大小
    for (const asset of fontAssets) {
      if (asset.size > 150 * 1024) {
        suggestions.push({
          id: `font-file-large-${asset.name}`,
          title: `字体文件 ${asset.name} 体积过大`,
          description: `文件大小: ${formatBytes(asset.size)}`,
          priority: 'medium',
          category: 'font-optimization',
          impact: '单个大型字体文件会阻塞渲染',
          implementation: [
            '对字体进行子集化，只包含实际使用的字符',
            '检查是否加载了不必要的字重或字形',
            '考虑使用系统字体作为备用方案',
          ],
          estimatedSavings: `可节省约 ${formatBytes(asset.size * 0.6)}`,
        })
      }
    }

    // 字体加载过多
    if (fontAssets.length > 4) {
      suggestions.push({
        id: 'font-count-high',
        title: '字体文件数量过多',
        description: `加载了 ${fontAssets.length} 个字体文件`,
        priority: 'medium',
        category: 'font-optimization',
        impact: '多个字体文件会增加HTTP请求数量和加载时间',
        implementation: [
          '减少使用的字体系列数量',
          '合并相似字重的字体',
          '使用可变字体代替多个字重文件',
          '评估是否真的需要所有字体',
        ],
      })
    }

    // font-display 策略建议
    suggestions.push({
      id: 'font-display-strategy',
      title: '优化字体显示策略',
      description: '使用合适的 font-display 策略避免文本闪烁',
      priority: 'high',
      category: 'font-optimization',
      impact: '改善首次内容绘制（FCP）和累积布局偏移（CLS）',
      implementation: [
        '使用 font-display: swap 实现快速文本渲染',
        '对于图标字体使用 font-display: block',
        '考虑使用 font-display: optional 提升性能',
        '在 @font-face 规则中添加 font-display 属性',
      ],
    })

    // 字体预加载建议
    if (fontAssets.length > 0) {
      suggestions.push({
        id: 'font-preload',
        title: '预加载关键字体',
        description: '使用 <link rel="preload"> 预加载首屏需要的字体',
        priority: 'medium',
        category: 'font-optimization',
        impact: '减少字体加载延迟，改善FCP',
        implementation: [
          '识别首屏渲染所需的关键字体',
          '添加 <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>',
          '只预加载最重要的1-2个字体文件',
          '确保预加载的字体确实会被使用',
        ],
      })
    }

    // WOFF2 格式检查
    const nonWoff2Fonts = fontAssets.filter(
      asset => !asset.name.endsWith('.woff2')
    )
    if (nonWoff2Fonts.length > 0) {
      suggestions.push({
        id: 'font-format-woff2',
        title: '使用 WOFF2 字体格式',
        description: `检测到 ${nonWoff2Fonts.length} 个非 WOFF2 格式的字体`,
        priority: 'medium',
        category: 'font-optimization',
        impact: 'WOFF2 提供最佳压缩率，平均可减少30%文件大小',
        implementation: [
          '将所有字体转换为 WOFF2 格式',
          '现代浏览器都已支持 WOFF2',
          '可以保留 WOFF 作为旧浏览器的备用方案',
        ],
      })
    }

    return suggestions
  }
}


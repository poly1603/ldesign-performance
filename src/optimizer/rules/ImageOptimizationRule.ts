/**
 * 图片优化规则
 */
import type { OptimizationRule, OptimizationSuggestion, BuildMetrics } from '../../types'
import { formatBytes } from '../../utils/formatUtils'

export class ImageOptimizationRule implements OptimizationRule {
  id = 'image-optimization'
  name = 'Image Optimization'
  category = 'image-optimization' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    const images = metrics.assets.filter(a => a.type === 'image')

    if (images.length === 0) {
      return suggestions
    }

    const totalImageSize = images.reduce((sum, img) => sum + img.size, 0)
    const largeImages = images.filter(img => img.size > 200 * 1024) // > 200KB

    // 检查图片总体积
    if (totalImageSize > 500 * 1024) { // > 500KB
      suggestions.push({
        id: 'image-optimization-total-size',
        title: 'Large Total Image Size',
        description: `Total image size is ${formatBytes(totalImageSize)} across ${images.length} images.`,
        priority: totalImageSize > 1024 * 1024 ? 'high' : 'medium',
        category: 'image-optimization',
        impact: 'Large images significantly increase page load time and bandwidth usage.',
        implementation: [
          'Use modern image formats (WebP, AVIF)',
          'Implement responsive images with srcset',
          'Compress images using tools like imagemin',
          'Lazy load images below the fold',
          'Consider using a CDN with automatic image optimization',
        ],
        estimatedSavings: formatBytes(totalImageSize * 0.5), // 预估可减少 50%
      })
    }

    // 检查大图片
    if (largeImages.length > 0) {
      suggestions.push({
        id: 'image-optimization-large-images',
        title: `${largeImages.length} Large Image(s) Detected`,
        description: `Found ${largeImages.length} images larger than 200KB. Largest: ${largeImages[0].name} (${formatBytes(largeImages[0].size)})`,
        priority: 'medium',
        category: 'image-optimization',
        impact: 'Individual large images cause loading delays.',
        implementation: [
          'Resize images to appropriate dimensions',
          'Compress large images',
          'Use progressive JPEG for photos',
          'Consider using SVG for icons and illustrations',
        ],
        estimatedSavings: formatBytes(
          largeImages.reduce((sum, img) => sum + img.size, 0) * 0.6
        ),
      })
    }

    // 检查是否使用了现代格式
    const modernFormats = images.filter(img =>
      img.name.endsWith('.webp') ||
      img.name.endsWith('.avif')
    )

    if (images.length > 3 && modernFormats.length === 0) {
      suggestions.push({
        id: 'image-optimization-modern-formats',
        title: 'Use Modern Image Formats',
        description: 'No WebP or AVIF images detected. Modern formats offer better compression.',
        priority: 'low',
        category: 'image-optimization',
        impact: 'Modern formats can reduce image size by 30-50% with same quality.',
        implementation: [
          'Convert images to WebP format',
          'Use <picture> element for format fallbacks',
          'Configure build tools to auto-convert images',
        ],
        estimatedSavings: formatBytes(totalImageSize * 0.35),
      })
    }

    return suggestions
  }
}



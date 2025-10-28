/**
 * 压缩优化规则
 */
import type { BuildMetrics, OptimizationSuggestion, OptimizationRule } from '../../types'
import { formatBytes } from '../../utils/formatUtils'

export class CompressionRule implements OptimizationRule {
  id = 'compression'
  name = 'Compression Optimization'
  category = 'compression' as const

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 计算整体压缩率
    const totalSize = metrics.totalSize
    const totalGzipSize = metrics.totalGzipSize
    const compressionRatio = totalGzipSize / totalSize

    // 压缩率不理想
    if (compressionRatio > 0.4) {
      const potentialSavings = totalSize - totalSize * 0.35
      suggestions.push({
        id: 'compression-ratio-low',
        title: '压缩率可以进一步优化',
        description: `当前压缩率为 ${(compressionRatio * 100).toFixed(1)}%，可以进一步提升`,
        priority: 'medium',
        category: 'compression',
        impact: '更好的压缩率可以显著减少传输时间',
        implementation: [
          '确保服务器启用 Gzip 或 Brotli 压缩',
          'Brotli 比 Gzip 提供更好的压缩率（约 15-20%）',
          '检查是否有未压缩的文本资源',
          '对所有文本资源（JS、CSS、HTML、JSON、SVG）启用压缩',
        ],
        estimatedSavings: `可节省约 ${formatBytes(potentialSavings)}`,
      })
    }

    // 建议使用 Brotli
    suggestions.push({
      id: 'brotli-compression',
      title: '使用 Brotli 压缩',
      description: 'Brotli 提供比 Gzip 更好的压缩率',
      priority: 'high',
      category: 'compression',
      impact: '平均可减少 15-20% 的传输大小',
      implementation: [
        '在服务器配置中启用 Brotli 压缩',
        '在构建时预压缩文件（生成 .br 文件）',
        '现代浏览器都支持 Brotli',
        'Nginx: brotli on; | Apache: LoadModule brotli_module',
      ],
      estimatedSavings: `可节省约 ${formatBytes(totalSize * 0.15)}`,
    })

    // 检查大文件是否被压缩
    const largeBundles = metrics.bundles.filter(b => b.size > 100 * 1024)
    for (const bundle of largeBundles) {
      const bundleCompressionRatio = bundle.gzipSize / bundle.size
      if (bundleCompressionRatio > 0.5) {
        suggestions.push({
          id: `compression-bundle-${bundle.name}`,
          title: `文件 ${bundle.name} 压缩效果不佳`,
          description: `压缩率为 ${(bundleCompressionRatio * 100).toFixed(1)}%`,
          priority: 'low',
          category: 'compression',
          impact: '该文件可能包含难以压缩的内容',
          implementation: [
            '检查是否包含已压缩的二进制数据（图片、视频等）',
            '确认代码是否经过 minify',
            '检查是否有重复的代码可以提取',
          ],
        })
      }
    }

    // 预压缩建议
    if (metrics.bundles.length > 3) {
      suggestions.push({
        id: 'precompression',
        title: '使用预压缩优化服务器性能',
        description: '在构建时预先压缩文件，减轻服务器压力',
        priority: 'low',
        category: 'compression',
        impact: '减少服务器 CPU 使用，提升响应速度',
        implementation: [
          '使用 vite-plugin-compression 或类似插件',
          '生成 .gz 和 .br 文件',
          '配置服务器优先提供预压缩文件',
          '适合静态资源 CDN 部署',
        ],
      })
    }

    return suggestions
  }
}


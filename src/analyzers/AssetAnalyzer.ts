/**
 * 资源文件分析器
 */
import type { AssetMetrics, AssetType } from '../types'
import { formatBytes } from '../utils/formatUtils'

export interface AssetAnalysisResult {
  /** 按类型统计 */
  byType: Record<AssetType, AssetTypeStats>
  /** 大型资源 */
  largeAssets: LargeAsset[]
  /** 优化建议 */
  recommendations: string[]
}

export interface AssetTypeStats {
  count: number
  totalSize: number
  averageSize: number
  largest?: AssetMetrics
}

export interface LargeAsset {
  name: string
  type: AssetType
  size: number
  recommendation: string
}

export class AssetAnalyzer {
  private readonly IMAGE_SIZE_THRESHOLD = 200 * 1024 // 200KB
  private readonly FONT_SIZE_THRESHOLD = 100 * 1024 // 100KB

  /**
   * 分析资源文件
   */
  analyze(assets: AssetMetrics[]): AssetAnalysisResult {
    const byType = this.groupByType(assets)
    const largeAssets = this.findLargeAssets(assets)
    const recommendations = this.generateRecommendations(byType, largeAssets)

    return {
      byType,
      largeAssets,
      recommendations,
    }
  }

  /**
   * 按类型分组统计
   */
  private groupByType(assets: AssetMetrics[]): Record<AssetType, AssetTypeStats> {
    const types: AssetType[] = ['image', 'font', 'css', 'js', 'other']
    const result: any = {}

    for (const type of types) {
      const typeAssets = assets.filter(a => a.type === type)

      if (typeAssets.length === 0) {
        result[type] = {
          count: 0,
          totalSize: 0,
          averageSize: 0,
        }
        continue
      }

      const totalSize = typeAssets.reduce((sum, a) => sum + a.size, 0)
      const largest = typeAssets.reduce((max, a) => a.size > max.size ? a : max)

      result[type] = {
        count: typeAssets.length,
        totalSize,
        averageSize: totalSize / typeAssets.length,
        largest,
      }
    }

    return result
  }

  /**
   * 查找大型资源
   */
  private findLargeAssets(assets: AssetMetrics[]): LargeAsset[] {
    const large: LargeAsset[] = []

    for (const asset of assets) {
      let threshold = 0
      let recommendation = ''

      switch (asset.type) {
        case 'image':
          threshold = this.IMAGE_SIZE_THRESHOLD
          recommendation = 'Consider compressing or using WebP/AVIF format'
          break
        case 'font':
          threshold = this.FONT_SIZE_THRESHOLD
          recommendation = 'Consider subsetting or using variable fonts'
          break
        case 'js':
          threshold = 100 * 1024
          recommendation = 'Consider code splitting or lazy loading'
          break
        case 'css':
          threshold = 50 * 1024
          recommendation = 'Consider removing unused styles or splitting CSS'
          break
        default:
          threshold = 100 * 1024
          recommendation = 'Consider optimization or lazy loading'
      }

      if (asset.size > threshold) {
        large.push({
          name: asset.name,
          type: asset.type,
          size: asset.size,
          recommendation,
        })
      }
    }

    return large.sort((a, b) => b.size - a.size)
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    byType: Record<AssetType, AssetTypeStats>,
    largeAssets: LargeAsset[]
  ): string[] {
    const recommendations: string[] = []

    // 图片优化建议
    if (byType.image.totalSize > 500 * 1024) {
      recommendations.push(
        `Total image size is ${formatBytes(byType.image.totalSize)}. ` +
        'Consider using modern formats (WebP/AVIF) and lazy loading.'
      )
    }

    // 字体优化建议
    if (byType.font.count > 3) {
      recommendations.push(
        `${byType.font.count} font files detected. ` +
        'Consider reducing the number of font families or using system fonts.'
      )
    }

    // 大型资源建议
    if (largeAssets.length > 0) {
      recommendations.push(
        `${largeAssets.length} large assets detected. ` +
        'Review individual asset recommendations for optimization.'
      )
    }

    return recommendations
  }
}



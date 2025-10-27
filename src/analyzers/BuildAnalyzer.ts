/**
 * 构建性能分析器
 */
import type { BuildMetrics } from '../types'
import { formatBytes, formatDuration } from '../utils/formatUtils'

export interface BuildAnalysis {
  /** 构建时长分析 */
  durationAnalysis: {
    total: number
    formatted: string
    isOptimal: boolean
    message: string
  }
  /** 体积分析 */
  sizeAnalysis: {
    totalSize: number
    totalGzipSize: number
    compressionRatio: number
    formatted: {
      total: string
      gzip: string
    }
    isOptimal: boolean
    message: string
  }
  /** 打包产物分析 */
  bundleAnalysis: {
    count: number
    largest: {
      name: string
      size: number
      percentage: number
    }
    recommendations: string[]
  }
}

export class BuildAnalyzer {
  /**
   * 分析构建指标
   */
  analyze(metrics: BuildMetrics): BuildAnalysis {
    return {
      durationAnalysis: this.analyzeDuration(metrics),
      sizeAnalysis: this.analyzeSize(metrics),
      bundleAnalysis: this.analyzeBundles(metrics),
    }
  }

  /**
   * 分析构建时长
   */
  private analyzeDuration(metrics: BuildMetrics) {
    const { duration } = metrics
    const formatted = formatDuration(duration)

    let isOptimal = true
    let message = 'Build time is optimal'

    if (duration > 60000) {
      isOptimal = false
      message = 'Build time is slow. Consider optimizing build configuration.'
    } else if (duration > 30000) {
      isOptimal = false
      message = 'Build time could be improved.'
    }

    return {
      total: duration,
      formatted,
      isOptimal,
      message,
    }
  }

  /**
   * 分析打包体积
   */
  private analyzeSize(metrics: BuildMetrics) {
    const { totalSize, totalGzipSize } = metrics
    const compressionRatio = totalGzipSize / totalSize

    let isOptimal = true
    let message = 'Bundle size is optimal'

    // 超过 1MB 认为需要优化
    if (totalSize > 1024 * 1024) {
      isOptimal = false
      message = 'Bundle size is large. Consider code splitting and lazy loading.'
    }

    // 压缩率低于 30% 可能有优化空间
    if (compressionRatio > 0.7) {
      isOptimal = false
      message = 'Low compression ratio. Enable minification and tree-shaking.'
    }

    return {
      totalSize,
      totalGzipSize,
      compressionRatio,
      formatted: {
        total: formatBytes(totalSize),
        gzip: formatBytes(totalGzipSize),
      },
      isOptimal,
      message,
    }
  }

  /**
   * 分析打包产物
   */
  private analyzeBundles(metrics: BuildMetrics) {
    const { bundles, totalSize } = metrics
    const recommendations: string[] = []

    // 找出最大的打包文件
    const largest = bundles.reduce((max, bundle) =>
      bundle.size > max.size ? bundle : max,
      bundles[0]
    )

    const largestPercentage = (largest.size / totalSize) * 100

    // 如果单个文件超过总体积的 50%，建议拆分
    if (largestPercentage > 50) {
      recommendations.push(
        `Largest bundle (${largest.name}) takes up ${largestPercentage.toFixed(1)}% of total size. ` +
        'Consider code splitting.'
      )
    }

    // 如果打包文件太多，建议合并
    if (bundles.length > 20) {
      recommendations.push(
        `High number of bundles (${bundles.length}). ` +
        'Consider consolidating smaller chunks.'
      )
    }

    // 检查是否有超大文件
    for (const bundle of bundles) {
      if (bundle.size > 500 * 1024) {
        recommendations.push(
          `Bundle ${bundle.name} is large (${formatBytes(bundle.size)}). ` +
          'Consider lazy loading or splitting.'
        )
      }
    }

    return {
      count: bundles.length,
      largest: {
        name: largest.name,
        size: largest.size,
        percentage: largestPercentage,
      },
      recommendations,
    }
  }
}



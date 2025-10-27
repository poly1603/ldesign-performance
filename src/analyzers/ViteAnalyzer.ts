/**
 * Vite 专用分析器
 */
import type { BuildMetrics } from '../types'

export interface ViteAnalysisResult {
  /** 预构建依赖 */
  preBundledDeps: string[]
  /** 优化建议 */
  recommendations: string[]
}

export class ViteAnalyzer {
  /**
   * 分析 Vite 构建
   */
  analyze(metrics: BuildMetrics): ViteAnalysisResult {
    return {
      preBundledDeps: this.extractPreBundledDeps(metrics),
      recommendations: this.generateViteRecommendations(metrics),
    }
  }

  /**
   * 提取预构建依赖
   */
  private extractPreBundledDeps(metrics: BuildMetrics): string[] {
    // 简化版本：基于文件名模式识别
    const deps: string[] = []

    for (const bundle of metrics.bundles) {
      if (bundle.name.includes('vendor') || bundle.name.includes('chunk')) {
        deps.push(bundle.name)
      }
    }

    return deps
  }

  /**
   * 生成 Vite 特定建议
   */
  private generateViteRecommendations(metrics: BuildMetrics): string[] {
    const recommendations: string[] = []

    // 检查是否使用了代码分割
    const hasCodeSplitting = metrics.bundles.length > 2
    if (!hasCodeSplitting) {
      recommendations.push(
        'Consider enabling manual code splitting with dynamic imports for better chunking.'
      )
    }

    // 检查是否有大型 vendor chunk
    const vendorChunk = metrics.bundles.find(b => b.name.includes('vendor'))
    if (vendorChunk && vendorChunk.size > 500 * 1024) {
      recommendations.push(
        'Large vendor chunk detected. Consider using manualChunks to split vendor code.'
      )
    }

    return recommendations
  }
}



/**
 * 打包产物深度分析器
 * 使用 rollup-plugin-visualizer 进行可视化
 */
import type { BuildMetrics, BundleMetrics } from '../types'
import { formatBytes } from '../utils/formatUtils'

export interface BundleAnalysisResult {
  /** 重复模块 */
  duplicates: DuplicateModule[]
  /** 大型依赖 */
  largeDependencies: LargeDependency[]
  /** 未使用的导出 */
  unusedExports: string[]
}

export interface DuplicateModule {
  name: string
  instances: number
  totalSize: number
}

export interface LargeDependency {
  name: string
  size: number
  percentage: number
}

export class BundleAnalyzer {
  /**
   * 分析打包产物
   */
  analyze(metrics: BuildMetrics): BundleAnalysisResult {
    return {
      duplicates: this.findDuplicates(metrics),
      largeDependencies: this.findLargeDependencies(metrics),
      unusedExports: [], // 需要更深入的静态分析
    }
  }

  /**
   * 查找重复模块
   */
  private findDuplicates(metrics: BuildMetrics): DuplicateModule[] {
    const moduleMap = new Map<string, number>()

    // 简化版本：基于模块名检测
    for (const bundle of metrics.bundles) {
      if (bundle.modules) {
        for (const module of bundle.modules) {
          const count = moduleMap.get(module.id) || 0
          moduleMap.set(module.id, count + 1)
        }
      }
    }

    const duplicates: DuplicateModule[] = []
    for (const [name, instances] of moduleMap.entries()) {
      if (instances > 1) {
        duplicates.push({
          name,
          instances,
          totalSize: 0, // 需要更详细的模块信息
        })
      }
    }

    return duplicates
  }

  /**
   * 查找大型依赖
   */
  private findLargeDependencies(metrics: BuildMetrics): LargeDependency[] {
    const { bundles, totalSize } = metrics
    const dependencies: LargeDependency[] = []

    // 找出大于 100KB 的打包文件
    const threshold = 100 * 1024 // 100KB

    for (const bundle of bundles) {
      if (bundle.size > threshold) {
        dependencies.push({
          name: bundle.name,
          size: bundle.size,
          percentage: (bundle.size / totalSize) * 100,
        })
      }
    }

    return dependencies.sort((a, b) => b.size - a.size)
  }

  /**
   * 生成可视化报告路径
   */
  generateVisualizationReport(outputDir: string): string {
    return `${outputDir}/bundle-visualization.html`
  }
}



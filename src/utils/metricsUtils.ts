/**
 * 指标计算工具函数
 */
import type {
  BuildMetrics,
  OptimizationSuggestion,
  Priority,
  BudgetCheckResult,
  BudgetConfig
} from '../types'
import { parseSize } from './formatUtils'

/**
 * 计算性能评分 (0-100)
 */
export function calculatePerformanceScore(
  buildMetrics: BuildMetrics,
  budgetResults: BudgetCheckResult[],
  suggestions: OptimizationSuggestion[]
): number {
  let score = 100

  // 预算检查扣分
  const failedBudgets = budgetResults.filter(r => !r.passed)
  score -= failedBudgets.length * 10

  // 根据建议优先级扣分
  const criticalCount = suggestions.filter(s => s.priority === 'critical').length
  const highCount = suggestions.filter(s => s.priority === 'high').length
  const mediumCount = suggestions.filter(s => s.priority === 'medium').length

  score -= criticalCount * 15
  score -= highCount * 10
  score -= mediumCount * 5

  // 构建时间扣分（超过 30 秒）
  if (buildMetrics.duration > 30000) {
    score -= Math.min(20, Math.floor((buildMetrics.duration - 30000) / 10000) * 5)
  }

  // 确保分数在 0-100 之间
  return Math.max(0, Math.min(100, score))
}

/**
 * 检查预算
 */
export function checkBudgets(
  buildMetrics: BuildMetrics,
  budgetConfig?: BudgetConfig
): BudgetCheckResult[] {
  const results: BudgetCheckResult[] = []

  if (!budgetConfig) return results

  // 检查打包文件预算
  if (budgetConfig.bundles) {
    for (const bundleConfig of budgetConfig.bundles) {
      const bundle = buildMetrics.bundles.find(b =>
        b.name.includes(bundleConfig.name) || bundleConfig.name === 'main'
      )

      if (bundle) {
        const maxSize = parseSize(bundleConfig.maxSize)
        const passed = bundle.size <= maxSize
        const overagePercentage = passed ? 0 : ((bundle.size - maxSize) / maxSize) * 100

        results.push({
          name: bundleConfig.name,
          type: 'bundle',
          passed,
          actual: bundle.size,
          budget: maxSize,
          overagePercentage,
        })
      }
    }
  }

  return results
}

/**
 * 根据优先级排序建议
 */
export function sortSuggestions(suggestions: OptimizationSuggestion[]): OptimizationSuggestion[] {
  const priorityOrder: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return [...suggestions].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

/**
 * 过滤建议
 */
export function filterSuggestions(
  suggestions: OptimizationSuggestion[],
  minPriority: Priority = 'low'
): OptimizationSuggestion[] {
  const priorityOrder: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  const minLevel = priorityOrder[minPriority]
  return suggestions.filter(s => priorityOrder[s.priority] <= minLevel)
}

/**
 * 计算打包产物统计
 */
export function calculateBundleStats(buildMetrics: BuildMetrics) {
  const { bundles, assets } = buildMetrics

  return {
    totalBundles: bundles.length,
    totalAssets: assets.length,
    totalSize: buildMetrics.totalSize,
    totalGzipSize: buildMetrics.totalGzipSize,
    compressionRatio: buildMetrics.totalGzipSize / buildMetrics.totalSize,
    largestBundle: bundles.reduce((max, b) => b.size > max.size ? b : max, bundles[0]),
    assetsByType: groupAssetsByType(assets),
  }
}

/**
 * 按类型分组资源
 */
function groupAssetsByType(assets: any[]) {
  const groups: Record<string, any[]> = {}

  for (const asset of assets) {
    if (!groups[asset.type]) {
      groups[asset.type] = []
    }
    groups[asset.type].push(asset)
  }

  return groups
}

/**
 * 估算优化收益
 */
export function estimateSavings(
  currentSize: number,
  optimizationPercentage: number
): string {
  const savings = currentSize * (optimizationPercentage / 100)
  const { formatBytes } = require('./formatUtils')
  return formatBytes(savings)
}



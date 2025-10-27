/**
 * 性能预算检查器
 */
import type {
  BudgetConfig,
  BudgetCheckResult,
  BuildMetrics,
  RuntimeMetrics
} from '../types'
import { parseSize, formatBytes } from '../utils/formatUtils'

export class BudgetChecker {
  /**
   * 检查所有预算
   */
  check(
    budgetConfig: BudgetConfig,
    buildMetrics?: BuildMetrics,
    runtimeMetrics?: RuntimeMetrics
  ): BudgetCheckResult[] {
    const results: BudgetCheckResult[] = []

    // 检查打包文件预算
    if (budgetConfig.bundles && buildMetrics) {
      results.push(...this.checkBundleBudgets(budgetConfig.bundles, buildMetrics))
    }

    // 检查性能指标预算
    if (budgetConfig.metrics && runtimeMetrics?.webVitals) {
      results.push(...this.checkMetricsBudgets(budgetConfig.metrics, runtimeMetrics.webVitals))
    }

    return results
  }

  /**
   * 检查打包文件预算
   */
  private checkBundleBudgets(
    bundleConfigs: any[],
    buildMetrics: BuildMetrics
  ): BudgetCheckResult[] {
    const results: BudgetCheckResult[] = []

    for (const config of bundleConfigs) {
      // 查找匹配的打包文件
      const bundle = buildMetrics.bundles.find(b =>
        b.name.includes(config.name) ||
        config.name === 'main' ||
        (config.name === 'total' && b.isEntry)
      )

      if (!bundle) {
        continue
      }

      const maxSize = parseSize(config.maxSize)
      const actualSize = bundle.size
      const passed = actualSize <= maxSize
      const overagePercentage = passed ? 0 : ((actualSize - maxSize) / maxSize) * 100

      results.push({
        name: `${config.name} (${bundle.name})`,
        type: 'bundle',
        passed,
        actual: formatBytes(actualSize),
        budget: formatBytes(maxSize),
        overagePercentage: Math.round(overagePercentage),
      })

      // 检查警告阈值
      if (config.warningSize) {
        const warningSize = parseSize(config.warningSize)
        if (actualSize > warningSize && actualSize <= maxSize) {
          results.push({
            name: `${config.name} (warning)`,
            type: 'bundle',
            passed: true,
            actual: formatBytes(actualSize),
            budget: formatBytes(warningSize),
            overagePercentage: Math.round(((actualSize - warningSize) / warningSize) * 100),
          })
        }
      }
    }

    return results
  }

  /**
   * 检查性能指标预算
   */
  private checkMetricsBudgets(
    metricsBudget: any,
    webVitals: any
  ): BudgetCheckResult[] {
    const results: BudgetCheckResult[] = []

    // LCP (Largest Contentful Paint)
    if (metricsBudget.lcp !== undefined && webVitals.lcp !== undefined) {
      results.push({
        name: 'LCP (Largest Contentful Paint)',
        type: 'metric',
        passed: webVitals.lcp <= metricsBudget.lcp,
        actual: `${webVitals.lcp}ms`,
        budget: `${metricsBudget.lcp}ms`,
        overagePercentage: Math.round(
          ((webVitals.lcp - metricsBudget.lcp) / metricsBudget.lcp) * 100
        ),
      })
    }

    // FID (First Input Delay)
    if (metricsBudget.fid !== undefined && webVitals.fid !== undefined) {
      results.push({
        name: 'FID (First Input Delay)',
        type: 'metric',
        passed: webVitals.fid <= metricsBudget.fid,
        actual: `${webVitals.fid}ms`,
        budget: `${metricsBudget.fid}ms`,
        overagePercentage: Math.round(
          ((webVitals.fid - metricsBudget.fid) / metricsBudget.fid) * 100
        ),
      })
    }

    // CLS (Cumulative Layout Shift)
    if (metricsBudget.cls !== undefined && webVitals.cls !== undefined) {
      results.push({
        name: 'CLS (Cumulative Layout Shift)',
        type: 'metric',
        passed: webVitals.cls <= metricsBudget.cls,
        actual: webVitals.cls.toFixed(3),
        budget: metricsBudget.cls.toFixed(3),
        overagePercentage: Math.round(
          ((webVitals.cls - metricsBudget.cls) / metricsBudget.cls) * 100
        ),
      })
    }

    // FCP (First Contentful Paint)
    if (metricsBudget.fcp !== undefined && webVitals.fcp !== undefined) {
      results.push({
        name: 'FCP (First Contentful Paint)',
        type: 'metric',
        passed: webVitals.fcp <= metricsBudget.fcp,
        actual: `${webVitals.fcp}ms`,
        budget: `${metricsBudget.fcp}ms`,
        overagePercentage: Math.round(
          ((webVitals.fcp - metricsBudget.fcp) / metricsBudget.fcp) * 100
        ),
      })
    }

    // TTI (Time to Interactive)
    if (metricsBudget.tti !== undefined && webVitals.tti !== undefined) {
      results.push({
        name: 'TTI (Time to Interactive)',
        type: 'metric',
        passed: webVitals.tti <= metricsBudget.tti,
        actual: `${webVitals.tti}ms`,
        budget: `${metricsBudget.tti}ms`,
        overagePercentage: Math.round(
          ((webVitals.tti - metricsBudget.tti) / metricsBudget.tti) * 100
        ),
      })
    }

    // TBT (Total Blocking Time)
    if (metricsBudget.tbt !== undefined && webVitals.tbt !== undefined) {
      results.push({
        name: 'TBT (Total Blocking Time)',
        type: 'metric',
        passed: webVitals.tbt <= metricsBudget.tbt,
        actual: `${webVitals.tbt}ms`,
        budget: `${metricsBudget.tbt}ms`,
        overagePercentage: Math.round(
          ((webVitals.tbt - metricsBudget.tbt) / metricsBudget.tbt) * 100
        ),
      })
    }

    return results
  }
}



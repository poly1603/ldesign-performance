/**
 * 性能预算管理器
 */
import type {
  BudgetConfig,
  BudgetCheckResult,
  BuildMetrics,
  RuntimeMetrics
} from '../types'
import { BudgetChecker } from './BudgetChecker'

export class BudgetManager {
  private checker: BudgetChecker

  constructor() {
    this.checker = new BudgetChecker()
  }

  /**
   * 执行预算检查
   */
  check(
    config: BudgetConfig,
    buildMetrics?: BuildMetrics,
    runtimeMetrics?: RuntimeMetrics
  ): BudgetCheckResult[] {
    return this.checker.check(config, buildMetrics, runtimeMetrics)
  }

  /**
   * 检查是否全部通过
   */
  allPassed(results: BudgetCheckResult[]): boolean {
    return results.every(r => r.passed)
  }

  /**
   * 获取失败的检查
   */
  getFailures(results: BudgetCheckResult[]): BudgetCheckResult[] {
    return results.filter(r => !r.passed)
  }

  /**
   * 获取统计信息
   */
  getStats(results: BudgetCheckResult[]) {
    const total = results.length
    const passed = results.filter(r => r.passed).length
    const failed = total - passed
    const passRate = total === 0 ? 100 : (passed / total) * 100

    return {
      total,
      passed,
      failed,
      passRate: Math.round(passRate),
    }
  }

  /**
   * 生成预算报告摘要
   */
  generateSummary(results: BudgetCheckResult[]): string {
    const stats = this.getStats(results)
    const failures = this.getFailures(results)

    const lines: string[] = []
    lines.push(`Budget Check: ${stats.passed}/${stats.total} passed (${stats.passRate}%)`)

    if (failures.length > 0) {
      lines.push('\nFailed Checks:')
      for (const failure of failures) {
        const overage = failure.overagePercentage
          ? ` (+${failure.overagePercentage}%)`
          : ''
        lines.push(`  ✗ ${failure.name}: ${failure.actual} / ${failure.budget}${overage}`)
      }
    }

    return lines.join('\n')
  }
}



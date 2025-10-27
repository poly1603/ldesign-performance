/**
 * 报告辅助工具
 */
import type { PerformanceReport } from '../types'
import { formatBytes, formatDuration, formatTimestamp } from './formatUtils'

/**
 * 生成报告摘要
 */
export function generateReportSummary(report: PerformanceReport): string {
  const lines: string[] = []

  lines.push(`Performance Report - ${report.project.name}`)
  lines.push(`Generated: ${formatTimestamp(report.timestamp)}`)
  lines.push(`Score: ${report.score}/100`)
  lines.push('')

  if (report.buildMetrics) {
    lines.push('Build Metrics:')
    lines.push(`  Duration: ${formatDuration(report.buildMetrics.duration)}`)
    lines.push(`  Total Size: ${formatBytes(report.buildMetrics.totalSize)}`)
    lines.push(`  Gzip Size: ${formatBytes(report.buildMetrics.totalGzipSize)}`)
    lines.push(`  Bundles: ${report.buildMetrics.bundles.length}`)
    lines.push('')
  }

  if (report.budgetResults && report.budgetResults.length > 0) {
    const failed = report.budgetResults.filter(r => !r.passed)
    lines.push(`Budget Checks: ${report.budgetResults.length - failed.length}/${report.budgetResults.length} passed`)

    if (failed.length > 0) {
      lines.push('  Failed:')
      for (const result of failed) {
        lines.push(`    - ${result.name}: ${result.actual} (budget: ${result.budget})`)
      }
    }
    lines.push('')
  }

  if (report.suggestions.length > 0) {
    lines.push(`Optimization Suggestions: ${report.suggestions.length}`)
    const bySeverity = {
      critical: report.suggestions.filter(s => s.priority === 'critical').length,
      high: report.suggestions.filter(s => s.priority === 'high').length,
      medium: report.suggestions.filter(s => s.priority === 'medium').length,
      low: report.suggestions.filter(s => s.priority === 'low').length,
    }
    lines.push(`  Critical: ${bySeverity.critical}`)
    lines.push(`  High: ${bySeverity.high}`)
    lines.push(`  Medium: ${bySeverity.medium}`)
    lines.push(`  Low: ${bySeverity.low}`)
  }

  return lines.join('\n')
}

/**
 * 创建报告文件名
 */
export function createReportFilename(format: string, timestamp?: number): string {
  const ts = timestamp || Date.now()
  const dateStr = new Date(ts).toISOString().replace(/[:.]/g, '-').split('T')[0]
  return `performance-report-${dateStr}.${format}`
}



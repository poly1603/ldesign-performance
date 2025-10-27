/**
 * JSON 报告生成器
 */
import { join } from 'node:path'
import type { PerformanceReport } from '../types'
import { writeJsonFile } from '../utils/fileUtils'
import { createReportFilename } from '../utils/reportUtils'

export class JsonReporter {
  /**
   * 生成 JSON 报告
   */
  generate(report: PerformanceReport, outputDir: string): string {
    const filename = createReportFilename('json', report.timestamp)
    const filepath = join(outputDir, filename)

    // 格式化报告数据
    const formattedReport = this.formatReport(report)

    // 写入文件
    writeJsonFile(filepath, formattedReport)

    return filepath
  }

  /**
   * 格式化报告数据
   */
  private formatReport(report: PerformanceReport): any {
    return {
      meta: {
        version: '1.0.0',
        timestamp: report.timestamp,
        project: report.project,
        score: report.score,
      },
      buildMetrics: report.buildMetrics ? {
        duration: report.buildMetrics.duration,
        totalSize: report.buildMetrics.totalSize,
        totalGzipSize: report.buildMetrics.totalGzipSize,
        compressionRatio: report.buildMetrics.totalGzipSize / report.buildMetrics.totalSize,
        bundleCount: report.buildMetrics.bundles.length,
        assetCount: report.buildMetrics.assets.length,
        bundles: report.buildMetrics.bundles.map(b => ({
          name: b.name,
          size: b.size,
          gzipSize: b.gzipSize,
          path: b.path,
          isEntry: b.isEntry,
        })),
        assets: report.buildMetrics.assets.map(a => ({
          name: a.name,
          type: a.type,
          size: a.size,
          path: a.path,
        })),
      } : undefined,
      runtimeMetrics: report.runtimeMetrics,
      budgetResults: report.budgetResults ? {
        summary: {
          total: report.budgetResults.length,
          passed: report.budgetResults.filter(r => r.passed).length,
          failed: report.budgetResults.filter(r => !r.passed).length,
        },
        results: report.budgetResults,
      } : undefined,
      suggestions: {
        total: report.suggestions.length,
        bySeverity: {
          critical: report.suggestions.filter(s => s.priority === 'critical').length,
          high: report.suggestions.filter(s => s.priority === 'high').length,
          medium: report.suggestions.filter(s => s.priority === 'medium').length,
          low: report.suggestions.filter(s => s.priority === 'low').length,
        },
        items: report.suggestions,
      },
    }
  }
}



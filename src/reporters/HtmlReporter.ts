/**
 * HTML 报告生成器
 */
import { join } from 'node:path'
import type { PerformanceReport } from '../types'
import { writeTextFile } from '../utils/fileUtils'
import { createReportFilename } from '../utils/reportUtils'
import { formatBytes, formatDuration, formatTimestamp } from '../utils/formatUtils'

export class HtmlReporter {
  /**
   * 生成 HTML 报告
   */
  generate(report: PerformanceReport, outputDir: string): string {
    const filename = createReportFilename('html', report.timestamp)
    const filepath = join(outputDir, filename)

    const html = this.generateHtml(report)
    writeTextFile(filepath, html)

    return filepath
  }

  /**
   * 生成 HTML 内容
   */
  private generateHtml(report: PerformanceReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Report - ${report.project.name}</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  <div class="container">
    ${this.renderHeader(report)}
    ${this.renderBuildMetrics(report)}
    ${this.renderBudgetResults(report)}
    ${this.renderSuggestions(report)}
    ${this.renderFooter(report)}
  </div>
</body>
</html>`
  }

  /**
   * 获取样式
   */
  private getStyles(): string {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        background: #f5f5f5;
        color: #333;
        line-height: 1.6;
      }
      .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .header { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px;
        border-radius: 10px;
        margin-bottom: 30px;
      }
      .header h1 { font-size: 2.5em; margin-bottom: 10px; }
      .score { font-size: 3em; font-weight: bold; margin: 20px 0; }
      .score.excellent { color: #4ade80; }
      .score.good { color: #fbbf24; }
      .score.fair { color: #fb923c; }
      .score.poor { color: #f87171; }
      .section { 
        background: white;
        padding: 30px;
        margin-bottom: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .section h2 { 
        font-size: 1.8em;
        margin-bottom: 20px;
        color: #667eea;
        border-bottom: 2px solid #667eea;
        padding-bottom: 10px;
      }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
      th { background: #f9fafb; font-weight: 600; color: #374151; }
      tr:hover { background: #f9fafb; }
      .badge { 
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: 600;
      }
      .badge.pass { background: #d1fae5; color: #065f46; }
      .badge.fail { background: #fee2e2; color: #991b1b; }
      .badge.critical { background: #fee2e2; color: #991b1b; }
      .badge.high { background: #fed7aa; color: #92400e; }
      .badge.medium { background: #fef3c7; color: #78350f; }
      .badge.low { background: #e0e7ff; color: #3730a3; }
      .suggestion { 
        padding: 20px;
        margin: 15px 0;
        border-left: 4px solid #667eea;
        background: #f9fafb;
        border-radius: 4px;
      }
      .suggestion h3 { margin-bottom: 10px; color: #1f2937; }
      .suggestion p { margin: 8px 0; color: #6b7280; }
      .suggestion ul { margin: 10px 0 0 20px; color: #6b7280; }
      .suggestion li { margin: 5px 0; }
      .savings { color: #059669; font-weight: 600; }
      .footer { text-align: center; color: #6b7280; margin-top: 40px; padding: 20px; }
    `
  }

  /**
   * 渲染报告头部
   */
  private renderHeader(report: PerformanceReport): string {
    const grade = this.getScoreClass(report.score)
    return `
      <div class="header">
        <h1>📊 Performance Report</h1>
        <p>${report.project.name} ${report.project.version || ''}</p>
        <div class="score ${grade}">${report.score}/100</div>
        <p>Grade: ${this.getGradeText(report.score)}</p>
      </div>
    `
  }

  /**
   * 渲染构建指标
   */
  private renderBuildMetrics(report: PerformanceReport): string {
    if (!report.buildMetrics) return ''

    const { buildMetrics } = report
    const compressionRatio = ((buildMetrics.totalGzipSize / buildMetrics.totalSize) * 100).toFixed(1)

    let bundleRows = ''
    for (const bundle of buildMetrics.bundles.slice(0, 10)) {
      bundleRows += `
        <tr>
          <td>${bundle.name}</td>
          <td>${formatBytes(bundle.size)}</td>
          <td>${formatBytes(bundle.gzipSize)}</td>
          <td>${bundle.isEntry ? '✓' : ''}</td>
        </tr>
      `
    }

    return `
      <div class="section">
        <h2>📦 Build Metrics</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr><td>Build Duration</td><td>${formatDuration(buildMetrics.duration)}</td></tr>
          <tr><td>Total Size</td><td>${formatBytes(buildMetrics.totalSize)}</td></tr>
          <tr><td>Gzip Size</td><td>${formatBytes(buildMetrics.totalGzipSize)}</td></tr>
          <tr><td>Compression Ratio</td><td>${compressionRatio}%</td></tr>
          <tr><td>Bundle Count</td><td>${buildMetrics.bundles.length}</td></tr>
          <tr><td>Asset Count</td><td>${buildMetrics.assets.length}</td></tr>
        </table>

        <h3>Largest Bundles</h3>
        <table>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Gzip</th>
            <th>Entry</th>
          </tr>
          ${bundleRows}
        </table>
      </div>
    `
  }

  /**
   * 渲染预算检查结果
   */
  private renderBudgetResults(report: PerformanceReport): string {
    if (!report.budgetResults || report.budgetResults.length === 0) return ''

    const passed = report.budgetResults.filter(r => r.passed).length
    const total = report.budgetResults.length

    let resultRows = ''
    for (const result of report.budgetResults) {
      const statusBadge = result.passed
        ? '<span class="badge pass">✓ Pass</span>'
        : '<span class="badge fail">✗ Fail</span>'

      const overage = result.overagePercentage && result.overagePercentage > 0
        ? `+${result.overagePercentage}%`
        : '-'

      resultRows += `
        <tr>
          <td>${result.name}</td>
          <td>${statusBadge}</td>
          <td>${result.actual}</td>
          <td>${result.budget}</td>
          <td>${overage}</td>
        </tr>
      `
    }

    return `
      <div class="section">
        <h2>💰 Budget Check Results</h2>
        <p><strong>${passed}/${total}</strong> checks passed</p>
        <table>
          <tr>
            <th>Check</th>
            <th>Status</th>
            <th>Actual</th>
            <th>Budget</th>
            <th>Overage</th>
          </tr>
          ${resultRows}
        </table>
      </div>
    `
  }

  /**
   * 渲染优化建议
   */
  private renderSuggestions(report: PerformanceReport): string {
    if (report.suggestions.length === 0) {
      return `
        <div class="section">
          <h2>💡 Optimization Suggestions</h2>
          <p>✨ No optimization suggestions - Great job!</p>
        </div>
      `
    }

    let suggestionsHtml = ''
    for (const suggestion of report.suggestions) {
      const badge = `<span class="badge ${suggestion.priority}">${suggestion.priority.toUpperCase()}</span>`

      let implementationHtml = ''
      if (suggestion.implementation && suggestion.implementation.length > 0) {
        implementationHtml = '<ul>'
        for (const step of suggestion.implementation) {
          implementationHtml += `<li>${step}</li>`
        }
        implementationHtml += '</ul>'
      }

      const savingsHtml = suggestion.estimatedSavings
        ? `<p class="savings">💾 Estimated savings: ${suggestion.estimatedSavings}</p>`
        : ''

      suggestionsHtml += `
        <div class="suggestion">
          <h3>${badge} ${suggestion.title}</h3>
          <p>${suggestion.description}</p>
          <p><strong>Impact:</strong> ${suggestion.impact}</p>
          ${savingsHtml}
          ${implementationHtml}
        </div>
      `
    }

    return `
      <div class="section">
        <h2>💡 Optimization Suggestions (${report.suggestions.length})</h2>
        ${suggestionsHtml}
      </div>
    `
  }

  /**
   * 渲染页脚
   */
  private renderFooter(report: PerformanceReport): string {
    return `
      <div class="footer">
        <p>Generated by @ldesign/performance</p>
        <p>${formatTimestamp(report.timestamp)}</p>
      </div>
    `
  }

  /**
   * 获取分数等级类名
   */
  private getScoreClass(score: number): string {
    if (score >= 90) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
  }

  /**
   * 获取分数等级文本
   */
  private getGradeText(score: number): string {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Poor'
  }
}



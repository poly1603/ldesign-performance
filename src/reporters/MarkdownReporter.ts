/**
 * Markdown 报告生成器
 */
import { join } from 'node:path'
import type { PerformanceReport } from '../types'
import { writeTextFile } from '../utils/fileUtils'
import { createReportFilename } from '../utils/reportUtils'
import { formatBytes, formatDuration, formatTimestamp } from '../utils/formatUtils'

export class MarkdownReporter {
  /**
   * 生成 Markdown 报告
   */
  generate(report: PerformanceReport, outputDir: string): string {
    const filename = createReportFilename('md', report.timestamp)
    const filepath = join(outputDir, filename)

    const markdown = this.generateMarkdown(report)
    writeTextFile(filepath, markdown)

    return filepath
  }

  /**
   * 生成 Markdown 内容
   */
  private generateMarkdown(report: PerformanceReport): string {
    const sections: string[] = []

    sections.push(this.renderHeader(report))
    sections.push(this.renderBuildMetrics(report))
    sections.push(this.renderBudgetResults(report))
    sections.push(this.renderSuggestions(report))
    sections.push(this.renderFooter(report))

    return sections.join('\n\n')
  }

  /**
   * 渲染报告头部
   */
  private renderHeader(report: PerformanceReport): string {
    const emoji = this.getScoreEmoji(report.score)
    return `# 📊 Performance Report

**Project:** ${report.project.name} ${report.project.version || ''}  
**Score:** ${emoji} **${report.score}/100** (${this.getGradeText(report.score)})  
**Generated:** ${formatTimestamp(report.timestamp)}

---`
  }

  /**
   * 渲染构建指标
   */
  private renderBuildMetrics(report: PerformanceReport): string {
    if (!report.buildMetrics) return ''

    const { buildMetrics } = report
    const compressionRatio = ((buildMetrics.totalGzipSize / buildMetrics.totalSize) * 100).toFixed(1)

    let md = `## 📦 Build Metrics

| Metric | Value |
|--------|-------|
| Build Duration | ${formatDuration(buildMetrics.duration)} |
| Total Size | ${formatBytes(buildMetrics.totalSize)} |
| Gzip Size | ${formatBytes(buildMetrics.totalGzipSize)} |
| Compression Ratio | ${compressionRatio}% |
| Bundle Count | ${buildMetrics.bundles.length} |
| Asset Count | ${buildMetrics.assets.length} |

### Largest Bundles

| Name | Size | Gzip | Entry |
|------|------|------|-------|
`

    const topBundles = buildMetrics.bundles.slice(0, 10)
    for (const bundle of topBundles) {
      const entry = bundle.isEntry ? '✓' : ''
      md += `| ${bundle.name} | ${formatBytes(bundle.size)} | ${formatBytes(bundle.gzipSize)} | ${entry} |\n`
    }

    return md
  }

  /**
   * 渲染预算检查结果
   */
  private renderBudgetResults(report: PerformanceReport): string {
    if (!report.budgetResults || report.budgetResults.length === 0) return ''

    const passed = report.budgetResults.filter(r => r.passed).length
    const total = report.budgetResults.length

    let md = `## 💰 Budget Check Results

**${passed}/${total}** checks passed

| Check | Status | Actual | Budget | Overage |
|-------|--------|--------|--------|---------|
`

    for (const result of report.budgetResults) {
      const status = result.passed ? '✓ Pass' : '✗ Fail'
      const overage = result.overagePercentage && result.overagePercentage > 0
        ? `+${result.overagePercentage}%`
        : '-'

      md += `| ${result.name} | ${status} | ${result.actual} | ${result.budget} | ${overage} |\n`
    }

    return md
  }

  /**
   * 渲染优化建议
   */
  private renderSuggestions(report: PerformanceReport): string {
    if (report.suggestions.length === 0) {
      return `## 💡 Optimization Suggestions

✨ No optimization suggestions - Great job!`
    }

    let md = `## 💡 Optimization Suggestions (${report.suggestions.length})

`

    const byPriority = {
      critical: report.suggestions.filter(s => s.priority === 'critical'),
      high: report.suggestions.filter(s => s.priority === 'high'),
      medium: report.suggestions.filter(s => s.priority === 'medium'),
      low: report.suggestions.filter(s => s.priority === 'low'),
    }

    if (byPriority.critical.length > 0) {
      md += this.renderSuggestionsByPriority('🔴 Critical', byPriority.critical)
    }
    if (byPriority.high.length > 0) {
      md += this.renderSuggestionsByPriority('🟠 High', byPriority.high)
    }
    if (byPriority.medium.length > 0) {
      md += this.renderSuggestionsByPriority('🟡 Medium', byPriority.medium)
    }
    if (byPriority.low.length > 0) {
      md += this.renderSuggestionsByPriority('🟢 Low', byPriority.low)
    }

    return md
  }

  /**
   * 渲染特定优先级的建议
   */
  private renderSuggestionsByPriority(title: string, suggestions: any[]): string {
    let md = `\n### ${title} Priority (${suggestions.length})\n\n`

    for (const suggestion of suggestions) {
      md += `#### ${suggestion.title}\n\n`
      md += `${suggestion.description}\n\n`
      md += `**Impact:** ${suggestion.impact}\n\n`

      if (suggestion.estimatedSavings) {
        md += `**💾 Estimated Savings:** ${suggestion.estimatedSavings}\n\n`
      }

      if (suggestion.implementation && suggestion.implementation.length > 0) {
        md += `**Implementation:**\n\n`
        for (const step of suggestion.implementation) {
          md += `- ${step}\n`
        }
        md += '\n'
      }
    }

    return md
  }

  /**
   * 渲染页脚
   */
  private renderFooter(report: PerformanceReport): string {
    return `---

*Generated by @ldesign/performance*`
  }

  /**
   * 获取分数表情
   */
  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🟢'
    if (score >= 70) return '🟡'
    if (score >= 50) return '🟠'
    return '🔴'
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



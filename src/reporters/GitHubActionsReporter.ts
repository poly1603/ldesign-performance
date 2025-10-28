/**
 * GitHub Actions Reporter
 */
import type { PerformanceReport } from '../types'
import { formatBytes, formatDuration } from '../utils/formatUtils'

export class GitHubActionsReporter {
  /**
   * 生成 GitHub Actions 输出
   */
  generate(report: PerformanceReport): void {
    console.log('::group::📊 Performance Report')
    
    // 输出核心指标
    this.outputSummary(report)
    
    // 输出预算检查结果
    if (report.budgetResults && report.budgetResults.length > 0) {
      this.outputBudgetResults(report)
    }
    
    // 输出优化建议
    if (report.suggestions.length > 0) {
      this.outputSuggestions(report)
    }
    
    console.log('::endgroup::')
    
    // 设置输出变量
    this.setOutputs(report)
    
    // 如果有失败的预算检查，设置错误状态
    const hasFailures = report.budgetResults?.some(r => !r.passed)
    if (hasFailures) {
      console.log('::error::Performance budget exceeded!')
    }
  }

  /**
   * 输出摘要信息
   */
  private outputSummary(report: PerformanceReport): void {
    console.log('\n## Summary\n')
    console.log(`**Performance Score**: ${report.score}/100`)
    
    if (report.buildMetrics) {
      const { buildMetrics } = report
      console.log(`**Build Duration**: ${formatDuration(buildMetrics.duration)}`)
      console.log(`**Total Size**: ${formatBytes(buildMetrics.totalSize)}`)
      console.log(`**Gzip Size**: ${formatBytes(buildMetrics.totalGzipSize)}`)
      console.log(`**Bundles**: ${buildMetrics.bundles.length}`)
      console.log(`**Assets**: ${buildMetrics.assets.length}`)
    }
  }

  /**
   * 输出预算检查结果
   */
  private outputBudgetResults(report: PerformanceReport): void {
    console.log('\n## Budget Check Results\n')
    
    const passed = report.budgetResults!.filter(r => r.passed).length
    const total = report.budgetResults!.length
    
    if (passed === total) {
      console.log(`::notice::✅ All ${total} budget checks passed`)
    } else {
      console.log(`::warning::⚠️ ${total - passed} of ${total} budget checks failed`)
    }
    
    for (const result of report.budgetResults!) {
      const icon = result.passed ? '✅' : '❌'
      const status = result.passed ? 'PASS' : 'FAIL'
      
      if (!result.passed) {
        console.log(`::error::${icon} [${status}] ${result.name}: ${result.actual} (budget: ${result.budget})`)
      } else {
        console.log(`${icon} [${status}] ${result.name}: ${result.actual} (budget: ${result.budget})`)
      }
    }
  }

  /**
   * 输出优化建议
   */
  private outputSuggestions(report: PerformanceReport): void {
    const criticalSuggestions = report.suggestions.filter(s => s.priority === 'critical')
    const highSuggestions = report.suggestions.filter(s => s.priority === 'high')
    
    if (criticalSuggestions.length > 0) {
      console.log('\n## 🔴 Critical Issues\n')
      for (const suggestion of criticalSuggestions) {
        console.log(`::error::${suggestion.title}: ${suggestion.description}`)
      }
    }
    
    if (highSuggestions.length > 0) {
      console.log('\n## 🟡 High Priority Suggestions\n')
      for (const suggestion of highSuggestions) {
        console.log(`::warning::${suggestion.title}: ${suggestion.description}`)
      }
    }
    
    if (report.suggestions.length > (criticalSuggestions.length + highSuggestions.length)) {
      console.log(`\n_+${report.suggestions.length - criticalSuggestions.length - highSuggestions.length} more suggestions available in full report_`)
    }
  }

  /**
   * 设置 GitHub Actions 输出变量
   */
  private setOutputs(report: PerformanceReport): void {
    // 设置输出变量供后续步骤使用
    console.log(`::set-output name=score::${report.score}`)
    
    if (report.buildMetrics) {
      console.log(`::set-output name=total_size::${report.buildMetrics.totalSize}`)
      console.log(`::set-output name=gzip_size::${report.buildMetrics.totalGzipSize}`)
      console.log(`::set-output name=duration::${report.buildMetrics.duration}`)
    }
    
    const budgetPassed = !report.budgetResults?.some(r => !r.passed)
    console.log(`::set-output name=budget_passed::${budgetPassed}`)
  }

  /**
   * 生成 PR 评论内容
   */
  generatePRComment(report: PerformanceReport, previousReport?: PerformanceReport): string {
    const lines: string[] = []
    
    lines.push('## 📊 Performance Report')
    lines.push('')
    
    // 评分
    const scoreEmoji = this.getScoreEmoji(report.score)
    lines.push(`### ${scoreEmoji} Performance Score: ${report.score}/100`)
    
    if (previousReport) {
      const scoreDiff = report.score - previousReport.score
      if (scoreDiff > 0) {
        lines.push(`_Improved by ${scoreDiff} points_  ✅`)
      } else if (scoreDiff < 0) {
        lines.push(`_Decreased by ${Math.abs(scoreDiff)} points_  ⚠️`)
      }
    }
    
    lines.push('')
    
    // 构建指标
    if (report.buildMetrics) {
      lines.push('### 📦 Build Metrics')
      lines.push('')
      lines.push('| Metric | Value |')
      lines.push('|--------|-------|')
      lines.push(`| Build Duration | ${formatDuration(report.buildMetrics.duration)} |`)
      lines.push(`| Total Size | ${formatBytes(report.buildMetrics.totalSize)} |`)
      lines.push(`| Gzip Size | ${formatBytes(report.buildMetrics.totalGzipSize)} |`)
      lines.push(`| Bundles | ${report.buildMetrics.bundles.length} |`)
      lines.push(`| Assets | ${report.buildMetrics.assets.length} |`)
      lines.push('')
      
      // 与之前的对比
      if (previousReport?.buildMetrics) {
        const sizeDiff = report.buildMetrics.totalSize - previousReport.buildMetrics.totalSize
        const sizePercent = (sizeDiff / previousReport.buildMetrics.totalSize * 100).toFixed(1)
        
        if (Math.abs(sizeDiff) > 1024) {
          const icon = sizeDiff > 0 ? '📈' : '📉'
          lines.push(`${icon} Size changed by ${formatBytes(Math.abs(sizeDiff))} (${sizePercent}%)`)
          lines.push('')
        }
      }
    }
    
    // 预算检查
    if (report.budgetResults && report.budgetResults.length > 0) {
      const failed = report.budgetResults.filter(r => !r.passed)
      
      if (failed.length > 0) {
        lines.push('### ⚠️ Budget Checks Failed')
        lines.push('')
        lines.push('| Check | Actual | Budget | Over |')
        lines.push('|-------|--------|--------|------|')
        
        for (const result of failed) {
          const overage = result.overagePercentage ? `+${result.overagePercentage.toFixed(1)}%` : '-'
          lines.push(`| ${result.name} | ${result.actual} | ${result.budget} | ${overage} |`)
        }
        lines.push('')
      } else {
        lines.push('### ✅ All Budget Checks Passed')
        lines.push('')
      }
    }
    
    // 关键建议
    const critical = report.suggestions.filter(s => s.priority === 'critical')
    const high = report.suggestions.filter(s => s.priority === 'high')
    
    if (critical.length > 0 || high.length > 0) {
      lines.push('### 💡 Optimization Suggestions')
      lines.push('')
      
      if (critical.length > 0) {
        lines.push('**Critical:**')
        for (const s of critical) {
          lines.push(`- 🔴 ${s.title}`)
        }
        lines.push('')
      }
      
      if (high.length > 0) {
        lines.push('**High Priority:**')
        for (const s of high.slice(0, 3)) {
          lines.push(`- 🟡 ${s.title}`)
        }
        if (high.length > 3) {
          lines.push(`- _...and ${high.length - 3} more_`)
        }
        lines.push('')
      }
    }
    
    lines.push('---')
    lines.push('_Generated by @ldesign/performance_')
    
    return lines.join('\n')
  }

  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🟢'
    if (score >= 75) return '🟡'
    if (score >= 50) return '🟠'
    return '🔴'
  }
}


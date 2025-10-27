/**
 * CLI 报告生成器
 */
import Table from 'cli-table3'
import chalk from 'chalk'
import boxen from 'boxen'
import type { PerformanceReport } from '../types'
import { formatBytes, formatDuration, colorizeScore, getScoreGrade } from '../utils/formatUtils'

export class CliReporter {
  /**
   * 生成并打印 CLI 报告
   */
  generate(report: PerformanceReport): void {
    console.log('\n')
    this.printHeader(report)
    this.printBuildMetrics(report)
    this.printBudgetResults(report)
    this.printSuggestions(report)
    this.printFooter(report)
  }

  /**
   * 打印报告头部
   */
  private printHeader(report: PerformanceReport): void {
    const title = chalk.bold.cyan(`📊 Performance Report - ${report.project.name}`)
    const score = `${colorizeScore(report.score)} Score: ${chalk.bold(report.score)}/100 (${getScoreGrade(report.score)})`

    console.log(boxen(`${title}\n\n${score}`, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
    }))
  }

  /**
   * 打印构建指标
   */
  private printBuildMetrics(report: PerformanceReport): void {
    if (!report.buildMetrics) return

    const { buildMetrics } = report

    console.log(chalk.bold.yellow('\n📦 Build Metrics\n'))

    const table = new Table({
      head: ['Metric', 'Value'],
      colWidths: [30, 50],
    })

    table.push(
      ['Build Duration', formatDuration(buildMetrics.duration)],
      ['Total Size', formatBytes(buildMetrics.totalSize)],
      ['Gzip Size', formatBytes(buildMetrics.totalGzipSize)],
      ['Compression Ratio', `${((buildMetrics.totalGzipSize / buildMetrics.totalSize) * 100).toFixed(1)}%`],
      ['Bundle Count', buildMetrics.bundles.length.toString()],
      ['Asset Count', buildMetrics.assets.length.toString()]
    )

    console.log(table.toString())

    // 打印最大的几个文件
    if (buildMetrics.bundles.length > 0) {
      console.log(chalk.bold.yellow('\n📄 Largest Bundles\n'))

      const bundleTable = new Table({
        head: ['Name', 'Size', 'Gzip', 'Entry'],
        colWidths: [40, 15, 15, 10],
      })

      const topBundles = buildMetrics.bundles.slice(0, 5)
      for (const bundle of topBundles) {
        bundleTable.push([
          bundle.name,
          formatBytes(bundle.size),
          formatBytes(bundle.gzipSize),
          bundle.isEntry ? '✓' : '',
        ])
      }

      console.log(bundleTable.toString())
    }
  }

  /**
   * 打印预算检查结果
   */
  private printBudgetResults(report: PerformanceReport): void {
    if (!report.budgetResults || report.budgetResults.length === 0) return

    console.log(chalk.bold.yellow('\n💰 Budget Check Results\n'))

    const passed = report.budgetResults.filter(r => r.passed).length
    const total = report.budgetResults.length
    const summary = `${passed}/${total} checks passed`

    console.log(chalk.bold(summary) + '\n')

    const table = new Table({
      head: ['Check', 'Status', 'Actual', 'Budget', 'Overage'],
      colWidths: [30, 10, 15, 15, 12],
    })

    for (const result of report.budgetResults) {
      const status = result.passed
        ? chalk.green('✓ Pass')
        : chalk.red('✗ Fail')

      const overage = result.overagePercentage && result.overagePercentage > 0
        ? `+${result.overagePercentage}%`
        : '-'

      table.push([
        result.name,
        status,
        result.actual.toString(),
        result.budget.toString(),
        overage,
      ])
    }

    console.log(table.toString())
  }

  /**
   * 打印优化建议
   */
  private printSuggestions(report: PerformanceReport): void {
    if (report.suggestions.length === 0) {
      console.log(chalk.bold.green('\n✨ No optimization suggestions - Great job!\n'))
      return
    }

    console.log(chalk.bold.yellow('\n💡 Optimization Suggestions\n'))

    const bySeverity = {
      critical: report.suggestions.filter(s => s.priority === 'critical'),
      high: report.suggestions.filter(s => s.priority === 'high'),
      medium: report.suggestions.filter(s => s.priority === 'medium'),
      low: report.suggestions.filter(s => s.priority === 'low'),
    }

    // 打印每个优先级的建议
    if (bySeverity.critical.length > 0) {
      this.printSuggestionsByPriority('🔴 Critical', bySeverity.critical, chalk.red)
    }
    if (bySeverity.high.length > 0) {
      this.printSuggestionsByPriority('🟠 High', bySeverity.high, chalk.yellow)
    }
    if (bySeverity.medium.length > 0) {
      this.printSuggestionsByPriority('🟡 Medium', bySeverity.medium, chalk.blue)
    }
    if (bySeverity.low.length > 0) {
      this.printSuggestionsByPriority('🟢 Low', bySeverity.low, chalk.gray)
    }
  }

  /**
   * 打印特定优先级的建议
   */
  private printSuggestionsByPriority(
    title: string,
    suggestions: any[],
    colorFn: any
  ): void {
    console.log(colorFn.bold(`\n${title} Priority (${suggestions.length})\n`))

    for (const suggestion of suggestions) {
      console.log(colorFn(`● ${suggestion.title}`))
      console.log(`  ${suggestion.description}`)

      if (suggestion.estimatedSavings) {
        console.log(chalk.green(`  💾 Est. savings: ${suggestion.estimatedSavings}`))
      }

      if (suggestion.implementation && suggestion.implementation.length > 0) {
        console.log(chalk.dim('  Implementation:'))
        for (const step of suggestion.implementation) {
          console.log(chalk.dim(`    - ${step}`))
        }
      }
      console.log()
    }
  }

  /**
   * 打印页脚
   */
  private printFooter(report: PerformanceReport): void {
    const timestamp = new Date(report.timestamp).toLocaleString()
    console.log(chalk.dim(`\n📅 Generated at ${timestamp}\n`))
  }
}



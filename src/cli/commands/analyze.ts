/**
 * analyze 命令 - 分析构建产物
 */
import { resolve } from 'node:path'
import ora from 'ora'
import chalk from 'chalk'
import { ConfigLoader } from '../../config'
import { MetricsCollector } from '../../metrics'
import { OptimizationEngine } from '../../optimizer'
import { BudgetManager } from '../../budget'
import { CliReporter, HtmlReporter, JsonReporter, MarkdownReporter } from '../../reporters'
import { calculatePerformanceScore } from '../../utils/metricsUtils'
import { ensureDir } from '../../utils/fileUtils'
import type { PerformanceReport } from '../../types'

export interface AnalyzeOptions {
  dir?: string
  config?: string
  output?: string
  format?: string[]
  verbose?: boolean
}

export async function analyze(options: AnalyzeOptions = {}) {
  const cwd = process.cwd()
  const buildDir = resolve(cwd, options.dir || 'dist')

  const spinner = ora('Loading configuration...').start()

  try {
    // 加载配置
    const config = await ConfigLoader.load(cwd)
    const projectInfo = await ConfigLoader.loadProjectInfo(cwd)
    spinner.succeed('Configuration loaded')

    // 收集构建指标
    spinner.start('Analyzing build artifacts...')
    const collector = new MetricsCollector()
    const buildMetrics = await collector.endBuildMetrics(buildDir, cwd)
    spinner.succeed(`Found ${buildMetrics.bundles.length} bundles and ${buildMetrics.assets.length} assets`)

    // 生成优化建议
    spinner.start('Generating optimization suggestions...')
    const optimizer = new OptimizationEngine()
    const suggestions = optimizer.generateSuggestions(buildMetrics)
    spinner.succeed(`Generated ${suggestions.length} optimization suggestions`)

    // 检查预算
    spinner.start('Checking performance budgets...')
    const budgetManager = new BudgetManager()
    const budgetResults = config.budgets
      ? budgetManager.check(config.budgets, buildMetrics)
      : []

    if (budgetResults.length > 0) {
      const stats = budgetManager.getStats(budgetResults)
      if (stats.failed > 0) {
        spinner.warn(`Budget check: ${stats.passed}/${stats.total} passed`)
      } else {
        spinner.succeed(`Budget check: ${stats.passed}/${stats.total} passed`)
      }
    } else {
      spinner.info('No budget checks configured')
    }

    // 计算分数
    const score = calculatePerformanceScore(buildMetrics, budgetResults, suggestions)

    // 生成报告
    const report: PerformanceReport = {
      timestamp: Date.now(),
      project: projectInfo,
      buildMetrics,
      budgetResults,
      suggestions,
      score,
    }

    // 输出报告
    console.log('')
    const cliReporter = new CliReporter()
    cliReporter.generate(report)

    // 生成文件报告
    const outputDir = resolve(cwd, options.output || config.analyze?.outputDir || '.performance')
    ensureDir(outputDir)

    const formats = options.format || config.analyze?.formats || ['html', 'json']

    for (const format of formats) {
      spinner.start(`Generating ${format.toUpperCase()} report...`)

      let filepath = ''
      switch (format) {
        case 'html':
          filepath = new HtmlReporter().generate(report, outputDir)
          break
        case 'json':
          filepath = new JsonReporter().generate(report, outputDir)
          break
        case 'markdown':
        case 'md':
          filepath = new MarkdownReporter().generate(report, outputDir)
          break
      }

      if (filepath) {
        spinner.succeed(`${format.toUpperCase()} report saved to ${chalk.cyan(filepath)}`)
      }
    }

    // 退出码
    const hasFailures = budgetResults.some(r => !r.passed)
    const hasCritical = suggestions.some(s => s.priority === 'critical')

    if (hasFailures || hasCritical) {
      console.log(chalk.yellow('\n⚠️  Performance issues detected'))
      process.exit(1)
    } else {
      console.log(chalk.green('\n✨ Analysis complete!'))
    }

  } catch (error) {
    spinner.fail('Analysis failed')
    console.error(chalk.red('\nError:'), error)
    process.exit(1)
  }
}



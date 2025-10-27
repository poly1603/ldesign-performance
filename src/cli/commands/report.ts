/**
 * report 命令 - 生成综合性能报告
 */
import { resolve } from 'node:path'
import ora from 'ora'
import chalk from 'chalk'
import { readJsonFile } from '../../utils/fileUtils'
import { CliReporter, HtmlReporter } from '../../reporters'
import type { PerformanceReport } from '../../types'

export interface ReportOptions {
  input?: string
  output?: string
  format?: string
}

export async function report(options: ReportOptions = {}) {
  const spinner = ora('Loading report data...').start()

  try {
    const cwd = process.cwd()
    const inputPath = resolve(cwd, options.input || '.performance/performance-report-*.json')

    // 读取报告数据
    const reportData = readJsonFile<PerformanceReport>(inputPath)

    if (!reportData) {
      spinner.fail('No report data found')
      console.log(chalk.yellow('\nPlease run the analyze command first to generate report data.'))
      process.exit(1)
    }

    spinner.succeed('Report data loaded')

    // 生成报告
    const format = options.format || 'cli'

    if (format === 'cli') {
      console.log('')
      const cliReporter = new CliReporter()
      cliReporter.generate(reportData)
    } else if (format === 'html') {
      const outputDir = resolve(cwd, options.output || '.performance')
      const htmlReporter = new HtmlReporter()
      const filepath = htmlReporter.generate(reportData, outputDir)
      console.log(chalk.green(`\n✨ HTML report generated: ${chalk.cyan(filepath)}\n`))
    }

  } catch (error) {
    spinner.fail('Report generation failed')
    console.error(chalk.red('\nError:'), error)
    process.exit(1)
  }
}



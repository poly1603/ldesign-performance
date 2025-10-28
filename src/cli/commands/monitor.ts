/**
 * monitor 命令 - 监控运行时性能
 */
import chalk from 'chalk'
import ora from 'ora'
import { RuntimeMonitor } from '../../monitor'
import { CliReporter, JsonReporter } from '../../reporters'
import type { PerformanceReport } from '../../types'

export interface MonitorOptions {
  url?: string
  output?: string
  verbose?: boolean
}

export async function monitor(options: MonitorOptions = {}) {
  if (!options.url) {
    console.error(chalk.red('\n❌  Error: URL is required'))
    console.log(chalk.dim('Usage: ldesign-performance monitor --url <url>\n'))
    process.exit(1)
  }

  const spinner = ora('Starting runtime monitoring...').start()

  try {
    const monitor = new RuntimeMonitor()
    
    // 收集 Web Vitals
    spinner.text = 'Collecting Web Vitals...'
    const webVitals = await monitor.collectWebVitals(options.url)
    
    if (options.verbose) {
      spinner.succeed('Web Vitals collected')
      console.log(chalk.dim(JSON.stringify(webVitals, null, 2)))
      spinner.start('Running Lighthouse audit...')
    } else {
      spinner.text = 'Running Lighthouse audit...'
    }
    
    // 运行 Lighthouse
    const lighthouseResult = await monitor.runLighthouse(options.url)
    
    // 收集完整的运行时指标
    spinner.text = 'Collecting runtime metrics...'
    const runtimeMetrics = await monitor.collectRuntimeMetrics(options.url)
    
    spinner.succeed('Monitoring completed!')
    
    // 生成报告
    const report: PerformanceReport = {
      timestamp: Date.now(),
      project: {
        name: new URL(options.url).hostname,
        path: options.url,
      },
      runtimeMetrics,
      suggestions: [],
      score: lighthouseResult.performanceScore,
    }
    
    // 输出报告
    console.log('\n')
    const cliReporter = new CliReporter()
    cliReporter.generate(report, '')
    
    // 保存 JSON 报告
    if (options.output) {
      const jsonReporter = new JsonReporter()
      const filepath = jsonReporter.generate(report, options.output)
      console.log(chalk.green(`\n✓ Report saved to: ${filepath}`))
    }
    
    console.log(chalk.dim('\n⚠️  Note: Full Lighthouse and Web Vitals integration requires additional dependencies:'))
    console.log(chalk.dim('  - lighthouse'))
    console.log(chalk.dim('  - chrome-launcher'))
    console.log(chalk.dim('  - puppeteer or playwright\n'))
    
  } catch (error) {
    spinner.fail('Monitoring failed')
    console.error(chalk.red('\n❌  Error:'), error)
    process.exit(1)
  }
}


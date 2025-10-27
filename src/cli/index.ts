/**
 * CLI 主入口
 */
import { Command } from 'commander'
import chalk from 'chalk'
import { analyze } from './commands/analyze'
import { monitor } from './commands/monitor'
import { report } from './commands/report'

const program = new Command()

program
  .name('ldesign-performance')
  .description('🚀 LDesign Performance Optimization Tool')
  .version('0.1.0')

// analyze 命令
program
  .command('analyze')
  .description('Analyze build artifacts and generate performance report')
  .option('-d, --dir <directory>', 'Build output directory', 'dist')
  .option('-c, --config <path>', 'Path to config file')
  .option('-o, --output <directory>', 'Report output directory', '.performance')
  .option('-f, --format <formats...>', 'Report formats (html, json, markdown)', ['html', 'json'])
  .option('-v, --verbose', 'Verbose output', false)
  .action(analyze)

// monitor 命令
program
  .command('monitor')
  .description('Monitor runtime performance')
  .option('-u, --url <url>', 'URL to monitor')
  .option('-o, --output <directory>', 'Report output directory', '.performance')
  .option('-v, --verbose', 'Verbose output', false)
  .action(monitor)

// report 命令
program
  .command('report')
  .description('Generate comprehensive performance report')
  .option('-i, --input <path>', 'Input report data file')
  .option('-o, --output <directory>', 'Report output directory', '.performance')
  .option('-f, --format <format>', 'Report format (cli, html)', 'cli')
  .action(report)

/**
 * 运行 CLI
 */
export function run() {
  program.parse(process.argv)

  // 如果没有提供任何命令，显示帮助
  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }
}

// 处理未捕获的错误
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('\n❌ Unhandled error:'), error)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n❌ Uncaught exception:'), error)
  process.exit(1)
})



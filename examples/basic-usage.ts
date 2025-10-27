/**
 * 基础使用示例
 */
import { MetricsCollector, OptimizationEngine, CliReporter } from '@ldesign/performance'

async function main() {
  // 创建指标收集器
  const collector = new MetricsCollector()

  // 收集构建指标
  const buildMetrics = await collector.endBuildMetrics('./dist')

  console.log('Build Metrics:')
  console.log(`  Duration: ${buildMetrics.duration}ms`)
  console.log(`  Total Size: ${buildMetrics.totalSize} bytes`)
  console.log(`  Bundles: ${buildMetrics.bundles.length}`)

  // 生成优化建议
  const optimizer = new OptimizationEngine()
  const suggestions = optimizer.generateSuggestions(buildMetrics)

  console.log(`\nOptimization Suggestions: ${suggestions.length}`)
  for (const suggestion of suggestions) {
    console.log(`  - [${suggestion.priority}] ${suggestion.title}`)
  }

  // 生成报告
  const report = {
    timestamp: Date.now(),
    project: {
      name: 'my-project',
      path: process.cwd(),
    },
    buildMetrics,
    suggestions,
    score: 85,
  }

  const reporter = new CliReporter()
  reporter.generate(report)
}

main().catch(console.error)



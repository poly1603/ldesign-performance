/**
 * @ldesign/performance 完整功能示例
 * 
 * 本示例展示了包的所有主要功能：
 * - 构建指标收集
 * - 优化建议生成
 * - 预算检查
 * - 多格式报告生成
 * - 历史记录管理
 * - 趋势分析
 * - Prometheus metrics 导出
 * - GitHub Actions 集成
 */

import {
  // 核心功能
  MetricsCollector,
  OptimizationEngine,
  BudgetManager,
  
  // 历史与趋势
  HistoryManager,
  TrendAnalyzer,
  
  // 报告生成器
  CliReporter,
  JsonReporter,
  HtmlReporter,
  MarkdownReporter,
  GitHubActionsReporter,
  
  // 导出器
  PrometheusExporter,
  
  // 运行时监控
  RuntimeMonitor,
  
  // 类型
  type PerformanceConfig,
  type PerformanceReport,
} from '@ldesign/performance'

async function main() {
  console.log('🚀 @ldesign/performance - Full Example\n')

  // 1. 配置
  const config: PerformanceConfig = {
    budgets: {
      bundles: [
        { name: 'main', maxSize: '300kb', warningSize: '250kb' },
        { name: 'vendor', maxSize: '500kb' },
      ],
      metrics: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        fcp: 1800,
      },
    },
    analyze: {
      generateReport: true,
      outputDir: '.performance',
      formats: ['html', 'json', 'markdown'],
    },
    verbose: true,
  }

  // 2. 收集构建指标
  console.log('📊 Collecting build metrics...')
  const collector = new MetricsCollector()
  collector.startBuildMetrics()
  
  // 模拟构建过程
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const buildMetrics = await collector.endBuildMetrics('./dist')
  console.log(`✓ Build completed in ${buildMetrics.duration}ms`)
  console.log(`✓ Total size: ${buildMetrics.totalSize} bytes`)

  // 3. 生成优化建议
  console.log('\n💡 Generating optimization suggestions...')
  const optimizer = new OptimizationEngine()
  const suggestions = optimizer.generateSuggestions(buildMetrics)
  console.log(`✓ Generated ${suggestions.length} suggestions`)

  // 4. 检查性能预算
  console.log('\n💰 Checking performance budgets...')
  const budgetManager = new BudgetManager()
  const budgetResults = budgetManager.check(
    config.budgets!,
    buildMetrics
  )
  const budgetStats = budgetManager.getStats(budgetResults)
  console.log(`✓ Budget checks: ${budgetStats.passed}/${budgetStats.total} passed`)

  // 5. 生成性能报告
  const report: PerformanceReport = {
    timestamp: Date.now(),
    project: {
      name: 'my-awesome-app',
      version: '1.0.0',
      path: process.cwd(),
    },
    buildMetrics,
    budgetResults,
    suggestions,
    score: 85, // 简化计算
  }

  // 6. 生成多种格式的报告
  console.log('\n📋 Generating reports...')
  
  // CLI 报告
  const cliReporter = new CliReporter()
  cliReporter.generate(report, '')
  
  // JSON 报告
  const jsonReporter = new JsonReporter()
  const jsonPath = jsonReporter.generate(report, '.performance')
  console.log(`✓ JSON report: ${jsonPath}`)
  
  // HTML 报告
  const htmlReporter = new HtmlReporter()
  const htmlPath = htmlReporter.generate(report, '.performance')
  console.log(`✓ HTML report: ${htmlPath}`)
  
  // Markdown 报告
  const mdReporter = new MarkdownReporter()
  const mdPath = mdReporter.generate(report, '.performance')
  console.log(`✓ Markdown report: ${mdPath}`)

  // 7. GitHub Actions 报告
  if (process.env.GITHUB_ACTIONS) {
    console.log('\n🤖 Generating GitHub Actions output...')
    const ghReporter = new GitHubActionsReporter()
    ghReporter.generate(report)
    
    // 生成 PR 评论
    const comment = ghReporter.generatePRComment(report)
    console.log('PR Comment generated')
  }

  // 8. 历史记录管理
  console.log('\n📚 Managing history...')
  const history = new HistoryManager('.performance')
  await history.addEntry(report, {
    commit: process.env.GIT_COMMIT || 'local',
    branch: process.env.GIT_BRANCH || 'main',
  })
  
  const historyStats = await history.getStats()
  console.log(`✓ History: ${historyStats.count} entries`)

  // 9. 趋势分析
  console.log('\n📈 Analyzing trends...')
  const trendAnalyzer = new TrendAnalyzer()
  const historyEntries = await history.getHistory(10)
  const trends = trendAnalyzer.analyzeTrends(historyEntries)
  
  console.log(`✓ Regressions: ${trends.regressions.length}`)
  console.log(`✓ Improvements: ${trends.improvements.length}`)
  
  // 报告回归
  if (trends.regressions.length > 0) {
    console.log('\n⚠️  Performance Regressions Detected:')
    for (const regression of trends.regressions) {
      console.log(`  - ${regression.metric}: +${regression.changePercentage.toFixed(1)}%`)
    }
  }
  
  // 报告改进
  if (trends.improvements.length > 0) {
    console.log('\n✅ Performance Improvements:')
    for (const improvement of trends.improvements) {
      console.log(`  - ${improvement.metric}: -${improvement.improvementPercentage.toFixed(1)}%`)
    }
  }

  // 10. Prometheus Metrics 导出
  console.log('\n📊 Exporting Prometheus metrics...')
  const promExporter = new PrometheusExporter('my_app')
  const metrics = promExporter.generateMetrics(report)
  console.log(`✓ Generated ${metrics.metrics.length} metrics`)
  
  promExporter.exportToFile(report, '.performance/metrics.prom')
  console.log('✓ Metrics exported to .performance/metrics.prom')

  // 11. 运行时监控（可选）
  if (process.env.MONITOR_URL) {
    console.log('\n🔍 Running runtime monitoring...')
    const monitor = new RuntimeMonitor()
    const runtimeMetrics = await monitor.collectRuntimeMetrics(process.env.MONITOR_URL)
    console.log('✓ Runtime metrics collected')
  }

  // 12. 总结
  console.log('\n' + '='.repeat(60))
  console.log('📊 Performance Analysis Summary')
  console.log('='.repeat(60))
  console.log(`Performance Score: ${report.score}/100`)
  console.log(`Build Duration: ${buildMetrics.duration}ms`)
  console.log(`Total Size: ${(buildMetrics.totalSize / 1024).toFixed(2)} KB`)
  console.log(`Gzip Size: ${(buildMetrics.totalGzipSize / 1024).toFixed(2)} KB`)
  console.log(`Budget Status: ${budgetStats.passRate}% passed`)
  console.log(`Optimization Suggestions: ${suggestions.length}`)
  console.log('='.repeat(60))

  // 13. 决定退出状态
  const hasFailures = !budgetManager.allPassed(budgetResults)
  if (hasFailures) {
    console.log('\n❌ Performance budget exceeded!')
    process.exit(1)
  }

  console.log('\n✅ Performance analysis completed successfully!')
}

// 运行示例
main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})


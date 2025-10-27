/**
 * Vite 性能分析插件
 */
import type { Plugin, ResolvedConfig } from 'vite'
import { resolve } from 'node:path'
import type { VitePluginOptions, PerformanceConfig } from '../types'
import { MetricsCollector } from '../metrics'
import { OptimizationEngine } from '../optimizer'
import { BudgetManager } from '../budget'
import { HtmlReporter, JsonReporter, CliReporter } from '../reporters'
import { ConfigLoader } from '../config'
import { calculatePerformanceScore } from '../utils/metricsUtils'
import { ensureDir } from '../utils/fileUtils'

export function performancePlugin(options: VitePluginOptions = {}): Plugin {
  let config: ResolvedConfig
  let performanceConfig: PerformanceConfig
  let collector: MetricsCollector
  let enabled = options.enabled !== false

  return {
    name: 'ldesign-performance',

    async configResolved(resolvedConfig) {
      config = resolvedConfig

      // 只在生产构建时启用
      if (config.command !== 'build' || config.mode !== 'production') {
        enabled = false
        return
      }

      // 加载性能配置
      try {
        performanceConfig = options.config || await ConfigLoader.load(config.root)
      } catch (error) {
        console.warn('Failed to load performance config, using defaults')
        performanceConfig = options.config || {}
      }

      collector = new MetricsCollector()
    },

    buildStart() {
      if (!enabled) return
      collector.startBuildMetrics()
    },

    async closeBundle() {
      if (!enabled) return

      try {
        // 获取构建输出目录
        const outDir = config.build.outDir || 'dist'
        const buildDir = resolve(config.root, outDir)

        // 收集构建指标
        const buildMetrics = await collector.endBuildMetrics(buildDir, config.root)

        // 生成优化建议
        const optimizer = new OptimizationEngine()
        const suggestions = optimizer.generateSuggestions(buildMetrics)

        // 检查预算
        const budgetManager = new BudgetManager()
        const budgetResults = performanceConfig.budgets
          ? budgetManager.check(performanceConfig.budgets, buildMetrics)
          : []

        // 计算分数
        const score = calculatePerformanceScore(buildMetrics, budgetResults, suggestions)

        // 获取项目信息
        const projectInfo = await ConfigLoader.loadProjectInfo(config.root)

        // 生成报告
        const report = {
          timestamp: Date.now(),
          project: projectInfo,
          buildMetrics,
          budgetResults,
          suggestions,
          score,
        }

        // 输出 CLI 报告
        if (performanceConfig.verbose) {
          console.log('\n')
          const cliReporter = new CliReporter()
          cliReporter.generate(report)
        } else {
          // 简化输出
          console.log('\n📊 Performance Analysis:')
          console.log(`   Score: ${score}/100`)
          console.log(`   Bundles: ${buildMetrics.bundles.length}`)
          console.log(`   Suggestions: ${suggestions.length}`)

          if (budgetResults.length > 0) {
            const passed = budgetResults.filter(r => r.passed).length
            console.log(`   Budget: ${passed}/${budgetResults.length} passed`)
          }
        }

        // 生成文件报告
        if (performanceConfig.analyze?.generateReport !== false) {
          const outputDir = resolve(
            config.root,
            performanceConfig.analyze?.outputDir || '.performance'
          )
          ensureDir(outputDir)

          const formats = performanceConfig.analyze?.formats || ['html', 'json']

          for (const format of formats) {
            switch (format) {
              case 'html':
                const htmlPath = new HtmlReporter().generate(report, outputDir)
                console.log(`   Report: ${htmlPath}`)
                break
              case 'json':
                const jsonPath = new JsonReporter().generate(report, outputDir)
                if (performanceConfig.verbose) {
                  console.log(`   JSON: ${jsonPath}`)
                }
                break
            }
          }
        }

        // 如果有预算失败或严重问题，警告用户
        const hasFailures = budgetResults.some(r => !r.passed)
        const hasCritical = suggestions.some(s => s.priority === 'critical')

        if (hasFailures || hasCritical) {
          console.log('   ⚠️  Performance issues detected\n')
        } else {
          console.log('   ✨ Build performance looks good!\n')
        }

      } catch (error) {
        console.error('Performance analysis failed:', error)
      }
    },
  }
}



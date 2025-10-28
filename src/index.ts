/**
 * @ldesign/performance - 主入口
 * 
 * 全方位的性能优化工具
 */

// 导出类型
export * from './types'

// 导出配置
export { ConfigLoader, ConfigValidator, defaultConfig } from './config'

// 导出指标收集器
export { MetricsCollector, BuildMetricsCollector } from './metrics'

// 导出分析器
export {
  BuildAnalyzer,
  BundleAnalyzer,
  AssetAnalyzer,
  ViteAnalyzer,
  SecurityAnalyzer,
  FrameworkAnalyzer,
  CacheAnalyzer,
  NetworkAnalyzer,
} from './analyzers'

export type {
  BuildAnalysis,
  BundleAnalysisResult,
  AssetAnalysisResult,
  ViteAnalysisResult,
} from './analyzers'

// 导出预算管理
export { BudgetManager, BudgetChecker } from './budget'

// 导出优化引擎
export { OptimizationEngine } from './optimizer'
export {
  BundleSizeRule,
  ImageOptimizationRule,
  CodeSplittingRule,
  TreeShakingRule,
  LazyLoadingRule,
} from './optimizer/rules'

// 导出报告生成器
export {
  CliReporter,
  JsonReporter,
  HtmlReporter,
  MarkdownReporter,
  GitHubActionsReporter,
} from './reporters'

// 导出插件
export { performancePlugin } from './plugins'

// 导出工具函数
export * from './utils'

// 导出运行时监控
export { RuntimeMonitor } from './monitor'

// 导出历史管理
export { HistoryManager, TrendAnalyzer } from './history'

// 导出导出器
export { PrometheusExporter } from './exporters'

// 导出仪表板
export { DashboardServer } from './dashboard'

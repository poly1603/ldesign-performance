/**
 * @ldesign/performance - 类型定义
 */

/**
 * 性能预算配置
 */
export interface BudgetConfig {
  /** 打包文件预算 */
  bundles?: BundleConfig[]
  /** 性能指标预算 */
  metrics?: MetricsBudget
}

export interface BundleConfig {
  /** 包名 */
  name: string
  /** 最大体积（如 '300kb'） */
  maxSize: string
  /** 警告阈值（如 '250kb'） */
  warningSize?: string
}

export interface MetricsBudget {
  /** Largest Contentful Paint (ms) */
  lcp?: number
  /** First Input Delay (ms) */
  fid?: number
  /** Cumulative Layout Shift */
  cls?: number
  /** First Contentful Paint (ms) */
  fcp?: number
  /** Time to Interactive (ms) */
  tti?: number
  /** Total Blocking Time (ms) */
  tbt?: number
}

/**
 * 分析配置
 */
export interface AnalyzeConfig {
  /** 是否打开可视化分析器 */
  openAnalyzer?: boolean
  /** 是否生成报告 */
  generateReport?: boolean
  /** 报告输出目录 */
  outputDir?: string
  /** 报告格式 */
  formats?: ReportFormat[]
}

/**
 * 优化配置
 */
export interface OptimizeConfig {
  /** 图片优化 */
  images?: boolean
  /** 字体优化 */
  fonts?: boolean
  /** CSS 优化 */
  css?: boolean
  /** JS 优化 */
  js?: boolean
}

/**
 * 主配置类型
 */
export interface PerformanceConfig {
  /** 性能预算 */
  budgets?: BudgetConfig
  /** 分析配置 */
  analyze?: AnalyzeConfig
  /** 优化配置 */
  optimize?: OptimizeConfig
  /** 输出目录 */
  outDir?: string
  /** 是否启用详细日志 */
  verbose?: boolean
}

/**
 * 报告格式
 */
export type ReportFormat = 'html' | 'json' | 'markdown' | 'cli'

/**
 * 构建指标
 */
export interface BuildMetrics {
  /** 构建开始时间 */
  startTime: number
  /** 构建结束时间 */
  endTime: number
  /** 构建时长 (ms) */
  duration: number
  /** 打包产物 */
  bundles: BundleMetrics[]
  /** 资源文件 */
  assets: AssetMetrics[]
  /** 总体积 */
  totalSize: number
  /** Gzip 后总体积 */
  totalGzipSize: number
}

/**
 * 打包产物指标
 */
export interface BundleMetrics {
  /** 文件名 */
  name: string
  /** 文件大小 (bytes) */
  size: number
  /** Gzip 后大小 (bytes) */
  gzipSize: number
  /** 文件路径 */
  path: string
  /** 是否为入口文件 */
  isEntry: boolean
  /** 模块列表 */
  modules?: ModuleMetrics[]
}

/**
 * 模块指标
 */
export interface ModuleMetrics {
  /** 模块 ID */
  id: string
  /** 模块大小 (bytes) */
  size: number
  /** 导入的模块 */
  imports: string[]
}

/**
 * 资源文件指标
 */
export interface AssetMetrics {
  /** 文件名 */
  name: string
  /** 文件类型 */
  type: AssetType
  /** 文件大小 (bytes) */
  size: number
  /** 文件路径 */
  path: string
}

export type AssetType = 'image' | 'font' | 'css' | 'js' | 'other'

/**
 * Web Vitals 指标
 */
export interface WebVitalsMetrics {
  /** Largest Contentful Paint */
  lcp?: number
  /** First Input Delay */
  fid?: number
  /** Cumulative Layout Shift */
  cls?: number
  /** First Contentful Paint */
  fcp?: number
  /** Time to Interactive */
  tti?: number
  /** Total Blocking Time */
  tbt?: number
}

/**
 * 运行时性能指标
 */
export interface RuntimeMetrics {
  /** Web Vitals */
  webVitals?: WebVitalsMetrics
  /** 导航时序 */
  navigationTiming?: NavigationTimingMetrics
  /** 资源加载时序 */
  resourceTiming?: ResourceTimingMetrics[]
}

/**
 * 导航时序指标
 */
export interface NavigationTimingMetrics {
  /** DNS 查询时间 */
  dnsTime: number
  /** TCP 连接时间 */
  tcpTime: number
  /** 请求时间 */
  requestTime: number
  /** 响应时间 */
  responseTime: number
  /** DOM 解析时间 */
  domParseTime: number
  /** 资源加载时间 */
  resourceLoadTime: number
  /** 页面加载总时间 */
  totalTime: number
}

/**
 * 资源加载时序指标
 */
export interface ResourceTimingMetrics {
  /** 资源名称 */
  name: string
  /** 资源类型 */
  type: string
  /** 开始时间 */
  startTime: number
  /** 持续时间 */
  duration: number
  /** 传输大小 */
  transferSize: number
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  /** 建议 ID */
  id: string
  /** 建议标题 */
  title: string
  /** 建议描述 */
  description: string
  /** 优先级 */
  priority: Priority
  /** 分类 */
  category: OptimizationCategory
  /** 影响说明 */
  impact: string
  /** 实施建议 */
  implementation?: string[]
  /** 预期收益 */
  estimatedSavings?: string
}

export type Priority = 'critical' | 'high' | 'medium' | 'low'

export type OptimizationCategory =
  | 'bundle-size'
  | 'code-splitting'
  | 'lazy-loading'
  | 'tree-shaking'
  | 'image-optimization'
  | 'font-optimization'
  | 'css-optimization'
  | 'caching'
  | 'compression'
  | 'network'
  | 'security'
  | 'third-party'
  | 'prerendering'
  | 'framework'
  | 'other'

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** 报告生成时间 */
  timestamp: number
  /** 项目信息 */
  project: ProjectInfo
  /** 构建指标 */
  buildMetrics?: BuildMetrics
  /** 运行时指标 */
  runtimeMetrics?: RuntimeMetrics
  /** 预算检查结果 */
  budgetResults?: BudgetCheckResult[]
  /** 优化建议 */
  suggestions: OptimizationSuggestion[]
  /** 总体评分 (0-100) */
  score: number
}

/**
 * 项目信息
 */
export interface ProjectInfo {
  /** 项目名称 */
  name: string
  /** 项目版本 */
  version?: string
  /** 项目路径 */
  path: string
}

/**
 * 预算检查结果
 */
export interface BudgetCheckResult {
  /** 预算名称 */
  name: string
  /** 预算类型 */
  type: 'bundle' | 'metric'
  /** 是否通过 */
  passed: boolean
  /** 实际值 */
  actual: number | string
  /** 预算值 */
  budget: number | string
  /** 超出百分比 */
  overagePercentage?: number
}

/**
 * 优化规则接口
 */
export interface OptimizationRule {
  /** 规则 ID */
  id: string
  /** 规则名称 */
  name: string
  /** 规则分类 */
  category: OptimizationCategory
  /** 执行规则检查 */
  check(metrics: BuildMetrics): OptimizationSuggestion[]
}

/**
 * Vite 插件选项
 */
export interface VitePluginOptions {
  /** 性能配置 */
  config?: PerformanceConfig
  /** 是否在构建时启用 */
  enabled?: boolean
}

/**
 * Lighthouse 结果
 */
export interface LighthouseResult {
  /** 性能评分 (0-100) */
  performanceScore: number
  /** 可访问性评分 */
  accessibilityScore: number
  /** 最佳实践评分 */
  bestPracticesScore: number
  /** SEO 评分 */
  seoScore: number
  /** PWA 评分 */
  pwaScore?: number
  /** 审计结果 */
  audits: Record<string, LighthouseAudit>
}

export interface LighthouseAudit {
  /** 审计 ID */
  id: string
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 评分 */
  score: number | null
  /** 显示值 */
  displayValue?: string
}

/**
 * 缓存分析结果
 */
export interface CacheAnalysisResult {
  /** HTTP 缓存配置 */
  httpCache: HttpCacheInfo[]
  /** Service Worker 状态 */
  serviceWorker?: ServiceWorkerInfo
  /** 缓存优化建议 */
  suggestions: OptimizationSuggestion[]
}

export interface HttpCacheInfo {
  /** 资源 URL */
  url: string
  /** 缓存控制头 */
  cacheControl?: string
  /** ETag */
  etag?: string
  /** Last-Modified */
  lastModified?: string
  /** 缓存策略评分 (0-100) */
  score: number
  /** 是否可缓存 */
  isCacheable: boolean
}

export interface ServiceWorkerInfo {
  /** 是否已注册 */
  registered: boolean
  /** 缓存策略 */
  strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate'
  /** 缓存的资源数量 */
  cachedResources?: number
}

/**
 * 网络性能分析结果
 */
export interface NetworkAnalysisResult {
  /** 关键渲染路径 */
  criticalPath: CriticalPathInfo
  /** HTTP/2 使用情况 */
  http2Usage: Http2Info
  /** 资源提示 */
  resourceHints: ResourceHintInfo[]
  /** 瀑布图数据 */
  waterfallData: WaterfallEntry[]
}

export interface CriticalPathInfo {
  /** 关键资源数量 */
  criticalResourceCount: number
  /** 关键路径长度 (ms) */
  criticalPathLength: number
  /** 关键资源列表 */
  criticalResources: string[]
}

export interface Http2Info {
  /** 是否支持 HTTP/2 */
  supported: boolean
  /** HTTP/2 请求占比 */
  percentage: number
  /** 多路复用效率 */
  multiplexingEfficiency?: number
}

export interface ResourceHintInfo {
  /** 提示类型 */
  type: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch'
  /** 资源 URL */
  url: string
  /** 是否已实现 */
  implemented: boolean
  /** 建议优先级 */
  priority: Priority
}

export interface WaterfallEntry {
  /** 资源名称 */
  name: string
  /** 资源类型 */
  type: string
  /** 开始时间 (ms) */
  startTime: number
  /** 持续时间 (ms) */
  duration: number
  /** 大小 (bytes) */
  size: number
  /** 是否阻塞渲染 */
  blocking: boolean
}

/**
 * 安全分析结果
 */
export interface SecurityAnalysisResult {
  /** 敏感信息检测结果 */
  sensitiveInfo: SensitiveInfoIssue[]
  /** 依赖漏洞 */
  vulnerabilities: VulnerabilityIssue[]
  /** 许可证信息 */
  licenses: LicenseInfo[]
  /** CSP 分析 */
  csp?: CspAnalysis
  /** 安全评分 (0-100) */
  securityScore: number
}

export interface SensitiveInfoIssue {
  /** 问题类型 */
  type: 'api-key' | 'token' | 'password' | 'secret' | 'private-key' | 'email' | 'other'
  /** 文件路径 */
  file: string
  /** 行号 */
  line: number
  /** 匹配的内容（脱敏） */
  match: string
  /** 严重程度 */
  severity: Priority
}

export interface VulnerabilityIssue {
  /** 包名 */
  package: string
  /** 版本 */
  version: string
  /** 漏洞 ID (CVE) */
  cve?: string
  /** 严重程度 */
  severity: 'critical' | 'high' | 'moderate' | 'low'
  /** 标题 */
  title: string
  /** 修复建议 */
  recommendation?: string
}

export interface LicenseInfo {
  /** 包名 */
  package: string
  /** 许可证类型 */
  license: string
  /** 是否兼容 */
  compatible: boolean
  /** 风险等级 */
  risk: 'high' | 'medium' | 'low'
}

export interface CspAnalysis {
  /** 是否存在 CSP */
  exists: boolean
  /** CSP 配置 */
  policy?: string
  /** 安全评分 */
  score: number
  /** 建议 */
  suggestions: string[]
}

/**
 * Source Map 分析结果
 */
export interface SourceMapAnalysisResult {
  /** 源代码贡献分析 */
  sourceContributions: SourceContribution[]
  /** 未使用代码 */
  unusedCode: UnusedCodeInfo[]
  /** 模块依赖图 */
  dependencyGraph: DependencyGraphNode[]
  /** 重复代码 */
  duplicates: DuplicateCodeInfo[]
  /** 总体统计 */
  stats: SourceMapStats
}

export interface SourceContribution {
  /** 源文件路径 */
  source: string
  /** 大小 (bytes) */
  size: number
  /** 占比 (%) */
  percentage: number
  /** 所属包 */
  package?: string
}

export interface UnusedCodeInfo {
  /** 文件路径 */
  file: string
  /** 未使用的大小 (bytes) */
  unusedSize: number
  /** 未使用占比 (%) */
  unusedPercentage: number
  /** 具体未使用的代码段 */
  ranges?: Array<{ start: number; end: number }>
}

export interface DependencyGraphNode {
  /** 模块 ID */
  id: string
  /** 模块名称 */
  name: string
  /** 大小 (bytes) */
  size: number
  /** 依赖的模块 */
  dependencies: string[]
  /** 被依赖次数 */
  dependents: number
}

export interface DuplicateCodeInfo {
  /** 代码内容哈希 */
  hash: string
  /** 大小 (bytes) */
  size: number
  /** 出现位置 */
  locations: Array<{
    file: string
    line: number
  }>
  /** 重复次数 */
  count: number
}

export interface SourceMapStats {
  /** 总源文件数 */
  totalSources: number
  /** 总大小 (bytes) */
  totalSize: number
  /** 未使用代码总大小 */
  totalUnusedSize: number
  /** 重复代码总大小 */
  totalDuplicateSize: number
}

/**
 * 历史记录条目
 */
export interface HistoryEntry {
  /** 时间戳 */
  timestamp: number
  /** Git commit hash */
  commit?: string
  /** 分支名 */
  branch?: string
  /** 性能报告 */
  report: PerformanceReport
}

/**
 * 趋势分析结果
 */
export interface TrendAnalysisResult {
  /** 构建大小趋势 */
  sizetrend: TrendData[]
  /** 构建时间趋势 */
  durationTrend: TrendData[]
  /** 性能评分趋势 */
  scoreTrend: TrendData[]
  /** 回归检测 */
  regressions: RegressionIssue[]
  /** 改进点 */
  improvements: ImprovementInfo[]
}

export interface TrendData {
  /** 时间戳 */
  timestamp: number
  /** 值 */
  value: number
  /** 标签 */
  label?: string
}

export interface RegressionIssue {
  /** 指标名称 */
  metric: string
  /** 当前值 */
  current: number
  /** 基准值 */
  baseline: number
  /** 变化百分比 */
  changePercentage: number
  /** 严重程度 */
  severity: Priority
}

export interface ImprovementInfo {
  /** 指标名称 */
  metric: string
  /** 当前值 */
  current: number
  /** 之前值 */
  previous: number
  /** 改进百分比 */
  improvementPercentage: number
}

/**
 * 框架特定分析结果
 */
export interface FrameworkAnalysisResult {
  /** 框架类型 */
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'unknown'
  /** 框架版本 */
  version?: string
  /** 组件分析 */
  components: ComponentAnalysis[]
  /** 框架特定建议 */
  suggestions: OptimizationSuggestion[]
}

export interface ComponentAnalysis {
  /** 组件名称 */
  name: string
  /** 组件大小 */
  size: number
  /** 是否懒加载 */
  isLazy: boolean
  /** 渲染次数估计 */
  renderCount?: number
  /** 优化建议 */
  suggestions: string[]
}

/**
 * CI/CD 集成配置
 */
export interface CiCdConfig {
  /** 是否启用 */
  enabled: boolean
  /** GitHub 配置 */
  github?: GitHubConfig
  /** GitLab 配置 */
  gitlab?: GitLabConfig
  /** 通知配置 */
  notifications?: NotificationConfig
  /** 是否阻断构建 */
  failOnBudget?: boolean
}

export interface GitHubConfig {
  /** Token */
  token?: string
  /** 仓库 */
  repo: string
  /** 是否评论 PR */
  commentOnPR: boolean
  /** 评论模板 */
  commentTemplate?: string
}

export interface GitLabConfig {
  /** Token */
  token?: string
  /** 项目 ID */
  projectId: string
  /** 是否评论 MR */
  commentOnMR: boolean
}

export interface NotificationConfig {
  /** Webhook URL */
  webhookUrl?: string
  /** Slack 配置 */
  slack?: {
    webhookUrl: string
    channel?: string
  }
  /** 钉钉配置 */
  dingtalk?: {
    webhookUrl: string
    secret?: string
  }
}

/**
 * 仪表板配置
 */
export interface DashboardConfig {
  /** 端口 */
  port: number
  /** 是否自动打开浏览器 */
  open: boolean
  /** WebSocket 端口 */
  wsPort?: number
  /** 刷新间隔 (ms) */
  refreshInterval?: number
}

/**
 * Prometheus Metrics
 */
export interface PrometheusMetrics {
  /** 指标列表 */
  metrics: PrometheusMetric[]
}

export interface PrometheusMetric {
  /** 指标名称 */
  name: string
  /** 指标类型 */
  type: 'gauge' | 'counter' | 'histogram' | 'summary'
  /** 帮助文本 */
  help: string
  /** 值 */
  value: number
  /** 标签 */
  labels?: Record<string, string>
}


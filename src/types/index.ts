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
  | 'caching'
  | 'compression'
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



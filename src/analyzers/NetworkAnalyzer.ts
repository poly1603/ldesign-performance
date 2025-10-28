/**
 * 网络性能分析器
 */
import type {
  BuildMetrics,
  NetworkAnalysisResult,
  CriticalPathInfo,
  Http2Info,
  ResourceHintInfo,
  WaterfallEntry,
  OptimizationSuggestion,
} from '../types'

export class NetworkAnalyzer {
  /**
   * 分析网络性能
   */
  async analyze(buildDir: string, metrics: BuildMetrics): Promise<NetworkAnalysisResult> {
    const criticalPath = this.analyzeCriticalPath(metrics)
    const http2Usage = this.analyzeHttp2Usage(metrics)
    const resourceHints = this.generateResourceHints(metrics)
    const waterfallData = this.generateWaterfallData(metrics)

    return {
      criticalPath,
      http2Usage,
      resourceHints,
      waterfallData,
    }
  }

  /**
   * 分析关键渲染路径
   */
  private analyzeCriticalPath(metrics: BuildMetrics): CriticalPathInfo {
    const criticalResources: string[] = []
    let criticalPathLength = 0

    // 识别关键资源
    for (const bundle of metrics.bundles) {
      if (bundle.isEntry) {
        criticalResources.push(bundle.name)
        // 估算加载时间（基于大小）
        criticalPathLength += Math.ceil(bundle.size / 1024 / 100) * 10 // 假设100KB/s
      }
    }

    // 添加关键CSS
    const cssAssets = metrics.assets.filter(a => a.type === 'css')
    criticalResources.push(...cssAssets.map(a => a.name))
    criticalPathLength += cssAssets.length * 20 // 每个CSS文件20ms估算

    return {
      criticalResourceCount: criticalResources.length,
      criticalPathLength,
      criticalResources,
    }
  }

  /**
   * 分析HTTP/2使用情况
   */
  private analyzeHttp2Usage(metrics: BuildMetrics): Http2Info {
    // 在实际环境中，这需要运行时检测
    // 这里提供分析框架
    return {
      supported: false, // 需要运行时检测
      percentage: 0,
      multiplexingEfficiency: undefined,
    }
  }

  /**
   * 生成资源提示建议
   */
  private generateResourceHints(metrics: BuildMetrics): ResourceHintInfo[] {
    const hints: ResourceHintInfo[] = []

    // 预加载关键资源
    for (const bundle of metrics.bundles) {
      if (bundle.isEntry) {
        hints.push({
          type: 'preload',
          url: bundle.name,
          implemented: false,
          priority: 'critical',
        })
      }
    }

    // 预加载关键字体
    const fonts = metrics.assets.filter(a => a.type === 'font')
    for (const font of fonts.slice(0, 2)) {
      hints.push({
        type: 'preload',
        url: font.name,
        implemented: false,
        priority: 'high',
      })
    }

    // DNS预解析外部资源
    hints.push({
      type: 'dns-prefetch',
      url: 'cdn.example.com',
      implemented: false,
      priority: 'medium',
    })

    // 预连接重要域名
    hints.push({
      type: 'preconnect',
      url: 'api.example.com',
      implemented: false,
      priority: 'medium',
    })

    return hints
  }

  /**
   * 生成瀑布图数据
   */
  private generateWaterfallData(metrics: BuildMetrics): WaterfallEntry[] {
    const entries: WaterfallEntry[] = []
    let currentTime = 0

    // 模拟资源加载瀑布图
    // 实际实现需要在运行时收集 Performance API 数据

    // HTML（假设首先加载）
    entries.push({
      name: 'index.html',
      type: 'document',
      startTime: 0,
      duration: 50,
      size: 5000,
      blocking: true,
    })
    currentTime = 50

    // 关键CSS和JS
    for (const bundle of metrics.bundles) {
      if (bundle.isEntry) {
        entries.push({
          name: bundle.name,
          type: 'script',
          startTime: currentTime,
          duration: Math.ceil(bundle.size / 1024 / 10), // 假设10KB/ms
          size: bundle.size,
          blocking: true,
        })
        currentTime += Math.ceil(bundle.size / 1024 / 10)
      }
    }

    // 其他资源
    for (const asset of metrics.assets) {
      entries.push({
        name: asset.name,
        type: asset.type,
        startTime: currentTime,
        duration: Math.ceil(asset.size / 1024 / 10),
        size: asset.size,
        blocking: asset.type === 'css',
      })
    }

    return entries
  }

  /**
   * 生成网络优化建议
   */
  generateSuggestions(result: NetworkAnalysisResult, metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 关键路径优化
    if (result.criticalPath.criticalResourceCount > 5) {
      suggestions.push({
        id: 'network-critical-path',
        title: '减少关键渲染路径资源',
        description: `关键路径包含 ${result.criticalPath.criticalResourceCount} 个资源`,
        priority: 'high',
        category: 'network',
        impact: '减少首次渲染时间',
        implementation: [
          '内联关键CSS',
          '延迟加载非关键JavaScript',
          '使用代码分割减少初始bundle大小',
          '优化字体加载策略',
        ],
      })
    }

    // 资源提示
    const unimplementedHints = result.resourceHints.filter(h => !h.implemented)
    if (unimplementedHints.length > 0) {
      suggestions.push({
        id: 'network-resource-hints',
        title: '使用资源提示优化加载',
        description: `可以添加 ${unimplementedHints.length} 个资源提示`,
        priority: 'high',
        category: 'network',
        impact: '减少资源加载延迟',
        implementation: [
          '使用 <link rel="preload"> 预加载关键资源',
          '使用 <link rel="dns-prefetch"> 预解析DNS',
          '使用 <link rel="preconnect"> 预建立连接',
          '使用 <link rel="prefetch"> 预取下一页资源',
        ],
      })
    }

    // HTTP/2
    if (!result.http2Usage.supported) {
      suggestions.push({
        id: 'network-http2',
        title: '启用 HTTP/2',
        description: 'HTTP/2 提供多路复用、头部压缩等性能优势',
        priority: 'medium',
        category: 'network',
        impact: '显著提升资源加载速度',
        implementation: [
          '在服务器配置中启用HTTP/2',
          'Nginx: listen 443 ssl http2',
          'Apache: Protocols h2 http/1.1',
          '考虑升级到HTTP/3（QUIC）',
        ],
      })
    }

    // 连接优化
    suggestions.push({
      id: 'network-connection',
      title: '优化网络连接',
      description: '减少连接建立和往返时间',
      priority: 'medium',
      category: 'network',
      impact: '降低延迟，提升响应速度',
      implementation: [
        '使用CDN减少物理距离',
        '启用Keep-Alive持久连接',
        '减少重定向',
        '使用域名分片（HTTP/1.1）或合并域名（HTTP/2）',
      ],
    })

    // 并行下载
    const totalResources = metrics.bundles.length + metrics.assets.length
    if (totalResources > 10) {
      suggestions.push({
        id: 'network-parallel',
        title: '优化资源并行下载',
        description: `当前有 ${totalResources} 个资源需要下载`,
        priority: 'low',
        category: 'network',
        impact: '更好地利用带宽',
        implementation: [
          '合并小文件减少请求数',
          '使用雪碧图合并图片',
          '考虑使用HTTP/2的多路复用',
          '避免请求队列阻塞',
        ],
      })
    }

    return suggestions
  }
}


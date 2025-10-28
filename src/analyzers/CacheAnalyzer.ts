/**
 * 缓存策略分析器
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
  BuildMetrics,
  CacheAnalysisResult,
  HttpCacheInfo,
  ServiceWorkerInfo,
  OptimizationSuggestion,
} from '../types'

export class CacheAnalyzer {
  /**
   * 分析缓存策略
   */
  async analyze(buildDir: string, metrics: BuildMetrics): Promise<CacheAnalysisResult> {
    const httpCache = await this.analyzeHttpCache(buildDir, metrics)
    const serviceWorker = await this.detectServiceWorker(buildDir)
    const suggestions = this.generateSuggestions(httpCache, serviceWorker, metrics)

    return {
      httpCache,
      serviceWorker,
      suggestions,
    }
  }

  /**
   * 分析HTTP缓存配置
   */
  private async analyzeHttpCache(
    buildDir: string,
    metrics: BuildMetrics
  ): Promise<HttpCacheInfo[]> {
    const cacheInfos: HttpCacheInfo[] = []

    // 检查各类资源的缓存建议
    for (const asset of metrics.assets) {
      const cacheInfo = this.getCacheRecommendation(asset.name, asset.type)
      cacheInfos.push(cacheInfo)
    }

    for (const bundle of metrics.bundles) {
      const cacheInfo = this.getCacheRecommendation(bundle.name, 'js')
      cacheInfos.push(cacheInfo)
    }

    return cacheInfos
  }

  /**
   * 获取缓存建议
   */
  private getCacheRecommendation(filename: string, type: string): HttpCacheInfo {
    const url = filename

    // 根据文件类型和命名模式判断缓存策略
    const hasHash = /\.[a-f0-9]{8,}\./i.test(filename)
    
    let cacheControl: string
    let score: number
    let isCacheable: boolean

    if (hasHash) {
      // 带hash的文件可以长期缓存
      cacheControl = 'public, max-age=31536000, immutable'
      score = 100
      isCacheable = true
    } else if (type === 'js' || type === 'css') {
      // 主文件需要验证
      cacheControl = 'public, max-age=0, must-revalidate'
      score = 70
      isCacheable = true
    } else if (type === 'image') {
      // 图片中等缓存
      cacheControl = 'public, max-age=2592000'
      score = 85
      isCacheable = true
    } else if (type === 'font') {
      // 字体长期缓存
      cacheControl = 'public, max-age=31536000, immutable'
      score = 100
      isCacheable = true
    } else {
      // 其他资源短期缓存
      cacheControl = 'public, max-age=3600'
      score = 60
      isCacheable = true
    }

    return {
      url,
      cacheControl,
      etag: hasHash ? undefined : 'W/"hash"',
      lastModified: hasHash ? undefined : new Date().toUTCString(),
      score,
      isCacheable,
    }
  }

  /**
   * 检测Service Worker
   */
  private async detectServiceWorker(buildDir: string): Promise<ServiceWorkerInfo | undefined> {
    try {
      // 检查常见的Service Worker文件
      const swFiles = ['sw.js', 'service-worker.js', 'workbox-*.js']
      
      for (const swFile of swFiles) {
        try {
          const swPath = join(buildDir, swFile)
          const content = readFileSync(swPath, 'utf-8')
          
          // 简单检测缓存策略
          let strategy: ServiceWorkerInfo['strategy']
          if (content.includes('CacheFirst') || content.includes('cache-first')) {
            strategy = 'cache-first'
          } else if (content.includes('NetworkFirst') || content.includes('network-first')) {
            strategy = 'network-first'
          } else if (content.includes('StaleWhileRevalidate') || content.includes('stale-while-revalidate')) {
            strategy = 'stale-while-revalidate'
          }

          return {
            registered: true,
            strategy,
            cachedResources: this.estimateCachedResources(content),
          }
        } catch {
          // 文件不存在，继续
        }
      }
    } catch (error) {
      // 忽略错误
    }

    return {
      registered: false,
    }
  }

  /**
   * 估算缓存的资源数量
   */
  private estimateCachedResources(swContent: string): number {
    // 简单统计缓存的URL数量
    const urlMatches = swContent.match(/['"`].*?\.(js|css|png|jpg|jpeg|svg|woff2?)['"]/gi)
    return urlMatches ? urlMatches.length : 0
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(
    httpCache: HttpCacheInfo[],
    serviceWorker: ServiceWorkerInfo | undefined,
    metrics: BuildMetrics
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 检查文件是否有hash
    const filesWithoutHash = httpCache.filter(c => 
      !c.url.match(/\.[a-f0-9]{8,}\./i) && 
      (c.url.endsWith('.js') || c.url.endsWith('.css'))
    )

    if (filesWithoutHash.length > 0) {
      suggestions.push({
        id: 'cache-file-hash',
        title: '为静态资源添加内容哈希',
        description: `发现 ${filesWithoutHash.length} 个文件没有内容哈希`,
        priority: 'high',
        category: 'caching',
        impact: '内容哈希允许长期缓存，显著提升重复访问速度',
        implementation: [
          '在构建配置中启用文件名哈希',
          'Vite: output.assetFileNames 和 output.chunkFileNames',
          'Webpack: output.filename 使用 [contenthash]',
          '确保HTML文件引用更新',
        ],
      })
    }

    // Service Worker 建议
    if (!serviceWorker?.registered) {
      suggestions.push({
        id: 'cache-service-worker',
        title: '考虑使用 Service Worker',
        description: '未检测到 Service Worker，可以提供离线支持和更好的缓存控制',
        priority: 'medium',
        category: 'caching',
        impact: '实现离线访问、提升加载速度、减少服务器负载',
        implementation: [
          '使用 Workbox 简化 Service Worker 开发',
          '实现 Cache-First 策略缓存静态资源',
          '实现 Network-First 策略处理API请求',
          '使用 Stale-While-Revalidate 平衡性能和新鲜度',
        ],
      })
    } else {
      suggestions.push({
        id: 'cache-sw-optimization',
        title: '优化 Service Worker 策略',
        description: `当前使用 ${serviceWorker.strategy || '未知'} 策略`,
        priority: 'low',
        category: 'caching',
        impact: '合适的缓存策略可以优化用户体验',
        implementation: [
          '静态资源使用 Cache-First',
          'API请求使用 Network-First',
          '图片使用 Cache-First 带版本控制',
          '定期清理旧缓存',
        ],
      })
    }

    // HTTP缓存头建议
    const poorCacheScores = httpCache.filter(c => c.score < 80)
    if (poorCacheScores.length > 0) {
      suggestions.push({
        id: 'cache-http-headers',
        title: '优化 HTTP 缓存头',
        description: `${poorCacheScores.length} 个资源缓存策略可以改进`,
        priority: 'medium',
        category: 'caching',
        impact: '正确的缓存头可以减少重复请求',
        implementation: [
          '为带hash的资源设置 immutable 和长期max-age',
          '为HTML设置 no-cache 或短期缓存',
          '使用 ETag 支持条件请求',
          '启用 Brotli 或 Gzip 压缩',
        ],
      })
    }

    // CDN建议
    suggestions.push({
      id: 'cache-cdn',
      title: '使用 CDN 加速静态资源',
      description: '将静态资源部署到CDN可以显著提升全球访问速度',
      priority: 'medium',
      category: 'caching',
      impact: '减少延迟、提升可用性、减轻源站压力',
      implementation: [
        '使用 Cloudflare, AWS CloudFront, 或阿里云CDN',
        '为CDN资源配置长期缓存',
        '使用不同域名避免Cookie开销',
        '启用HTTP/2或HTTP/3',
      ],
    })

    return suggestions
  }
}


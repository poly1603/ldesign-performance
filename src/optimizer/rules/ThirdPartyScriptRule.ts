/**
 * 第三方脚本优化规则
 */
import type { BuildMetrics, OptimizationSuggestion, OptimizationRule } from '../../types'

export class ThirdPartyScriptRule implements OptimizationRule {
  id = 'third-party-script'
  name = 'Third-Party Script Optimization'
  category = 'third-party' as const

  private readonly KNOWN_THIRD_PARTIES = [
    'google-analytics',
    'gtag',
    'googletagmanager',
    'facebook',
    'twitter',
    'linkedin',
    'amplitude',
    'mixpanel',
    'segment',
    'hotjar',
    'intercom',
    'zendesk',
  ]

  check(metrics: BuildMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 检查是否有第三方脚本的迹象
    const jsAssets = metrics.assets.filter(a => a.type === 'js')
    const possibleThirdParty = jsAssets.filter(asset =>
      this.KNOWN_THIRD_PARTIES.some(tp => asset.name.toLowerCase().includes(tp))
    )

    if (possibleThirdParty.length > 0 || jsAssets.length > 10) {
      suggestions.push({
        id: 'third-party-defer',
        title: '延迟加载第三方脚本',
        description: '第三方脚本应该延迟加载以避免阻塞主线程',
        priority: 'high',
        category: 'third-party',
        impact: '第三方脚本通常会显著延长页面加载时间',
        implementation: [
          '使用 async 或 defer 属性加载第三方脚本',
          '考虑使用 Partytown 在 Web Worker 中运行第三方脚本',
          '延迟非关键分析和跟踪脚本的加载',
          '在用户交互后再加载聊天小部件等功能',
        ],
      })

      suggestions.push({
        id: 'third-party-audit',
        title: '审计第三方脚本的必要性',
        description: '定期审查所有第三方脚本，移除不再使用的脚本',
        priority: 'medium',
        category: 'third-party',
        impact: '每个第三方脚本都会增加页面负担',
        implementation: [
          '列出所有第三方脚本及其用途',
          '移除未使用或低价值的第三方服务',
          '考虑使用服务端分析代替客户端跟踪',
          '使用 Consent Management Platform (CMP) 控制脚本加载',
        ],
      })
    }

    // 建议使用 Facade 模式
    suggestions.push({
      id: 'third-party-facade',
      title: '使用 Facade 模式优化第三方嵌入',
      description: '对于视频播放器、地图等重型第三方嵌入使用 Facade 模式',
      priority: 'medium',
      category: 'third-party',
      impact: '显著减少初始加载时间和资源消耗',
      implementation: [
        '使用静态图片作为占位符，点击后才加载真实内容',
        '对 YouTube 嵌入使用 lite-youtube-embed',
        '对 Google Maps 使用静态地图 API',
        '延迟加载社交媒体嵌入（Twitter、Instagram等）',
      ],
    })

    return suggestions
  }
}


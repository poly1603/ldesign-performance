/**
 * 框架特定分析器
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
  BuildMetrics,
  FrameworkAnalysisResult,
  ComponentAnalysis,
  OptimizationSuggestion,
} from '../types'

export class FrameworkAnalyzer {
  /**
   * 分析项目使用的框架
   */
  async analyze(buildDir: string, metrics: BuildMetrics): Promise<FrameworkAnalysisResult> {
    const framework = await this.detectFramework(buildDir, metrics)
    const version = await this.detectVersion(buildDir, framework)
    const components = await this.analyzeComponents(buildDir, metrics, framework)
    const suggestions = this.generateSuggestions(framework, components, metrics)

    return {
      framework,
      version,
      components,
      suggestions,
    }
  }

  /**
   * 检测使用的框架
   */
  private async detectFramework(
    buildDir: string,
    metrics: BuildMetrics
  ): Promise<'react' | 'vue' | 'angular' | 'svelte' | 'unknown'> {
    try {
      const packageJsonPath = join(buildDir, '../package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }

      // 检查依赖中的框架
      if (deps['react'] || deps['react-dom']) return 'react'
      if (deps['vue']) return 'vue'
      if (deps['@angular/core']) return 'angular'
      if (deps['svelte']) return 'svelte'

      // 检查bundle内容
      for (const bundle of metrics.bundles) {
        try {
          const content = readFileSync(join(buildDir, bundle.name), 'utf-8')
          if (content.includes('react') || content.includes('React')) return 'react'
          if (content.includes('vue') || content.includes('Vue')) return 'vue'
          if (content.includes('angular') || content.includes('ng')) return 'angular'
          if (content.includes('svelte')) return 'svelte'
        } catch {
          // 忽略
        }
      }
    } catch (error) {
      // 忽略错误
    }

    return 'unknown'
  }

  /**
   * 检测框架版本
   */
  private async detectVersion(buildDir: string, framework: string): Promise<string | undefined> {
    if (framework === 'unknown') return undefined

    try {
      const packageJsonPath = join(buildDir, '../package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }

      const frameworkPackage = framework === 'react' ? 'react' : framework
      return deps[frameworkPackage]?.replace(/[\^~]/, '')
    } catch (error) {
      return undefined
    }
  }

  /**
   * 分析组件
   */
  private async analyzeComponents(
    buildDir: string,
    metrics: BuildMetrics,
    framework: string
  ): Promise<ComponentAnalysis[]> {
    if (framework === 'unknown') return []

    const components: ComponentAnalysis[] = []

    // 分析bundle中的组件
    for (const bundle of metrics.bundles) {
      try {
        const content = readFileSync(join(buildDir, bundle.name), 'utf-8')
        
        if (framework === 'react') {
          components.push(...this.analyzeReactComponents(content, bundle.name))
        } else if (framework === 'vue') {
          components.push(...this.analyzeVueComponents(content, bundle.name))
        }
      } catch (error) {
        // 忽略错误
      }
    }

    return components
  }

  /**
   * 分析 React 组件
   */
  private analyzeReactComponents(content: string, bundleName: string): ComponentAnalysis[] {
    const components: ComponentAnalysis[] = []

    // 检测 React.lazy 使用
    const lazyPattern = /React\.lazy\s*\(\s*(?:function\s*\(\)|(?:\(\)\s*=>))\s*import\s*\(\s*['"](.*?)['"]\s*\)\s*\)/g
    const lazyMatches = content.matchAll(lazyPattern)
    
    for (const match of lazyMatches) {
      components.push({
        name: match[1] || 'Unknown',
        size: 0, // 难以精确计算
        isLazy: true,
        suggestions: ['已使用懒加载，很好！'],
      })
    }

    // 检测可能的大型组件（简化检测）
    const componentPattern = /function\s+([A-Z][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/g
    const componentMatches = content.matchAll(componentPattern)
    
    for (const match of componentMatches) {
      const componentName = match[1]
      const suggestions: string[] = []

      // 检查是否使用了 memo
      if (!content.includes(`React.memo(${componentName})`)) {
        suggestions.push('考虑使用 React.memo 避免不必要的重渲染')
      }

      // 检查是否可以拆分
      if (content.includes(`${componentName}`) && content.split(componentName).length > 3) {
        suggestions.push('组件被多次引用，确保已优化')
      }

      if (suggestions.length > 0) {
        components.push({
          name: componentName,
          size: 0,
          isLazy: false,
          suggestions,
        })
      }
    }

    return components
  }

  /**
   * 分析 Vue 组件
   */
  private analyzeVueComponents(content: string, bundleName: string): ComponentAnalysis[] {
    const components: ComponentAnalysis[] = []

    // 检测异步组件
    const asyncPattern = /defineAsyncComponent\s*\(\s*(?:function\s*\(\)|(?:\(\)\s*=>))\s*import\s*\(\s*['"](.*?)['"]\s*\)\s*\)/g
    const asyncMatches = content.matchAll(asyncPattern)
    
    for (const match of asyncMatches) {
      components.push({
        name: match[1] || 'Unknown',
        size: 0,
        isLazy: true,
        suggestions: ['已使用异步组件，很好！'],
      })
    }

    // 检测普通组件
    const componentPattern = /defineComponent\s*\(\s*\{/g
    const componentMatches = Array.from(content.matchAll(componentPattern))
    
    if (componentMatches.length > 0) {
      components.push({
        name: 'Vue Components',
        size: 0,
        isLazy: false,
        suggestions: [
          '对于路由级别的组件，考虑使用 defineAsyncComponent',
          '使用 v-memo 指令优化列表渲染',
          '合理使用 keep-alive 缓存组件',
        ],
      })
    }

    return components
  }

  /**
   * 生成框架特定的优化建议
   */
  private generateSuggestions(
    framework: string,
    components: ComponentAnalysis[],
    metrics: BuildMetrics
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    if (framework === 'react') {
      suggestions.push(...this.getReactSuggestions(components, metrics))
    } else if (framework === 'vue') {
      suggestions.push(...this.getVueSuggestions(components, metrics))
    } else if (framework === 'angular') {
      suggestions.push(...this.getAngularSuggestions(metrics))
    } else if (framework === 'svelte') {
      suggestions.push(...this.getSvelteSuggestions(metrics))
    }

    return suggestions
  }

  /**
   * React 优化建议
   */
  private getReactSuggestions(
    components: ComponentAnalysis[],
    metrics: BuildMetrics
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 检查是否使用了代码分割
    const hasLazyComponents = components.some(c => c.isLazy)
    if (!hasLazyComponents && metrics.bundles.length < 3) {
      suggestions.push({
        id: 'react-code-splitting',
        title: '使用 React.lazy 进行代码分割',
        description: '通过路由级别的代码分割减少初始加载体积',
        priority: 'high',
        category: 'framework',
        impact: '可显著减少首屏加载时间',
        implementation: [
          '使用 React.lazy(() => import(\'./Component\'))',
          '配合 Suspense 组件使用',
          '按路由进行代码分割',
          '对大型第三方库使用动态导入',
        ],
      })
    }

    // React 性能优化
    suggestions.push({
      id: 'react-optimization',
      title: '使用 React 性能优化技术',
      description: '应用 React 特定的性能优化手段',
      priority: 'medium',
      category: 'framework',
      impact: '减少不必要的组件重渲染',
      implementation: [
        '使用 React.memo 包装纯组件',
        '使用 useMemo 和 useCallback 缓存计算和函数',
        '避免在 render 中创建新对象和数组',
        '使用 React DevTools Profiler 识别性能瓶颈',
        '考虑使用虚拟滚动处理长列表',
      ],
    })

    // 生产构建检查
    suggestions.push({
      id: 'react-production-build',
      title: '确保使用生产构建',
      description: '生产环境必须使用优化过的 React 版本',
      priority: 'critical',
      category: 'framework',
      impact: '生产构建比开发构建小且快得多',
      implementation: [
        '设置 NODE_ENV=production',
        '启用 Terser 压缩',
        '移除 PropTypes 和开发警告',
      ],
    })

    return suggestions
  }

  /**
   * Vue 优化建议
   */
  private getVueSuggestions(
    components: ComponentAnalysis[],
    metrics: BuildMetrics
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    suggestions.push({
      id: 'vue-async-components',
      title: '使用异步组件',
      description: '通过异步组件实现代码分割',
      priority: 'high',
      category: 'framework',
      impact: '减少初始 bundle 大小',
      implementation: [
        '使用 defineAsyncComponent 定义异步组件',
        '在路由配置中使用动态导入',
        '对大型组件使用异步加载',
      ],
    })

    suggestions.push({
      id: 'vue-optimization',
      title: '应用 Vue 性能优化',
      description: 'Vue 3 特定的性能优化技巧',
      priority: 'medium',
      category: 'framework',
      impact: '提升渲染性能和响应速度',
      implementation: [
        '使用 v-memo 指令优化列表渲染',
        '合理使用 v-once 和 v-pre',
        '使用 shallowRef 和 shallowReactive 处理大对象',
        '使用 keep-alive 缓存组件状态',
        '避免不必要的响应式数据',
      ],
    })

    return suggestions
  }

  /**
   * Angular 优化建议
   */
  private getAngularSuggestions(metrics: BuildMetrics): OptimizationSuggestion[] {
    return [
      {
        id: 'angular-lazy-loading',
        title: '使用惰性加载路由',
        description: 'Angular 路由级别的代码分割',
        priority: 'high',
        category: 'framework',
        impact: '显著减少初始加载时间',
        implementation: [
          '使用 loadChildren 配置惰性路由',
          '启用预加载策略',
          '按功能模块组织代码',
        ],
      },
      {
        id: 'angular-aot',
        title: '启用 AOT 编译',
        description: '使用提前编译提升性能',
        priority: 'critical',
        category: 'framework',
        impact: '更小的 bundle、更快的渲染',
        implementation: [
          '生产构建使用 --aot 标志',
          '启用 buildOptimizer',
          '使用 Ivy 编译器',
        ],
      },
    ]
  }

  /**
   * Svelte 优化建议
   */
  private getSvelteSuggestions(metrics: BuildMetrics): OptimizationSuggestion[] {
    return [
      {
        id: 'svelte-optimization',
        title: 'Svelte 优化最佳实践',
        description: 'Svelte 特定的优化技巧',
        priority: 'medium',
        category: 'framework',
        impact: 'Svelte 已经很快，但仍有优化空间',
        implementation: [
          '使用 {#key} 块优化列表更新',
          '避免不必要的响应式声明',
          '合理使用 immutable 编译选项',
          '考虑使用 svelte-virtual-list 处理长列表',
        ],
      },
    ]
  }
}


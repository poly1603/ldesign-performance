/**
 * 优化建议引擎
 */
import type { BuildMetrics, OptimizationSuggestion, OptimizationRule } from '../types'
import { sortSuggestions } from '../utils/metricsUtils'
import {
  BundleSizeRule,
  ImageOptimizationRule,
  CodeSplittingRule,
  TreeShakingRule,
  LazyLoadingRule,
  CssOptimizationRule,
  FontOptimizationRule,
  ThirdPartyScriptRule,
  CompressionRule,
} from './rules'

export class OptimizationEngine {
  private rules: OptimizationRule[]

  constructor() {
    this.rules = [
      new BundleSizeRule(),
      new ImageOptimizationRule(),
      new CodeSplittingRule(),
      new TreeShakingRule(),
      new LazyLoadingRule(),
      new CssOptimizationRule(),
      new FontOptimizationRule(),
      new ThirdPartyScriptRule(),
      new CompressionRule(),
    ]
  }

  /**
   * 生成优化建议
   */
  generateSuggestions(metrics: BuildMetrics): OptimizationSuggestion[] {
    const allSuggestions: OptimizationSuggestion[] = []

    for (const rule of this.rules) {
      try {
        const suggestions = rule.check(metrics)
        allSuggestions.push(...suggestions)
      } catch (error) {
        console.warn(`Rule ${rule.id} failed:`, error)
      }
    }

    // 去重（基于 ID）
    const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions)

    // 按优先级排序
    return sortSuggestions(uniqueSuggestions)
  }

  /**
   * 添加自定义规则
   */
  addRule(rule: OptimizationRule): void {
    this.rules.push(rule)
  }

  /**
   * 移除规则
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId)
  }

  /**
   * 获取所有规则
   */
  getRules(): OptimizationRule[] {
    return [...this.rules]
  }

  /**
   * 去重建议
   */
  private deduplicateSuggestions(
    suggestions: OptimizationSuggestion[]
  ): OptimizationSuggestion[] {
    const seen = new Set<string>()
    const unique: OptimizationSuggestion[] = []

    for (const suggestion of suggestions) {
      if (!seen.has(suggestion.id)) {
        seen.add(suggestion.id)
        unique.push(suggestion)
      }
    }

    return unique
  }
}



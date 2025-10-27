/**
 * 配置验证器
 */
import type { PerformanceConfig } from '../types'

export class ConfigValidator {
  /**
   * 验证配置
   */
  static validate(config: PerformanceConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 验证预算配置
    if (config.budgets) {
      if (config.budgets.bundles) {
        for (const bundle of config.budgets.bundles) {
          if (!bundle.name) {
            errors.push('Bundle config must have a name')
          }
          if (!bundle.maxSize) {
            errors.push(`Bundle "${bundle.name}" must have maxSize`)
          } else if (!this.isValidSize(bundle.maxSize)) {
            errors.push(`Bundle "${bundle.name}" has invalid maxSize: ${bundle.maxSize}`)
          }
          if (bundle.warningSize && !this.isValidSize(bundle.warningSize)) {
            errors.push(`Bundle "${bundle.name}" has invalid warningSize: ${bundle.warningSize}`)
          }
        }
      }

      if (config.budgets.metrics) {
        const metrics = config.budgets.metrics
        if (metrics.lcp !== undefined && metrics.lcp < 0) {
          errors.push('LCP budget must be positive')
        }
        if (metrics.fid !== undefined && metrics.fid < 0) {
          errors.push('FID budget must be positive')
        }
        if (metrics.cls !== undefined && (metrics.cls < 0 || metrics.cls > 1)) {
          errors.push('CLS budget must be between 0 and 1')
        }
      }
    }

    // 验证分析配置
    if (config.analyze) {
      if (config.analyze.formats) {
        const validFormats = ['html', 'json', 'markdown', 'cli']
        for (const format of config.analyze.formats) {
          if (!validFormats.includes(format)) {
            errors.push(`Invalid report format: ${format}`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 检查体积字符串是否有效
   */
  private static isValidSize(size: string): boolean {
    return /^\d+(\.\d+)?(b|kb|mb|gb)$/i.test(size)
  }
}



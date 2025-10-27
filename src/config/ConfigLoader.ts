/**
 * 配置加载器
 */
import { existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type { PerformanceConfig } from '../types'
import { defaultConfig } from './DefaultConfig'
import { ConfigValidator } from './ConfigValidator'

export class ConfigLoader {
  private static CONFIG_FILES = [
    'performance.config.ts',
    'performance.config.js',
    'performance.config.mjs',
    '.performancerc.ts',
    '.performancerc.js',
  ]

  /**
   * 加载配置
   */
  static async load(cwd: string = process.cwd()): Promise<PerformanceConfig> {
    // 尝试加载配置文件
    const configPath = this.findConfigFile(cwd)
    let userConfig: Partial<PerformanceConfig> = {}

    if (configPath) {
      try {
        const configModule = await import(configPath)
        userConfig = configModule.default || configModule
      } catch (error) {
        console.warn(`Failed to load config from ${configPath}:`, error)
      }
    }

    // 合并配置
    const config = this.mergeConfig(defaultConfig, userConfig)

    // 验证配置
    const validation = ConfigValidator.validate(config)
    if (!validation.valid) {
      throw new Error(`Invalid configuration:\n${validation.errors.join('\n')}`)
    }

    return config
  }

  /**
   * 查找配置文件
   */
  private static findConfigFile(cwd: string): string | null {
    for (const filename of this.CONFIG_FILES) {
      const filepath = resolve(cwd, filename)
      if (existsSync(filepath)) {
        return filepath
      }
    }
    return null
  }

  /**
   * 深度合并配置
   */
  private static mergeConfig(
    defaults: PerformanceConfig,
    user: Partial<PerformanceConfig>
  ): PerformanceConfig {
    return {
      ...defaults,
      ...user,
      budgets: {
        ...defaults.budgets,
        ...user.budgets,
        bundles: user.budgets?.bundles || defaults.budgets?.bundles,
        metrics: {
          ...defaults.budgets?.metrics,
          ...user.budgets?.metrics,
        },
      },
      analyze: {
        ...defaults.analyze,
        ...user.analyze,
      },
      optimize: {
        ...defaults.optimize,
        ...user.optimize,
      },
    }
  }

  /**
   * 从 package.json 加载项目信息
   */
  static async loadProjectInfo(cwd: string = process.cwd()) {
    try {
      const pkgPath = join(cwd, 'package.json')
      if (existsSync(pkgPath)) {
        const pkg = await import(pkgPath, { assert: { type: 'json' } })
        return {
          name: pkg.default?.name || 'unknown',
          version: pkg.default?.version,
          path: cwd,
        }
      }
    } catch (error) {
      // Ignore
    }

    return {
      name: 'unknown',
      path: cwd,
    }
  }
}



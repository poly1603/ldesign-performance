/**
 * 主指标收集器
 */
import type {
  BuildMetrics,
  RuntimeMetrics,
  WebVitalsMetrics
} from '../types'
import { BuildMetricsCollector } from './BuildMetrics'

export class MetricsCollector {
  private buildCollector: BuildMetricsCollector
  private buildMetrics?: BuildMetrics
  private runtimeMetrics?: RuntimeMetrics

  constructor() {
    this.buildCollector = new BuildMetricsCollector()
  }

  /**
   * 开始收集构建指标
   */
  startBuildMetrics(): void {
    this.buildCollector.start()
  }

  /**
   * 结束并收集构建指标
   */
  async endBuildMetrics(buildDir: string, rootDir?: string): Promise<BuildMetrics> {
    this.buildCollector.end()
    this.buildMetrics = await this.buildCollector.collect(buildDir, rootDir)
    return this.buildMetrics
  }

  /**
   * 获取构建指标
   */
  getBuildMetrics(): BuildMetrics | undefined {
    return this.buildMetrics
  }

  /**
   * 设置运行时指标
   */
  setRuntimeMetrics(metrics: RuntimeMetrics): void {
    this.runtimeMetrics = metrics
  }

  /**
   * 获取运行时指标
   */
  getRuntimeMetrics(): RuntimeMetrics | undefined {
    return this.runtimeMetrics
  }

  /**
   * 从外部源导入 Web Vitals
   */
  importWebVitals(vitals: WebVitalsMetrics): void {
    if (!this.runtimeMetrics) {
      this.runtimeMetrics = {}
    }
    this.runtimeMetrics.webVitals = vitals
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.buildMetrics = undefined
    this.runtimeMetrics = undefined
    this.buildCollector = new BuildMetricsCollector()
  }
}



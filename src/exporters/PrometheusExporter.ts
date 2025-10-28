/**
 * Prometheus Metrics 导出器
 */
import type { PerformanceReport, PrometheusMetrics, PrometheusMetric } from '../types'

export class PrometheusExporter {
  private namespace: string

  constructor(namespace: string = 'ldesign_performance') {
    this.namespace = namespace
  }

  /**
   * 从性能报告生成 Prometheus metrics
   */
  generateMetrics(report: PerformanceReport): PrometheusMetrics {
    const metrics: PrometheusMetric[] = []

    // 性能评分
    metrics.push({
      name: `${this.namespace}_score`,
      type: 'gauge',
      help: 'Overall performance score (0-100)',
      value: report.score,
      labels: {
        project: report.project.name,
      },
    })

    // 构建指标
    if (report.buildMetrics) {
      const { buildMetrics } = report

      metrics.push({
        name: `${this.namespace}_build_duration_ms`,
        type: 'gauge',
        help: 'Build duration in milliseconds',
        value: buildMetrics.duration,
        labels: {
          project: report.project.name,
        },
      })

      metrics.push({
        name: `${this.namespace}_total_size_bytes`,
        type: 'gauge',
        help: 'Total bundle size in bytes',
        value: buildMetrics.totalSize,
        labels: {
          project: report.project.name,
        },
      })

      metrics.push({
        name: `${this.namespace}_total_gzip_size_bytes`,
        type: 'gauge',
        help: 'Total gzip size in bytes',
        value: buildMetrics.totalGzipSize,
        labels: {
          project: report.project.name,
        },
      })

      metrics.push({
        name: `${this.namespace}_bundle_count`,
        type: 'gauge',
        help: 'Number of bundles',
        value: buildMetrics.bundles.length,
        labels: {
          project: report.project.name,
        },
      })

      metrics.push({
        name: `${this.namespace}_asset_count`,
        type: 'gauge',
        help: 'Number of assets',
        value: buildMetrics.assets.length,
        labels: {
          project: report.project.name,
        },
      })

      // 每个bundle的大小
      for (const bundle of buildMetrics.bundles) {
        metrics.push({
          name: `${this.namespace}_bundle_size_bytes`,
          type: 'gauge',
          help: 'Individual bundle size in bytes',
          value: bundle.size,
          labels: {
            project: report.project.name,
            bundle: bundle.name,
            is_entry: bundle.isEntry.toString(),
          },
        })
      }
    }

    // Runtime metrics
    if (report.runtimeMetrics?.webVitals) {
      const { webVitals } = report.runtimeMetrics

      if (webVitals.lcp) {
        metrics.push({
          name: `${this.namespace}_lcp_ms`,
          type: 'gauge',
          help: 'Largest Contentful Paint in milliseconds',
          value: webVitals.lcp,
          labels: {
            project: report.project.name,
          },
        })
      }

      if (webVitals.fid) {
        metrics.push({
          name: `${this.namespace}_fid_ms`,
          type: 'gauge',
          help: 'First Input Delay in milliseconds',
          value: webVitals.fid,
          labels: {
            project: report.project.name,
          },
        })
      }

      if (webVitals.cls) {
        metrics.push({
          name: `${this.namespace}_cls`,
          type: 'gauge',
          help: 'Cumulative Layout Shift score',
          value: webVitals.cls,
          labels: {
            project: report.project.name,
          },
        })
      }

      if (webVitals.fcp) {
        metrics.push({
          name: `${this.namespace}_fcp_ms`,
          type: 'gauge',
          help: 'First Contentful Paint in milliseconds',
          value: webVitals.fcp,
          labels: {
            project: report.project.name,
          },
        })
      }

      if (webVitals.tti) {
        metrics.push({
          name: `${this.namespace}_tti_ms`,
          type: 'gauge',
          help: 'Time to Interactive in milliseconds',
          value: webVitals.tti,
          labels: {
            project: report.project.name,
          },
        })
      }

      if (webVitals.tbt) {
        metrics.push({
          name: `${this.namespace}_tbt_ms`,
          type: 'gauge',
          help: 'Total Blocking Time in milliseconds',
          value: webVitals.tbt,
          labels: {
            project: report.project.name,
          },
        })
      }
    }

    // 预算检查
    if (report.budgetResults) {
      const passed = report.budgetResults.filter(r => r.passed).length
      const failed = report.budgetResults.length - passed

      metrics.push({
        name: `${this.namespace}_budget_checks_passed`,
        type: 'gauge',
        help: 'Number of budget checks passed',
        value: passed,
        labels: {
          project: report.project.name,
        },
      })

      metrics.push({
        name: `${this.namespace}_budget_checks_failed`,
        type: 'gauge',
        help: 'Number of budget checks failed',
        value: failed,
        labels: {
          project: report.project.name,
        },
      })
    }

    // 优化建议计数
    const suggestionsByPriority = {
      critical: report.suggestions.filter(s => s.priority === 'critical').length,
      high: report.suggestions.filter(s => s.priority === 'high').length,
      medium: report.suggestions.filter(s => s.priority === 'medium').length,
      low: report.suggestions.filter(s => s.priority === 'low').length,
    }

    for (const [priority, count] of Object.entries(suggestionsByPriority)) {
      metrics.push({
        name: `${this.namespace}_suggestions`,
        type: 'gauge',
        help: 'Number of optimization suggestions',
        value: count,
        labels: {
          project: report.project.name,
          priority,
        },
      })
    }

    return { metrics }
  }

  /**
   * 格式化为 Prometheus 文本格式
   */
  formatPrometheusText(prometheusMetrics: PrometheusMetrics): string {
    const lines: string[] = []

    // 按指标名称分组
    const groupedMetrics = new Map<string, PrometheusMetric[]>()
    for (const metric of prometheusMetrics.metrics) {
      if (!groupedMetrics.has(metric.name)) {
        groupedMetrics.set(metric.name, [])
      }
      groupedMetrics.get(metric.name)!.push(metric)
    }

    // 格式化每个指标
    for (const [name, metrics] of groupedMetrics) {
      // HELP 和 TYPE 只需要写一次
      lines.push(`# HELP ${name} ${metrics[0].help}`)
      lines.push(`# TYPE ${name} ${metrics[0].type}`)

      // 每个指标值
      for (const metric of metrics) {
        const labels = metric.labels
          ? Object.entries(metric.labels)
              .map(([k, v]) => `${k}="${v}"`)
              .join(',')
          : ''
        
        const labelStr = labels ? `{${labels}}` : ''
        lines.push(`${name}${labelStr} ${metric.value}`)
      }

      lines.push('') // 空行分隔不同指标
    }

    return lines.join('\n')
  }

  /**
   * 导出到文件
   */
  exportToFile(report: PerformanceReport, filepath: string): void {
    const metrics = this.generateMetrics(report)
    const text = this.formatPrometheusText(metrics)
    
    // 写入文件
    const fs = require('fs')
    fs.writeFileSync(filepath, text, 'utf-8')
  }
}


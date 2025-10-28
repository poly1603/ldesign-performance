/**
 * 趋势分析器
 */
import type {
  HistoryEntry,
  TrendAnalysisResult,
  TrendData,
  RegressionIssue,
  ImprovementInfo,
} from '../types'

export class TrendAnalyzer {
  /**
   * 分析历史趋势
   */
  analyzeTrends(history: HistoryEntry[]): TrendAnalysisResult {
    if (history.length < 2) {
      return {
        sizetrend: [],
        durationTrend: [],
        scoreTrend: [],
        regressions: [],
        improvements: [],
      }
    }

    return {
      sizetrend: this.analyzeSizeTrend(history),
      durationTrend: this.analyzeDurationTrend(history),
      scoreTrend: this.analyzeScoreTrend(history),
      regressions: this.detectRegressions(history),
      improvements: this.detectImprovements(history),
    }
  }

  /**
   * 分析体积趋势
   */
  private analyzeSizeTrend(history: HistoryEntry[]): TrendData[] {
    return history
      .filter(e => e.report.buildMetrics)
      .map(entry => ({
        timestamp: entry.timestamp,
        value: entry.report.buildMetrics!.totalSize,
        label: entry.commit?.substring(0, 7),
      }))
  }

  /**
   * 分析构建时长趋势
   */
  private analyzeDurationTrend(history: HistoryEntry[]): TrendData[] {
    return history
      .filter(e => e.report.buildMetrics)
      .map(entry => ({
        timestamp: entry.timestamp,
        value: entry.report.buildMetrics!.duration,
        label: entry.commit?.substring(0, 7),
      }))
  }

  /**
   * 分析评分趋势
   */
  private analyzeScoreTrend(history: HistoryEntry[]): TrendData[] {
    return history.map(entry => ({
      timestamp: entry.timestamp,
      value: entry.report.score,
      label: entry.commit?.substring(0, 7),
    }))
  }

  /**
   * 检测回归问题
   */
  private detectRegressions(history: HistoryEntry[]): RegressionIssue[] {
    if (history.length < 2) {
      return []
    }

    const regressions: RegressionIssue[] = []
    const current = history[history.length - 1]
    const baseline = history[history.length - 2]

    // 检查总体积回归
    if (current.report.buildMetrics && baseline.report.buildMetrics) {
      const currentSize = current.report.buildMetrics.totalSize
      const baselineSize = baseline.report.buildMetrics.totalSize
      const sizeChange = ((currentSize - baselineSize) / baselineSize) * 100

      if (sizeChange > 5) {
        regressions.push({
          metric: 'Total Bundle Size',
          current: currentSize,
          baseline: baselineSize,
          changePercentage: sizeChange,
          severity: sizeChange > 20 ? 'critical' : sizeChange > 10 ? 'high' : 'medium',
        })
      }

      // 检查构建时间回归
      const currentDuration = current.report.buildMetrics.duration
      const baselineDuration = baseline.report.buildMetrics.duration
      const durationChange = ((currentDuration - baselineDuration) / baselineDuration) * 100

      if (durationChange > 10) {
        regressions.push({
          metric: 'Build Duration',
          current: currentDuration,
          baseline: baselineDuration,
          changePercentage: durationChange,
          severity: durationChange > 50 ? 'high' : 'medium',
        })
      }
    }

    // 检查评分回归
    const currentScore = current.report.score
    const baselineScore = baseline.report.score
    const scoreChange = baselineScore - currentScore

    if (scoreChange > 5) {
      regressions.push({
        metric: 'Performance Score',
        current: currentScore,
        baseline: baselineScore,
        changePercentage: -scoreChange,
        severity: scoreChange > 20 ? 'critical' : scoreChange > 10 ? 'high' : 'medium',
      })
    }

    return regressions
  }

  /**
   * 检测改进点
   */
  private detectImprovements(history: HistoryEntry[]): ImprovementInfo[] {
    if (history.length < 2) {
      return []
    }

    const improvements: ImprovementInfo[] = []
    const current = history[history.length - 1]
    const previous = history[history.length - 2]

    // 检查体积改进
    if (current.report.buildMetrics && previous.report.buildMetrics) {
      const currentSize = current.report.buildMetrics.totalSize
      const previousSize = previous.report.buildMetrics.totalSize
      const sizeImprovement = ((previousSize - currentSize) / previousSize) * 100

      if (sizeImprovement > 5) {
        improvements.push({
          metric: 'Total Bundle Size',
          current: currentSize,
          previous: previousSize,
          improvementPercentage: sizeImprovement,
        })
      }

      // 检查构建时间改进
      const currentDuration = current.report.buildMetrics.duration
      const previousDuration = previous.report.buildMetrics.duration
      const durationImprovement = ((previousDuration - currentDuration) / previousDuration) * 100

      if (durationImprovement > 10) {
        improvements.push({
          metric: 'Build Duration',
          current: currentDuration,
          previous: previousDuration,
          improvementPercentage: durationImprovement,
        })
      }
    }

    // 检查评分改进
    const currentScore = current.report.score
    const previousScore = previous.report.score
    const scoreImprovement = currentScore - previousScore

    if (scoreImprovement > 5) {
      improvements.push({
        metric: 'Performance Score',
        current: currentScore,
        previous: previousScore,
        improvementPercentage: scoreImprovement,
      })
    }

    return improvements
  }

  /**
   * 比较两个历史记录
   */
  compare(entry1: HistoryEntry, entry2: HistoryEntry) {
    const result: any = {
      timestamp1: entry1.timestamp,
      timestamp2: entry2.timestamp,
      commit1: entry1.commit,
      commit2: entry2.commit,
      differences: {},
    }

    // 比较构建指标
    if (entry1.report.buildMetrics && entry2.report.buildMetrics) {
      const metrics1 = entry1.report.buildMetrics
      const metrics2 = entry2.report.buildMetrics

      result.differences.size = {
        value1: metrics1.totalSize,
        value2: metrics2.totalSize,
        change: metrics2.totalSize - metrics1.totalSize,
        changePercentage: ((metrics2.totalSize - metrics1.totalSize) / metrics1.totalSize) * 100,
      }

      result.differences.duration = {
        value1: metrics1.duration,
        value2: metrics2.duration,
        change: metrics2.duration - metrics1.duration,
        changePercentage: ((metrics2.duration - metrics1.duration) / metrics1.duration) * 100,
      }
    }

    // 比较评分
    result.differences.score = {
      value1: entry1.report.score,
      value2: entry2.report.score,
      change: entry2.report.score - entry1.report.score,
    }

    return result
  }

  /**
   * 计算平均值
   */
  calculateAverages(history: HistoryEntry[]) {
    const withBuildMetrics = history.filter(e => e.report.buildMetrics)

    if (withBuildMetrics.length === 0) {
      return {
        avgSize: 0,
        avgDuration: 0,
        avgScore: 0,
      }
    }

    const totalSize = withBuildMetrics.reduce(
      (sum, e) => sum + e.report.buildMetrics!.totalSize,
      0
    )
    const totalDuration = withBuildMetrics.reduce(
      (sum, e) => sum + e.report.buildMetrics!.duration,
      0
    )
    const totalScore = history.reduce((sum, e) => sum + e.report.score, 0)

    return {
      avgSize: totalSize / withBuildMetrics.length,
      avgDuration: totalDuration / withBuildMetrics.length,
      avgScore: totalScore / history.length,
    }
  }
}


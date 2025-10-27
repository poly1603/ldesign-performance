/**
 * metricsUtils 单元测试
 */
import { describe, it, expect } from 'vitest'
import {
  calculatePerformanceScore,
  sortSuggestions,
  filterSuggestions,
} from '../../src/utils/metricsUtils'
import type { OptimizationSuggestion, BudgetCheckResult, BuildMetrics } from '../../src/types'

describe('metricsUtils', () => {
  describe('calculatePerformanceScore', () => {
    it('should return 100 for perfect metrics', () => {
      const buildMetrics: BuildMetrics = {
        startTime: 0,
        endTime: 10000,
        duration: 10000,
        bundles: [],
        assets: [],
        totalSize: 100000,
        totalGzipSize: 30000,
      }
      const score = calculatePerformanceScore(buildMetrics, [], [])
      expect(score).toBe(100)
    })

    it('should deduct points for failed budgets', () => {
      const buildMetrics: BuildMetrics = {
        startTime: 0,
        endTime: 10000,
        duration: 10000,
        bundles: [],
        assets: [],
        totalSize: 100000,
        totalGzipSize: 30000,
      }
      const failedBudgets: BudgetCheckResult[] = [
        {
          name: 'test',
          type: 'bundle',
          passed: false,
          actual: '500kb',
          budget: '300kb',
          overagePercentage: 66,
        },
      ]
      const score = calculatePerformanceScore(buildMetrics, failedBudgets, [])
      expect(score).toBeLessThan(100)
    })
  })

  describe('sortSuggestions', () => {
    it('should sort by priority', () => {
      const suggestions: OptimizationSuggestion[] = [
        {
          id: '1',
          title: 'Low',
          description: '',
          priority: 'low',
          category: 'other',
          impact: '',
        },
        {
          id: '2',
          title: 'Critical',
          description: '',
          priority: 'critical',
          category: 'other',
          impact: '',
        },
        {
          id: '3',
          title: 'High',
          description: '',
          priority: 'high',
          category: 'other',
          impact: '',
        },
      ]
      const sorted = sortSuggestions(suggestions)
      expect(sorted[0].priority).toBe('critical')
      expect(sorted[1].priority).toBe('high')
      expect(sorted[2].priority).toBe('low')
    })
  })

  describe('filterSuggestions', () => {
    it('should filter by minimum priority', () => {
      const suggestions: OptimizationSuggestion[] = [
        {
          id: '1',
          title: 'Low',
          description: '',
          priority: 'low',
          category: 'other',
          impact: '',
        },
        {
          id: '2',
          title: 'Critical',
          description: '',
          priority: 'critical',
          category: 'other',
          impact: '',
        },
      ]
      const filtered = filterSuggestions(suggestions, 'high')
      expect(filtered.length).toBe(1)
      expect(filtered[0].priority).toBe('critical')
    })
  })
})



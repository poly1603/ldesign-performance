/**
 * formatUtils 单元测试
 */
import { describe, it, expect } from 'vitest'
import {
  formatBytes,
  formatDuration,
  formatPercentage,
  parseSize,
  getScoreGrade,
} from '../../src/utils/formatUtils'

describe('formatUtils', () => {
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B')
      expect(formatBytes(1024)).toBe('1 kB')
      expect(formatBytes(1024 * 1024)).toBe('1 MB')
    })
  })

  describe('formatDuration', () => {
    it('should format duration in milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms')
      expect(formatDuration(1500)).toBe('1.50s')
      expect(formatDuration(65000)).toBe('1m 5s')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(50, 100)).toBe('50.00%')
      expect(formatPercentage(1, 3)).toBe('33.33%')
      expect(formatPercentage(0, 0)).toBe('0%')
    })
  })

  describe('parseSize', () => {
    it('should parse size strings', () => {
      expect(parseSize('100b')).toBe(100)
      expect(parseSize('1kb')).toBe(1024)
      expect(parseSize('1mb')).toBe(1024 * 1024)
      expect(parseSize('1.5kb')).toBe(1536)
    })

    it('should throw on invalid size', () => {
      expect(() => parseSize('invalid')).toThrow()
    })
  })

  describe('getScoreGrade', () => {
    it('should return correct grade', () => {
      expect(getScoreGrade(95)).toBe('Excellent')
      expect(getScoreGrade(75)).toBe('Good')
      expect(getScoreGrade(55)).toBe('Fair')
      expect(getScoreGrade(30)).toBe('Poor')
    })
  })
})



/**
 * 格式化工具函数
 */
import prettyBytes from 'pretty-bytes'

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number): string {
  return prettyBytes(bytes)
}

/**
 * 格式化持续时间（毫秒）
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}m ${seconds}s`
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(2)}%`
}

/**
 * 格式化数字（添加千分位）
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * 解析大小字符串为字节数
 */
export function parseSize(sizeStr: string): number {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)$/i)
  if (!match) {
    throw new Error(`Invalid size string: ${sizeStr}`)
  }

  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase()

  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  }

  return value * units[unit]
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

/**
 * 截断字符串
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * 颜色化分数
 */
export function colorizeScore(score: number): string {
  if (score >= 90) return '🟢' // Green
  if (score >= 70) return '🟡' // Yellow
  if (score >= 50) return '🟠' // Orange
  return '🔴' // Red
}

/**
 * 获取分数等级
 */
export function getScoreGrade(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Poor'
}



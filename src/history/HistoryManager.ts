/**
 * 历史数据管理器
 */
import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import type { HistoryEntry, PerformanceReport } from '../types'
import { readJsonFile, writeJsonFile } from '../utils/fileUtils'

export class HistoryManager {
  private historyDir: string
  private historyFile: string
  private maxEntries: number

  constructor(outputDir: string = '.performance', maxEntries: number = 50) {
    this.historyDir = outputDir
    this.historyFile = join(outputDir, 'history.json')
    this.maxEntries = maxEntries
    
    if (!existsSync(this.historyDir)) {
      mkdirSync(this.historyDir, { recursive: true })
    }
  }

  /**
   * 添加历史记录
   */
  async addEntry(report: PerformanceReport, meta?: {
    commit?: string
    branch?: string
  }): Promise<void> {
    const history = await this.loadHistory()
    
    const entry: HistoryEntry = {
      timestamp: report.timestamp,
      commit: meta?.commit,
      branch: meta?.branch,
      report,
    }

    history.push(entry)

    // 保持历史记录数量限制
    if (history.length > this.maxEntries) {
      history.shift()
    }

    await this.saveHistory(history)
  }

  /**
   * 获取历史记录
   */
  async getHistory(limit?: number): Promise<HistoryEntry[]> {
    const history = await this.loadHistory()
    
    if (limit) {
      return history.slice(-limit)
    }
    
    return history
  }

  /**
   * 获取最近一次记录
   */
  async getLatest(): Promise<HistoryEntry | undefined> {
    const history = await this.loadHistory()
    return history[history.length - 1]
  }

  /**
   * 按分支获取历史
   */
  async getByBranch(branch: string, limit?: number): Promise<HistoryEntry[]> {
    const history = await this.loadHistory()
    const filtered = history.filter(e => e.branch === branch)
    
    if (limit) {
      return filtered.slice(-limit)
    }
    
    return filtered
  }

  /**
   * 按时间范围获取历史
   */
  async getByTimeRange(startTime: number, endTime: number): Promise<HistoryEntry[]> {
    const history = await this.loadHistory()
    return history.filter(e => e.timestamp >= startTime && e.timestamp <= endTime)
  }

  /**
   * 清除历史记录
   */
  async clearHistory(): Promise<void> {
    await this.saveHistory([])
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    const history = await this.loadHistory()
    
    if (history.length === 0) {
      return {
        count: 0,
        firstEntry: null,
        lastEntry: null,
        branches: [],
      }
    }

    const branches = [...new Set(history.map(e => e.branch).filter(Boolean))]
    
    return {
      count: history.length,
      firstEntry: history[0].timestamp,
      lastEntry: history[history.length - 1].timestamp,
      branches,
    }
  }

  /**
   * 加载历史数据
   */
  private async loadHistory(): Promise<HistoryEntry[]> {
    if (!existsSync(this.historyFile)) {
      return []
    }

    try {
      return readJsonFile<HistoryEntry[]>(this.historyFile)
    } catch (error) {
      console.warn('Failed to load history, starting fresh')
      return []
    }
  }

  /**
   * 保存历史数据
   */
  private async saveHistory(history: HistoryEntry[]): Promise<void> {
    writeJsonFile(this.historyFile, history)
  }
}


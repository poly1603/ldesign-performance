/**
 * 构建指标收集器
 */
import { join, relative, basename } from 'node:path'
import type { BuildMetrics as IBuildMetrics, BundleMetrics, AssetMetrics } from '../types'
import {
  findBuildAssets,
  getFileSize,
  getGzipSize,
  getAssetType
} from '../utils/fileUtils'

export class BuildMetricsCollector {
  private startTime: number = 0
  private endTime: number = 0

  /**
   * 标记构建开始
   */
  start(): void {
    this.startTime = Date.now()
  }

  /**
   * 标记构建结束
   */
  end(): void {
    this.endTime = Date.now()
  }

  /**
   * 收集构建指标
   */
  async collect(buildDir: string, rootDir: string = process.cwd()): Promise<IBuildMetrics> {
    const assets = await findBuildAssets(buildDir)

    const bundles: BundleMetrics[] = []
    const assetsList: AssetMetrics[] = []
    let totalSize = 0
    let totalGzipSize = 0

    for (const assetPath of assets) {
      const size = getFileSize(assetPath)
      const gzipSize = getGzipSize(assetPath)
      const name = basename(assetPath)
      const relativePath = relative(rootDir, assetPath)
      const type = getAssetType(assetPath)

      totalSize += size
      totalGzipSize += gzipSize

      // JS/CSS 文件视为打包产物
      if (type === 'js' || type === 'css') {
        bundles.push({
          name,
          size,
          gzipSize,
          path: relativePath,
          isEntry: this.isEntryFile(name),
        })
      }

      // 记录所有资源
      assetsList.push({
        name,
        type,
        size,
        path: relativePath,
      })
    }

    return {
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime - this.startTime,
      bundles: bundles.sort((a, b) => b.size - a.size),
      assets: assetsList.sort((a, b) => b.size - a.size),
      totalSize,
      totalGzipSize,
    }
  }

  /**
   * 判断是否为入口文件
   */
  private isEntryFile(filename: string): boolean {
    const entryPatterns = [
      /^index\./,
      /^main\./,
      /^app\./,
      /^bundle\./,
      /-[a-f0-9]{8}\.(js|css)$/,  // Hash pattern
    ]

    return entryPatterns.some(pattern => pattern.test(filename))
  }

  /**
   * 获取构建时长
   */
  getDuration(): number {
    return this.endTime - this.startTime
  }
}



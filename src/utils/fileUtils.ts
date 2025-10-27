/**
 * 文件工具函数
 */
import { statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { gzipSync } from 'node:zlib'
import glob from 'fast-glob'
import gzipSize from 'gzip-size'
import type { AssetType } from '../types'

/**
 * 获取文件大小
 */
export function getFileSize(filePath: string): number {
  try {
    const stats = statSync(filePath)
    return stats.size
  } catch {
    return 0
  }
}

/**
 * 获取文件的 gzip 大小
 */
export function getGzipSize(filePath: string): number {
  try {
    return gzipSize.fileSync(filePath)
  } catch {
    return 0
  }
}

/**
 * 根据文件扩展名获取资源类型
 */
export function getAssetType(filePath: string): AssetType {
  const ext = extname(filePath).toLowerCase()

  const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.ico']
  const fontExts = ['.woff', '.woff2', '.ttf', '.otf', '.eot']
  const cssExts = ['.css']
  const jsExts = ['.js', '.mjs', '.cjs']

  if (imageExts.includes(ext)) return 'image'
  if (fontExts.includes(ext)) return 'font'
  if (cssExts.includes(ext)) return 'css'
  if (jsExts.includes(ext)) return 'js'

  return 'other'
}

/**
 * 查找所有构建产物
 */
export async function findBuildAssets(
  buildDir: string,
  patterns: string[] = ['**/*.{js,css,html,png,jpg,jpeg,gif,svg,woff,woff2}']
): Promise<string[]> {
  return await glob(patterns, {
    cwd: buildDir,
    absolute: true,
    onlyFiles: true,
  })
}

/**
 * 确保目录存在
 */
export function ensureDir(dirPath: string): void {
  try {
    mkdirSync(dirPath, { recursive: true })
  } catch (error) {
    // Ignore if already exists
  }
}

/**
 * 写入 JSON 文件
 */
export function writeJsonFile(filePath: string, data: any): void {
  ensureDir(dirname(filePath))
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * 读取 JSON 文件
 */
export function readJsonFile<T = any>(filePath: string): T | null {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * 写入文本文件
 */
export function writeTextFile(filePath: string, content: string): void {
  ensureDir(dirname(filePath))
  writeFileSync(filePath, content, 'utf-8')
}



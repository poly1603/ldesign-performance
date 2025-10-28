/**
 * 安全分析器
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
  BuildMetrics,
  SecurityAnalysisResult,
  SensitiveInfoIssue,
  VulnerabilityIssue,
  LicenseInfo,
  CspAnalysis,
} from '../types'

export class SecurityAnalyzer {
  /**
   * 敏感信息检测正则
   */
  private readonly SENSITIVE_PATTERNS = {
    'api-key': [
      /api[_-]?key['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
      /apikey['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
    ],
    token: [
      /token['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]/gi,
      /bearer\s+([a-zA-Z0-9_\-\.]{20,})/gi,
      /authorization['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]/gi,
    ],
    password: [
      /password['"]?\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
      /passwd['"]?\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
    ],
    secret: [
      /secret['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{16,})['"]/gi,
      /client[_-]?secret['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{16,})['"]/gi,
    ],
    'private-key': [
      /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
      /private[_-]?key['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
    ],
    email: [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    ],
  }

  /**
   * 已知的高风险许可证
   */
  private readonly HIGH_RISK_LICENSES = [
    'GPL-2.0',
    'GPL-3.0',
    'AGPL-3.0',
    'LGPL-2.1',
    'LGPL-3.0',
  ]

  /**
   * 分析构建产物的安全性
   */
  async analyze(buildDir: string, metrics: BuildMetrics): Promise<SecurityAnalysisResult> {
    const sensitiveInfo = await this.detectSensitiveInfo(buildDir, metrics)
    const vulnerabilities = await this.scanVulnerabilities(buildDir)
    const licenses = await this.checkLicenses(buildDir)
    const csp = await this.analyzeCSP(buildDir)

    // 计算安全评分
    const securityScore = this.calculateSecurityScore({
      sensitiveInfo,
      vulnerabilities,
      licenses,
      csp,
    })

    return {
      sensitiveInfo,
      vulnerabilities,
      licenses,
      csp,
      securityScore,
    }
  }

  /**
   * 检测敏感信息
   */
  private async detectSensitiveInfo(
    buildDir: string,
    metrics: BuildMetrics
  ): Promise<SensitiveInfoIssue[]> {
    const issues: SensitiveInfoIssue[] = []

    // 检查所有 JS 文件
    const jsFiles = metrics.bundles.map(b => join(buildDir, b.name))

    for (const file of jsFiles) {
      try {
        const content = readFileSync(file, 'utf-8')
        const lines = content.split('\n')

        // 检查每种敏感信息类型
        for (const [type, patterns] of Object.entries(this.SENSITIVE_PATTERNS)) {
          for (const pattern of patterns) {
            // 重置正则表达式状态
            pattern.lastIndex = 0
            
            let match
            while ((match = pattern.exec(content)) !== null) {
              // 计算行号
              const beforeMatch = content.substring(0, match.index)
              const lineNumber = beforeMatch.split('\n').length

              // 脱敏处理
              const matchedText = match[0]
              const masked = this.maskSensitiveData(matchedText)

              issues.push({
                type: type as any,
                file,
                line: lineNumber,
                match: masked,
                severity: this.getSeverity(type),
              })
            }
          }
        }
      } catch (error) {
        // 忽略读取错误
      }
    }

    return issues
  }

  /**
   * 扫描依赖漏洞
   */
  private async scanVulnerabilities(buildDir: string): Promise<VulnerabilityIssue[]> {
    // 这里需要集成 npm audit 或类似工具
    // 简化实现：读取 package.json 并检查已知漏洞
    const vulnerabilities: VulnerabilityIssue[] = []

    try {
      const packageJsonPath = join(buildDir, '../package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      // 简化示例：检查一些已知的有问题的包版本
      const knownVulnerabilities = {
        'lodash': ['4.17.19', '4.17.20'],
        'axios': ['0.21.0', '0.21.1'],
      }

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }

      for (const [pkg, version] of Object.entries(allDeps || {})) {
        if (knownVulnerabilities[pkg as keyof typeof knownVulnerabilities]) {
          vulnerabilities.push({
            package: pkg,
            version: version as string,
            severity: 'moderate',
            title: `Known vulnerability in ${pkg}`,
            recommendation: 'Update to the latest version',
          })
        }
      }
    } catch (error) {
      // package.json 不存在或读取失败
    }

    return vulnerabilities
  }

  /**
   * 检查许可证
   */
  private async checkLicenses(buildDir: string): Promise<LicenseInfo[]> {
    const licenses: LicenseInfo[] = []

    try {
      const packageJsonPath = join(buildDir, '../package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }

      // 简化实现：只检查主 package.json 的许可证
      if (packageJson.license) {
        const license = packageJson.license
        const isHighRisk = this.HIGH_RISK_LICENSES.includes(license)

        licenses.push({
          package: packageJson.name || 'main',
          license,
          compatible: !isHighRisk,
          risk: isHighRisk ? 'high' : 'low',
        })
      }

      // 在实际实现中，应该检查所有依赖的许可证
      // 可以使用 license-checker 等工具
    } catch (error) {
      // 忽略错误
    }

    return licenses
  }

  /**
   * 分析 CSP (Content Security Policy)
   */
  private async analyzeCSP(buildDir: string): Promise<CspAnalysis> {
    // 检查 index.html 中的 CSP
    try {
      const indexPath = join(buildDir, 'index.html')
      const content = readFileSync(indexPath, 'utf-8')

      // 查找 CSP meta 标签或 HTTP 头
      const cspMetaMatch = content.match(
        /<meta\s+http-equiv=["']Content-Security-Policy["']\s+content=["']([^"']+)["']/i
      )

      if (cspMetaMatch) {
        const policy = cspMetaMatch[1]
        return {
          exists: true,
          policy,
          score: this.scoreCSP(policy),
          suggestions: this.getCSPSuggestions(policy),
        }
      }
    } catch (error) {
      // index.html 不存在或读取失败
    }

    return {
      exists: false,
      score: 0,
      suggestions: [
        '添加 Content-Security-Policy 头或 meta 标签',
        '限制脚本来源（script-src）',
        '限制样式来源（style-src）',
        '禁止不安全的内联脚本和样式',
        '启用 upgrade-insecure-requests',
      ],
    }
  }

  /**
   * 脱敏处理
   */
  private maskSensitiveData(text: string): string {
    // 保留前后几个字符，中间用 * 替换
    if (text.length <= 10) {
      return '*'.repeat(text.length)
    }

    const start = text.substring(0, 5)
    const end = text.substring(text.length - 5)
    const middle = '*'.repeat(Math.min(20, text.length - 10))

    return `${start}${middle}${end}`
  }

  /**
   * 获取严重程度
   */
  private getSeverity(type: string): 'critical' | 'high' | 'medium' | 'low' {
    const severityMap: Record<string, any> = {
      'api-key': 'critical',
      'token': 'critical',
      'password': 'critical',
      'secret': 'critical',
      'private-key': 'critical',
      'email': 'low',
    }
    return severityMap[type] || 'medium'
  }

  /**
   * 计算安全评分
   */
  private calculateSecurityScore(result: Omit<SecurityAnalysisResult, 'securityScore'>): number {
    let score = 100

    // 敏感信息扣分
    const criticalIssues = result.sensitiveInfo.filter(i => i.severity === 'critical').length
    const highIssues = result.sensitiveInfo.filter(i => i.severity === 'high').length
    score -= criticalIssues * 20
    score -= highIssues * 10

    // 漏洞扣分
    const criticalVulns = result.vulnerabilities.filter(v => v.severity === 'critical').length
    const highVulns = result.vulnerabilities.filter(v => v.severity === 'high').length
    score -= criticalVulns * 15
    score -= highVulns * 8

    // 许可证风险扣分
    const highRiskLicenses = result.licenses.filter(l => l.risk === 'high').length
    score -= highRiskLicenses * 5

    // CSP 加分
    if (result.csp?.exists) {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 评分 CSP 策略
   */
  private scoreCSP(policy: string): number {
    let score = 50 // 基础分

    // 检查关键指令
    if (policy.includes('script-src')) score += 10
    if (policy.includes('style-src')) score += 5
    if (policy.includes('img-src')) score += 5
    if (policy.includes('default-src')) score += 10

    // 检查安全特性
    if (policy.includes("'strict-dynamic'")) score += 10
    if (policy.includes('upgrade-insecure-requests')) score += 5
    if (!policy.includes("'unsafe-inline'")) score += 5
    if (!policy.includes("'unsafe-eval'")) score += 5

    return Math.min(100, score)
  }

  /**
   * 获取 CSP 改进建议
   */
  private getCSPSuggestions(policy: string): string[] {
    const suggestions: string[] = []

    if (policy.includes("'unsafe-inline'")) {
      suggestions.push('移除 unsafe-inline，使用 nonce 或 hash')
    }
    if (policy.includes("'unsafe-eval'")) {
      suggestions.push('移除 unsafe-eval，避免使用 eval()')
    }
    if (!policy.includes('upgrade-insecure-requests')) {
      suggestions.push('添加 upgrade-insecure-requests 指令')
    }
    if (!policy.includes("'strict-dynamic'")) {
      suggestions.push('考虑使用 strict-dynamic 提升安全性')
    }

    return suggestions
  }
}


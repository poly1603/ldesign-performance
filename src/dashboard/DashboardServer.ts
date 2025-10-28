/**
 * 性能监控仪表板服务器
 */
import express, { type Express } from 'express'
import { Server as WebSocketServer } from 'ws'
import { createServer, type Server } from 'http'
import open from 'open'
import type { PerformanceReport, DashboardConfig } from '../types'

export class DashboardServer {
  private app: Express
  private server: Server | null = null
  private wss: WebSocketServer | null = null
  private config: DashboardConfig
  private latestReport: PerformanceReport | null = null

  constructor(config: Partial<DashboardConfig> = {}) {
    this.config = {
      port: config.port || 3000,
      open: config.open !== false,
      wsPort: config.wsPort || 3001,
      refreshInterval: config.refreshInterval || 5000,
    }

    this.app = express()
    this.setupMiddleware()
    this.setupRoutes()
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    this.app.use(express.json())
    this.app.use(express.static('public'))
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // 首页
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML())
    })

    // API: 获取最新报告
    this.app.get('/api/report', (req, res) => {
      if (this.latestReport) {
        res.json(this.latestReport)
      } else {
        res.status(404).json({ error: 'No report available' })
      }
    })

    // API: 更新报告
    this.app.post('/api/report', (req, res) => {
      this.latestReport = req.body
      this.broadcastUpdate(this.latestReport)
      res.json({ success: true })
    })

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' })
    })
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 启动 HTTP 服务器
        this.server = createServer(this.app)
        this.server.listen(this.config.port, () => {
          console.log(`📊 Dashboard server running at http://localhost:${this.config.port}`)

          // 启动 WebSocket 服务器
          this.setupWebSocket()

          // 自动打开浏览器
          if (this.config.open) {
            open(`http://localhost:${this.config.port}`)
          }

          resolve()
        })

        this.server.on('error', reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 设置 WebSocket
   */
  private setupWebSocket(): void {
    if (!this.server) return

    this.wss = new WebSocketServer({ server: this.server })

    this.wss.on('connection', (ws) => {
      console.log('📡 New WebSocket connection')

      // 发送当前报告
      if (this.latestReport) {
        ws.send(JSON.stringify({
          type: 'report',
          data: this.latestReport,
        }))
      }

      ws.on('close', () => {
        console.log('📡 WebSocket connection closed')
      })
    })
  }

  /**
   * 广播更新
   */
  private broadcastUpdate(report: PerformanceReport): void {
    if (!this.wss) return

    const message = JSON.stringify({
      type: 'update',
      data: report,
    })

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message)
      }
    })
  }

  /**
   * 更新报告
   */
  updateReport(report: PerformanceReport): void {
    this.latestReport = report
    this.broadcastUpdate(report)
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close()
      }

      if (this.server) {
        this.server.close(() => {
          console.log('Dashboard server stopped')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  /**
   * 生成仪表板 HTML
   */
  private generateDashboardHTML(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Dashboard - @ldesign/performance</title>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header .status {
      display: inline-block;
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      font-size: 0.9em;
    }
    .status.connected { background: #10b981; }
    .status.disconnected { background: #ef4444; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: #1e293b;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .card h2 {
      font-size: 1.5em;
      margin-bottom: 16px;
      color: #60a5fa;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #334155;
    }
    .metric:last-child { border-bottom: none; }
    .metric-label { color: #94a3b8; }
    .metric-value {
      font-weight: 600;
      color: #e2e8f0;
    }
    .chart {
      width: 100%;
      height: 400px;
      margin-top: 20px;
    }
    .score {
      font-size: 4em;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    .score.excellent { color: #10b981; }
    .score.good { color: #fbbf24; }
    .score.fair { color: #fb923c; }
    .score.poor { color: #ef4444; }
    
    .suggestions {
      list-style: none;
    }
    .suggestion {
      padding: 12px;
      margin: 8px 0;
      background: #0f172a;
      border-left: 4px solid #60a5fa;
      border-radius: 4px;
    }
    .suggestion.critical { border-color: #ef4444; }
    .suggestion.high { border-color: #f59e0b; }
    .suggestion.medium { border-color: #fbbf24; }
    .suggestion.low { border-color: #10b981; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Performance Dashboard</h1>
    <p>Real-time performance monitoring powered by @ldesign/performance</p>
    <div class="status" id="status">Connecting...</div>
  </div>

  <div class="grid">
    <div class="card">
      <h2>Performance Score</h2>
      <div class="score" id="score">--</div>
    </div>

    <div class="card">
      <h2>Build Metrics</h2>
      <div id="buildMetrics">
        <div class="metric">
          <span class="metric-label">Total Size</span>
          <span class="metric-value" id="totalSize">--</span>
        </div>
        <div class="metric">
          <span class="metric-label">Gzip Size</span>
          <span class="metric-value" id="gzipSize">--</span>
        </div>
        <div class="metric">
          <span class="metric-label">Build Duration</span>
          <span class="metric-value" id="duration">--</span>
        </div>
        <div class="metric">
          <span class="metric-label">Bundles</span>
          <span class="metric-value" id="bundles">--</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Budget Status</h2>
      <div id="budgetStatus">No budget data</div>
    </div>
  </div>

  <div class="card">
    <h2>Bundle Size Distribution</h2>
    <div id="bundleChart" class="chart"></div>
  </div>

  <div class="card">
    <h2>Optimization Suggestions</h2>
    <ul class="suggestions" id="suggestions">
      <li>Waiting for data...</li>
    </ul>
  </div>

  <script>
    const ws = new WebSocket('ws://localhost:${this.config.port}')
    const statusEl = document.getElementById('status')
    let bundleChart = null

    ws.onopen = () => {
      statusEl.textContent = 'Connected'
      statusEl.className = 'status connected'
    }

    ws.onclose = () => {
      statusEl.textContent = 'Disconnected'
      statusEl.className = 'status disconnected'
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'report' || message.type === 'update') {
        updateDashboard(message.data)
      }
    }

    function updateDashboard(report) {
      // Update score
      const scoreEl = document.getElementById('score')
      scoreEl.textContent = report.score
      scoreEl.className = 'score ' + getScoreClass(report.score)

      // Update build metrics
      if (report.buildMetrics) {
        document.getElementById('totalSize').textContent = formatBytes(report.buildMetrics.totalSize)
        document.getElementById('gzipSize').textContent = formatBytes(report.buildMetrics.totalGzipSize)
        document.getElementById('duration').textContent = formatDuration(report.buildMetrics.duration)
        document.getElementById('bundles').textContent = report.buildMetrics.bundles.length

        // Update chart
        updateBundleChart(report.buildMetrics.bundles)
      }

      // Update budget status
      if (report.budgetResults && report.budgetResults.length > 0) {
        const passed = report.budgetResults.filter(r => r.passed).length
        const total = report.budgetResults.length
        document.getElementById('budgetStatus').innerHTML = 
          \`<div class="metric">
            <span class="metric-label">Passed</span>
            <span class="metric-value">\${passed}/\${total}</span>
          </div>\`
      }

      // Update suggestions
      if (report.suggestions && report.suggestions.length > 0) {
        const suggestionsHTML = report.suggestions.slice(0, 10).map(s => 
          \`<li class="suggestion \${s.priority}">
            <strong>[\${s.priority.toUpperCase()}]</strong> \${s.title}
          </li>\`
        ).join('')
        document.getElementById('suggestions').innerHTML = suggestionsHTML
      }
    }

    function updateBundleChart(bundles) {
      if (!bundleChart) {
        bundleChart = echarts.init(document.getElementById('bundleChart'))
      }

      const data = bundles.map(b => ({
        name: b.name,
        value: b.size
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} bytes ({d}%)'
        },
        series: [{
          name: 'Bundles',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0f172a',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside'
          },
          data: data
        }]
      }

      bundleChart.setOption(option)
    }

    function getScoreClass(score) {
      if (score >= 90) return 'excellent'
      if (score >= 75) return 'good'
      if (score >= 50) return 'fair'
      return 'poor'
    }

    function formatBytes(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    function formatDuration(ms) {
      if (ms < 1000) return ms + 'ms'
      return (ms / 1000).toFixed(2) + 's'
    }

    // Fetch initial data
    fetch('/api/report')
      .then(res => res.json())
      .then(data => updateDashboard(data))
      .catch(err => console.log('No initial data'))
  </script>
</body>
</html>`
  }
}


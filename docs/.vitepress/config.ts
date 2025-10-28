import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/performance',
  description: '企业级前端性能优化工具包',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/overview' },
      { text: '示例', link: '/examples/basic' },
      { 
        text: '生态',
        items: [
          { text: '@ldesign/kit', link: 'https://kit.ldesign.dev' },
          { text: '@ldesign/shared', link: 'https://shared.ldesign.dev' },
        ]
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '核心概念', link: '/guide/concepts' },
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '优化规则', link: '/guide/optimization-rules' },
            { text: '分析器', link: '/guide/analyzers' },
            { text: '报告生成', link: '/guide/reporters' },
            { text: '预算管理', link: '/guide/budgets' },
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '安全检测', link: '/guide/security' },
            { text: '框架优化', link: '/guide/frameworks' },
            { text: '缓存策略', link: '/guide/caching' },
            { text: '实时监控', link: '/guide/monitoring' },
            { text: '历史趋势', link: '/guide/trends' },
          ]
        },
        {
          text: '集成',
          items: [
            { text: 'Vite 插件', link: '/guide/vite-plugin' },
            { text: 'CI/CD', link: '/guide/ci-cd' },
            { text: 'Prometheus', link: '/guide/prometheus' },
          ]
        },
        {
          text: '其他',
          items: [
            { text: '配置', link: '/guide/configuration' },
            { text: 'CLI 命令', link: '/guide/cli' },
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '故障排查', link: '/guide/troubleshooting' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '总览', link: '/api/overview' },
            { text: '优化规则', link: '/api/rules' },
            { text: '分析器', link: '/api/analyzers' },
            { text: '报告器', link: '/api/reporters' },
            { text: '工具函数', link: '/api/utils' },
            { text: '类型定义', link: '/api/types' },
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础使用', link: '/examples/basic' },
            { text: 'Vite 集成', link: '/examples/vite' },
            { text: '自定义规则', link: '/examples/custom-rules' },
            { text: 'CI/CD 集成', link: '/examples/ci-cd' },
            { text: '实时仪表板', link: '/examples/dashboard' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/performance' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 LDesign Team'
    },

    search: {
      provider: 'local'
    }
  }
})


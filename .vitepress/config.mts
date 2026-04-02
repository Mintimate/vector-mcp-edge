import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: "VitePress MCP 智能检索",
    description: "基于 CNB 知识库 + EdgeOne Edge Function，为 VitePress 文档站点赋予 AI 语义搜索能力",
    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }]
    ],
    themeConfig: {
      logo: '/logo.svg',
      nav: [
        { text: '首页', link: '/' },
        { text: '功能/效果', link: '/features/' },
        { text: '搭建教程', link: '/guide/' }
      ],
      sidebar: {
        '/features/': [
          {
            text: '功能与效果',
            items: [
              { text: '方案对比与选型', link: '/features/solutions' },
              { text: '架构全景图', link: '/features/architecture' },
              { text: 'Opt1: 接入外部 AI 工具', link: '/features/solution-mcp' },
              { text: 'Opt2: 自建 Go 服务 RAG', link: '/features/solution-rag' }
            ]
          }
        ],
        '/guide/': [
          {
            text: '开始这里',
            items: [
              { text: '文档导航', link: '/guide/' },
              { text: '快速开始', link: '/guide/getting-started' }
            ]
          },
          {
            text: '主线教程',
            items: [
              { text: '托管到 CNB', link: '/guide/deploy-cnb' },
              { text: '知识库向量化', link: '/guide/knowledge-base' },
              { text: 'Edge Function 实现 MCP Server', link: '/guide/mcp-server' },
              { text: '部署与验证', link: '/guide/deploy-verify' }
            ]
          },
          {
            text: '实战与维护',
            items: [
              { text: '扩展更多 MCP 工具', link: '/guide/extend-tools' },
              { text: '最佳实践', link: '/guide/best-practices' },
              { text: '常见问题 FAQ', link: '/guide/faq' },
              { text: '故障排查', link: '/guide/troubleshooting' },
              { text: '术语表', link: '/guide/glossary' }
            ]
          }
        ]
      },
      socialLinks: [
        { icon: 'github', link: 'https://cnb.cool/shenzhen/lecturer/vector-mcp-edge' }
      ],
      footer: {
        message: '基于 CNB 平台知识库 + 腾讯云 EdgeOne Edge Function',
        copyright: 'Copyright © 2026'
      },
      search: {
        provider: 'local'
      }
    }
  })
)

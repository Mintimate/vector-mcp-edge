import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    lang: 'zh-CN',
    title: "VitePress MCP 智能检索",
    description: "基于 CNB 知识库 + EdgeOne Edge Function，为 VitePress 文档站点赋予 AI 语义搜索能力",
    srcExclude: ['**/README.md','DocVitePressOMR'],
    sitemap: {
      hostname: 'https://vector-mcp-edge.mintimate.cn'
    },
    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }]
    ],
    themeConfig: {
      logo: '/logo.svg',
      outline: {
        label: '本页导航',
        level: [2, 6]
      },
      docFooter: {
        prev: '上一页',
        next: '下一页'
      },
      lastUpdated: {
        text: '最后更新于'
      },
      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '菜单',
      darkModeSwitchLabel: '主题',
      lightModeSwitchTitle: '切换到浅色模式',
      darkModeSwitchTitle: '切换到深色模式',
      notFound: {
        title: '这里什么都没有',
        quote: '你想找的页面可能已被移除或不存在'
      },
      nav: [
        { text: '首页', link: '/' },
        { text: '上手体验', link: '/features/' },
        { text: '搭建教程', link: '/guide/' }
      ],
      sidebar: {
        '/features/': [
          {
            text: '这里开始',
            items: [
              { text: '方案选型', link: '/features/solutions' }
            ]
          },
          {
            text: '架构与方案',
            items: [
              { text: '架构全景图', link: '/features/architecture' },
              { text: 'Go Cloud Function', link: '/features/solution-go-function' },
              { text: '方案演进与对比', link: '/features/solutions' }
            ]
          },
          {
            text: '历史方案（已归档）',
            collapsed: true,
            items: [
              { text: 'JS Serverless MCP', link: '/features/solution-mcp' },
              { text: 'Go RAG 自建服务', link: '/features/solution-rag' }
            ]
          },
          {
            text: '在线体验',
            items: [
              { text: '本站 MCP 端点', link: '/features/mcp-endpoint' }
            ]
          }
        ],
        '/guide/': [
          {
            text: '开始这里',
            items: [
              { text: '搭建教程', link: '/guide/' },
              { text: '快速开始', link: '/guide/getting-started' }
            ]
          },
          {
            text: '主线教程',
            items: [
              { text: '托管到 CNB', link: '/guide/deploy-cnb' },
              { text: '知识库向量化', link: '/guide/knowledge-base' },
              { text: 'Cloud Function', link: '/guide/cloud-function' },
              { text: '部署与验证', link: '/guide/deploy-verify' }
            ]
          },
          {
            text: '历史教程（已归档）',
            collapsed: true,
            items: [
              { text: 'JS Edge Function 实现 MCP', link: '/guide/mcp-server' }
            ]
          },
          {
            text: '实战与维护',
            items: [
              { text: '扩展更多 MCP 工具', link: '/guide/extend-tools' },
              { text: '配置网页端 AI 助手', link: '/guide/ai-assistant' },
              { text: '最佳实践', link: '/guide/best-practices' },
              { text: '常见问题 FAQ', link: '/guide/faq' },
              { text: '故障排查', link: '/guide/troubleshooting' },
              { text: '术语表', link: '/guide/glossary' }
            ]
          }
        ]
      },
      socialLinks: [
        { icon: { svg: '<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M228.906 40.2412C229.882 37.5108 228.906 34.3903 226.759 32.44C219.342 26.004 200.799 12.3519 173.082 10.4016C141.852 8.06121 122.528 16.4475 112.769 22.6885C108.474 25.4189 108.279 31.4649 112.183 34.3903L191.625 96.2149C198.652 101.676 208.997 98.5553 211.729 90.169L228.711 40.2412H228.906Z" fill="currentColor"/><path d="M32.9381 223.564C29.6199 225.71 28.2536 229.805 29.2295 233.511C32.1573 244.432 41.3312 266.861 66.9009 287.534C92.4706 308.012 122.725 310.353 135.607 309.963C139.511 309.963 142.829 307.427 144 303.722L194.945 142.627C198.653 130.925 185.576 121.173 175.426 127.999L32.9381 223.564Z" fill="currentColor"/><path d="M70.2169 53.4955C67.6794 52.5203 64.9468 52.7153 62.6045 53.8855C53.2355 58.9563 29.032 74.7538 16.54 107.324C6.78054 132.288 10.0987 159.982 12.8314 173.439C13.6121 177.925 18.2967 180.46 22.5908 178.705L175.424 119.026C186.354 114.735 186.354 99.3276 175.424 95.0369L70.2169 53.4955Z" fill="currentColor"/><path d="M297.03 168.968C301.519 171.893 307.57 169.358 308.351 164.092C310.303 150.05 312.06 125.866 304.057 107.338C293.321 82.9591 274.974 67.7468 266.19 61.7008C263.458 59.7505 259.749 59.9456 257.212 62.2859L218.564 96.4162C212.318 102.072 212.904 112.019 219.931 116.699L297.03 168.968Z" fill="currentColor"/><path d="M189.089 299.428C188.699 303.914 192.603 307.814 197.092 307.229C211.731 305.669 241.79 299.818 264.237 278.365C286.098 257.496 293.32 232.728 295.272 222.781C295.858 220.051 295.272 217.32 293.515 215.175L225.98 131.897C218.758 122.925 204.119 127.411 203.143 138.918L189.089 299.233V299.428Z" fill="currentColor"/></svg>' }, link: 'https://cnb.cool/shenzhen/lecturer/vector-mcp-edge' },
        { icon: 'github', link: 'https://github.com/Mintimate/vector-mcp-edge' }
      ],
      footer: {
        message: '基于 CNB 平台知识库 + 腾讯云 EdgeOne Edge Function',
        copyright: 'Copyright © 2026 | <a href="https://www.mintimate.cn" target="_blank">Mintimate 博客</a> · <a href="https://space.bilibili.com/355567627" target="_blank">B站</a>'
      },
      search: {
        provider: 'local'
      }
    },
    mermaid: {
      theme: 'base',
      flowchart: {
        padding: 16,
        nodeSpacing: 50,
        rankSpacing: 50
      },
      themeVariables: {
        fontSize: '18px',
        fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
      }
    }
  })
)

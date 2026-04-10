import DefaultTheme from 'vitepress/theme'
import Mermaid from './components/Mermaid.vue'
import SlideEmbed from './components/SlideEmbed.vue'
import './custom.css'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // 注册自定义 Mermaid 组件，覆盖插件默认的（暗色模式下不切换主题）
    app.component('Mermaid', Mermaid)
    // 注册 SlideEmbed 组件，用于嵌入 Slidev PPT
    app.component('SlideEmbed', SlideEmbed)
  }
}

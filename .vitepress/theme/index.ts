import DefaultTheme from 'vitepress/theme'
import Mermaid from './components/Mermaid.vue'
import './custom.css'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // 注册自定义 Mermaid 组件，覆盖插件默认的（暗色模式下不切换主题）
    app.component('Mermaid', Mermaid)
  }
}

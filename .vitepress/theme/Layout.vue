<script setup>
import DefaultTheme from 'vitepress/theme'
import aiChat from './components/aiChat/index.vue'
import ThemeToggle from './components/ThemeToggle.vue'

const { Layout } = DefaultTheme

// AI聊天组件配置 - 从环境变量读取（AI_ 前缀，通过 vite.config.mjs define 注入）
const aiChatConfig = {
  mcpBaseUrl: import.meta.env.AI_MCP_BASE_URL || undefined,
  maxHistoryTurns: Number(import.meta.env.AI_MAX_HISTORY_TURNS) || 3,
  welcomeMessage: import.meta.env.AI_WELCOME_MESSAGE || undefined,
  defaultTools: import.meta.env.AI_DEFAULT_TOOLS || undefined
}
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <div class="nav-actions-after">
        <ThemeToggle />
        <div class="askAi">
          <aiChat 
            :mcp-base-url="aiChatConfig.mcpBaseUrl"
            :max-history-turns="aiChatConfig.maxHistoryTurns"
            :welcome-message="aiChatConfig.welcomeMessage"
            :default-tools="aiChatConfig.defaultTools"
          />
        </div>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.nav-actions-after {
  display: flex;
  align-items: center;
  gap: 8px; /* 增加一点间距，让图标和组件之间不那么拥挤 */
  margin-left: 12px; /* 和左侧内容的间距 */
}

/* 覆盖可能导致间距奇怪的问题 */
.askAi {
  display: flex;
  align-items: center;
}
</style>

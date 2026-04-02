<script setup>
import DefaultTheme from 'vitepress/theme'
import aiChat from './components/aiChat/index.vue'

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
      <div class="askAi">
        <aiChat 
          :mcp-base-url="aiChatConfig.mcpBaseUrl"
          :max-history-turns="aiChatConfig.maxHistoryTurns"
          :welcome-message="aiChatConfig.welcomeMessage"
          :default-tools="aiChatConfig.defaultTools"
        />
      </div>
    </template>
  </Layout>
</template>

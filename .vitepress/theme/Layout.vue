<script setup>
import DefaultTheme from 'vitepress/theme'
import aiChat from './components/aiChat/index.vue'
import ThemeToggle from './components/ThemeToggle.vue'

const { Layout } = DefaultTheme

const aiChatConfig = {
  welcomeMessage: import.meta.env.AI_WELCOME_MESSAGE || undefined
}
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <div class="nav-actions-after">
        <ThemeToggle />
        <div class="askAi">
          <aiChat 
            :welcome-message="aiChatConfig.welcomeMessage"
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

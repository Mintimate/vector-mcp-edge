<script setup lang="ts">
import { useData } from 'vitepress'
import { onMounted, ref } from 'vue'

const { isDark } = useData()

// 三种模式: light / system / dark
type ThemeMode = 'light' | 'system' | 'dark'

const currentMode = ref<ThemeMode>('system')

// 图标定义
const icons = {
  light: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  system: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  dark: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
}

const modes: ThemeMode[] = ['light', 'system', 'dark']

/**
 * 获取系统偏好的主题
 */
function getSystemPreference(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * 应用主题
 */
function applyTheme(mode: ThemeMode) {
  const shouldBeDark = mode === 'dark' || (mode === 'system' && getSystemPreference())

  // 使用 VitePress 的过渡动画切换
  const el = document.documentElement
  if (shouldBeDark !== isDark.value) {
    isDark.value = shouldBeDark
  }
}

/**
 * 切换到指定模式
 */
function setMode(mode: ThemeMode) {
  currentMode.value = mode
  localStorage.setItem('vitepress-theme-mode', mode)
  applyTheme(mode)
}

// 监听系统主题变化（仅在 system 模式下生效）
function handleSystemChange(e: MediaQueryListEvent) {
  if (currentMode.value === 'system') {
    isDark.value = e.matches
  }
}

onMounted(() => {
  // 从 localStorage 恢复模式
  const saved = localStorage.getItem('vitepress-theme-mode') as ThemeMode | null
  if (saved && modes.includes(saved)) {
    currentMode.value = saved
  }
  // 初始应用
  applyTheme(currentMode.value)

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemChange)
})

// 获取滑块位置索引
function getModeIndex(mode: ThemeMode): number {
  return modes.indexOf(mode)
}
</script>

<template>
  <div class="theme-toggle-wrapper" role="radiogroup" aria-label="主题切换">
    <!-- 滑块背景 -->
    <div
      class="theme-toggle-slider"
      :style="{ transform: `translateX(${getModeIndex(currentMode) * 100}%)` }"
    />
    <!-- 三个按钮 -->
    <button
      v-for="mode in modes"
      :key="mode"
      class="theme-toggle-btn"
      :class="{ active: currentMode === mode }"
      :aria-checked="currentMode === mode"
      :aria-label="mode === 'light' ? '亮色模式' : mode === 'system' ? '跟随系统' : '暗色模式'"
      :title="mode === 'light' ? '亮色模式' : mode === 'system' ? '跟随系统' : '暗色模式'"
      role="radio"
      @click="setMode(mode)"
      v-html="icons[mode]"
    />
  </div>
</template>

<style scoped>
.theme-toggle-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  background-color: var(--vp-c-default-soft);
  border-radius: 20px;
  padding: 2px;
  gap: 0;
  height: 32px;
  width: 96px;
  flex-shrink: 0;
}

.theme-toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 32px;
  height: 28px;
  border-radius: 16px;
  background-color: var(--vp-c-bg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.theme-toggle-btn {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 16px;
  color: var(--vp-c-text-3);
  transition: color 0.25s ease;
  padding: 0;
  outline: none;
}

.theme-toggle-btn:hover {
  color: var(--vp-c-text-2);
}

.theme-toggle-btn.active {
  color: var(--vp-c-brand-1);
}

.theme-toggle-btn :deep(svg) {
  width: 16px;
  height: 16px;
}

/* 暗色模式下微调 */
.dark .theme-toggle-slider {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15);
}
</style>

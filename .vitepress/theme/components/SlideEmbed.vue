<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  /** iframe 加载的路径，默认指向 Slidev 构建产物 */
  src: {
    type: String,
    default: '/slides/'
  },
  /** 演示文稿标题 */
  title: {
    type: String,
    default: '演示文稿'
  },
  /** 宽高比，默认 16:9 */
  aspectRatio: {
    type: String,
    default: '16/9'
  }
})

const loading = ref(true)
const isFullscreen = ref(false)
const iframeRef = ref(null)

const paddingTop = computed(() => {
  const [w, h] = props.aspectRatio.split('/').map(Number)
  return `${(h / w) * 100}%`
})

function onLoad() {
  loading.value = false
}

function toggleFullscreen() {
  if (!iframeRef.value) return
  if (!document.fullscreenElement) {
    iframeRef.value.requestFullscreen?.()
    isFullscreen.value = true
  } else {
    document.exitFullscreen?.()
    isFullscreen.value = false
  }
}

// 监听退出全屏
if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
}
</script>

<template>
  <div class="slide-embed">
    <!-- 标题栏 -->
    <div class="slide-embed-header">
      <span class="slide-embed-title">
        <span class="slide-embed-icon">📽️</span>
        {{ title }}
      </span>
      <button
        class="slide-embed-fullscreen-btn"
        :title="isFullscreen ? '退出全屏' : '全屏观看'"
        @click="toggleFullscreen"
      >
        {{ isFullscreen ? '⬜ 退出全屏' : '⛶ 全屏观看' }}
      </button>
    </div>

    <!-- 嵌入区域 -->
    <div class="slide-embed-wrapper" :style="{ paddingTop }">
      <!-- 加载骨架屏 -->
      <div v-if="loading" class="slide-embed-skeleton">
        <div class="slide-embed-spinner" />
        <span class="slide-embed-loading-text">正在加载演示文稿…</span>
      </div>

      <iframe
        ref="iframeRef"
        :src="src"
        :title="title"
        class="slide-embed-iframe"
        allow="fullscreen"
        loading="lazy"
        @load="onLoad"
      />
    </div>
  </div>
</template>

<style scoped>
.slide-embed {
  margin: 1.5rem 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.slide-embed:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* 标题栏 */
.slide-embed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.slide-embed-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.slide-embed-icon {
  font-size: 16px;
}

.slide-embed-fullscreen-btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slide-embed-fullscreen-btn:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

/* 嵌入容器 — 保持宽高比 */
.slide-embed-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #000;
}

/* 骨架屏 / 加载状态 */
.slide-embed-skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--vp-c-bg-soft);
  z-index: 2;
}

.slide-embed-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: slide-spin 0.8s linear infinite;
}

@keyframes slide-spin {
  to { transform: rotate(360deg); }
}

.slide-embed-loading-text {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* iframe */
.slide-embed-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}
</style>

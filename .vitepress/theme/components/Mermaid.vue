<!--
  自定义 Mermaid 组件：基于 vitepress-plugin-mermaid 的 Mermaid.vue
  修改点：去掉暗色模式下强制将 mermaid 主题切换为 "dark" 的逻辑，
  通过 CSS 底色来保证暗色模式下的可读性，保持 markdown 中丰富多彩的样式。
-->
<template>
  <div v-html="svg" :class="props.class"></div>
</template>

<script setup>
import mermaid from "mermaid";
import { onMounted, onUnmounted, ref, toRaw } from "vue";

// 获取 mermaid 配置
import { useData } from "vitepress";

// 内联 init 和 render 函数（原来从插件内部导入，但插件未暴露该路径）
const init = async (externalDiagrams) => {
  try {
    if (mermaid.registerExternalDiagrams)
      await mermaid.registerExternalDiagrams(externalDiagrams);
  } catch (e) {
    console.error(e);
  }
};

const render = async (id, code, config) => {
  mermaid.initialize(config);
  const { svg } = await mermaid.render(id, code);
  return svg;
};

const pluginSettings = ref({
  securityLevel: "loose",
  startOnLoad: false,
  externalDiagrams: [],
});
const { page } = useData();
const { frontmatter } = toRaw(page.value);
const mermaidPageTheme = frontmatter.mermaidTheme || "";

const props = defineProps({
  graph: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: false,
    default: "mermaid",
  },
});

const svg = ref(null);
let mut = null;

onMounted(async () => {
  await init(pluginSettings.value.externalDiagrams);
  let settings = await import("virtual:mermaid-config");
  if (settings?.default) pluginSettings.value = settings.default;

  mut = new MutationObserver(async () => await renderChart());
  mut.observe(document.documentElement, { attributes: true });
  await renderChart();

  // 首次渲染时刷新图片
  const hasImages =
    /<img([\w\W]+?)>/.exec(decodeURIComponent(props.graph))?.length > 0;
  if (hasImages)
    setTimeout(() => {
      let imgElements = document.getElementsByTagName("img");
      let imgs = Array.from(imgElements);
      if (imgs.length) {
        Promise.all(
          imgs
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise((resolve) => {
                  img.onload = img.onerror = resolve;
                })
            )
        ).then(async () => {
          await renderChart();
        });
      }
    }, 100);
});

onUnmounted(() => mut.disconnect());

const renderChart = async () => {
  // 【核心修改】去掉暗色模式下强制切换主题为 "dark" 的逻辑
  // 始终使用配置中设定的主题（base），通过 CSS 底色保证暗色模式下的可读性
  let mermaidConfig = {
    ...pluginSettings.value,
  };

  if (mermaidPageTheme) mermaidConfig.theme = mermaidPageTheme;

  let svgCode = await render(
    props.id,
    decodeURIComponent(props.graph),
    mermaidConfig
  );
  // 强制 v-html 重新渲染的 hack
  const salt = Math.random().toString(36).substring(7);
  svg.value = `${svgCode} <span style="display: none">${salt}</span>`;
};
</script>

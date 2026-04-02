import { loadEnv } from 'vite'

export default ({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  // 统一暴露所有 AI_ 开头的环境变量
  const envWithPrefix = Object.keys(env)
    .filter(key => key.startsWith('AI_'))
    .reduce((acc, key) => {
      acc[`import.meta.env.${key}`] = JSON.stringify(env[key])
      return acc
    }, {})

  return {
    server: {
      host: '0.0.0.0',
      allowedHosts: true
    },
    define: envWithPrefix
  }
}

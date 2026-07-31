import { nextTick, ref } from 'vue'

const CONVERSATION_KEY = 'vector-mcp-edge-conversation-id'

export function useAgent(convertToHtml, smartScrollToBottom) {
  const toolCallStatus = ref(false)
  const toolCallSteps = ref([])
  let activeController = null

  const getConversationId = () => {
    const cached = localStorage.getItem(CONVERSATION_KEY)
    if (cached) return cached
    const fresh = crypto.randomUUID()
    localStorage.setItem(CONVERSATION_KEY, fresh)
    return fresh
  }

  const updateSteps = (steps) => {
    toolCallSteps.value = steps
    toolCallStatus.value = steps.length > 0
    nextTick(() => smartScrollToBottom())
  }

  const streamMessage = async ({ message, aiMessageIndex, messages }) => {
    const conversationId = getConversationId()
    activeController = new AbortController()
    updateSteps([{ text: 'Agent 正在分析问题...', active: true, completed: false }])

    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'makers-conversation-id': conversationId
      },
      body: JSON.stringify({ message }),
      signal: activeController.signal
    })

    if (!response.ok || !response.body) {
      const detail = await response.text()
      throw new Error(detail || `Agent HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let answer = ''
    let reasoning = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const frames = buffer.split('\n\n')
        buffer = frames.pop() || ''

        for (const frame of frames) {
          const dataLine = frame.split('\n').find(line => line.startsWith('data:'))
          if (!dataLine) continue
          const raw = dataLine.slice(5).trim()
          if (!raw || raw === '[DONE]') continue

          const event = JSON.parse(raw)
          if (event.type === 'ping' || event.type === 'usage') continue
          if (event.type === 'tool_call') {
            updateSteps([
              { text: 'Agent 已分析问题', active: false, completed: true },
              { text: event.name === 'query_knowledge_base' ? '正在查询知识库...' : `正在调用 ${event.name}...`, active: true, completed: false }
            ])
            continue
          }
          if (event.type === 'tool_result') {
            updateSteps([
              { text: 'Agent 已分析问题', active: false, completed: true },
              { text: event.name === 'query_knowledge_base' ? '知识库查询完成' : `${event.name} 调用完成`, active: false, completed: true },
              { text: '正在生成回答...', active: true, completed: false }
            ])
            continue
          }
          if (event.type === 'error_message') throw new Error(event.content || 'Agent request failed')
          if (event.type === 'reasoning' && event.content) {
            reasoning += event.content
            messages.value[aiMessageIndex].thinkContent = reasoning
            messages.value[aiMessageIndex].thinkHtml = convertToHtml(reasoning)
            messages.value[aiMessageIndex].thinkExpanded = true
            nextTick(() => smartScrollToBottom())
            continue
          }
          if (event.type === 'ai_response' && event.content) {
            answer += event.content
            messages.value[aiMessageIndex].text = answer
            messages.value[aiMessageIndex].html = convertToHtml(answer)
            if (reasoning) messages.value[aiMessageIndex].thinkExpanded = false
            toolCallStatus.value = false
            nextTick(() => smartScrollToBottom())
          }
        }
      }
    } finally {
      reader.releaseLock()
      activeController = null
      resetAgentState()
    }

    if (!answer.trim()) throw new Error('Agent returned no response')
    return answer
  }

  const stopAgent = async () => {
    const conversationId = getConversationId()
    try {
      await fetch('/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'makers-conversation-id': conversationId
        },
        body: JSON.stringify({ conversation_id: conversationId })
      })
    } finally {
      activeController?.abort()
      activeController = null
      resetAgentState()
    }
  }

  const resetAgentState = () => {
    toolCallStatus.value = false
    toolCallSteps.value = []
  }

  return {
    toolCallStatus,
    toolCallSteps,
    streamMessage,
    stopAgent,
    resetAgentState
  }
}

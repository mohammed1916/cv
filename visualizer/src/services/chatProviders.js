const STORAGE_KEY = 'chat.provider.v1'

export function getChatProvider() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { provider: 'ollama-local', model: 'gemma4:e2b' } } catch { return { provider: 'ollama-local', model: 'gemma4:e2b' } }
}

export function setChatProvider(value) { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) }

export async function* streamProviderChat(messages, config = getChatProvider()) {
  const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...config, messages }) })
  if (!response.ok) throw new Error((await response.text()) || `Chat error ${response.status}`)
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
  while (true) {
    const { done, value } = await reader.read(); if (done) break
    buffer += decoder.decode(value, { stream: true }); const lines = buffer.split('\n'); buffer = lines.pop()
    for (const line of lines) {
      const text = line.replace(/^data:\s*/, '').trim(); if (!text || text === '[DONE]') continue
      try { const json = JSON.parse(text); const delta = json?.message?.content || json?.candidates?.[0]?.content?.parts?.[0]?.text; if (delta) yield delta } catch { /* wait for a complete event */ }
    }
  }
}

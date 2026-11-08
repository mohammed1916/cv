const STORAGE_KEY = 'chat.provider.v1'
const PROVIDER_EVENT = 'cpviz-chat-provider-change'
const MAX_CHAT_REQUEST_CHARS = 90_000
export const DEFAULT_LOCAL_OLLAMA_URL = 'http://127.0.0.1:11434'

export function defaultChatModel(provider = 'ollama-local') {
  if (provider === 'gemini') return 'gemini-2.5-flash'
  if (provider === 'ollama-cloud') return 'gpt-oss:120b'
  return 'gemma2:2b'
}

export function getChatProvider() {
  const fallbackProvider = canUseLocalOllama() ? 'ollama-local' : 'ollama-cloud'
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (stored && typeof stored === 'object') {
      const provider = stored.provider || fallbackProvider
      return {
        provider,
        model: stored.model || defaultChatModel(provider),
        localBaseUrl: stored.localBaseUrl || DEFAULT_LOCAL_OLLAMA_URL,
        contextTokens: stored.contextTokens || 8192,
      }
    }
  } catch {
    // Fall through to the environment-aware default.
  }
  return {
    provider: fallbackProvider,
    model: defaultChatModel(fallbackProvider),
    localBaseUrl: DEFAULT_LOCAL_OLLAMA_URL,
    contextTokens: 8192,
  }
}

export function setChatProvider(value) {
  const next = {
    provider: value?.provider || 'ollama-local',
    model: value?.model || defaultChatModel(value?.provider),
    localBaseUrl: value?.localBaseUrl || DEFAULT_LOCAL_OLLAMA_URL,
    contextTokens: Math.max(4096, Math.min(131072, Number(value?.contextTokens) || 8192)),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(PROVIDER_EVENT, { detail: next }))
  } catch {
    // The current component still keeps the selection when storage is disabled.
  }
  return next
}

export function subscribeChatProvider(listener) {
  if (typeof window === 'undefined') return () => {}
  const handleProviderEvent = (event) => listener(event.detail || getChatProvider())
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) listener(getChatProvider())
  }
  window.addEventListener(PROVIDER_EVENT, handleProviderEvent)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(PROVIDER_EVENT, handleProviderEvent)
    window.removeEventListener('storage', handleStorage)
  }
}

export async function* streamProviderChat(messages, config = getChatProvider()) {
  if (config.provider === 'ollama-local') {
    yield* streamLocalOllama(messages, config)
    return
  }

  if (config.provider === 'ollama-cloud') {
    yield* streamOllamaCloud(messages, config)
    return
  }
  if (config.provider === 'gemini') {
    yield* streamGemini(messages, config)
    return
  }
  throw new Error(`Unknown AI provider: ${config.provider}`)
}

export function canUseLocalOllama() {
  if (typeof window === 'undefined') return true
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

function assertSmallRequest(body) {
  const serialized = JSON.stringify(body)
  if (serialized.length > MAX_CHAT_REQUEST_CHARS) {
    throw new Error('This AI conversation is too large for the transport limit. No partial result was applied.')
  }
  return serialized
}

function normalizeOllamaBaseUrl(value) {
  return String(value || DEFAULT_LOCAL_OLLAMA_URL).trim().replace(/\/+$/, '')
}

async function* streamLocalOllama(messages, config) {
  const baseUrl = normalizeOllamaBaseUrl(config.localBaseUrl)
  const body = {
    model: config.model || defaultChatModel('ollama-local'),
    stream: true,
    ...(config.contextTokens ? { options: { num_ctx: config.contextTokens } } : {}),
    messages: messages.map((message) => ({
      role: message.role,
      content: message.text,
    })),
  }
  let response
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      signal: config.signal,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: assertSmallRequest(body),
    })
  } catch (error) {
    throw new Error(
      `Could not reach Ollama Local from this page. Make sure Ollama is running and, if this is the hosted app, allow this origin in Ollama CORS settings. Original error: ${error?.message || 'fetch failed'}`,
      { cause: error },
    )
  }
  if (!response.ok) {
    const detail = (await response.text()).trim()
    throw new Error(detail || `Ollama Local returned ${response.status}`)
  }
  assertNotHtmlResponse(response)
  if (!response.body) throw new Error('Ollama Local did not return a streaming response.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) buffer += decoder.decode() + '\n'
    else buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      const text = line.replace(/^data:\s*/, '').trim()
      if (!text || text === '[DONE]') continue
      let json
      try {
        json = JSON.parse(text)
      } catch {
        // Wait for a complete event.
        continue
      }
      if (json?.error) throw new Error(String(json.error))
      const delta = json?.message?.content || json?.response || ''
      if (delta) yield delta
    }
    if (done) break
  }
}

export const OLLAMA_CLOUD_URL = 'https://ollama.com'
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com'

const HTML_ENDPOINT_MESSAGE =
  'The hosted AI endpoint is not configured: the site answered with a web page instead of a chat response. '
  + 'Use Ollama Local on this computer, or choose Ollama Cloud or Gemini and enter your own API key.'

export function isHtmlResponseText(text) {
  return /^\s*(<!doctype\s+html|<html[\s>])/i.test(String(text || ''))
}

export function isHtmlContentType(contentType) {
  return /text\/html/i.test(String(contentType || ''))
}

function assertNotHtmlResponse(response) {
  if (isHtmlContentType(response.headers?.get?.('content-type'))) {
    throw new Error(HTML_ENDPOINT_MESSAGE)
  }
}

function networkError(providerLabel, error) {
  return new Error(
    `Could not reach ${providerLabel} from this browser. The request was blocked or the network failed. `
    + 'Use Ollama Local on this computer, or try a key from a provider that allows browser requests. '
    + `Original error: ${error?.message || 'fetch failed'}`,
    { cause: error },
  )
}

async function readErrorDetail(response, fallback) {
  const raw = (await response.text().catch(() => '')).trim()
  if (!raw) return fallback
  if (isHtmlContentType(response.headers?.get?.('content-type')) || isHtmlResponseText(raw)) {
    throw new Error(HTML_ENDPOINT_MESSAGE)
  }
  try {
    const json = JSON.parse(raw)
    return String(json?.error?.message || json?.error || fallback)
  } catch {
    return raw.slice(0, 500)
  }
}

// Reads a newline-delimited or SSE ("data:") stream and yields text deltas.
// `extractDelta` maps one parsed JSON event to its text.
async function* readEventStream(response, extractDelta) {
  if (!response.body) throw new Error('The AI service did not return a streaming response.')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let checkedHead = false
  while (true) {
    const { done, value } = await reader.read()
    if (done) buffer += decoder.decode() + '\n'
    else buffer += decoder.decode(value, { stream: true })
    if (!checkedHead && buffer.trim()) {
      checkedHead = true
      if (isHtmlResponseText(buffer)) throw new Error(HTML_ENDPOINT_MESSAGE)
    }
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      const text = line.replace(/^data:\s*/, '').trim()
      if (!text || text === '[DONE]') continue
      let json
      try {
        json = JSON.parse(text)
      } catch {
        // Wait for a complete event.
        continue
      }
      if (json?.error) throw new Error(String(json.error?.message || json.error))
      const delta = extractDelta(json)
      if (delta) yield delta
    }
    if (done) break
  }
}

function requireApiKey(config, label) {
  const key = String(config.ollamaApiKey || config.geminiApiKey || '').trim()
  if (!key) {
    throw new Error(`Enter your ${label} API key in the AI connection settings before sending a message.`)
  }
  return key
}

export function buildOllamaCloudRequest(messages, config) {
  const key = requireApiKey(
    { ollamaApiKey: config.ollamaApiKey },
    'Ollama Cloud',
  )
  const body = {
    model: config.model || defaultChatModel('ollama-cloud'),
    stream: true,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.text,
    })),
  }
  return {
    url: `${OLLAMA_CLOUD_URL}/api/chat`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: assertSmallRequest(body),
    },
  }
}

export function buildGeminiRequest(messages, config) {
  const key = requireApiKey({ geminiApiKey: config.geminiApiKey }, 'Gemini')
  const model = config.model || defaultChatModel('gemini')
  const systemText = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.text)
    .join('\n\n')
  const body = {
    contents: messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' || message.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(message.text ?? '') }],
      })),
    ...(systemText ? { systemInstruction: { parts: [{ text: systemText }] } } : {}),
  }
  return {
    url: `${GEMINI_API_URL}/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: assertSmallRequest(body),
    },
  }
}

async function* streamOllamaCloud(messages, config) {
  const request = buildOllamaCloudRequest(messages, config)
  let response
  try {
    response = await fetch(request.url, { ...request.init, signal: config.signal })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw networkError('Ollama Cloud', error)
  }
  if (!response.ok) {
    throw new Error(await readErrorDetail(response, `Ollama Cloud returned ${response.status}. Check the API key.`))
  }
  assertNotHtmlResponse(response)
  yield* readEventStream(response, (json) => json?.message?.content || json?.response || '')
}

async function* streamGemini(messages, config) {
  const request = buildGeminiRequest(messages, config)
  let response
  try {
    response = await fetch(request.url, { ...request.init, signal: config.signal })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw networkError('Gemini', error)
  }
  if (!response.ok) {
    throw new Error(await readErrorDetail(response, `Gemini returned ${response.status}. Check the API key and model name.`))
  }
  assertNotHtmlResponse(response)
  yield* readEventStream(response, (json) => (json?.candidates?.[0]?.content?.parts || [])
    .map((part) => part?.text || '')
    .join(''))
}

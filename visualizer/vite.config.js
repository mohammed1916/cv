import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function chatApiPlugin(env) {
  return {
    name: 'chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let raw = ''
        req.on('data', (chunk) => { raw += chunk })
        req.on('end', async () => {
          try {
            const { provider = 'ollama-local', model, messages = [], ollamaApiKey } = JSON.parse(raw || '{}')
            const endpoint = provider === 'gemini'
              ? `https://generativelanguage.googleapis.com/v1beta/models/${model || env.GEMINI_MODEL || 'gemini-2.5-flash'}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY || ''}`
              : provider === 'ollama-cloud'
                ? `${env.OLLAMA_CLOUD_URL || 'https://ollama.com'}/api/chat`
                : `${env.OLLAMA_LOCAL_URL || 'http://localhost:11434'}/api/chat`
            if (provider === 'gemini' && !env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured')
            const payload = provider === 'gemini'
              ? { contents: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text || '' }] })), systemInstruction: { parts: [{ text: messages.find(m => m.role === 'system')?.text || '' }] } }
              : { model: model || env.OLLAMA_MODEL || 'gemma4:e2b', messages: messages.map(m => ({ role: m.role, content: m.text || '' })), stream: true }
            // A browser-session BYOK takes precedence. It is used only for
            // this request and deliberately never written to disk or logs.
            const cloudApiKey = ollamaApiKey || env.OLLAMA_API_KEY || env.OLLAMA_CLOUD_API_KEY
            if (provider === 'ollama-cloud' && !cloudApiKey) throw new Error('OLLAMA_API_KEY is not configured')
            const upstream = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(provider === 'ollama-cloud' ? { Authorization: `Bearer ${cloudApiKey}` } : {}) }, body: JSON.stringify(payload) })
            if (!upstream.ok) throw new Error(await upstream.text())
            res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/x-ndjson')
            for await (const chunk of upstream.body) res.write(chunk)
            res.end()
          } catch (error) { res.statusCode = 500; res.end(JSON.stringify({ error: error.message })) }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite does not automatically expose `.env` values to code running inside
  // its config callback. Load them here so the server-only chat proxy can use
  // OLLAMA_API_KEY without ever shipping it to the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [react(), chatApiPlugin(env)],
  optimizeDeps: {
    include: ['@monaco-editor/react', 'monaco-editor'],
  },
  server: {
    // Pin the dev server and HMR client to IPv4. On this machine Vite was
    // listening only on ::1 while the browser resolved localhost to 127.0.0.1,
    // so the page loaded through a fallback but its HMR WebSocket could not.
    host: '127.0.0.1',
    port: 3010,
    hmr: {
      host: '127.0.0.1',
      protocol: 'ws',
      clientPort: 3010,
    },
  },
  build: {
    rollupOptions: {
      // Rolldown check: purely informational build-time breakdown. The build is
      // fast (~3s), so silence this advisory while keeping all correctness checks on.
      checks: {
        pluginTimings: false,
      },
    },
  },
  }
})

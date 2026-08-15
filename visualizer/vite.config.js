import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@monaco-editor/react', 'monaco-editor'],
  },
  server: {
    port: 3010,
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let raw = ''
        req.on('data', (chunk) => { raw += chunk })
        req.on('end', async () => {
          try {
            const { provider = 'ollama-local', model, messages = [] } = JSON.parse(raw || '{}')
            const endpoint = provider === 'gemini'
              ? `https://generativelanguage.googleapis.com/v1beta/models/${model || process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY || ''}`
              : provider === 'ollama-cloud'
                ? `${process.env.OLLAMA_CLOUD_URL || 'https://api.ollama.com'}/api/chat`
                : `${process.env.OLLAMA_LOCAL_URL || 'http://localhost:11434'}/api/chat`
            if (provider === 'gemini' && !process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured')
            const payload = provider === 'gemini'
              ? { contents: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text || '' }] })), systemInstruction: { parts: [{ text: messages.find(m => m.role === 'system')?.text || '' }] } }
              : { model: model || process.env.OLLAMA_MODEL || 'gemma4:e2b', messages: messages.map(m => ({ role: m.role, content: m.text || '' })), stream: true }
            const upstream = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(provider === 'ollama-cloud' && process.env.OLLAMA_CLOUD_API_KEY ? { Authorization: `Bearer ${process.env.OLLAMA_CLOUD_API_KEY}` } : {}) }, body: JSON.stringify(payload) })
            if (!upstream.ok) throw new Error(await upstream.text())
            res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/x-ndjson')
            for await (const chunk of upstream.body) res.write(chunk)
            res.end()
          } catch (error) { res.statusCode = 500; res.end(JSON.stringify({ error: error.message })) }
        })
      })
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
})

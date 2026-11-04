import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/shared/VisualizerChrome.css'
import App from './App.jsx'
import { ChatProvider } from './context/ChatContext'
import { VisualizationProvider } from './context/VisualizationContext'

// A tab opened before a deploy still references the old hashed chunks, which no
// longer exist. Reload once to pick up the new build; the time guard stops a loop
// if the chunk is really missing, and the error boundary then shows the failure.
const CHUNK_RELOAD_KEY = 'chunk-reload-at'
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY)) || 0
    if (Date.now() - last < 30000) return
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()))
  } catch {
    return
  }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VisualizationProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </VisualizationProvider>
  </StrictMode>,
)

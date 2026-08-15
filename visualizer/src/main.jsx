import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChatProvider } from './context/ChatContext'
import { VisualizationProvider } from './context/VisualizationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VisualizationProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </VisualizationProvider>
  </StrictMode>,
)

import { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext()

const STORAGE_KEY = 'cpviz.theme'

// Light is the default, deliberately regardless of the OS setting: only a
// choice the user made here overrides it. Falling back to
// prefers-color-scheme was tried and reverted — it silently handed anyone on
// a dark-mode machine the dark theme, which is not what "light by default"
// means.
function initialTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Ignore localStorage failures (private mode, old browsers).
  }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    // The token blocks in index.css key off this attribute; light is the bare
    // :root block, so the attribute is set either way for CSS that wants to
    // target light explicitly.
    document.documentElement.setAttribute('data-theme', theme)
    // Lets form controls, scrollbars and the like follow the theme.
    document.documentElement.style.colorScheme = theme
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore write failures.
    }
  }, [theme])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd+Shift+L toggles the theme. Shift keeps it clear of the
      // browser's own Ctrl+L (focus address bar).
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault()
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

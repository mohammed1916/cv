import { useTheme } from '../context/ThemeContext'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="theme-toggle-panel">
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        title={`Switch to ${isDark ? 'light' : 'dark'} theme (Ctrl+Shift+L)`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        aria-pressed={isDark}
      >
        <span className="theme-toggle-icon" aria-hidden="true">{isDark ? '☀' : '☾'}</span>
        <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
      </button>
    </div>
  )
}

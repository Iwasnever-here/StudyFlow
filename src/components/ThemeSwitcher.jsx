import { useEffect, useState } from 'react'
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu'

function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system'
  })

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      root.removeAttribute('data-theme')
      localStorage.removeItem('theme')
    } else {
      root.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  return (
    <div className="flex rounded-xl border border-[var(--border)] bg-[var(--bg-input)] p-1">
      <button
        type="button"
        onClick={() => setTheme('system')}
        aria-label="Use system theme"
        title="System theme"
        className={`rounded-lg p-2 transition ${
          theme === 'system'
            ? 'bg-[var(--color-primary)] text-[var(--text-light)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        <LuMonitor size={18} />
      </button>

      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-label="Use light theme"
        title="Light theme"
        className={`rounded-lg p-2 transition ${
          theme === 'light'
            ? 'bg-[var(--color-primary)] text-[var(--text-light)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        <LuSun size={18} />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-label="Use dark theme"
        title="Dark theme"
        className={`rounded-lg p-2 transition ${
          theme === 'dark'
            ? 'bg-[var(--color-primary)] text-[var(--text-light)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        <LuMoon size={18} />
      </button>
    </div>
  )
}

export default ThemeSwitcher
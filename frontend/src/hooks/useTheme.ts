import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'jaai-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  const mobile = window.matchMedia('(max-width: 767px)').matches
  // Mobile defaults to light until the user explicitly chooses a theme
  if (mobile && stored !== 'dark' && stored !== 'light') {
    return 'light'
  }
  if (mobile && !stored) {
    return 'light'
  }
  if (stored === 'light' || stored === 'dark') return stored
  return 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    root.classList.toggle('dark', t === 'dark')
    localStorage.setItem(STORAGE_KEY, t)

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', t === 'dark' ? '#1A1216' : '#E9868B')
    }
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  return { theme, toggleTheme } as const
}

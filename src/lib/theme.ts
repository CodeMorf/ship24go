import { useCallback, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'theme';
const THEME_EVENT = 'ship24go-theme-change';

export function applyTheme(isDark: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isDark ? '#020617' : '#f8fafc');
}

function readStoredTheme() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
}

export function useTheme() {
  const [isDark, setIsDark] = useState(readStoredTheme);

  useEffect(() => {
    const syncTheme = () => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      const nextDark = stored === 'dark';
      if (stored !== 'dark' && stored !== 'light') window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
      setIsDark(nextDark);
      applyTheme(nextDark);
    };

    syncTheme();
    window.addEventListener(THEME_EVENT, syncTheme);
    return () => window.removeEventListener(THEME_EVENT, syncTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((current) => {
      const nextDark = !current;
      window.localStorage.setItem(THEME_STORAGE_KEY, nextDark ? 'dark' : 'light');
      applyTheme(nextDark);
      window.dispatchEvent(new Event(THEME_EVENT));
      return nextDark;
    });
  }, []);

  return { isDark, toggleTheme };
}

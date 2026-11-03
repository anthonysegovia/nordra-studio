import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function BirthdayThemeButton({ english }: { english: boolean }) {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  function toggleTheme() {
    const theme = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('nordra-theme', theme); } catch { /* The choice still applies for this visit. */ }
    setDark(!dark);
  }
  return <button className="birthday-theme-button" type="button" aria-pressed={dark}
    aria-label={english ? 'Dark mode' : 'Modo oscuro'} onClick={toggleTheme}>
    {dark ? <Moon aria-hidden="true" size={18}/> : <Sun aria-hidden="true" size={18}/>}
  </button>;
}

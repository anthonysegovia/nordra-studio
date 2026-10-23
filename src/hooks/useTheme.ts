import { useEffect, useState } from "react";

export function useTheme() {
  // The HTML head resolves the theme before CSS/React can paint a light frame.
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("nordra-theme", dark ? "dark" : "light"); } catch { /* Storage may be unavailable in private browsing. */ }
  }, [dark]);

  return { dark, toggleTheme: () => setDark((v) => !v) };
}

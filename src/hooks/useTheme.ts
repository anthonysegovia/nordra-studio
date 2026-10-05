import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("nordra-theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nordra-theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggleTheme: () => setDark((v) => !v) };
}

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Cambiar tema"
      onClick={toggleTheme}
      className="theme-toggle group"
    >
      <span className={`theme-icon ${dark ? "theme-icon-dark" : "theme-icon-light"}`}>
        {dark ? <Sun size={17} /> : <Moon size={17} />}
      </span>
    </button>
  );
}

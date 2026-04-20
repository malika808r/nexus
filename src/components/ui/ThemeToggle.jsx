import { Sun, Moon } from "lucide-react";
import { useAppStore } from "../../store/store";

export default function ThemeToggle() {
  const { theme, setTheme } = useAppStore();
  
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-muted-foreground/5 hover:bg-muted-foreground/10"
      style={{ color: "var(--text-primary)" }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

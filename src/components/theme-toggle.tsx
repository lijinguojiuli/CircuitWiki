"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-toggle" aria-label="外观模式">
      {[
        { id: "light", label: "Light 浅色", Icon: Sun },
        { id: "dark", label: "Dark 深色", Icon: Moon },
        { id: "system", label: "System 跟随系统", Icon: Monitor },
      ].map(({ id, label, Icon }) => (
        <button
          key={id}
          title={label}
          aria-label={label}
          onClick={() => setTheme(id)}
          data-theme-choice={id}
          className={theme === id ? "active" : ""}
          suppressHydrationWarning
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}

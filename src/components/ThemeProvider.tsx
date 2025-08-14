import { createContext, useContext } from 'react';

export type Theme = {
  mode: "light" | "dark";
  accent: "default" | "blue" | "orange" | "green";
};

export interface ThemeContextValue {
  theme: Theme;
  getThemeClasses: () => string;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const getThemeClasses = () => {
    let classes = "";

    if (theme.mode === "dark") {
      classes += " dark";
    }

    if (theme.accent === "blue") {
      classes += " blue-theme";
    } else if (theme.accent === "orange") {
      classes += " orange-theme";
    } else if (theme.accent === "green") {
      classes += " green-theme";
    }

    return classes.trim();
  };

  return (
    <ThemeContext.Provider value={{ theme, getThemeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
}
import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = {
  mode: "light" | "dark" | "system";
  accent: "default" | "blue" | "orange" | "green";
};

export interface ThemeContextValue {
  theme: Theme;
  getThemeClasses: () => string;
  getActualMode: () => "light" | "dark";
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
  const [systemPreference, setSystemPreference] = useState<"light" | "dark">(() => {
    // Detect initial system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Get the actual mode (resolving "system" to actual preference)
  const getActualMode = (): "light" | "dark" => {
    if (theme.mode === "system") {
      return systemPreference;
    }
    return theme.mode;
  };

  const getThemeClasses = () => {
    let classes = "";
    const actualMode = getActualMode();

    // Apply dark mode class
    if (actualMode === "dark") {
      classes += " dark";
    }

    // Apply accent theme classes
    switch (theme.accent) {
      case "blue":
        classes += " blue-theme";
        break;
      case "orange":
        classes += " orange-theme";
        break;
      case "green":
        classes += " green-theme";
        break;
      case "default":
        // Default theme doesn't need additional classes beyond dark/light
        break;
      default:
        // Fallback to default if invalid accent
        break;
    }

    return classes.trim();
  };

  // Apply theme classes to document root
  useEffect(() => {
    const root = document.documentElement;
    const themeClasses = getThemeClasses();
    
    // Remove all possible theme classes first
    root.classList.remove(
      'dark',
      'blue-theme',
      'orange-theme',
      'green-theme'
    );
    
    // Add current theme classes
    if (themeClasses) {
      themeClasses.split(' ').forEach(cls => {
        if (cls) root.classList.add(cls);
      });
    }
    
    // Also update any portal containers
    setTimeout(() => {
      const portals = document.querySelectorAll('[data-radix-portal]');
      portals.forEach((portal) => {
        // Remove existing theme classes
        portal.classList.remove(
          'dark',
          'blue-theme',
          'orange-theme',
          'green-theme'
        );
        
        // Add current theme classes
        if (themeClasses) {
          themeClasses.split(' ').forEach((cls) => {
            if (cls) portal.classList.add(cls);
          });
        }
      });
    }, 0);
  }, [theme.mode, theme.accent, systemPreference]);

  return (
    <ThemeContext.Provider value={{ theme, getThemeClasses, getActualMode }}>
      <div className={`min-h-screen transition-colors duration-300 mytick-app ${getThemeClasses()}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}


// =============================================
// components/Navigation/ThemeMenu.tsx
// =============================================
import React from "react";
import { Button } from "@/components/ui/button.tsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu.tsx";
import { Sun, Moon, Palette, Monitor, Check } from "lucide-react";
import { ConditionalTooltip } from "@/components/Navigation/ConditionalTooltip.tsx";

export type Mode = "light" | "dark" | "system";
export type Accent = "default" | "blue" | "orange" | "green";
export interface Theme { mode: Mode; accent: Accent }

interface ThemeMenuProps {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  getThemeClasses: () => string;
  getActualMode: () => "light" | "dark";
  showTooltips: boolean;
}

export function ThemeMenu({ theme, onThemeChange, getThemeClasses, getActualMode, showTooltips }: ThemeMenuProps) {
  const themeOptions = [
    { id: "system-blue", label: "System Theme", icon: Monitor, mode: "system" as const, accent: "blue" as const, description: "Follows your system's dark/light preference" },
    { id: "light-default", label: "Light Theme", icon: Sun, mode: "light" as const, accent: "default" as const, description: "Clean white background with emerald accents" },
    { id: "dark-default", label: "Dark Theme", icon: Moon, mode: "dark" as const, accent: "default" as const, description: "Dark background with emerald accents" },
    { id: "light-blue", label: "Blue Theme", icon: Palette, mode: "light" as const, accent: "blue" as const, description: "Full blue background theme (light mode)" },
    { id: "dark-blue", label: "Dark Blue", icon: Palette, mode: "dark" as const, accent: "blue" as const, description: "Full blue background theme (dark mode)" },
    { id: "light-orange", label: "Orange Theme", icon: Palette, mode: "light" as const, accent: "orange" as const, description: "Full orange background theme (light mode)" },
    { id: "dark-orange", label: "Dark Orange", icon: Palette, mode: "dark" as const, accent: "orange" as const, description: "Full orange background theme (dark mode)" },
    { id: "light-green", label: "Green Theme", icon: Palette, mode: "light" as const, accent: "green" as const, description: "Full green background theme (light mode)" },
    { id: "dark-green", label: "Dark Green", icon: Palette, mode: "dark" as const, accent: "green" as const, description: "Full green background theme (dark mode)" },
  ];

  const isCurrentTheme = (opt: typeof themeOptions[number]) => theme.mode === opt.mode && theme.accent === opt.accent;

  const getCurrentThemeIcon = () => {
    if (theme.mode === "system") return <Monitor className="w-4 h-4 text-foreground mytick-theme" />;
    if (theme.accent !== "default") return <Palette className="w-4 h-4 text-foreground mytick-theme" />;
    return theme.mode === "dark" ? (
      <Moon className="w-4 h-4 text-foreground mytick-theme" />
    ) : (
      <Sun className="w-4 h-4 text-foreground mytick-theme" />
    );
  };

  return (
    <ConditionalTooltip
      show={showTooltips}
      content={
        <div className="mytick-theme">
          <p className="font-medium mytick-theme">Theme Settings</p>
          <p className="text-sm mt-1 mytick-theme">Switch between light/dark modes and color themes</p>
          <p className="text-xs mt-1 text-muted-foreground mytick-theme">
            {theme.mode === 'system' && `Currently: ${getActualMode() === 'dark' ? 'Dark' : 'Light'} (System)`}
            {theme.mode !== 'system' && `Current: ${theme.mode} mode with ${theme.accent} accent`}
          </p>
        </div>
      }
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mytick-theme">
            {getCurrentThemeIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={`w-64 bg-popover border-border mytick-theme ${getThemeClasses()}`}>
          <DropdownMenuLabel className="text-muted-foreground mytick-theme">Choose Theme</DropdownMenuLabel>
          {theme.mode === "system" && (
            <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 rounded-md mx-2 mb-2 mytick-theme">
              Currently using: {getActualMode() === "dark" ? "Dark" : "Light"} (System)
            </div>
          )}
          <DropdownMenuSeparator className="bg-border mytick-theme" />
          <DropdownMenuGroup className="mytick-theme">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const active = isCurrentTheme(opt);
              return (
                <DropdownMenuItem
                  key={opt.id}
                  onClick={() => onThemeChange({ mode: opt.mode, accent: opt.accent })}
                  className="flex items-center gap-3 px-3 py-3 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme"
                >
                  <div className="flex items-center gap-3 flex-1 mytick-theme">
                    <Icon className="w-4 h-4 text-foreground mytick-theme" />
                    <div className="flex-1 mytick-theme">
                      <div className="font-medium text-foreground mytick-theme">{opt.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 mytick-theme">{opt.description}</div>
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4 text-theme-accent mytick-theme" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ConditionalTooltip>
  );
}

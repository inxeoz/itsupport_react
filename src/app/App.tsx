import { useState, useCallback, useEffect } from "react";
import { ThemeProvider, type Theme } from "./providers";
import { TabRouter, type TabConfig } from "./routing";
import { TopBar } from "@/shared/components/navigation/TopBar";
import { Toaster } from "@/ui/components/sonner";

interface AppContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  tabs: TabConfig[];
  onAddTab: (tabId: string, label: string) => void;
  onRemoveTab: (tabId: string) => void;
  onMoveTab: (dragIndex: number, hoverIndex: number) => void;
}

function AppContent({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  tabs,
  onAddTab,
  onRemoveTab,
  onMoveTab,
}: AppContentProps) {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col transition-colors duration-300 mytick-theme">
      <TopBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        theme={theme}
        onThemeChange={onThemeChange}
        tabs={tabs}
        onAddTab={onAddTab}
        onRemoveTab={onRemoveTab}
        onMoveTab={onMoveTab}
      />
      <main className="flex-1 overflow-auto m-5 bg-background mytick-theme">
        <TabRouter activeTab={activeTab} />
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        expand={true}
        richColors
        closeButton
        toastOptions={{
          className: "bg-card border-border text-card-foreground mytick-theme",
        }}
      />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("main-table");

  // Load theme from localStorage or use system default
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('mytick-theme');
        if (savedTheme) {
          const parsed = JSON.parse(savedTheme);
          // Validate the parsed theme
          if (parsed &&
              ['light', 'dark', 'system'].includes(parsed.mode) &&
              ['default', 'blue', 'orange', 'green'].includes(parsed.accent)) {
            return parsed;
          }
        }
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }
    // Default to system theme with blue accent
    return {
      mode: "system",
      accent: "blue",
    };
  });

  const [tabs, setTabs] = useState<TabConfig[]>([
    { id: "main-table", label: "Main table", icon: "⋯" },
    { id: "form", label: "Form", icon: undefined },
    { id: "kanban", label: "Kanban", icon: undefined },
    { id: "add-ticket", label: "Add Ticket", icon: undefined },
  ]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mytick-theme', JSON.stringify(theme));
    }
  }, [theme]);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  const handleAddTab = useCallback((tabId: string, label: string) => {
    setTabs((prevTabs) => {
      const existingTab = prevTabs.find((tab) => tab.id === tabId);
      if (!existingTab) {
        return [
          ...prevTabs,
          { id: tabId, label, icon: undefined },
        ];
      }
      return prevTabs;
    });
  }, []);

  const handleRemoveTab = useCallback((tabId: string) => {
    setTabs((prevTabs) => {
      // Don't allow removing the last tab
      if (prevTabs.length <= 1) {
        return prevTabs;
      }

      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);

      // If the removed tab was the active tab, switch to another tab
      if (activeTab === tabId && newTabs.length > 0) {
        // Switch to the first remaining tab
        setActiveTab(newTabs[0].id);
      }

      return newTabs;
    });
  }, [activeTab]);

  const handleMoveTab = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setTabs((prevTabs) => {
        if (dragIndex < 0 || dragIndex >= prevTabs.length ||
            hoverIndex < 0 || hoverIndex >= prevTabs.length) {
          return prevTabs;
        }

        const newTabs = [...prevTabs];
        const draggedTab = newTabs[dragIndex];

        // Remove the dragged tab
        newTabs.splice(dragIndex, 1);

        // Insert it at the new position
        newTabs.splice(hoverIndex, 0, draggedTab);

        return newTabs;
      });
    },
    [],
  );

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AppContent
        activeTab={activeTab}
        onTabChange={handleTabChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        tabs={tabs}
        onAddTab={handleAddTab}
        onRemoveTab={handleRemoveTab}
        onMoveTab={handleMoveTab}
      />
    </ThemeProvider>
  );
}
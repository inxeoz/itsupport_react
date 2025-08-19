import { useState, useCallback } from "react";
import { TopBar } from "./components/TopBar";
import { TicketDashboard } from "./components/TicketDashboard";
import { KanbanBoard } from "./components/KanbanBoard";
import { AddTicket } from "./components/AddTicket";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { FormView } from "./components/FormView";
import { GanttView } from "./components/GanttView";
import { CalendarView } from "./components/CalendarView";
import { DocumentView } from "./components/DocumentView";
import { FileGalleryView } from "./components/FileGalleryView";
import { CustomizableDashboard } from "./components/CustomizableDashboard";
import { DeveloperDashboard } from "./components/DeveloperDashboard";
import { HackerProDashboard } from "./components/HackerProDashboard";
import { TesterDashboard } from "./components/TesterDashboard";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider, type Theme } from "./components/ThemeProvider";

interface AppContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  tabs: Array<{ id: string; label: string; icon: string | null }>;
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
  const renderActiveView = () => {
    switch (activeTab) {
      case "main-table":
      case "table":
        return <TicketDashboard />;
      case "kanban":
        return <KanbanBoard />;
      case "add-ticket":
        return <AddTicket />;
      case "chart":
        return <AnalyticsDashboard />;
      case "form":
        return <FormView />;
      case "gantt":
        return <GanttView />;
      case "calendar":
        return <CalendarView />;
      case "doc":
        return <DocumentView />;
      case "file-gallery":
        return <FileGalleryView />;
      case "customizable":
        return <CustomizableDashboard />;
      case "developer":
        return <DeveloperDashboard />;
      case "hacker-pro":
        return <HackerProDashboard />;
      case "tester":
        return <TesterDashboard />;
      default:
        return <TicketDashboard />;
    }
  };

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
        {renderActiveView()}
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
  const [theme, setTheme] = useState<Theme>({
    mode: "light",
    accent: "blue",
  });
  const [tabs, setTabs] = useState([
    { id: "main-table", label: "Main table", icon: "⋯" },
    { id: "form", label: "Form", icon: null },
    { id: "kanban", label: "Kanban", icon: null },
    { id: "add-ticket", label: "Add Ticket", icon: null },
  ]);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  const handleAddTab = useCallback((tabId: string, label: string) => {
    setTabs((prevTabs) => {
      const existingTab = prevTabs.find((tab) => tab.id === tabId);
      if (!existingTab) {
        return [
          ...prevTabs,
          { id: tabId, label, icon: null },
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
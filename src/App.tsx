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
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider, type Theme } from "./components/ThemeProvider";

export default function App() {
  const [activeTab, setActiveTab] = useState("main-table");
  const [theme, setTheme] = useState<Theme>({
    mode: "dark",
    accent: "blue",
  });
  const [tabs, setTabs] = useState([
    { id: "main-table", label: "Main table", icon: "⋯" },
    { id: "form", label: "Form", icon: null },
    { id: "kanban", label: "Kanban", icon: null },
    { id: "add-ticket", label: "Add Ticket", icon: null },
  ]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleAddTab = (tabId: string, label: string) => {
    const existingTab = tabs.find((tab) => tab.id === tabId);
    if (!existingTab) {
      setTabs((prevTabs) => [
        ...prevTabs,
        { id: tabId, label, icon: null },
      ]);
    }
  };

  const handleRemoveTab = (tabId: string) => {
    // Don't allow removing the last tab
    if (tabs.length <= 1) {
      return;
    }

    // Remove the tab from the list
    setTabs((prevTabs) =>
      prevTabs.filter((tab) => tab.id !== tabId),
    );

    // If the removed tab was the active tab, switch to another tab
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter(
        (tab) => tab.id !== tabId,
      );
      if (remainingTabs.length > 0) {
        // Switch to the first remaining tab
        setActiveTab(remainingTabs[0].id);
      }
    }
  };

  const handleMoveTab = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setTabs((prevTabs) => {
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
      default:
        return <TicketDashboard />;
    }
  };

  // Generate CSS classes for theme
  const getThemeClasses = () => {
    let classes =
      "h-screen bg-background text-foreground flex flex-col transition-colors duration-300";

    // Add dark mode class
    if (theme.mode === "dark") {
      classes += " dark";
    }

    // Add theme background classes
    if (theme.accent === "blue") {
      classes += " blue-theme";
    } else if (theme.accent === "orange") {
      classes += " orange-theme";
    } else if (theme.accent === "green") {
      classes += " green-theme";
    }

    return classes;
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={getThemeClasses()}>
        <TopBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          theme={theme}
          onThemeChange={handleThemeChange}
          tabs={tabs}
          onAddTab={handleAddTab}
          onRemoveTab={handleRemoveTab}
          onMoveTab={handleMoveTab}
        />
        <main className="flex-1 overflow-auto m-5">
          {renderActiveView()}
        </main>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          expand={true}
          richColors
          closeButton
          toastOptions={{
            className:
              "bg-card border-border text-card-foreground",
          }}
        />
      </div>
    </ThemeProvider>
  );
}
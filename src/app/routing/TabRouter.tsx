import { lazy, Suspense } from "react";
import type { ViewId } from "@/shared/types";

// Lazy load feature modules for better performance
const TicketsDashboard = lazy(() => import("@/features/tickets").then(m => ({ default: m.TicketsDashboard })));
const KanbanBoard = lazy(() => import("@/features/kanban").then(m => ({ default: m.KanbanBoard })));
const AddTicket = lazy(() => import("@/features/tickets").then(m => ({ default: m.AddTicket })));
const AnalyticsDashboard = lazy(() => import("@/features/analytics").then(m => ({ default: m.AnalyticsDashboard })));
const FormView = lazy(() => import("@/features/forms").then(m => ({ default: m.FormView })));
const GanttView = lazy(() => import("@/features/gantt").then(m => ({ default: m.GanttView })));
const CalendarView = lazy(() => import("@/features/calendar").then(m => ({ default: m.CalendarView })));
const DocumentView = lazy(() => import("@/features/documents").then(m => ({ default: m.DocumentView })));
const FileGalleryView = lazy(() => import("@/features/gallery").then(m => ({ default: m.FileGalleryView })));
const CustomizableDashboard = lazy(() => import("@/shared/components/CustomizableDashboard/CustomizableDashboard").then(m => ({ default: m.CustomizableDashboard })));
const DeveloperDashboard = lazy(() => import("@/features/developer").then(m => ({ default: m.DeveloperDashboard })));
const HackerProDashboard = lazy(() => import("@/features/developer").then(m => ({ default: m.HackerProDashboard })));
const TesterDashboard = lazy(() => import("@/features/developer").then(m => ({ default: m.TesterDashboard })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2 text-muted-foreground">Loading...</span>
  </div>
);

interface TabRouterProps {
  activeTab: string;
}

export function TabRouter({ activeTab }: TabRouterProps) {
  const renderActiveView = () => {
    const viewId = activeTab as ViewId;
    
    switch (viewId) {
      case "main-table":
      case "table":
        return <TicketsDashboard />;
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
        return <TicketsDashboard />;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderActiveView()}
    </Suspense>
  );
}
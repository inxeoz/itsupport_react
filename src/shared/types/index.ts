export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
}

export interface TabRouterProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: TabConfig[];
  onAddTab: (tabId: string, label: string) => void;
  onRemoveTab: (tabId: string) => void;
  onMoveTab: (dragIndex: number, hoverIndex: number) => void;
}

export type ViewId = 
  | "main-table"
  | "table" 
  | "kanban"
  | "add-ticket"
  | "chart"
  | "form"
  | "gantt"
  | "calendar"
  | "doc"
  | "file-gallery"
  | "customizable"
  | "developer"
  | "hacker-pro"
  | "tester";

export interface TestConnectionResult {
  success: boolean;
  message?: string;
  data?: any;
}
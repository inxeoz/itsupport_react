
// =============================================
// components/Navigation/TabsNav.tsx
// =============================================
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DraggableTab } from "@/components/Navigation/DraggableTab.tsx";

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

interface TabsNavProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onRemoveTab: (tabId: string) => void;
  onMoveTab: (dragIndex: number, hoverIndex: number) => void;
  canRemoveTab: boolean;
  getThemeClasses: () => string;
  showTooltips: boolean;
}

export function TabsNav({
  tabs,
  activeTab,
  onTabChange,
  onRemoveTab,
  onMoveTab,
  canRemoveTab,
  getThemeClasses,
  showTooltips,
}: TabsNavProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex items-center gap-1 min-w-0 mytick-theme">
        {tabs.map((tab, index) => (
          <DraggableTab
            key={tab.id}
            tab={tab}
            index={index}
            isActive={activeTab === tab.id}
            onTabChange={onTabChange}
            onRemoveTab={onRemoveTab}
            onMoveTab={onMoveTab}
            canRemoveTab={canRemoveTab}
            getThemeClasses={getThemeClasses}
            showTooltips={showTooltips}
          />
        ))}
      </div>
    </DndProvider>
  );
}

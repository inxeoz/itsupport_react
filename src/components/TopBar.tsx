// import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

import AccountMenu from "./AccountMenu";
import AddTab from "./AddTab";

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TopBar({ activeTab, onTabChange }: TopBarProps) {
  const tabs = [
    { id: "main-table", label: "Main table", icon: "⋯" },
    { id: "form", label: "Form", icon: null },
    { id: "kanban", label: "Kanban", icon: null },
  ];

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      {/* Left side - Navigation tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm ${
              activeTab === tab.id
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}

        {/* <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white ml-2"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add View
        </Button> */}

        <AddTab />
      </div>

      {/* Right side - Branding and controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium text-white">MYTICK</h1>
          <Badge
            variant="secondary"
            className="bg-emerald-600 text-white border-none"
          >
            In Portal
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button> */}

          {/* <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div> */}

          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

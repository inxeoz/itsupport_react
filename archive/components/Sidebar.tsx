import { Plus } from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'main-table', label: 'Main table', icon: '⋯' },
    { id: 'form', label: 'Form', icon: null },
    { id: 'kanban', label: 'Kanban', icon: null },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-2">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white ml-2"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add View
        </Button>
      </div>
    </nav>
  );
}
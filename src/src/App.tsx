import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { TicketDashboard } from '../components/TicketDashboard';
import { KanbanBoard } from '../components/KanbanBoard';
import { AddTicket } from '../components/AddTicket';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('main-table');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tabs, setTabs] = useState([
    { id: "main-table", label: "Main table", icon: "⋯" },
    { id: "form", label: "Form", icon: null },
    { id: "kanban", label: "Kanban", icon: null },
    { id: "add-ticket", label: "Add Ticket", icon: null },
  ]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAddTab = (tabId: string, label: string) => {
    const existingTab = tabs.find(tab => tab.id === tabId);
    if (!existingTab) {
      setTabs(prevTabs => [...prevTabs, { id: tabId, label, icon: null }]);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'main-table':
      case 'table':
        return <TicketDashboard />;
      case 'kanban':
        return <KanbanBoard />;
      case 'add-ticket':
        return <AddTicket />;
      case 'chart':
        return <AnalyticsDashboard />;
      case 'form':
        return (
          <div className="p-6">
            <h2 className="text-xl mb-4">Form View</h2>
            <p className="text-muted-foreground">Form view coming soon...</p>
          </div>
        );
      case 'gantt':
        return (
          <div className="p-6">
            <h2 className="text-xl mb-4">Gantt View</h2>
            <p className="text-muted-foreground">Gantt chart view coming soon...</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-6">
            <h2 className="text-xl mb-4">Calendar View</h2>
            <p className="text-muted-foreground">Calendar view coming soon...</p>
          </div>
        );
      case 'doc':
        return (
          <div className="p-6">
            <h2 className="text-xl mb-4">Document View</h2>
            <p className="text-muted-foreground">Document view coming soon...</p>
          </div>
        );
      case 'file-gallery':
        return (
          <div className="p-6">
            <h2 className="text-xl mb-4">File Gallery View</h2>
            <p className="text-muted-foreground">File gallery view coming soon...</p>
          </div>
        );
      case 'customizable':
        return (
          <div className="p-6">
            <h2 className="text-xl mb-4">Customizable View</h2>
            <p className="text-muted-foreground">Customizable view coming soon...</p>
          </div>
        );
      default:
        return <TicketDashboard />;
    }
  };

  return (
    <div className={`h-screen bg-background text-foreground flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <TopBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        tabs={tabs}
        onAddTab={handleAddTab}
      />
      <main className="flex-1 overflow-auto m-5">
        {renderActiveView()}
      </main>
    </div>
  );
}
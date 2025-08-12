import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { TicketDashboard } from './components/TicketDashboard';
import { KanbanBoard } from './components/KanbanBoard';

export default function App() {
  const [activeTab, setActiveTab] = useState('main-table');

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto m-5">
        {activeTab === 'main-table' && <TicketDashboard />}
        {activeTab === 'form' && (
          <div className="p-6">
            <h2 className="text-xl mb-4">Form View</h2>
            <p className="text-slate-400">Form view coming soon...</p>
          </div>
        )}
        {activeTab === 'kanban' && <KanbanBoard />}
      </main>
    </div>
  );
}
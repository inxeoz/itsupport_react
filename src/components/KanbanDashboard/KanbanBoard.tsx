import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { KanbanColumn } from './KanbanColumn.tsx';

interface Ticket {
  id: number;
  title: string;
  description: string;
  agent: string | null;
  status: string;
  priority: string;
  creationDate: string;
  resolutionDate: string | null;
  tags: string[];
}

const initialTicketData: Ticket[] = [
  {
    id: 1,
    title: 'Request for access - new employee',
    description: 'Hello team, We have a new employee joining our Creative ...',
    agent: null,
    status: 'reviewed',
    priority: 'medium',
    creationDate: 'May 4, 2024',
    resolutionDate: null,
    tags: ['Reviewed']
  },
  {
    id: 2,
    title: 'job issue',
    description: '',
    agent: null,
    status: 'reviewed',
    priority: 'high',
    creationDate: 'Aug 7',
    resolutionDate: null,
    tags: ['Reviewed']
  },
  {
    id: 3,
    title: 'SSO not working after new security audit',
    description: 'Our entire team is locked out of our SaaS applications and thinks ...',
    agent: null,
    status: 'awaiting-customer',
    priority: 'critical',
    creationDate: 'Apr 23, 2024',
    resolutionDate: null,
    tags: ['Awaiting customer', 'Critical']
  },
  {
    id: 4,
    title: 'I need help with my laptop',
    description: 'Hi team! So some reason I can\'t restart my laptop. The screen just ...',
    agent: null,
    status: 'resolved',
    priority: 'low',
    creationDate: 'Apr 10, 2024',
    resolutionDate: 'Apr 15, 2024',
    tags: ['Removed']
  },
  {
    id: 5,
    title: 'rt',
    description: 'Help me pls',
    agent: null,
    status: 'new',
    priority: 'high',
    creationDate: 'Critical',
    resolutionDate: null,
    tags: ['New', 'High']
  }
];

const kanbanColumns = [
  {
    id: 'reviewed',
    title: 'Reviewed',
    color: 'bg-muted',
    count: 2
  },
  {
    id: 'awaiting-customer',
    title: 'Awaiting customer',
    color: 'bg-theme-accent',
    count: 1
  },
  {
    id: 'need-reply',
    title: 'Need reply',
    color: 'bg-theme-accent',
    count: 0
  },
  {
    id: 'resolved',
    title: 'Resolved',
    color: 'bg-theme-accent',
    count: 1
  },
  {
    id: 'self-resolved',
    title: 'Self resolved',
    color: 'bg-muted-foreground',
    count: 0
  },
  {
    id: 'returned',
    title: 'Returned',
    color: 'bg-theme-accent',
    count: 0
  },
  {
    id: 'new',
    title: 'New',
    color: 'bg-theme-accent',
    count: 1
  }
];

export function KanbanBoard() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTicketData);

  const getTicketsForColumn = (columnId: string) => {
    return tickets.filter(ticket => ticket.status === columnId);
  };

  const moveTicket = (ticketId: number, newStatus: string) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );
  };

  const updateTicket = (ticketId: number, updates: Partial<Ticket>) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, ...updates }
          : ticket
      )
    );
  };

  const deleteTicket = (ticketId: number) => {
    setTickets(prevTickets =>
      prevTickets.filter(ticket => ticket.id !== ticketId)
    );
  };

  const duplicateTicket = (ticketToDuplicate: Ticket) => {
    const newTicket: Ticket = {
      ...ticketToDuplicate,
      id: Math.max(...tickets.map(t => t.id)) + 1,
      title: `${ticketToDuplicate.title} (Copy)`,
      creationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      resolutionDate: null,
    };
    setTickets(prevTickets => [...prevTickets, newTicket]);
  };

  const addTicketToColumn = (columnId: string) => {
    const newTicket: Ticket = {
      id: Math.max(...tickets.map(t => t.id)) + 1,
      title: 'New Ticket',
      description: 'Enter ticket description...',
      agent: null,
      status: columnId,
      priority: 'medium',
      creationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      resolutionDate: null,
      tags: []
    };
    setTickets(prevTickets => [...prevTickets, newTicket]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full bg-background">
        {/* Toolbar */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground">
                <Search className="w-4 h-4 mr-1 text-muted-foreground" />
                <span className="text-foreground">Search</span>
              </Button>

              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground">
                <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
                <span className="text-foreground">Filter</span>
              </Button>

              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground">
                <span className="text-foreground">📊</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground">
                <span className="text-foreground">👁️</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground">
                <span className="text-foreground">⬆</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="flex gap-4 p-4 min-w-max">
            {kanbanColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tickets={getTicketsForColumn(column.id)}
                onMoveTicket={moveTicket}
                onUpdateTicket={updateTicket}
                onDeleteTicket={deleteTicket}
                onDuplicateTicket={duplicateTicket}
                onAddTicket={addTicketToColumn}
              />
            ))}

            <div className="min-w-80">
              <Button
                variant="ghost"
                className="w-full h-12 border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground hover:bg-accent"
              >
                <Plus className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">Add folder</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

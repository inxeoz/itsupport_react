import { useDrop } from 'react-dnd';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { KanbanCard } from './KanbanCard.tsx';

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

interface Column {
  id: string;
  title: string;
  color: string;
  count: number;
}

interface KanbanColumnProps {
  column: Column;
  tickets: Ticket[];
  onMoveTicket: (ticketId: number, newStatus: string) => void;
  onUpdateTicket?: (ticketId: number, updates: Partial<Ticket>) => void;
  onDeleteTicket?: (ticketId: number) => void;
  onDuplicateTicket?: (ticket: Ticket) => void;
  onAddTicket?: (columnId: string) => void;
}

interface DragItem {
  id: number;
  type: string;
  status: string;
}

export function KanbanColumn({ column, tickets, onMoveTicket, onUpdateTicket, onDeleteTicket, onDuplicateTicket, onAddTicket }: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: 'TICKET',
    drop: (item) => {
      if (item.status !== column.id) {
        onMoveTicket(item.id, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="min-w-80 flex flex-col">
      {/* Column Header */}
      <div className="bg-card rounded-t-lg p-3 border border-border">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-6 rounded-sm ${column.color}`}></div>
          <span className="font-medium text-foreground">{column.title}</span>
          <span className="text-muted-foreground text-sm">{tickets.length}</span>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={drop}
        className={`bg-muted flex-1 border-l border-r border-border p-2 space-y-3 min-h-96 transition-colors ${
          isOver ? 'bg-accent border-accent-foreground' : ''
        }`}
      >
        {tickets.map((ticket) => (
          <KanbanCard
            key={ticket.id}
            ticket={ticket}
            onUpdateTicket={onUpdateTicket}
            onDeleteTicket={onDeleteTicket}
            onDuplicateTicket={onDuplicateTicket}
          />
        ))}

        {tickets.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            {isOver ? 'Drop here' : 'No tickets'}
          </div>
        )}
      </div>

      {/* Column Footer */}
      <div className="bg-muted rounded-b-lg border border-t-0 border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={() => onAddTicket?.(column.id)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add ticket
        </Button>
      </div>
    </div>
  );
}

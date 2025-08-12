import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { KanbanCard } from "./KanbanCard";
import { Droppable } from "@hello-pangea/dnd";

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
}

export function KanbanColumn({ column, tickets }: KanbanColumnProps) {
  return (
    <div className="min-w-80 flex flex-col">
      {/* Column Header */}
      <div className="bg-slate-800 rounded-t-lg p-3 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-6 rounded-sm ${column.color}`}></div>
          <span className="font-medium text-white">{column.title}</span>
          <span className="text-slate-400 text-sm">{tickets.length}</span>
        </div>
      </div>

      {/* Column Content */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`bg-slate-850 flex-1 border-l border-r border-slate-700 p-2 space-y-3 min-h-96 transition-colors ${
              snapshot.isDraggingOver ? "bg-slate-800" : ""
            }`}
          >
            {tickets.map((ticket, index) => (
              <KanbanCard key={ticket.id} ticket={ticket} index={index} />
            ))}

            {tickets.length === 0 && (
              <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                No tickets
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Column Footer */}
      <div className="bg-slate-850 rounded-b-lg border border-t-0 border-slate-700 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add ticket
        </Button>
      </div>
    </div>
  );
}

import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { KanbanColumn } from "./KanbanColumn";
import { Toolbar } from "./Toolbar";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import data from "./data/ticket.json";

const initialTicketData = data;

const kanbanColumns = [
  {
    id: "reviewed",
    title: "Reviewed",
    color: "bg-slate-500",
    count: 2,
  },
  {
    id: "awaiting-customer",
    title: "Awaiting customer",
    color: "bg-purple-500",
    count: 1,
  },
  {
    id: "need-reply",
    title: "Need reply",
    color: "bg-blue-500",
    count: 0,
  },
  {
    id: "resolved",
    title: "Resolved",
    color: "bg-green-500",
    count: 1,
  },
  {
    id: "self-resolved",
    title: "Self resolved",
    color: "bg-yellow-500",
    count: 0,
  },
  {
    id: "returned",
    title: "Returned",
    color: "bg-cyan-500",
    count: 0,
  },
  {
    id: "new",
    title: "New",
    color: "bg-indigo-500",
    count: 1,
  },
];

export function KanbanBoard() {
  const [tickets, setTickets] = useState(initialTicketData);

  const getTicketsForColumn = (columnId: string) => {
    return tickets.filter((ticket) => ticket.status === columnId);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination, do nothing
    if (!destination) {
      return;
    }

    // If the item is dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update the ticket's status
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === parseInt(draggableId)
          ? { ...ticket, status: destination.droppableId }
          : ticket,
      ),
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Toolbar
        leftActions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
            >
              <Search className="w-4 h-4 mr-1" />
              Search
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </>
        }
        rightActions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
            >
              📊
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
            >
              👁️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
            >
              ⬆
            </Button>
          </>
        }
      />

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-auto">
          <div className="flex gap-4 p-4 min-w-max">
            {kanbanColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tickets={getTicketsForColumn(column.id)}
              />
            ))}

            <div className="min-w-80">
              <Button
                variant="ghost"
                className="w-full h-12 border-2 border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add folder
              </Button>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

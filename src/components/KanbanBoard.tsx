import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { KanbanColumn } from "./KanbanColumn";
import { Toolbar } from "./Toolbar";

const mockTicketData = [
  {
    id: 1,
    title: "Request for access - new employee",
    description: "Hello team, We have a new employee joining our Creative ...",
    agent: null,
    status: "reviewed",
    priority: "medium",
    creationDate: "May 4, 2024",
    resolutionDate: null,
    tags: ["Reviewed"],
  },
  {
    id: 2,
    title: "job issue",
    description: "",
    agent: null,
    status: "reviewed",
    priority: "high",
    creationDate: "Aug 7",
    resolutionDate: null,
    tags: ["Reviewed"],
  },
  {
    id: 3,
    title: "SSO not working after new security audit",
    description:
      "Our entire team is locked out of our SaaS applications and thinks ...",
    agent: null,
    status: "awaiting-customer",
    priority: "critical",
    creationDate: "Apr 23, 2024",
    resolutionDate: null,
    tags: ["Awaiting customer", "Critical"],
  },
  {
    id: 4,
    title: "I need help with my laptop",
    description:
      "Hi team! So some reason I can't restart my laptop. The screen just ...",
    agent: null,
    status: "resolved",
    priority: "low",
    creationDate: "Apr 10, 2024",
    resolutionDate: "Apr 15, 2024",
    tags: ["Removed"],
  },
  {
    id: 5,
    title: "rt",
    description: "Help me pls",
    agent: null,
    status: "new",
    priority: "high",
    creationDate: "Critical",
    resolutionDate: null,
    tags: ["New", "High"],
  },
];

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
  const getTicketsForColumn = (columnId: string) => {
    return mockTicketData.filter((ticket) => ticket.status === columnId);
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
    </div>
  );
}

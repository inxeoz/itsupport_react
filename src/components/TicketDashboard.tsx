import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { TicketGroup } from "./TicketGroup";
import { Toolbar } from "./Toolbar";

const mockTicketData = [
  {
    id: "AS",
    name: "AS",
    color: "bg-red-500",
    count: 2,
    tickets: [
      {
        id: 1,
        agent: null,
        status: "open",
        priority: "high",
        creationDate: "May 2, 24",
        resolutionDate: null,
      },
      {
        id: 2,
        agent: null,
        status: "pending",
        priority: "medium",
        creationDate: "Apr 28, 24",
        resolutionDate: "May 1, 24",
      },
    ],
  },
  {
    id: "OP",
    name: "OP",
    color: "bg-blue-500",
    count: 1,
    tickets: [
      {
        id: 3,
        agent: "John Doe",
        status: "in-progress",
        priority: "high",
        creationDate: "May 1, 24",
        resolutionDate: null,
      },
    ],
  },
  {
    id: "WR",
    name: "WR",
    color: "bg-purple-500",
    count: 1,
    tickets: [
      {
        id: 4,
        agent: "Jane Smith",
        status: "waiting",
        priority: "low",
        creationDate: "Apr 29, 24",
        resolutionDate: null,
      },
    ],
  },
  {
    id: "RT",
    name: "RT",
    color: "bg-green-500",
    count: 2,
    tickets: [
      {
        id: 5,
        agent: null,
        status: "resolved",
        priority: "medium",
        creationDate: "Apr 10, 24",
        resolutionDate: "Apr 15, 24",
      },
      {
        id: 6,
        agent: "Mike Johnson",
        status: "closed",
        priority: "low",
        creationDate: "Apr 5, 24",
        resolutionDate: "Apr 7, 24",
      },
    ],
  },
];

export function TicketDashboard() {
  return (
    <div className="flex flex-col h-full">
      <Toolbar
        leftActions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              New ticket
            </Button>

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
              📊 Group by
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
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white"
          >
            ⬆
          </Button>
        }
      />

      {/* Table Header */}
      <div className="bg-slate-850 border-b border-slate-700 px-6 py-3">
        <div className="grid grid-cols-6 gap-4 text-sm text-slate-400">
          <div></div>
          <div>Agent</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Creation Date</div>
          <div>Resolution Date</div>
        </div>
      </div>

      {/* Ticket Groups */}
      <div className="flex-1 overflow-auto">
        {mockTicketData.map((group) => (
          <TicketGroup key={group.id} group={group} />
        ))}

        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add new group
          </Button>
        </div>
      </div>
    </div>
  );
}

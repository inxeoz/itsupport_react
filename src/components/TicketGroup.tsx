import { useState } from 'react';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Ticket {
  id: number;
  agent: string | null;
  status: string;
  priority: string;
  creationDate: string;
  resolutionDate: string | null;
}

interface Group {
  id: string;
  name: string;
  color: string;
  count: number;
  tickets: Ticket[];
}

interface TicketGroupProps {
  group: Group;
}

const statusColors = {
  open: 'bg-gray-500',
  pending: 'bg-yellow-500',
  'in-progress': 'bg-blue-500',
  waiting: 'bg-purple-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-600',
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-orange-500',
  high: 'bg-red-500',
};

export function TicketGroup({ group }: TicketGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusColor = (status: string) => statusColors[status as keyof typeof statusColors] || 'bg-gray-500';
  const getPriorityColor = (priority: string) => priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-500';

  return (
    <div className="border-b border-slate-700">
      {/* Group Header */}
      <div
        className="flex items-center gap-3 p-4 hover:bg-slate-800 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          <div className={`w-3 h-8 rounded-sm ${group.color}`}></div>
          <span className="font-medium">{group.name}</span>
          <span className="text-slate-400 text-sm">{group.count} Tickets</span>
        </div>
      </div>

      {/* Tickets */}
      {isExpanded && (
        <div>
          {group.tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="grid grid-cols-6 gap-4 px-6 py-3 hover:bg-slate-800 border-l-4 border-l-transparent hover:border-l-slate-600"
            >
              <div></div>
              
              {/* Agent */}
              <div className="flex items-center">
                {ticket.agent ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-slate-600">
                        {ticket.agent.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ticket.agent}</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-400" />
                  </div>
                )}
              </div>
              
              {/* Status */}
              <div>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(ticket.status)} text-white border-none capitalize text-xs`}
                >
                  {ticket.status.replace('-', ' ')}
                </Badge>
              </div>
              
              {/* Priority */}
              <div>
                <Badge
                  variant="secondary"
                  className={`${getPriorityColor(ticket.priority)} text-white border-none capitalize text-xs`}
                >
                  {ticket.priority}
                </Badge>
              </div>
              
              {/* Creation Date */}
              <div>
                <Badge
                  variant="outline"
                  className="bg-red-600 text-white border-red-600 text-xs"
                >
                  {ticket.creationDate}
                </Badge>
              </div>
              
              {/* Resolution Date */}
              <div>
                {ticket.resolutionDate ? (
                  <Badge
                    variant="outline"
                    className="bg-green-600 text-white border-green-600 text-xs"
                  >
                    {ticket.resolutionDate}
                  </Badge>
                ) : (
                  <div className="w-20 h-6 bg-slate-700 rounded"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
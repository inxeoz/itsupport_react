import { MessageSquare, Paperclip, MoreHorizontal } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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

interface KanbanCardProps {
  ticket: Ticket;
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-orange-500',
  high: 'bg-red-500',
  critical: 'bg-red-600',
};

const tagColors = {
  'Reviewed': 'bg-slate-500',
  'Awaiting customer': 'bg-purple-500',
  'Critical': 'bg-red-600',
  'Removed': 'bg-gray-500',
  'New': 'bg-indigo-500',
  'High': 'bg-red-500',
};

export function KanbanCard({ ticket }: KanbanCardProps) {
  const getPriorityColor = (priority: string) => 
    priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-500';
  
  const getTagColor = (tag: string) =>
    tagColors[tag as keyof typeof tagColors] || 'bg-gray-500';

  return (
    <div className="bg-slate-700 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition-colors">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-white leading-tight">
          {ticket.title}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-xs text-slate-300 mb-3 line-clamp-2">
          {ticket.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {ticket.tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={`${getTagColor(tag)} text-white border-none text-xs px-2 py-0.5`}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-red-600 text-white border-red-600 text-xs"
          >
            {ticket.creationDate}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 text-slate-400">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
          >
            <MessageSquare className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
          >
            <Paperclip className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
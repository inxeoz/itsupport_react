import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { MessageSquare, Paperclip, MoreHorizontal, GripVertical, Edit, Copy, Trash2, Check, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

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
  onUpdateTicket?: (ticketId: number, updates: Partial<Ticket>) => void;
  onDeleteTicket?: (ticketId: number) => void;
  onDuplicateTicket?: (ticket: Ticket) => void;
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

export function KanbanCard({ ticket, onUpdateTicket, onDeleteTicket, onDuplicateTicket }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDescription, setEditDescription] = useState(ticket.description);
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'TICKET',
    item: { id: ticket.id, type: 'TICKET', status: ticket.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getPriorityColor = (priority: string) => 
    priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-500';
  
  const getTagColor = (tag: string) =>
    tagColors[tag as keyof typeof tagColors] || 'bg-gray-500';

  const handleSaveEdit = () => {
    if (onUpdateTicket && (editTitle !== ticket.title || editDescription !== ticket.description)) {
      onUpdateTicket(ticket.id, {
        title: editTitle.trim() || ticket.title,
        description: editDescription.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDuplicate = () => {
    if (onDuplicateTicket) {
      onDuplicateTicket(ticket);
    }
  };

  const handleDelete = () => {
    if (onDeleteTicket) {
      onDeleteTicket(ticket.id);
    }
  };

  return (
    <div
      ref={dragPreview}
      className={`bg-card rounded-lg border border-border hover:border-muted-foreground transition-all group cursor-move ${
        isDragging ? 'opacity-50 rotate-2 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      {/* Drag Handle */}
      <div 
        ref={drag}
        className="flex items-center justify-between p-3 pb-2"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-sm font-medium h-6 px-1 border-none bg-accent focus:bg-background"
              placeholder="Enter ticket title..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
            />
          ) : (
            <h4 className="text-sm font-medium text-foreground leading-tight flex-1">
              {ticket.title}
            </h4>
          )}
        </div>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
              onClick={handleSaveEdit}
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              onClick={handleCancelEdit}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit} className="text-xs">
                <Edit className="w-3 h-3 mr-2" />
                Edit Ticket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate} className="text-xs">
                <Copy className="w-3 h-3 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete} 
                className="text-xs text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="px-3 pb-3">
        {/* Description */}
        {isEditing ? (
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="text-xs min-h-16 mb-3 px-2 py-1 border-none bg-accent focus:bg-background resize-none"
            placeholder="Enter ticket description..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
          />
        ) : (
          ticket.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {ticket.description}
            </p>
          )
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
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
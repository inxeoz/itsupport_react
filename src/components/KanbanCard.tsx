import { MessageSquare, Paperclip, MoreHorizontal } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Draggable } from "@hello-pangea/dnd";

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
  index: number;
}

// Configuration for tag colors - easily extensible
const TAG_COLORS: Record<string, string> = {
  Reviewed: "bg-slate-500",
  "Awaiting customer": "bg-purple-500",
  Critical: "bg-red-600",
  Removed: "bg-gray-500",
  New: "bg-indigo-500",
  High: "bg-red-500",
};

// CSS classes for better maintainability
const STYLES = {
  card: "bg-slate-700 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition-all cursor-grab active:cursor-grabbing max-w-sm",
  cardDragging: "shadow-lg rotate-2 bg-slate-600",
  title: "text-sm font-medium text-white leading-tight",
  description: "text-xs text-slate-300 mb-3 line-clamp-2",
  iconButton: "h-6 w-6 p-0 text-slate-400 hover:text-white",
  datebadge: "bg-red-600 text-white border-red-600 text-xs",
  tag: "text-white border-none text-xs px-2 py-0.5",
} as const;

const IconButton = ({
  icon: Icon,
  className = "",
}: {
  icon: any;
  className?: string;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={`${STYLES.iconButton} ${className}`}
  >
    <Icon className="w-3 h-3" />
  </Button>
);

const TagBadge = ({ tag }: { tag: string }) => {
  const colorClass = TAG_COLORS[tag] || "bg-gray-500";
  return (
    <Badge variant="secondary" className={`${colorClass} ${STYLES.tag}`}>
      {tag}
    </Badge>
  );
};

export function KanbanCard({ ticket, index }: KanbanCardProps) {
  return (
    <Draggable draggableId={ticket.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${STYLES.card} ${snapshot.isDragging ? STYLES.cardDragging : ""}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h4 className={STYLES.title}>{ticket.title}</h4>
            <IconButton
              icon={MoreHorizontal}
              className="opacity-0 group-hover:opacity-100"
            />
          </div>

          {/* Description */}
          {ticket.description && (
            <p className={STYLES.description}>{ticket.description}</p>
          )}

          {/* Tags */}
          {ticket.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {ticket.tags.map((tag, tagIndex) => (
                <TagBadge key={tagIndex} tag={tag} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={STYLES.datebadge}>
              {ticket.creationDate}
            </Badge>

            <div className="flex items-center gap-1">
              <IconButton icon={MessageSquare} />
              <IconButton icon={Paperclip} />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

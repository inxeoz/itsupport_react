import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { MoreHorizontal, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from './ui/dropdown-menu';

const ItemType = 'TAB';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface DraggableTabProps {
  tab: Tab;
  index: number;
  isActive: boolean;
  onTabChange: (tabId: string) => void;
  onRemoveTab: (tabId: string) => void;
  onMoveTab: (dragIndex: number, hoverIndex: number) => void;
  canRemoveTab: boolean;
  getThemeClasses: () => string;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function DraggableTab({
  tab,
  index,
  isActive,
  onTabChange,
  onRemoveTab,
  onMoveTab,
  canRemoveTab,
  getThemeClasses,
}: DraggableTabProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get horizontal middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the left
      const hoverClientX = (clientOffset?.x ?? 0) - hoverBoundingRect.left;

      // Only perform the move when the mouse has crossed half of the items width
      // When dragging rightward, only move when the cursor is beyond 50%
      // When dragging leftward, only move when the cursor is before 50%

      // Dragging rightward
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }

      // Dragging leftward
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      // Time to actually perform the action
      onMoveTab(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: () => {
      return { id: tab.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      style={{ opacity }}
      data-handler-id={handlerId}
      className="flex items-center cursor-move"
    >
      {isActive ? (
        /* Active tab with dropdown menu */
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm bg-accent text-accent-foreground hover:bg-accent relative`}
            >
              {tab.label}
              <MoreHorizontal className="w-4 h-4 ml-1" />
              {/* Drag indicator */}
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-muted-foreground/20 rounded-full flex flex-col justify-center gap-0.5">
                <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full"></div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={`w-48 ${getThemeClasses()}`}
          >
            <DropdownMenuLabel className="text-muted-foreground">
              {tab.label} Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {tab.id === "main-table" && (
                <>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Table Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Configure Filters</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Customize Columns</span>
                  </DropdownMenuItem>
                </>
              )}
              {tab.id === "kanban" && (
                <>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Board Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Add Column</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Customize Colors</span>
                  </DropdownMenuItem>
                </>
              )}
              {tab.id === "form" && (
                <>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Form Builder</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Form Settings</span>
                  </DropdownMenuItem>
                </>
              )}
              {tab.id === "add-ticket" && (
                <>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Form Preferences</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Template Settings</span>
                  </DropdownMenuItem>
                </>
              )}
              {tab.id === "chart" && (
                <>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Chart Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Data Filters</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <span>Export Options</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
            
            {/* Remove Tab option - only show if more than one tab exists */}
            {canRemoveTab && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onRemoveTab(tab.id)}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <X className="w-4 h-4" />
                  <span>Remove Tab</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        /* Inactive tab - regular button */
        <button
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent relative`}
        >
          {tab.label}
          {/* Drag indicator */}
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-muted-foreground/20 rounded-full flex flex-col justify-center gap-0.5">
            <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full"></div>
          </div>
        </button>
      )}
    </div>
  );
}
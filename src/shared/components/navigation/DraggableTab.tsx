// /home/inxeoz/proj/prob/apps/itsupport_frappe/itsupport_frappe/itsupport_react/src/components/Navigation/DraggableTab.tsx

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { MoreHorizontal, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/tooltip.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/ui/components/dropdown-menu.tsx';

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
  showTooltips?: boolean;
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
  showTooltips = true,
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

  const opacity = isDragging ? 0.6 : 1;
  const transform = isDragging ? 'scale(1.02)' : 'scale(1)';

  // Apply drag and drop to the entire container
  drag(drop(ref));

  // Conditional wrapper component for tooltips
  const ConditionalTooltip = ({
    children,
    content,
    ...props
  }: {
    children: React.ReactNode;
    content: React.ReactNode;
    [key: string]: any;
  }) => {
    if (!showTooltips) {
      return <>{children}</>;
    }

    return (
      <Tooltip {...props}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="mytick-theme">
          {content}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div
      ref={ref}
      style={{ opacity, transform }}
      data-handler-id={handlerId}
      className="flex items-center transition-all duration-200 mytick-theme"
    >
      {isActive ? (
        /* Active tab - separate button and dropdown */
        <div className="flex items-center mytick-theme">
          <ConditionalTooltip
            content={
              <div className="mytick-theme">
                <p className="font-medium mytick-theme">Active Tab: {tab.label}</p>
                <p className="text-sm mt-1 mytick-theme">Drag to reorder tabs or click the menu for options</p>
              </div>
            }
          >
            <button
              className={`px-4 py-2 rounded-l-md transition-all duration-200 flex items-center gap-2 text-sm bg-accent text-accent-foreground hover:bg-accent cursor-grab active:cursor-grabbing mytick-theme ${isDragging ? 'shadow-lg' : ''}`}
            >
              <span className="text-accent-foreground mytick-theme">{tab.label}</span>
            </button>
          </ConditionalTooltip>

          <ConditionalTooltip
            content={<p className="mytick-theme">Tab options and settings</p>}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`px-2 py-2 rounded-r-md transition-all duration-200 text-sm bg-accent text-accent-foreground hover:bg-accent/80 border-l border-accent-foreground/10 cursor-pointer mytick-theme ${isDragging ? 'shadow-lg' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                  }}
                >
                  <MoreHorizontal className="w-4 h-4 text-accent-foreground mytick-theme" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className={`w-48 bg-popover border-border mytick-theme ${getThemeClasses()}`}
              >
                <DropdownMenuLabel className="text-muted-foreground mytick-theme">
                  {tab.label} Options
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border mytick-theme" />
                <DropdownMenuGroup className="mytick-theme">
                  {tab.id === "main-table" && (
                    <>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Table Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Configure Filters</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Customize Columns</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {tab.id === "kanban" && (
                    <>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Board Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Add Column</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Customize Colors</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {tab.id === "form" && (
                    <>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Form Builder</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Form Settings</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {tab.id === "add-ticket" && (
                    <>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Form Preferences</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Template Settings</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {tab.id === "chart" && (
                    <>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Chart Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Data Filters</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                        <span className="text-foreground mytick-theme">Export Options</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>

                {/* Remove Tab option - only show if more than one tab exists */}
                {canRemoveTab && (
                  <>
                    <DropdownMenuSeparator className="bg-border mytick-theme" />
                    <DropdownMenuItem
                      onClick={() => onRemoveTab(tab.id)}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer text-destructive hover:bg-destructive hover:text-destructive-foreground focus:text-destructive mytick-theme"
                    >
                      <X className="w-4 h-4 mytick-theme" />
                      <span className="mytick-theme">Remove Tab</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </ConditionalTooltip>
        </div>
      ) : (
        /* Inactive tab - regular button */
        <ConditionalTooltip
          content={
            <div className="mytick-theme">
              <p className="font-medium mytick-theme">{tab.label}</p>
              <p className="text-sm mt-1 mytick-theme">Click to switch to this tab or drag to reorder</p>
            </div>
          }
        >
          <button
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground cursor-grab active:cursor-grabbing mytick-theme ${isDragging ? 'shadow-lg' : ''}`}
          >
            <span className="mytick-theme">{tab.label}</span>
          </button>
        </ConditionalTooltip>
      )}
    </div>
  );
}

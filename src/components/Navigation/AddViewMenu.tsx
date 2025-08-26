
// =============================================
// components/Navigation/AddViewMenu.tsx
// =============================================
import React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu.tsx";
import { Plus, ChevronRight } from "lucide-react";
import { ConditionalTooltip } from "@/components/Navigation/ConditionalTooltip.tsx";

export interface ViewItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

interface AddViewMenuProps {
  boardViews: ViewItem[];
  developerTools: ViewItem[];
  onSelect: (viewId: string) => void;
  getThemeClasses: () => string;
  showTooltips: boolean;
}

export function AddViewMenu({
  boardViews,
  developerTools,
  onSelect,
  getThemeClasses,
  showTooltips,
}: AddViewMenuProps) {
  return (
    <ConditionalTooltip
      show={showTooltips}
      content={
        <div className="mytick-theme">
          <p className="font-medium mytick-theme">Add View</p>
          <p className="text-sm mt-1 mytick-theme">Add different views like Table, Kanban, Charts, Calendar, and developer tools</p>
        </div>
      }
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground ml-2 flex-shrink-0 mytick-theme"
          >
            <Plus className="w-4 h-4 mr-1 text-muted-foreground mytick-theme" />
            <span className="text-foreground mytick-theme">Add View</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className={`w-72 bg-popover border-border mytick-theme ${getThemeClasses()}`}
        >
          <DropdownMenuLabel className="text-muted-foreground mytick-theme">
            Board views
          </DropdownMenuLabel>
          <DropdownMenuGroup className="mytick-theme">
            {boardViews.map((view) => {
              const IconComponent = view.icon;
              return (
                <DropdownMenuItem
                  key={view.id}
                  onClick={() => onSelect(view.id)}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme"
                >
                  <IconComponent className="w-4 h-4 text-muted-foreground mytick-theme" />
                  <span className="flex-1 text-foreground mytick-theme">{view.label}</span>
                  {view.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-theme-accent text-theme-accent-foreground border-none text-xs px-2 py-0.5 mytick-theme"
                    >
                      {view.badge}
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-border mytick-theme" />

          <DropdownMenuLabel className="text-muted-foreground mytick-theme">
            Developer Tools
          </DropdownMenuLabel>
          <DropdownMenuGroup className="mytick-theme">
            {developerTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <DropdownMenuItem
                  key={tool.id}
                  onClick={() => onSelect(tool.id)}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme"
                >
                  <IconComponent className="w-4 h-4 text-theme-accent mytick-theme" />
                  <div className="flex-1 mytick-theme">
                    <div className="font-medium text-foreground mytick-theme">{tool.label}</div>
                    {tool.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 mytick-theme">{tool.description}</div>
                    )}
                  </div>
                  {tool.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-theme-accent/20 text-theme-accent border-none text-xs px-2 py-0.5 mytick-theme"
                    >
                      {tool.badge}
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-border mytick-theme" />

          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
            <div className="w-4 h-4 bg-muted rounded flex items-center justify-center mytick-theme">
              <div className="w-2 h-2 bg-primary rounded mytick-theme"></div>
            </div>
            <span className="flex-1 text-foreground mytick-theme">Apps</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground mytick-theme" />
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border mytick-theme" />

          <DropdownMenuItem className="px-3 py-2 text-muted-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground mytick-theme">
            Explore more views
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ConditionalTooltip>
  );
}

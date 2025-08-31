import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/components/dialog.tsx';
import { Button } from '@/ui/components/button.tsx';
import { Input } from '@/ui/components/input.tsx';
import { Label } from '@/ui/components/label.tsx';
import { Checkbox } from '@/ui/components/checkbox.tsx';
import { Separator } from '@/ui/components/separator.tsx';
import { ScrollArea } from '@/ui/components/scroll-area.tsx';
import { Badge } from '@/ui/components/badge.tsx';
import { Settings, RotateCcw, Save, Eye, EyeOff, Columns } from 'lucide-react';
import { useTheme } from '@/app/providers';
import { toast } from "sonner";

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width: number;
  minWidth: number;
  required?: boolean; // Some columns like actions or select might be required
}

interface ColumnWidths {
  [key: string]: number;
}

interface ColumnVisibility {
  [key: string]: boolean;
}

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnWidths: ColumnWidths;
  columnVisibility: ColumnVisibility;
  onColumnWidthsChange: (widths: ColumnWidths) => void;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
  onResetToDefaults: () => void;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'select', label: 'Select', visible: true, width: 50, minWidth: 40, required: true },
  { id: 'ticket_id', label: 'Ticket ID', visible: true, width: 120, minWidth: 100 },
  { id: 'title', label: 'Title', visible: true, width: 200, minWidth: 150 },
  { id: 'user_name', label: 'User', visible: true, width: 150, minWidth: 120 },
  { id: 'department', label: 'Department', visible: true, width: 130, minWidth: 100 },
  { id: 'priority', label: 'Priority', visible: true, width: 100, minWidth: 80 },
  { id: 'status', label: 'Status', visible: true, width: 120, minWidth: 100 },
  { id: 'category', label: 'Category', visible: true, width: 110, minWidth: 90 },
  { id: 'created_datetime', label: 'Created Date', visible: true, width: 160, minWidth: 140 },
  { id: 'due_datetime', label: 'Due Date', visible: true, width: 160, minWidth: 140 },
  { id: 'assignee', label: 'Assignee', visible: true, width: 130, minWidth: 100 },
  { id: 'actions', label: 'Actions', visible: true, width: 100, minWidth: 80, required: true },
];

export function ColumnSettingsDialog({
  open,
  onOpenChange,
  columnWidths,
  columnVisibility,
  onColumnWidthsChange,
  onColumnVisibilityChange,
  onResetToDefaults
}: ColumnSettingsDialogProps) {
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const { getThemeClasses } = useTheme();

  // Update portal container theme classes when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const portals = document.querySelectorAll("[data-radix-portal]");
        portals.forEach((portal) => {
          // Remove existing theme classes
          portal.classList.remove(
            "dark",
            "blue-theme",
            "orange-theme",
            "green-theme"
          );

          // Add current theme classes
          const themeClasses = getThemeClasses();
          if (themeClasses.trim()) {
            themeClasses.trim().split(" ").forEach((cls) => {
              if (cls) portal.classList.add(cls);
            });
          }
        });
      }, 0);
    }
  }, [open, getThemeClasses]);

  // Initialize local state from props when dialog opens
  useEffect(() => {
    if (open) {
      const updatedColumns = DEFAULT_COLUMNS.map(col => ({
        ...col,
        visible: columnVisibility[col.id] !== undefined ? columnVisibility[col.id] : col.visible,
        width: columnWidths[col.id] || col.width,
      }));
      setLocalColumns(updatedColumns);
    }
  }, [open, columnWidths, columnVisibility]);

  const handleVisibilityChange = (columnId: string, visible: boolean) => {
    setLocalColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible } : col
      )
    );
  };

  const handleWidthChange = (columnId: string, value: string) => {
    // Handle the raw input value as string first
    const numValue = value.trim();

    // If empty, don't update yet (let user finish typing)
    if (numValue === '') {
      return;
    }

    // Parse the number and validate
    const parsedWidth = Number(numValue);

    // Only update if it's a valid number
    if (!isNaN(parsedWidth) && parsedWidth >= 0) {
      setLocalColumns(prev =>
        prev.map(col => {
          if (col.id === columnId) {
            // Ensure width is at least the minimum width
            const finalWidth = Math.max(col.minWidth, Math.min(1000, parsedWidth));
            return { ...col, width: finalWidth };
          }
          return col;
        })
      );
    }
  };

  const handleWidthBlur = (columnId: string, value: string) => {
    // On blur, ensure we have a valid width or reset to minimum
    const numValue = value.trim();
    const parsedWidth = Number(numValue);

    setLocalColumns(prev =>
      prev.map(col => {
        if (col.id === columnId) {
          // If invalid input, reset to minimum width
          const finalWidth = (isNaN(parsedWidth) || parsedWidth < col.minWidth)
            ? col.minWidth
            : Math.min(1000, parsedWidth);
          return { ...col, width: finalWidth };
        }
        return col;
      })
    );
  };

  const handleApplySettings = () => {
    const newVisibility: ColumnVisibility = {};
    const newWidths: ColumnWidths = {};

    localColumns.forEach(col => {
      newVisibility[col.id] = col.visible;
      newWidths[col.id] = col.width;
    });

    onColumnVisibilityChange(newVisibility);
    onColumnWidthsChange(newWidths);
    onOpenChange(false);

    const visibleCount = localColumns.filter(col => col.visible).length;
    toast.success("Column settings applied", {
      description: `${visibleCount} columns visible with custom widths`,
    });
  };

  const handleResetToDefaults = () => {
    setLocalColumns(DEFAULT_COLUMNS);
    onResetToDefaults();
    onOpenChange(false);

    toast.success("Column settings reset", {
      description: "All columns restored to default visibility and widths",
    });
  };

  const visibleColumnsCount = localColumns.filter(col => col.visible).length;
  const totalColumns = localColumns.length;
  const requiredColumnsCount = localColumns.filter(col => col.required).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-hidden bg-popover border-border ${getThemeClasses()}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Columns className="w-5 h-5 text-foreground" />
            Column Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Customize which columns to display and set their widths. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Summary Stats */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-theme-accent/10 text-theme-accent border-theme-accent/20">
                <Eye className="w-3 h-3 mr-1" />
                {visibleColumnsCount} Visible
              </Badge>
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                {totalColumns - visibleColumnsCount} Hidden
              </Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {requiredColumnsCount} Required
              </Badge>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Column List */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-[400px] pr-3">
              <div className="space-y-3">
                {localColumns.map((column, index) => (
                  <div key={column.id} className={`
                    p-4 rounded-lg border transition-all duration-200
                    ${column.visible
                      ? 'border-theme-accent/20 bg-theme-accent/5'
                      : 'border-border bg-muted/20'
                    }
                  `}>
                    <div className="flex items-start justify-between gap-4">
                      {/* Column Info & Visibility Toggle */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`column-${column.id}`}
                            checked={column.visible}
                            onCheckedChange={(checked) => handleVisibilityChange(column.id, checked as boolean)}
                            disabled={column.required}
                            className="data-[state=checked]:bg-theme-accent data-[state=checked]:border-theme-accent"
                          />
                          {column.visible ? (
                            <Eye className="w-4 h-4 text-theme-accent" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`column-${column.id}`}
                              className={`text-sm font-medium cursor-pointer ${
                                column.visible ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {column.label}
                            </Label>
                            {column.required && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-destructive text-destructive">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Column ID: {column.id} • Min width: {column.minWidth}px
                          </p>
                        </div>
                      </div>

                      {/* Width Input */}
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`width-${column.id}`}
                          className="text-xs text-muted-foreground whitespace-nowrap"
                        >
                          Width:
                        </Label>
                        <div className="relative">
                          <Input
                            id={`width-${column.id}`}
                            type="number"
                            value={column.width}
                            onChange={(e) => handleWidthChange(column.id, e.target.value)}
                            onBlur={(e) => handleWidthBlur(column.id, e.target.value)}
                            min={column.minWidth}
                            max={1000}
                            step={10}
                            className="w-20 text-xs bg-input border-border text-foreground"
                            disabled={!column.visible}
                            placeholder={column.minWidth.toString()}
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            px
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Width Preview Bar */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            column.visible
                              ? 'bg-theme-accent/30'
                              : 'bg-muted-foreground/20'
                          }`}
                          style={{
                            width: `${Math.min((column.width / 300) * 100, 100)}%`,
                            minWidth: '20px'
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {((column.width / 300) * 100).toFixed(0)}% of 300px
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Separator className="bg-border" />

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">Reset to Defaults</span>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplySettings}
              className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              Apply Settings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

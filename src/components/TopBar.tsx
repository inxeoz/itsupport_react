import {
  Plus,
  Settings,
  User,
  Sun,
  Moon,
  Table,
  BarChart3,
  Calendar,
  FileText,
  FolderOpen,
  FormInput,
  Layers,
  ChevronRight,
  MoreHorizontal,
  LogOut,
  UserIcon,
  Palette,
  Filter,
  Check,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "./ui/dropdown-menu";
import { useEffect } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableTab } from './DraggableTab';

export type Theme = {
  mode: 'light' | 'dark';
  accent: 'default' | 'blue' | 'orange';
};

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  tabs: Array<{ id: string; label: string; icon?: string }>;
  onAddTab: (tabId: string, label: string) => void;
  onRemoveTab: (tabId: string) => void;
  onMoveTab: (dragIndex: number, hoverIndex: number) => void;
}

export function TopBar({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  tabs,
  onAddTab,
  onRemoveTab,
  onMoveTab,
}: TopBarProps) {
  // Helper function to get theme classes for portals
  const getThemeClasses = () => {
    let classes = '';
    
    if (theme.mode === 'dark') {
      classes += ' dark';
    }
    
    if (theme.accent === 'blue') {
      classes += ' blue-theme';
    } else if (theme.accent === 'orange') {
      classes += ' orange-theme';
    }
    
    return classes.trim();
  };

  // Update portal container theme classes when theme changes
  useEffect(() => {
    const themeClasses = getThemeClasses();
    
    // Find all portal containers and apply theme classes
    setTimeout(() => {
      const portals = document.querySelectorAll('[data-radix-portal]');
      portals.forEach(portal => {
        // Remove existing theme classes
        portal.classList.remove('dark', 'blue-theme', 'orange-theme');
        
        // Add current theme classes
        if (themeClasses) {
          themeClasses.split(' ').forEach(cls => {
            if (cls) portal.classList.add(cls);
          });
        }
      });
    }, 0);
  }, [theme]);

  const boardViews = [
    { id: "table", label: "Table", icon: Table },
    { id: "gantt", label: "Gantt", icon: BarChart3 },
    { id: "chart", label: "Chart", icon: BarChart3 },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "kanban", label: "Kanban", icon: Layers },
    { id: "doc", label: "Doc", icon: FileText, badge: "New" },
    {
      id: "file-gallery",
      label: "File gallery",
      icon: FolderOpen,
    },
    { id: "form", label: "Form", icon: FormInput },
    {
      id: "customizable",
      label: "Customizable view",
      icon: MoreHorizontal,
    },
  ];

  const themeOptions = [
    { 
      id: 'light-default', 
      label: 'Light Theme', 
      icon: Sun, 
      mode: 'light' as const, 
      accent: 'default' as const,
      description: 'Clean white background with emerald accents'
    },
    { 
      id: 'dark-default', 
      label: 'Dark Theme', 
      icon: Moon, 
      mode: 'dark' as const, 
      accent: 'default' as const,
      description: 'Dark background with emerald accents'
    },
    { 
      id: 'light-blue', 
      label: 'Blue Theme', 
      icon: Palette, 
      mode: 'light' as const, 
      accent: 'blue' as const,
      description: 'Full blue background theme (light mode)'
    },
    { 
      id: 'dark-blue', 
      label: 'Dark Blue', 
      icon: Palette, 
      mode: 'dark' as const, 
      accent: 'blue' as const,
      description: 'Full blue background theme (dark mode)'
    },
    { 
      id: 'light-orange', 
      label: 'Orange Theme', 
      icon: Palette, 
      mode: 'light' as const, 
      accent: 'orange' as const,
      description: 'Full orange background theme (light mode)'
    },
    { 
      id: 'dark-orange', 
      label: 'Dark Orange', 
      icon: Palette, 
      mode: 'dark' as const, 
      accent: 'orange' as const,
      description: 'Full orange background theme (dark mode)'
    },
  ];

  const handleViewSelect = (viewId: string) => {
    // Map view IDs to existing tab IDs where applicable
    const viewToTabMap: { [key: string]: string } = {
      table: "main-table",
      kanban: "kanban",
      form: "form",
    };

    // Labels for mapped tabs (in case they need to be recreated)
    const mappedTabLabels: { [key: string]: string } = {
      "main-table": "Main table",
      kanban: "Kanban",
      form: "Form",
    };

    // Special handling for views that should create new tabs
    const viewLabels: { [key: string]: string } = {
      chart: "Charts",
      calendar: "Calendar",
      gantt: "Gantt",
      doc: "Documents",
      "file-gallery": "File Gallery",
      customizable: "Custom View",
    };

    if (viewToTabMap[viewId]) {
      // Check if the mapped tab exists, if not create it
      const mappedTabId = viewToTabMap[viewId];
      const existingTab = tabs.find(tab => tab.id === mappedTabId);
      
      if (!existingTab) {
        // Create the tab if it doesn't exist
        const tabLabel = mappedTabLabels[mappedTabId] || viewId;
        onAddTab(mappedTabId, tabLabel);
      }
      
      // Switch to the tab
      onTabChange(mappedTabId);
    } else if (viewLabels[viewId]) {
      // Create new tab for special views
      const existingTab = tabs.find(tab => tab.id === viewId);
      if (!existingTab) {
        onAddTab(viewId, viewLabels[viewId]);
      }
      onTabChange(viewId);
    } else {
      // Default behavior
      onTabChange(viewId);
    }
  };

  const handleThemeSelect = (themeOption: typeof themeOptions[0]) => {
    onThemeChange({
      mode: themeOption.mode,
      accent: themeOption.accent
    });
  };

  const getCurrentThemeIcon = () => {
    if (theme.accent === 'blue' || theme.accent === 'orange') {
      return <Palette className="w-4 h-4" />;
    } else if (theme.mode === 'dark') {
      return <Moon className="w-4 h-4" />;
    } else {
      return <Sun className="w-4 h-4" />;
    }
  };

  const isCurrentTheme = (themeOption: typeof themeOptions[0]) => {
    return theme.mode === themeOption.mode && theme.accent === themeOption.accent;
  };

  const getAccentColorClass = () => {
    switch (theme.accent) {
      case 'blue':
        return 'bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground';
      case 'orange':
        return 'bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground';
      default:
        return 'bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground';
    }
  };

  const getBadgeAccentClass = () => {
    return 'bg-theme-accent text-theme-accent-foreground border-none';
  };

  const canRemoveTab = tabs.length > 1;

  return (
    <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
      {/* Left side - Navigation tabs */}
      <div className="flex items-center gap-1">
        <DndProvider backend={HTML5Backend}>
          {tabs.map((tab, index) => (
            <DraggableTab
              key={tab.id}
              tab={tab}
              index={index}
              isActive={activeTab === tab.id}
              onTabChange={onTabChange}
              onRemoveTab={onRemoveTab}
              onMoveTab={onMoveTab}
              canRemoveTab={canRemoveTab}
              getThemeClasses={getThemeClasses}
            />
          ))}
        </DndProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground ml-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={`w-64 ${getThemeClasses()}`}
          >
            <DropdownMenuLabel className="text-muted-foreground">
              Board views
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {boardViews.map((view, index) => {
                const IconComponent = view.icon;
                return (
                  <DropdownMenuItem
                    key={view.id}
                    onClick={() => handleViewSelect(view.id)}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                  >
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{view.label}</span>
                    {view.badge && (
                      <Badge
                        variant="secondary"
                        className="bg-primary text-primary-foreground border-none text-xs px-2 py-0.5"
                      >
                        {view.badge}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
              <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded"></div>
              </div>
              <span className="flex-1">Apps</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="px-3 py-2 text-muted-foreground cursor-pointer">
              Explore more views
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side - Branding and controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium text-foreground">
            MYTICK
          </h1>
          <Badge
            variant="secondary"
            className={getBadgeAccentClass()}
          >
            In Portal
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Advanced Theme Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                title="Change Theme"
              >
                {getCurrentThemeIcon()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-64 ${getThemeClasses()}`}>
              <DropdownMenuLabel className="text-muted-foreground">
                Choose Theme
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {themeOptions.map((themeOption) => {
                  const IconComponent = themeOption.icon;
                  const isActive = isCurrentTheme(themeOption);
                  
                  return (
                    <DropdownMenuItem
                      key={themeOption.id}
                      onClick={() => handleThemeSelect(themeOption)}
                      className="flex items-center gap-3 px-3 py-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <IconComponent className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{themeOption.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {themeOption.description}
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <Check className="w-4 h-4 text-theme-accent" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`w-8 h-8 rounded-full flex items-center justify-center ${getAccentColorClass()}`}
              >
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-56 ${getThemeClasses()}`}>
              <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAccentColorClass()}`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    John Doe
                  </p>
                  <p className="text-xs text-muted-foreground">
                    john.doe@company.com
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                  <UserIcon className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                {/* Theme submenu in profile */}
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                  <Palette className="w-4 h-4" />
                  <span>Appearance</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
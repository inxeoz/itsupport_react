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
  Terminal,
  Code,
  Plug,
  TestTube,
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
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DraggableTab } from "./DraggableTab";
import { ApiConfigDialog, ApiConfig } from "./ApiConfigDialog";
import { toast } from "sonner";
import { useTheme, type Theme } from "./ThemeProvider";

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
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    baseUrl: 'http://localhost:8000',
    token: '698c17f4c776340:1ee1056e3b01ed9',
    endpoint: '/api/resource/Ticket',
    fields: ['name', 'title', 'user_name', 'description', 'creation', 'modified', 'docstatus', 'amended_from', 'ticket_id', 'department', 'contact_name', 'contact_email', 'contact_phone', 'category', 'priority', 'status', 'assigned_to', 'resolution', 'resolution_date', 'time_logged', 'billable_hours', 'tags', 'attachments', 'customer'],
    timeout: 10000,
    retries: 3,
  });

  const { getThemeClasses } = useTheme();

  // Update portal container theme classes when theme changes
  useEffect(() => {
    const themeClasses = getThemeClasses();

    // Find all portal containers and apply theme classes
    setTimeout(() => {
      const portals = document.querySelectorAll(
        "[data-radix-portal]",
      );
      portals.forEach((portal) => {
        // Remove existing theme classes (including green-theme)
        portal.classList.remove(
          "dark",
          "blue-theme",
          "orange-theme",
          "green-theme",
        );

        // Add current theme classes
        if (themeClasses) {
          themeClasses.split(" ").forEach((cls) => {
            if (cls) portal.classList.add(cls);
          });
        }
      });
    }, 0);
  }, [getThemeClasses]);

  // Load API config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('mytick-api-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setApiConfig(parsed);
      } catch (error) {
        console.error('Failed to parse saved API config:', error);
      }
    }
  }, []);

  const handleApiConfigChange = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    localStorage.setItem('mytick-api-config', JSON.stringify(newConfig));
    toast.success('API configuration saved successfully!', {
      description: 'Your Frappe ERPNext connection settings have been updated.',
    });
  };

  const handleTestConnection = async (config: ApiConfig): Promise<boolean> => {
    try {
      const url = `${config.baseUrl}${config.endpoint}?limit_page_length=1`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `token ${config.token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.timeout),
      });

      if (response.ok) {
        const data = await response.json();
        return data && (Array.isArray(data.data) || data.message);
      }
      return false;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  };

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

  const developerTools = [
    {
      id: "developer",
      label: "Developer Dashboard",
      icon: Terminal,
      badge: "Dev",
      description: "CSRF tokens, session info, and debug tools",
    },
    {
      id: "hacker-pro",
      label: "Hacker Pro",
      icon: Code,
      badge: "Pro",
      description: "Bulk ticket generation with demo data",
    },
    {
      id: "tester",
      label: "API Tester",
      icon: TestTube,
      badge: "Test",
      description: "Comprehensive API testing suite with live results",
    },
  ];

  const themeOptions = [
    {
      id: "light-default",
      label: "Light Theme",
      icon: Sun,
      mode: "light" as const,
      accent: "default" as const,
      description:
        "Clean white background with emerald accents",
    },
    {
      id: "dark-default",
      label: "Dark Theme",
      icon: Moon,
      mode: "dark" as const,
      accent: "default" as const,
      description: "Dark background with emerald accents",
    },
    {
      id: "light-blue",
      label: "Blue Theme",
      icon: Palette,
      mode: "light" as const,
      accent: "blue" as const,
      description: "Full blue background theme (light mode)",
    },
    {
      id: "dark-blue",
      label: "Dark Blue",
      icon: Palette,
      mode: "dark" as const,
      accent: "blue" as const,
      description: "Full blue background theme (dark mode)",
    },
    {
      id: "light-orange",
      label: "Orange Theme",
      icon: Palette,
      mode: "light" as const,
      accent: "orange" as const,
      description: "Full orange background theme (light mode)",
    },
    {
      id: "dark-orange",
      label: "Dark Orange",
      icon: Palette,
      mode: "dark" as const,
      accent: "orange" as const,
      description: "Full orange background theme (dark mode)",
    },

    {
      id: "light-green",
      label: "Green Theme",
      icon: Palette,
      mode: "light" as const,
      accent: "green" as const,
      description: "Full green background theme (light mode)",
    },

    {
      id: "dark-green",
      label: "Dark Green",
      icon: Palette,
      mode: "dark" as const,
      accent: "green" as const,
      description: "Full green background theme (dark mode)",
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
      developer: "Developer Dashboard",
      "hacker-pro": "Hacker Pro",
      "tester": "API Tester",
    };

    if (viewToTabMap[viewId]) {
      // Check if the mapped tab exists, if not create it
      const mappedTabId = viewToTabMap[viewId];
      const existingTab = tabs.find(
        (tab) => tab.id === mappedTabId,
      );

      if (!existingTab) {
        // Create the tab if it doesn't exist
        const tabLabel = mappedTabLabels[mappedTabId] || viewId;
        onAddTab(mappedTabId, tabLabel);
      }

      // Switch to the tab
      onTabChange(mappedTabId);
    } else if (viewLabels[viewId]) {
      // Create new tab for special views
      const existingTab = tabs.find((tab) => tab.id === viewId);
      if (!existingTab) {
        onAddTab(viewId, viewLabels[viewId]);
      }
      onTabChange(viewId);
    } else {
      // Default behavior
      onTabChange(viewId);
    }
  };

  const handleThemeSelect = (
    themeOption: (typeof themeOptions)[0],
  ) => {
    onThemeChange({
      mode: themeOption.mode,
      accent: themeOption.accent,
    });
  };

  const getCurrentThemeIcon = () => {
    if (theme.accent === "blue" || theme.accent === "orange" || theme.accent === "green") {
      return <Palette className="w-4 h-4 text-foreground" />;
    } else if (theme.mode === "dark") {
      return <Moon className="w-4 h-4 text-foreground" />;
    } else {
      return <Sun className="w-4 h-4 text-foreground" />;
    }
  };

  const isCurrentTheme = (
    themeOption: (typeof themeOptions)[0],
  ) => {
    return (
      theme.mode === themeOption.mode &&
      theme.accent === themeOption.accent
    );
  };

  const getAccentColorClass = () => {
    return "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground";
  };

  const getBadgeAccentClass = () => {
    return "bg-theme-accent text-theme-accent-foreground border-none";
  };

  const canRemoveTab = tabs.length > 1;

  return (
    <>
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        {/* Left side - Navigation tabs */}
        <div className="flex items-center gap-1 overflow-hidden">
          <DndProvider backend={HTML5Backend}>
            <div className="flex items-center gap-1 min-w-0">
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
            </div>
          </DndProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-1 text-muted-foreground" />
                <span className="text-foreground">Add View</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={`w-64 bg-popover border-border ${getThemeClasses()}`}
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
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 text-foreground">{view.label}</span>
                      {view.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-theme-accent text-theme-accent-foreground border-none text-xs px-2 py-0.5"
                        >
                          {view.badge}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuLabel className="text-muted-foreground">
                Developer Tools
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {developerTools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <DropdownMenuItem
                      key={tool.id}
                      onClick={() => handleViewSelect(tool.id)}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <IconComponent className="w-4 h-4 text-theme-accent" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {tool.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {tool.description}
                        </div>
                      </div>
                      {tool.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-theme-accent/20 text-theme-accent border-none text-xs px-2 py-0.5"
                        >
                          {tool.badge}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground">
                <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded"></div>
                </div>
                <span className="flex-1 text-foreground">Apps</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem className="px-3 py-2 text-muted-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground">
                Explore more views
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side - Branding and controls */}
        <div className="flex items-center gap-4 flex-shrink-0">
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
            {/* Config API Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsApiConfigOpen(true)}
              title="Configure API Settings"
            >
              <Plug className="w-4 h-4 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
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
              <DropdownMenuContent
                align="end"
                className={`w-64 bg-popover border-border ${getThemeClasses()}`}
              >
                <DropdownMenuLabel className="text-muted-foreground">
                  Choose Theme
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuGroup>
                  {themeOptions.map((themeOption) => {
                    const IconComponent = themeOption.icon;
                    const isActive = isCurrentTheme(themeOption);

                    return (
                      <DropdownMenuItem
                        key={themeOption.id}
                        onClick={() =>
                          handleThemeSelect(themeOption)
                        }
                        className="flex items-center gap-3 px-3 py-3 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <IconComponent className="w-4 h-4 text-foreground" />
                          <div className="flex-1">
                            <div className="font-medium text-foreground">
                              {themeOption.label}
                            </div>
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
              <DropdownMenuContent
                align="end"
                className={`w-56 bg-popover border-border ${getThemeClasses()}`}
              >
                <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${getAccentColorClass()}`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      John Doe
                    </p>
                    <p className="text-xs text-muted-foreground">
                      john.doe@company.com
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setIsApiConfigOpen(true)}
                  >
                    <Plug className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">API Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">Settings</span>
                  </DropdownMenuItem>

                  {/* Theme submenu in profile */}
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">Appearance</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-destructive hover:bg-destructive hover:text-destructive-foreground focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* API Configuration Dialog */}
      <ApiConfigDialog
        open={isApiConfigOpen}
        onOpenChange={setIsApiConfigOpen}
        config={apiConfig}
        onConfigChange={handleApiConfigChange}
        onTestConnection={handleTestConnection}
      />
    </>
  );
}
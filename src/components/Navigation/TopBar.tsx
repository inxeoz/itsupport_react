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
  HelpCircle,
  Monitor,
} from "lucide-react";
import { Button } from "../ui/button.tsx";
import { Badge } from "../ui/badge.tsx";
import { Switch } from "../ui/switch.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../ui/dropdown-menu.tsx";
import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DraggableTab } from "./DraggableTab.tsx";
import { ApiConfigDialog, ApiConfig } from "../ApiDialog/ApiConfigDialog.tsx";
import { toast } from "sonner";
import { useTheme, type Theme } from "../ThemeProvider.tsx";

import { useTicketDashboardStore } from "@/common/GlobalStore.ts";


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
  const [showTooltips, setShowTooltips] = useState(() => {
    // Load tooltip preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mytick-show-tooltips');
      return saved !== null ? JSON.parse(saved) : false; // Default to false (disabled)
    }
    return false; // Default to false (disabled)
  });

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    baseUrl: 'http://localhost:8000',
    token: '698c17f4c776340:1ee1056e3b01ed9',
    endpoint: '/api/resource/Ticket',
    fields: ['name', 'title', 'user_name', 'description', 'creation', 'modified', 'docstatus', 'amended_from', 'ticket_id', 'department', 'contact_name', 'contact_email', 'contact_phone', 'category', 'priority', 'status', 'assigned_to', 'resolution', 'resolution_date', 'time_logged', 'billable_hours', 'tags', 'attachments', 'customer'],
    timeout: 10000,
    retries: 3,
  });

  const { getThemeClasses, getActualMode } = useTheme();

  // Save tooltip preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mytick-show-tooltips', JSON.stringify(showTooltips));
    }
  }, [showTooltips]);

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
        credentials: 'omit',
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
      id: "system-blue",
      label: "System Theme",
      icon: Monitor,
      mode: "system" as const,
      accent: "blue" as const,
      description: "Follows your system's dark/light preference",
    },
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
    // System theme
    if (theme.mode === "system") {
      return <Monitor className="w-4 h-4 text-foreground mytick-theme" />;
    }

    // Color accent themes (blue, orange, green)
    if (theme.accent !== "default") {
      return <Palette className="w-4 h-4 text-foreground mytick-theme" />;
    }

    // Default themes (light/dark with emerald)
    if (theme.mode === "dark") {
      return <Moon className="w-4 h-4 text-foreground mytick-theme" />;
    } else {
      return <Sun className="w-4 h-4 text-foreground mytick-theme" />;
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
    return "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground mytick-theme";
  };

  const getBadgeAccentClass = () => {
    return "bg-theme-accent text-theme-accent-foreground border-none mytick-theme";
  };

  const canRemoveTab = tabs.length > 1;

  const handleTooltipToggle = (checked: boolean) => {
    setShowTooltips(checked);
    toast.success(
      checked ? "Tooltips enabled" : "Tooltips disabled",
      {
        description: checked
          ? "Helpful hints will now show on hover"
          : "Tooltips have been disabled for a cleaner interface",
      }
    );
  };

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

    const { isEditable, toggleEditable } = useTicketDashboardStore();

  return (
    <TooltipProvider>
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between mytick-theme">
        {/* Left side - Navigation tabs */}
        <div className="flex items-center gap-1 overflow-hidden mytick-theme">
          <DndProvider backend={HTML5Backend}>
            <div className="flex items-center gap-1 min-w-0 mytick-theme">
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
                  showTooltips={showTooltips}
                />
              ))}
            </div>
          </DndProvider>

          <ConditionalTooltip
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
                        onClick={() => handleViewSelect(view.id)}
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
                        onClick={() => handleViewSelect(tool.id)}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme"
                      >
                        <IconComponent className="w-4 h-4 text-theme-accent mytick-theme" />
                        <div className="flex-1 mytick-theme">
                          <div className="font-medium text-foreground mytick-theme">
                            {tool.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 mytick-theme">
                            {tool.description}
                          </div>
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
        </div>

        {/* Right side - Branding and controls */}
        <div className="flex items-center gap-4 flex-shrink-0 mytick-theme">
          <div className="flex items-center gap-4 mytick-theme">

            <h1 className="text-xl font-medium text-foreground mytick-theme">
              MYTICK
            </h1>

              {/* optional quick toggle for demo */}
              <Button variant="outline" size="sm" onClick={toggleEditable}>
                  {isEditable ? "Lock layout" : "Unlock layout"}
              </Button>


              <Badge
              variant="secondary"
              className={getBadgeAccentClass()}
            >
              In Portal
            </Badge>
          </div>

          <div className="flex items-center gap-3 mytick-theme">
            {/* Config API Button */}
            <ConditionalTooltip
              content={
                <div className="mytick-theme">
                  <p className="font-medium mytick-theme">API Configuration</p>
                  <p className="text-sm mt-1 mytick-theme">Configure your Frappe/ERPNext connection settings</p>
                  <p className="text-xs mt-1 text-muted-foreground mytick-theme">Set server URL, API token, and endpoints</p>
                </div>
              }
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground mytick-theme"
                onClick={() => setIsApiConfigOpen(true)}
              >
                <Plug className="w-4 h-4 text-muted-foreground mytick-theme" />
              </Button>
            </ConditionalTooltip>

            <ConditionalTooltip
              content={
                <div className="mytick-theme">
                  <p className="font-medium mytick-theme">General Settings</p>
                  <p className="text-sm mt-1 mytick-theme">Application preferences and configuration</p>
                </div>
              }
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground mytick-theme"
              >
                <Settings className="w-4 h-4 text-muted-foreground mytick-theme" />
              </Button>
            </ConditionalTooltip>

            {/* Advanced Theme Dropdown Menu */}
            <ConditionalTooltip
              content={
                <div className="mytick-theme">
                  <p className="font-medium mytick-theme">Theme Settings</p>
                  <p className="text-sm mt-1 mytick-theme">Switch between light/dark modes and color themes</p>
                  <p className="text-xs mt-1 text-muted-foreground mytick-theme">
                    {theme.mode === 'system' && `Currently: ${getActualMode() === 'dark' ? 'Dark' : 'Light'} (System)`}
                    {theme.mode !== 'system' && `Current: ${theme.mode} mode with ${theme.accent} accent`}
                  </p>
                </div>
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground mytick-theme"
                  >
                    {getCurrentThemeIcon()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={`w-64 bg-popover border-border mytick-theme ${getThemeClasses()}`}
                >
                  <DropdownMenuLabel className="text-muted-foreground mytick-theme">
                    Choose Theme
                  </DropdownMenuLabel>
                  {theme.mode === "system" && (
                    <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 rounded-md mx-2 mb-2 mytick-theme">
                      Currently using: {getActualMode() === "dark" ? "Dark" : "Light"} (System)
                    </div>
                  )}
                  <DropdownMenuSeparator className="bg-border mytick-theme" />
                  <DropdownMenuGroup className="mytick-theme">
                    {themeOptions.map((themeOption) => {
                      const IconComponent = themeOption.icon;
                      const isActive = isCurrentTheme(themeOption);

                      return (
                        <DropdownMenuItem
                          key={themeOption.id}
                          onClick={() =>
                            handleThemeSelect(themeOption)
                          }
                          className="flex items-center gap-3 px-3 py-3 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme"
                        >
                          <div className="flex items-center gap-3 flex-1 mytick-theme">
                            <IconComponent className="w-4 h-4 text-foreground mytick-theme" />
                            <div className="flex-1 mytick-theme">
                              <div className="font-medium text-foreground mytick-theme">
                                {themeOption.label}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 mytick-theme">
                                {themeOption.description}
                              </div>
                            </div>
                          </div>
                          {isActive && (
                            <Check className="w-4 h-4 text-theme-accent mytick-theme" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </ConditionalTooltip>

            {/* Profile Menu */}
            <ConditionalTooltip
              content={
                <div className="mytick-theme">
                  <p className="font-medium mytick-theme">User Profile</p>
                  <p className="text-sm mt-1 mytick-theme">Access profile settings, API config, and logout</p>
                </div>
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-8 h-8 rounded-full flex items-center justify-center mytick-theme ${getAccentColorClass()}`}
                  >
                    <User className="w-4 h-4 mytick-theme" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={`w-64 bg-popover border-border mytick-theme ${getThemeClasses()}`}
                >
                  <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2 mytick-theme">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mytick-theme ${getAccentColorClass()}`}
                    >
                      <User className="w-4 h-4 mytick-theme" />
                    </div>
                    <div className="mytick-theme">
                      <p className="text-sm font-medium text-foreground mytick-theme">
                        John Doe
                      </p>
                      <p className="text-xs text-muted-foreground mytick-theme">
                        john.doe@company.com
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-border mytick-theme" />

                  <DropdownMenuGroup className="mytick-theme">
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                      <UserIcon className="w-4 h-4 text-muted-foreground mytick-theme" />
                      <span className="text-foreground mytick-theme">Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme"
                      onClick={() => setIsApiConfigOpen(true)}
                    >
                      <Plug className="w-4 h-4 text-muted-foreground mytick-theme" />
                      <span className="text-foreground mytick-theme">API Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                      <Settings className="w-4 h-4 text-muted-foreground mytick-theme" />
                      <span className="text-foreground mytick-theme">Settings</span>
                    </DropdownMenuItem>

                    {/* Theme submenu in profile */}
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
                      <Palette className="w-4 h-4 text-muted-foreground mytick-theme" />
                      <span className="text-foreground mytick-theme">Appearance</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-border mytick-theme" />

                  {/* Tooltips toggle */}
                  <div className="flex items-center justify-between px-3 py-2 mytick-theme">
                    <div className="flex items-center gap-3 mytick-theme">
                      <HelpCircle className="w-4 h-4 text-muted-foreground mytick-theme" />
                      <span className="text-foreground text-sm mytick-theme">Show Hints</span>
                    </div>
                    <Switch
                      checked={showTooltips}
                      onCheckedChange={handleTooltipToggle}
                      className="mytick-theme"
                    />
                  </div>

                  <DropdownMenuSeparator className="bg-border mytick-theme" />

                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-destructive hover:bg-destructive hover:text-destructive-foreground focus:text-destructive mytick-theme">
                    <LogOut className="w-4 h-4 mytick-theme" />
                    <span className="mytick-theme">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ConditionalTooltip>
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
    </TooltipProvider>
  );
}

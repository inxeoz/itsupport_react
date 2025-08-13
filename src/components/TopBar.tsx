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

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function TopBar({
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleTheme,
}: TopBarProps) {
  const tabs = [
    { id: "main-table", label: "Main table", icon: "⋯" },
    { id: "form", label: "Form", icon: null },
    { id: "kanban", label: "Kanban", icon: null },
    { id: "add-ticket", label: "Add Ticket", icon: null },
  ];

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

  const handleViewSelect = (viewId: string) => {
    // Map view IDs to existing tab IDs where applicable
    const viewToTabMap: { [key: string]: string } = {
      table: "main-table",
      kanban: "kanban",
      form: "form",
    };

    const tabId = viewToTabMap[viewId] || viewId;
    onTabChange(tabId);
  };

  return (
    <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
      {/* Left side - Navigation tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <div key={tab.id} className="flex items-center">
            {activeTab === tab.id ? (
              /* Active tab with dropdown menu */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm bg-accent text-accent-foreground hover:bg-accent/80`}
                  >
                    {tab.label}
                    <MoreHorizontal className="w-4 h-4 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-48"
                >
                  <DropdownMenuLabel className="text-muted-foreground">
                    {tab.label} Options
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {tab.id === "main-table" && (
                      <>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <Settings className="w-4 h-4" />
                          <span>Table Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <Filter className="w-4 h-4" />
                          <span>Configure Filters</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <FormInput className="w-4 h-4" />
                          <span>Customize Columns</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {tab.id === "kanban" && (
                      <>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <Layers className="w-4 h-4" />
                          <span>Board Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <Plus className="w-4 h-4" />
                          <span>Add Column</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <Palette className="w-4 h-4" />
                          <span>Customize Colors</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {tab.id === "form" && (
                      <>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <FormInput className="w-4 h-4" />
                          <span>Form Builder</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <Settings className="w-4 h-4" />
                          <span>Form Settings</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {tab.id === "add-ticket" && (
                      <>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <Settings className="w-4 h-4" />
                          <span>Form Preferences</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                          <FileText className="w-4 h-4" />
                          <span>Template Settings</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Inactive tab - regular button */
              <button
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent`}
              >
                {tab.label}
              </button>
            )}
          </div>
        ))}

        <DropdownMenu className="bg-accent text-accent-foreground hover:bg-accent/80 ">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/80 text-muted-foreground hover:text-foreground ml-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 bg-accent text-accent-foreground bg-accent text-accent-foreground"
          >
            <DropdownMenuLabel className="text-muted-foreground bg-accent text-accent-foreground">
              Board views
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {boardViews.map((view, index) => {
                const IconComponent = view.icon;
                return (
                  <DropdownMenuItem
                    key={view.id}
                    onClick={() => handleViewSelect(view.id)}
                    className="accent-foreground text-accent-foreground flex items-center gap-3 px-3 py-2 cursor-pointer"
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
            className="bg-emerald-600 text-white border-none dark:bg-emerald-700"
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

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <User className="w-4 h-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center dark:bg-emerald-700">
                  <User className="w-4 h-4 text-white" />
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

                <DropdownMenuItem
                  onClick={onToggleTheme}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-4 h-4" />
                      <span>Switch to Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      <span>Switch to Dark Mode</span>
                    </>
                  )}
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
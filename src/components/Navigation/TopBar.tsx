// src/components/Navigation/TopBar.tsx
import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {toast} from "sonner";
import {type Theme, useTheme} from "@/components/ThemeProvider.tsx";
import {ApiConfig, ApiConfigDialog,} from "@/components/ApiDialog/ApiConfigDialog.tsx";
import {LoginDialog} from "@/components/Login/LoginDialog.tsx";
import {TabsNav} from "@/components/Navigation/TabsNav.tsx";
import {AddViewMenu, type ViewItem,} from "@/components/Navigation/AddViewMenu.tsx";
import {ThemeMenu} from "@/components/Navigation/ThemeMenu.tsx";
import {ProfileMenu} from "@/components/Navigation/ProfileMenu.tsx";
import {
    BarChart3,
    Calendar,
    Code,
    FileText,
    FolderOpen,
    FormInput,
    Layers,
    MoreHorizontal,
    Plug,
    Table,
    Terminal,
    TestTube,
} from "lucide-react";
import {Dashboard, useCurrentDashboard, useDashboardStore, useOpenLoginDialog,} from "@/common/GlobalStore.ts";

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
    const [showTooltips, setShowTooltips] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("mytick-show-tooltips");
            return saved !== null ? JSON.parse(saved) : false;
        }
        return false;
    });

    const [apiConfig, setApiConfig] = useState<ApiConfig>({
        baseUrl: "http://localhost:8000",
        token: "698c17f4c776340:1ee1056e3b01ed9",
        endpoint: "/api/resource/Ticket",
        fields: [
            "name",
            "title",
            "user_name",
            "description",
            "creation",
            "modified",
            "docstatus",
            "amended_from",
            "ticket_id",
            "department",
            "contact_name",
            "contact_email",
            "contact_phone",
            "category",
            "priority",
            "status",
            "assigned_to",
            "resolution",
            "resolution_date",
            "time_logged",
            "billable_hours",
            "tags",
            "attachments",
            "customer",
        ],
        timeout: 10000,
        retries: 3,
    });

    const {getThemeClasses, getActualMode} = useTheme();
    const {isEditable, toggleEditable} = useDashboardStore();
    const {setDashboard} = useCurrentDashboard();
    const {isOpenLoginDialog, setOpenLoginDialog} = useOpenLoginDialog();


    // Persist tooltip preference
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(
                "mytick-show-tooltips",
                JSON.stringify(showTooltips),
            );
        }
    }, [showTooltips]);

    // Keep Radix portals themed
    useEffect(() => {
        const themeClasses = getThemeClasses();
        setTimeout(() => {
            const portals = document.querySelectorAll("[data-radix-portal]");
            portals.forEach((portal) => {
                portal.classList.remove("dark", "blue-theme", "orange-theme", "green-theme");
                if (themeClasses) {
                    themeClasses
                        .split(" ")
                        .forEach((cls) => cls && portal.classList.add(cls));
                }
            });
        }, 0);
    }, [getThemeClasses]);

    // Load API config
    useEffect(() => {
        const savedConfig = localStorage.getItem("mytick-api-config");
        if (savedConfig) {
            try {
                setApiConfig(JSON.parse(savedConfig));
            } catch {
                // ignore
            }
        }
    }, []);

    const handleApiConfigChange = (newConfig: ApiConfig) => {
        setApiConfig(newConfig);
        localStorage.setItem("mytick-api-config", JSON.stringify(newConfig));
        toast.success("API configuration saved successfully!", {
            description: "Your Frappe ERPNext connection settings have been updated.",
        });
    };

    const handleTestConnection = async (config: ApiConfig): Promise<boolean> => {
        try {
            const url = `${config.baseUrl}${config.endpoint}?limit_page_length=1`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `token ${config.token}`,
                    "Content-Type": "application/json",
                },
                credentials: "omit",
                signal: AbortSignal.timeout(config.timeout),
            });
            if (response.ok) {
                const data = await response.json();
                return data && (Array.isArray(data.data) || data.message);
            }
            return false;
        } catch {
            return false;
        }
    };

    const boardViews: ViewItem[] = [
        {id: "table", label: "Table", icon: Table},
        {id: "gantt", label: "Gantt", icon: BarChart3},
        {id: "chart", label: "Chart", icon: BarChart3},
        {id: "calendar", label: "Calendar", icon: Calendar},
        {id: "kanban", label: "Kanban", icon: Layers},
        {id: "doc", label: "Doc", icon: FileText, badge: "New"},
        {id: "file-gallery", label: "File gallery", icon: FolderOpen},
        {id: "form", label: "Form", icon: FormInput},
        {id: "customizable", label: "Customizable view", icon: MoreHorizontal},
    ];

    const developerTools: ViewItem[] = [
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

    const handleViewSelect = (viewId: string) => {
        const viewToTabMap: Record<string, string> = {
            table: "main-table",
            kanban: "kanban",
            form: "form",
        };

        const mappedTabLabels: Record<string, string> = {
            "main-table": "Main table",
            kanban: "Kanban",
            form: "Form",
        };

        const viewLabels: Record<string, string> = {
            chart: "Charts",
            calendar: "Calendar",
            gantt: "Gantt",
            doc: "Documents",
            "file-gallery": "File Gallery",
            customizable: "Custom View",
            developer: "Developer Dashboard",
            "hacker-pro": "Hacker Pro",
            tester: "API Tester",
        };

        const viewToDashboard: Partial<Record<string, Dashboard>> = {
            table: Dashboard.TicketDashboard,
            gantt: Dashboard.GanttDashboard,
            chart: Dashboard.ChartDashboard,
            calendar: Dashboard.CalendarDashboard,
            kanban: Dashboard.KanbanDashboard,
            form: Dashboard.FormDashboard,
            "file-gallery": Dashboard.FileGalleryDashboard,
            developer: Dashboard.DeveloperDashboard,
            "hacker-pro": Dashboard.DeveloperDashboard,
            tester: Dashboard.DeveloperDashboard,
        };

        const maybeSetDashboard = (id: string) => {
            const d = viewToDashboard[id];
            if (typeof d !== "undefined") setDashboard(d);
        };

        if (viewToTabMap[viewId]) {
            const mappedTabId = viewToTabMap[viewId];
            const existing = tabs.find((t) => t.id === mappedTabId);
            if (!existing)
                onAddTab(mappedTabId, mappedTabLabels[mappedTabId] || viewId);
            onTabChange(mappedTabId);
            maybeSetDashboard(viewId);
            return;
        }

        if (viewLabels[viewId]) {
            const existing = tabs.find((t) => t.id === viewId);
            if (!existing) onAddTab(viewId, viewLabels[viewId]);
            onTabChange(viewId);
            maybeSetDashboard(viewId);
            return;
        }

        onTabChange(viewId);
        maybeSetDashboard(viewId);
    };

    const getAccentColorClass = () =>
        "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground mytick-theme";
    const getBadgeAccentClass = () =>
        "bg-theme-accent text-theme-accent-foreground border-none mytick-theme";

    const canRemoveTab = tabs.length > 1;

    const handleTooltipToggle = (checked: boolean) => {
        setShowTooltips(checked);
        toast.success(checked ? "Tooltips enabled" : "Tooltips disabled", {
            description: checked
                ? "Helpful hints will now show on hover"
                : "Tooltips have been disabled for a cleaner interface",
        });
    };

    return (
        <TooltipProvider>
            <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between mytick-theme">
                {/* Left: Tabs + Add View */}
                <div className="flex items-center gap-1 overflow-hidden mytick-theme">
                    <TabsNav
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={onTabChange}
                        onRemoveTab={onRemoveTab}
                        onMoveTab={onMoveTab}
                        canRemoveTab={canRemoveTab}
                        getThemeClasses={getThemeClasses}
                        showTooltips={showTooltips}
                    />

                    <AddViewMenu
                        boardViews={boardViews}
                        developerTools={developerTools}
                        onSelect={handleViewSelect}
                        getThemeClasses={getThemeClasses}
                        showTooltips={showTooltips}
                    />
                </div>

                {/* Right: Branding + Controls */}
                <div className="flex items-center gap-4 flex-shrink-0 mytick-theme">
                    <div className="flex items-center gap-4 mytick-theme">
                        <h1 className="text-xl font-medium text-foreground mytick-theme">
                            MYTICK
                        </h1>
                        <Button variant="outline" size="sm" onClick={toggleEditable}>
                            {isEditable ? "Lock layout" : "Unlock layout"}
                        </Button>
                        <Badge variant="secondary" className={getBadgeAccentClass()}>
                            In Portal
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3 mytick-theme">
                        {/* API Config Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground mytick-theme"
                            onClick={() => setIsApiConfigOpen(true)}
                            title="API Configuration"
                        >
                            <Plug className="w-4 h-4 text-muted-foreground mytick-theme"/>
                        </Button>

                        {/* Theme Menu */}
                        <ThemeMenu
                            theme={theme}
                            onThemeChange={onThemeChange}
                            getThemeClasses={getThemeClasses}
                            getActualMode={getActualMode}
                            showTooltips={showTooltips}
                        />

                        {/* Profile Menu */}
                        <ProfileMenu
                            getThemeClasses={getThemeClasses}
                            getAccentColorClass={getAccentColorClass}
                            showTooltips={showTooltips}
                            onToggleTooltips={handleTooltipToggle}
                            onOpenApiConfig={() => setIsApiConfigOpen(true)}
                            onLoginDialogOpen={() => setOpenLoginDialog(true)}
                        />
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


            {isOpenLoginDialog && (
                <LoginDialog
                open={isOpenLoginDialog}
                onOpenChange={setOpenLoginDialog}

                />
            )}

        </TooltipProvider>
    );
}

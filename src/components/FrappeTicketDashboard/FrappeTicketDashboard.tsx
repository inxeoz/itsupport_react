// src/components/FrappeTicketDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2, RefreshCw, Wifi, WifiOff, FileText, Settings, ArrowUpDown,
    ChevronUp, ChevronDown, Filter,
} from "lucide-react";
import { toast } from "sonner";

import {
    frappeApi,
    mockTickets,
    type FrappeTicket,
    DEFAULT_API_CONFIG,
    type ApiConfig,
} from "../../services/frappeApi";

import { ApiConfigDialog } from "@/components/ApiDialog/ApiConfigDialog.tsx";
import { NewTicketDialog } from "@/components/FrappeTicketDashboard/NewTicketDialog.tsx";
import { TicketDetailsPopover } from "@/components/FrappeTicketDashboard/TicketDetailsPopover.tsx";
import { ColumnSettingsDialog } from "@/components/FrappeTicketDashboard/columns_settings/ColumnSettingsDialog.tsx";

// existing hooks in your repo
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { usePagination } from "@/components/hooks/usePagination";
import { useSorting } from "@/components/hooks/useSorting";
import { useResizeColumns } from "@/components/hooks/useResizeColumns";

// your existing utils
import { exportCSV } from "@/components/utils/exportData";
import { useFilters } from "@/components/utils/useFilters";
import type { SortField } from "@/components/types/tickets";

// new presentational components (add them in step 2)
import { OverviewCards } from "./OverviewCards";
import { FiltersBar } from "./FiltersBar";
import { TicketTable } from "./TicketTable";
import { PaginationBar } from "./PaginationBar";

const DEFAULT_WIDTHS = {
    select: 50, ticket_id: 120, title: 200, user_name: 150, department: 130,
    priority: 100, status: 120, category: 110, created_datetime: 160,
    due_datetime: 160, assignee: 130, actions: 100,
};

const DEFAULT_VISIBILITY = {
    select: true, ticket_id: true, title: true, user_name: true, department: true,
    priority: true, status: true, category: true, created_datetime: true,
    due_datetime: true, assignee: true, actions: true,
};

export function FrappeTicketDashboard() {
    // connection & config
    const [tickets, setTickets] = useState<FrappeTicket[]>([]);
    const [totalTicketCount, setTotalTicketCount] = useState<number | null>(null);
    const [countLoading, setCountLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<
        "connected" | "disconnected" | "testing"
    >("testing");
    const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_API_CONFIG);

    // dialogs
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);
    const [columnSettingsDialogOpen, setColumnSettingsDialogOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<FrappeTicket | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // columns (persisted)
    const [columnWidths, setColumnWidths] = useLocalStorage(
        "frappe-dashboard-column-widths",
        DEFAULT_WIDTHS,
    );
    const [columnVisibility, setColumnVisibility] = useLocalStorage(
        "frappe-dashboard-column-visibility",
        DEFAULT_VISIBILITY,
    );
    const { widths, start: startResize } = useResizeColumns(columnWidths, setColumnWidths);
    const visibleColumns = Object.entries(columnVisibility)
        .filter(([, v]) => v)
        .map(([k]) => k);

    // filters & search (your util already returns applied/pending state)
    const {
        pending, setPending, applied, apply, clear,
        search, setSearch, appliedSearch, filtered, uniqueValues,
        activeFilterCount, hasUnapplied,
    } = useFilters(tickets);

    // sorting
    const { criteria, toggleSort, clear: clearSorting, sorted } = useSorting(filtered);

    // selection
    const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

    // pagination
    const { page, setPage, pages, canPrev, canNext, range, pageSize } =
        usePagination(totalTicketCount, 20, Math.ceil(mockTickets.length));

    // fetchers
    const fetchTotalCount = async () => {
        if (connectionStatus === "disconnected") return;
        setCountLoading(true);
        try {
            const count = await frappeApi.getTotalTicketCount();
            setTotalTicketCount(count);
        } catch {
            setTotalTicketCount(null);
        } finally {
            setCountLoading(false);
        }
    };

    const fetchTickets = async (showLoading = true, targetPage = page) => {
        if (showLoading) setLoading(true);
        setError(null);
        setConnectionStatus("testing");

        try {
            const offset = (targetPage - 1) * pageSize;
            const data = await frappeApi.getTickets(pageSize, offset);
            setTickets(data);
            setConnectionStatus("connected");
            fetchTotalCount();
        } catch (err: any) {
            setError(err?.message || "Failed to connect to Frappe API");
            setConnectionStatus("disconnected");
            setTotalTicketCount(null);

            // fallback to mock page slice
            await new Promise((r) => setTimeout(r, 300));
            const start = (targetPage - 1) * pageSize;
            setTickets(mockTickets.slice(start, start + pageSize));
        } finally {
            setLoading(false);
        }
    };

    // lifecycle
    useEffect(() => {
        const saved = localStorage.getItem("frappe-api-config");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setApiConfig(parsed);
                frappeApi.updateConfig(parsed);
            } catch {}
        }
        fetchTickets(true, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // stats
    const overview = useMemo(() => {
        const todayStart = new Date(new Date().toDateString()).getTime();
        const open = tickets.filter(
            (t) => t.status && ["New", "In Progress", "Waiting for Info"].includes(t.status),
        ).length;
        const critical = tickets.filter((t) => t.priority === "Critical").length;
        const resolvedToday = tickets.filter(
            (t) => t.resolution_datetime && +new Date(t.resolution_datetime) >= todayStart,
        ).length;

        return {
            total:
                totalTicketCount ?? (connectionStatus === "disconnected" ? mockTickets.length : 0),
            open,
            critical,
            resolvedToday,
        };
    }, [tickets, totalTicketCount, connectionStatus]);

    // config/test handlers
    const handleConfigChange = (cfg: ApiConfig) => {
        setApiConfig(cfg);
        frappeApi.updateConfig(cfg);
        localStorage.setItem("frappe-api-config", JSON.stringify(cfg));
        setPage(1);
        setTotalTicketCount(null);
        fetchTickets(true, 1);
    };
    const handleTestConnection = async (cfg: ApiConfig) => {
        try {
            return await frappeApi.testConnection(cfg);
        } catch (error: any) {
            return {
                success: false,
                message: error?.message || "Connection test failed",
                details: error,
                suggestions: [
                    "Check your network connection",
                    "Verify the base URL is correct",
                    "Ensure your API token is valid",
                    "Check if the Frappe server is running",
                ],
            };
        }
    };

    // ticket actions
    const onView = (t: FrappeTicket) => { setSelectedTicket(t); setDetailsOpen(true); };
    const onSubmit = async (id: string) => {
        setActionLoading(id);
        try {
            if (connectionStatus === "connected") {
                await frappeApi.submitTicket(id);
                await fetchTickets(false);
                toast.success("Ticket submitted");
            } else {
                setTickets((prev) =>
                    prev.map((t) => (t.name === id ? { ...t, docstatus: 1, modified: new Date().toISOString() } : t)),
                );
                toast.success("Ticket submitted (Demo)");
            }
        } catch (e: any) {
            toast.error("Failed to submit", { description: e?.message || "Please try again." });
            setTickets((prev) =>
                prev.map((t) => (t.name === id ? { ...t, docstatus: 1, modified: new Date().toISOString() } : t)),
            );
        } finally {
            setActionLoading(null);
        }
    };
    const onCancel = async (id: string) => {
        setActionLoading(id);
        try {
            if (connectionStatus === "connected") {
                await frappeApi.cancelTicket(id);
                await fetchTickets(false);
                toast.success("Ticket cancelled");
            } else {
                setTickets((prev) =>
                    prev.map((t) => (t.name === id ? { ...t, docstatus: 2, modified: new Date().toISOString() } : t)),
                );
                toast.success("Ticket cancelled (Demo)");
            }
        } catch (e: any) {
            toast.error("Failed to cancel", { description: e?.message || "Please try again." });
            setTickets((prev) =>
                prev.map((t) => (t.name === id ? { ...t, docstatus: 2, modified: new Date().toISOString() } : t)),
            );
        } finally {
            setActionLoading(null);
        }
    };

    // export
    const exportCsv = () => {
        const ok = exportCSV(sorted);
        if (!ok) toast.error("No data to export", { description: "Apply filters or check search." });
        else toast.success(`Exported ${sorted.length} tickets to CSV`);
    };

    const sortIndicator = (field: SortField) => {
        const idx = criteria.findIndex((c) => c.field === field);
        if (idx < 0) return <ArrowUpDown className="w-4 h-4 text-muted-foreground/60" />;
        const dir = criteria[idx].direction;
        const Icon = dir === "asc" ? ChevronUp : ChevronDown;
        return (
            <span className="inline-flex items-center gap-1 bg-theme-accent/10 rounded px-1.5 py-1 border border-theme-accent/20">
        <Icon className="w-4 h-4 text-theme-accent" />
                {criteria.length > 1 && (
                    <span className="text-xs font-bold bg-theme-accent text-theme-accent-foreground rounded-full px-1">
            {idx + 1}
          </span>
                )}
      </span>
        );
    };

    const resetColumns = () => {
        setColumnWidths(DEFAULT_WIDTHS);
        setColumnVisibility(DEFAULT_VISIBILITY);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-6 h-6 text-theme-accent" />
                                <CardTitle>Frappe Ticket Dashboard</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                {connectionStatus === "connected" && (
                                    <span className="flex items-center gap-1 text-green-600">
                    <Wifi className="w-4 h-4" /> Connected
                  </span>
                                )}
                                {connectionStatus === "disconnected" && (
                                    <span className="flex items-center gap-1 text-red-600">
                    <WifiOff className="w-4 h-4" /> Offline Mode
                  </span>
                                )}
                                {connectionStatus === "testing" && (
                                    <span className="flex items-center gap-1 text-yellow-600">
                    <Loader2 className="w-4 h-4 animate-spin" /> Testing...
                  </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {(activeFilterCount > 0 || criteria.length > 0) && (
                                <>
                                    {activeFilterCount > 0 && (
                                        <Badge variant="secondary">
                                            <Filter className="w-3 h-3 mr-1" />
                                            {activeFilterCount} Filter{activeFilterCount > 1 ? "s" : ""}
                                        </Badge>
                                    )}
                                    {criteria.length > 0 && (
                                        <Badge variant="secondary">
                                            <ArrowUpDown className="w-3 h-3 mr-1" />
                                            {criteria.length} Sort{criteria.length > 1 ? "s" : ""}
                                        </Badge>
                                    )}
                                </>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {sorted.length} of {totalTicketCount ?? mockTickets.length} tickets
                </span>
                                {countLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => fetchTickets()} disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setNewTicketDialogOpen(true)}>
                                New Ticket
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setConfigDialogOpen(true)}>
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <CardDescription>Manage and track support tickets from your Frappe/ERPNext instance</CardDescription>
                </CardHeader>
            </Card>

            {/* Overview */}
            <OverviewCards
                total={overview.total}
                loadingTotal={countLoading}
                open={overview.open}
                critical={overview.critical}
                resolvedToday={overview.resolvedToday}
                connectionStatus={connectionStatus}
            />

            {/* Error */}
            {error && (
                <Alert className="border-red-200 bg-red-50 text-red-900">
                    <AlertDescription>
                        <strong>Connection Error:</strong> {error}
                        <br />
                        <span className="text-sm opacity-90">Showing demo data. Check API configuration and refresh.</span>
                    </AlertDescription>
                </Alert>
            )}

            {/* Filters */}
            <Card className="p-6">
                <CardContent className="p-0">
                    <FiltersBar
                        pending={pending}
                        setPending={setPending}
                        uniqueValues={uniqueValues}
                        search={search}
                        setSearch={setSearch}
                        onApply={() => {
                            apply();
                            setPage(1);
                            toast.success("Filters applied");
                        }}
                        onClear={() => {
                            clear();
                            setPage(1);
                            toast.success("Filters cleared");
                        }}
                        hasUnapplied={hasUnapplied}
                        activeFilterCount={activeFilterCount}
                    />
                </CardContent>
            </Card>

            {/* Table + pagination */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-theme-accent" />
                            <span>Loading tickets...</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between p-4">
                                <div className="text-sm text-muted-foreground">
                                    Tickets ({sorted.length}
                                    {sorted.length !== tickets.length && ` of ${tickets.length}`})
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={exportCsv}>
                                        Export CSV
                                    </Button>
                                    {criteria.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                clearSorting();
                                                toast.success("Sorting cleared");
                                            }}
                                        >
                                            Clear Sorting
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setColumnSettingsDialogOpen(true)}
                                    >
                                        Columns ({visibleColumns.length})
                                    </Button>
                                </div>
                            </div>

                            <TicketTable
                                rows={sorted}
                                columnWidths={widths}
                                onResizeStart={startResize}
                                columnVisibility={columnVisibility}
                                onView={onView}
                                onSubmit={onSubmit}
                                onCancel={onCancel}
                                actionLoading={actionLoading}
                                selected={selectedTickets}
                                setSelected={setSelectedTickets}
                                sortIndicator={sortIndicator}
                                onSort={(f) => toggleSort(f as SortField)}
                                visibleColumns={visibleColumns}
                                onResetColumns={resetColumns}
                            />

                            <div className="p-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing page {page} of {pages} ({sorted.length} of{" "}
                                    {totalTicketCount ?? mockTickets.length} tickets)
                                </div>
                                <PaginationBar
                                    page={page}
                                    pages={pages}
                                    canPrev={canPrev}
                                    canNext={canNext}
                                    range={range}
                                    onPrev={() => {
                                        if (!canPrev) return;
                                        const p = page - 1;
                                        setPage(p);
                                        fetchTickets(false, p);
                                    }}
                                    onNext={() => {
                                        if (!canNext) return;
                                        const p = page + 1;
                                        setPage(p);
                                        fetchTickets(false, p);
                                    }}
                                    onGoto={(p) => {
                                        if (p === page) return;
                                        setPage(p);
                                        fetchTickets(false, p);
                                    }}
                                    isLoading={loading}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <ApiConfigDialog
                open={configDialogOpen}
                onOpenChange={setConfigDialogOpen}
                config={apiConfig}
                onConfigChange={handleConfigChange}
                onTestConnection={handleTestConnection}
            />
            <NewTicketDialog
                open={newTicketDialogOpen}
                onOpenChange={setNewTicketDialogOpen}
                onTicketCreated={(t) => {
                    setTickets((prev) => [t, ...prev]);
                    if (totalTicketCount !== null)
                        setTotalTicketCount((prev) => (prev || 0) + 1);
                }}
            />
            <TicketDetailsPopover ticket={selectedTicket} open={detailsOpen} onOpenChange={setDetailsOpen} />
            <ColumnSettingsDialog
                open={columnSettingsDialogOpen}
                onOpenChange={setColumnSettingsDialogOpen}
                columnWidths={widths}
                columnVisibility={columnVisibility}
                onColumnWidthsChange={setColumnWidths}
                onColumnVisibilityChange={setColumnVisibility}
                onResetToDefaults={resetColumns}
            />
        </div>
    );
}

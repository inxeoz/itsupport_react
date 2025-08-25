import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    frappeApi,
    mockTickets,
    type FrappeTicket,
    DEFAULT_API_CONFIG,
    type ApiConfig,
} from "@/services/frappeApi";

import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { usePagination } from "@/components/hooks/usePagination";
import { useSorting } from "@/components/hooks/useSorting";
import { useResizeColumns } from "@/components/hooks/useResizeColumns";

import { exportCSV } from "@/components/utils/exportData";
import { useFilters } from "@/components/utils/useFilters";
import type { SortField } from "@/components/types/tickets";

export const DEFAULT_WIDTHS = {
    select: 50, ticket_id: 120, title: 200, user_name: 150, department: 130,
    priority: 100, status: 120, category: 110, created_datetime: 160,
    due_datetime: 160, assignee: 130, actions: 100,
};

export const DEFAULT_VISIBILITY = {
    select: true, ticket_id: true, title: true, user_name: true, department: true,
    priority: true, status: true, category: true, created_datetime: true,
    due_datetime: true, assignee: true, actions: true,
};

export type ConnectionStatus = "connected" | "disconnected" | "testing";

export function useFrappeTicketDashboardLogic() {
    // connection & config
    const [tickets, setTickets] = useState<FrappeTicket[]>([]);
    const [totalTicketCount, setTotalTicketCount] = useState<number | null>(null);
    const [countLoading, setCountLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("testing");
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

    // filters & search
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

    const resetColumns = () => {
        setColumnWidths(DEFAULT_WIDTHS);
        setColumnVisibility(DEFAULT_VISIBILITY);
    };

    return {
        // connection & config
        tickets,
        totalTicketCount,
        countLoading,
        loading,
        error,
        actionLoading,
        connectionStatus,
        apiConfig,

        // dialogs & detail
        configDialogOpen, setConfigDialogOpen,
        newTicketDialogOpen, setNewTicketDialogOpen,
        columnSettingsDialogOpen, setColumnSettingsDialogOpen,
        selectedTicket, setSelectedTicket,
        detailsOpen, setDetailsOpen,

        // columns
        widths,
        startResize,
        columnVisibility,
        setColumnVisibility,
        visibleColumns,
        resetColumns,

        // filters
        pending, setPending,
        uniqueValues,
        search, setSearch,
        apply, clear, hasUnapplied, activeFilterCount,

        // sorting
        criteria, toggleSort, clearSorting, sorted,

        // selection
        selectedTickets, setSelectedTickets,

        // pagination
        page, setPage, pages, canPrev, canNext, range, pageSize,

        // data ops
        fetchTickets,
        handleConfigChange,
        handleTestConnection,
        onView, onSubmit, onCancel,
        exportCsv,

        // overview
        overview,
    };
}

export type DashboardLogic = ReturnType<typeof useFrappeTicketDashboardLogic>;
export type { SortField } from "@/components/types/tickets";

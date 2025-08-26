import React, { useState, useCallback, useMemo } from "react";
import { useTicketDashboardStore } from "@/common/GlobalStore.ts";

import {
    DragDropContext,
    Droppable,
    Draggable,
} from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2, RefreshCw, Wifi, WifiOff, FileText, Settings, ArrowUpDown,
    ChevronUp, ChevronDown, Filter,
} from "lucide-react";

import { mockTickets } from "@/services/frappeApi";
import type { SortField } from "@/components/types/tickets";
import { useFrappeTicketDashboardLogic } from "./LogicTicketDashboard.ts";

import { OverviewCards } from "./OverviewCards";
import { FiltersBar } from "./FiltersBar";
import { TicketTable } from "./TicketTable";
import { PaginationBar } from "./PaginationBar";

import { ApiConfigDialog } from "@/components/ApiDialog/ApiConfigDialog";
import { NewTicketDialog } from "@/components/FrappeTicketDashboard/NewTicketDialog";
import { TicketDetailsPopover } from "@/components/FrappeTicketDashboard/TicketDetailsPopover";
import { ColumnSettingsDialog } from "@/components/FrappeTicketDashboard/columns_settings/ColumnSettingsDialog";

// ------- dnd helpers -------
const reorder = <T,>(list: T[], startIndex: number, endIndex: number) => {
    const copy = list.slice();
    const [removed] = copy.splice(startIndex, 1);
    copy.splice(endIndex, 0, removed);
    return copy;
};

type SectionId = "header" | "overview" | "error" | "filters" | "table";

export default function FrappeTicketDashboard() {
    const L = useFrappeTicketDashboardLogic();

    // 🔒 global editability flag
    const { isEditable, toggleEditable } = useTicketDashboardStore();

    const [sectionOrder, setSectionOrder] = useState<SectionId[]>([
        "header",
        "overview",
        "filters",
        "table",
        "error", // hidden when no error
    ]);

    const visibleSections = useMemo(
        () => sectionOrder.filter((s) => s !== "error" || !!L.error),
        [sectionOrder, L.error]
    );

    const sortIndicator = (field: SortField) => {
        const idx = L.criteria.findIndex((c) => c.field === field);
        if (idx < 0) return <ArrowUpDown className="w-4 h-4 text-muted-foreground/60" />;
        const dir = L.criteria[idx].direction;
        const Icon = dir === "asc" ? ChevronUp : ChevronDown;
        return (
            <span className="inline-flex items-center gap-1 bg-theme-accent/10 rounded px-1.5 py-1 border border-theme-accent/20">
        <Icon className="w-4 h-4 text-theme-accent" />
                {L.criteria.length > 1 && (
                    <span className="text-xs font-bold bg-theme-accent text-theme-accent-foreground rounded-full px-1">
            {idx + 1}
          </span>
                )}
      </span>
        );
    };

    const onDragEnd = useCallback((result: DropResult) => {
        if (!isEditable) return; // 🔒 no-op when disabled
        const { source, destination } = result;
        if (!destination || destination.index === source.index) return;
        setSectionOrder(prev => reorder(prev, source.index, destination.index));
    }, [isEditable]);

    const renderSection = (sectionId: SectionId) => {
        switch (sectionId) {
            case "header":
                return (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-6 h-6 text-theme-accent" />
                                        <CardTitle>Frappe Ticket Dashboard</CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {L.connectionStatus === "connected" && (
                                            <span className="flex items-center gap-1 text-green-600">
                        <Wifi className="w-4 h-4" /> Connected
                      </span>
                                        )}
                                        {L.connectionStatus === "disconnected" && (
                                            <span className="flex items-center gap-1 text-red-600">
                        <WifiOff className="w-4 h-4" /> Offline Mode
                      </span>
                                        )}
                                        {L.connectionStatus === "testing" && (
                                            <span className="flex items-center gap-1 text-yellow-600">
                        <Loader2 className="w-4 h-4 animate-spin" /> Testing...
                      </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {(L.activeFilterCount > 0 || L.criteria.length > 0) && (
                                        <>
                                            {L.activeFilterCount > 0 && (
                                                <Badge variant="secondary">
                                                    <Filter className="w-3 h-3 mr-1" />
                                                    {L.activeFilterCount} Filter{L.activeFilterCount > 1 ? "s" : ""}
                                                </Badge>
                                            )}
                                            {L.criteria.length > 0 && (
                                                <Badge variant="secondary">
                                                    <ArrowUpDown className="w-3 h-3 mr-1" />
                                                    {L.criteria.length} Sort{L.criteria.length > 1 ? "s" : ""}
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Showing {L.sorted.length} of {L.totalTicketCount ?? mockTickets.length} tickets
                    </span>
                                        {L.countLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                    </div>


                                    <Button variant="outline" size="sm" onClick={() => L.fetchTickets()} disabled={L.loading}>
                                        {L.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => L.setNewTicketDialogOpen(true)}>
                                        New Ticket
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => L.setConfigDialogOpen(true)}>
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <CardDescription>Manage and track support tickets from your Frappe/ERPNext instance</CardDescription>
                        </CardHeader>
                    </Card>
                );

            case "overview":
                return (
                    <OverviewCards
                        total={L.overview.total}
                        loadingTotal={L.countLoading}
                        open={L.overview.open}
                        critical={L.overview.critical}
                        resolvedToday={L.overview.resolvedToday}
                        connectionStatus={L.connectionStatus}
                    />
                );

            case "error":
                return L.error ? (
                    <Alert className="border-red-200 bg-red-50 text-red-900">
                        <AlertDescription>
                            <strong>Connection Error:</strong> {L.error}
                            <br />
                            <span className="text-sm opacity-90">Showing demo data. Check API configuration and refresh.</span>
                        </AlertDescription>
                    </Alert>
                ) : null;

            case "filters":
                return (
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <FiltersBar
                                pending={L.pending}
                                setPending={L.setPending}
                                uniqueValues={L.uniqueValues}
                                search={L.search}
                                setSearch={L.setSearch}
                                onApply={() => {
                                    L.apply();
                                    L.setPage(1);
                                }}
                                onClear={() => {
                                    L.clear();
                                    L.setPage(1);
                                }}
                                hasUnapplied={L.hasUnapplied}
                                activeFilterCount={L.activeFilterCount}
                            />
                        </CardContent>
                    </Card>
                );

            case "table":
                return (
                    <Card>
                        <CardContent className="p-0">
                            {L.loading ? (
                                <div className="flex items-center justify-center py-12 gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-theme-accent" />
                                    <span>Loading tickets...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between p-4">
                                        <div className="text-sm text-muted-foreground">
                                            Tickets ({L.sorted.length}
                                            {L.sorted.length !== L.tickets.length && ` of ${L.tickets.length}`})
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={L.exportCsv}>
                                                Export CSV
                                            </Button>
                                            {L.criteria.length > 0 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        L.clearSorting();
                                                    }}
                                                >
                                                    Clear Sorting
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => L.setColumnSettingsDialogOpen(true)}
                                            >
                                                Columns ({L.visibleColumns.length})
                                            </Button>
                                        </div>
                                    </div>

                                    <TicketTable
                                        rows={L.sorted}
                                        columnWidths={L.widths}
                                        onResizeStart={L.startResize}
                                        columnVisibility={L.columnVisibility}
                                        onView={L.onView}
                                        onSubmit={L.onSubmit}
                                        onCancel={L.onCancel}
                                        actionLoading={L.actionLoading}
                                        selected={L.selectedTickets}
                                        setSelected={L.setSelectedTickets}
                                        sortIndicator={sortIndicator}
                                        onSort={(f) => L.toggleSort(f as SortField)}
                                        visibleColumns={L.visibleColumns}
                                        onResetColumns={L.resetColumns}
                                    />

                                    <div className="p-4 flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing page {L.page} of {L.pages} ({L.sorted.length} of{" "}
                                            {L.totalTicketCount ?? mockTickets.length} tickets)
                                        </div>
                                        <PaginationBar
                                            page={L.page}
                                            pages={L.pages}
                                            canPrev={L.canPrev}
                                            canNext={L.canNext}
                                            range={L.range}
                                            onPrev={() => {
                                                if (!L.canPrev) return;
                                                const p = L.page - 1;
                                                L.setPage(p);
                                                L.fetchTickets(false, p);
                                            }}
                                            onNext={() => {
                                                if (!L.canNext) return;
                                                const p = L.page + 1;
                                                L.setPage(p);
                                                L.fetchTickets(false, p);
                                            }}
                                            onGoto={(p) => {
                                                if (p === L.page) return;
                                                L.setPage(p);
                                                L.fetchTickets(false, p);
                                            }}
                                            isLoading={L.loading}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                );
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* Disable dropping when locked */}
            <Droppable droppableId="ticket_dashboard" direction="vertical" isDropDisabled={!isEditable}>
                {(dropProvided, dropSnapshot) => (
                    <div
                        className="space-y-6 ticket_dashboard"
                        ref={dropProvided.innerRef}
                        {...dropProvided.droppableProps}
                        style={{
                            background: dropSnapshot.isDraggingOver ? "rgba(59,130,246,0.04)" : undefined,
                            transition: "background 120ms ease",
                            opacity: isEditable ? 1 : 0.96,
                        }}
                    >
                        {visibleSections.map((sectionId, index) => (
                            <Draggable
                                key={sectionId}
                                draggableId={sectionId}
                                index={index}
                                isDragDisabled={!isEditable} // 🔒 per-item lock
                            >
                                {(dragProvided, dragSnapshot) => (
                                    <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        style={{
                                            boxShadow: dragSnapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.10)" : "none",
                                            borderRadius: 12,
                                            cursor: isEditable ? "grab" : "default",
                                            ...dragProvided.draggableProps.style,
                                        }}
                                        aria-disabled={!isEditable}
                                    >
                                        {renderSection(sectionId)}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {dropProvided.placeholder}

                        {/* Dialogs (not draggable / portal-based) */}
                        <ApiConfigDialog
                            open={L.configDialogOpen}
                            onOpenChange={L.setConfigDialogOpen}
                            config={L.apiConfig}
                            onConfigChange={L.handleConfigChange}
                            onTestConnection={L.handleTestConnection}
                        />
                        <NewTicketDialog
                            open={L.newTicketDialogOpen}
                            onOpenChange={L.setNewTicketDialogOpen}
                            onTicketCreated={() => {
                                L.setSelectedTicket(null);
                                L.fetchTickets(false, 1);
                            }}
                        />
                        <TicketDetailsPopover ticket={L.selectedTicket} open={L.detailsOpen} onOpenChange={L.setDetailsOpen} />
                        <ColumnSettingsDialog
                            open={L.columnSettingsDialogOpen}
                            onOpenChange={L.setColumnSettingsDialogOpen}
                            columnWidths={L.widths}
                            columnVisibility={L.columnVisibility}
                            onColumnWidthsChange={() => {/* handled by resize hook; no-op here */}}
                            onColumnVisibilityChange={L.setColumnVisibility}
                            onResetToDefaults={L.resetColumns}
                        />
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}

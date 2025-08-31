import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/ui/components/table";
import { Badge } from "@/ui/components/badge";
import { Button } from "@/ui/components/button";
import {
    Calendar, Clock, Eye, CheckCircle, XCircle, ArrowUpDown, User, UserCheck, Building, Tag,
} from "lucide-react";
import type { FrappeTicket } from "@/shared/services/frappeApi";
import type { ColumnVisibility, ColumnWidths, SortField } from "@/shared/types/tickets";
import { formatDateTime } from "@/shared/utils/date";

export function TicketTable({
                                rows, columnWidths, onResizeStart, columnVisibility, onView,
                                onSubmit, onCancel, actionLoading, selected, setSelected,
                                sortIndicator, onSort, visibleColumns, onResetColumns,
                            }: {
    rows: FrappeTicket[];
    columnWidths: ColumnWidths;
    onResizeStart: (e: React.MouseEvent, id: string) => void;
    columnVisibility: ColumnVisibility;
    onView: (t: FrappeTicket) => void;
    onSubmit: (id: string) => void;
    onCancel: (id: string) => void;
    actionLoading: string | null;
    selected: string[]; setSelected: (ids: string[]) => void;
    sortIndicator: (f: SortField) => React.ReactNode;
    onSort: (f: SortField) => void;
    visibleColumns: string[];
    onResetColumns: () => void;
}) {
    const getPriorityColor = (p?: string | null) => {
        switch ((p || "").toLowerCase()) {
            case "critical": return "bg-red-500 text-white";
            case "high": return "bg-orange-500 text-white";
            case "medium": return "bg-yellow-500 text-white";
            case "low": return "bg-green-500 text-white";
            default: return "bg-secondary text-secondary-foreground";
        }
    };
    const getStatusColor = (s?: string | null) => {
        switch ((s || "").toLowerCase()) {
            case "new": return "bg-blue-500 text-white";
            case "in progress": return "bg-orange-500 text-white";
            case "waiting for info": return "bg-yellow-500 text-black";
            case "resolved": return "bg-green-500 text-white";
            case "closed": return "bg-gray-500 text-white";
            default: return "bg-secondary text-secondary-foreground";
        }
    };

    return (
        <div className="relative overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                        {/* Select */}
                        {columnVisibility.select && (
                            <TableHead className="relative" style={{ width: columnWidths.select, minWidth: 50 }}>
                                <input
                                    type="checkbox"
                                    checked={selected.length === rows.length && rows.length > 0}
                                    onChange={(e) => setSelected(e.target.checked ? rows.map(r => r.name) : [])}
                                />
                                <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize" onMouseDown={(e)=>onResizeStart(e,"select")} />
                            </TableHead>
                        )}

                        {cellHead("ticket_id", "Ticket ID")}
                        {cellHead("title", "Title")}
                        {cellHead("user_name", "User")}
                        {cellHead("department", "Department")}
                        {cellHead("priority", "Priority")}
                        {cellHead("status", "Status")}
                        {cellHead("category", "Category")}
                        {cellHead("created_datetime", "Created")}
                        {cellHead("due_datetime", "Due Date")}
                        {cellHead("assignee", "Assignee")}

                        {columnVisibility.actions && (
                            <TableHead style={{ width: columnWidths.actions, minWidth: 100 }}>
                                <div className="flex items-center justify-between gap-2">
                                    <span>Actions</span>
                                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onResetColumns}>
                                        Reset Columns
                                    </Button>
                                </div>
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-muted-foreground">
                                No tickets
                            </TableCell>
                        </TableRow>
                    ) : rows.map((t) => (
                        <TableRow key={t.name} className="hover:bg-muted/50">
                            {columnVisibility.select && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(t.name)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelected([...selected, t.name]);
                                            else setSelected(selected.filter((id) => id !== t.name));
                                        }}
                                    />
                                </TableCell>
                            )}

                            {columnVisibility.ticket_id && (
                                <TableCell className="font-mono text-sm">{t.ticket_id || t.name}</TableCell>
                            )}
                            {columnVisibility.title && (
                                <TableCell title={t.title || ""} className="truncate">{t.title || "No title"}</TableCell>
                            )}
                            {columnVisibility.user_name && (
                                <TableCell className="truncate">
                                    <User className="w-4 h-4 inline mr-2 text-muted-foreground" />
                                    {t.user_name || "Unassigned"}
                                </TableCell>
                            )}
                            {columnVisibility.department && (
                                <TableCell className="truncate">
                                    <Building className="w-4 h-4 inline mr-2 text-muted-foreground" />
                                    {t.department || "N/A"}
                                </TableCell>
                            )}
                            {columnVisibility.priority && (
                                <TableCell>
                                    <Badge className={`${getPriorityColor(t.priority)} border-0 text-xs`}>{t.priority || "None"}</Badge>
                                </TableCell>
                            )}
                            {columnVisibility.status && (
                                <TableCell>
                                    <Badge className={`${getStatusColor(t.status)} border-0 text-xs`}>{t.status || "Unknown"}</Badge>
                                </TableCell>
                            )}
                            {columnVisibility.category && (
                                <TableCell className="truncate">
                                    <Tag className="w-4 h-4 inline mr-2 text-muted-foreground" />
                                    {t.category || "None"}
                                </TableCell>
                            )}
                            {columnVisibility.created_datetime && (
                                <TableCell className="text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    {formatDateTime(t.created_datetime || t.creation)}
                                </TableCell>
                            )}
                            {columnVisibility.due_datetime && (
                                <TableCell className="text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    {formatDateTime(t.due_datetime)}
                                </TableCell>
                            )}
                            {columnVisibility.assignee && (
                                <TableCell className="truncate">
                                    <UserCheck className="w-4 h-4 inline mr-2 text-muted-foreground" />
                                    {t.assignee || "Unassigned"}
                                </TableCell>
                            )}
                            {columnVisibility.actions && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onView(t)}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        {t.docstatus === 0 && (
                                            <Button
                                                variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-green-600"
                                                onClick={() => onSubmit(t.name)} disabled={actionLoading === t.name}
                                            >
                                                {actionLoading === t.name ? <span className="animate-spin">⏳</span> : <CheckCircle className="w-4 h-4" />}
                                            </Button>
                                        )}
                                        {t.docstatus !== 2 && (
                                            <Button
                                                variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-red-600"
                                                onClick={() => onCancel(t.name)} disabled={actionLoading === t.name}
                                            >
                                                {actionLoading === t.name ? <span className="animate-spin">⏳</span> : <XCircle className="w-4 h-4" />}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    function cellHead(id: SortField, label: string) {
        const width = (columnWidths as any)[id];
        const visible = (columnVisibility as any)[id];
        if (!visible) return null;
        return (
            <TableHead
                className="relative cursor-pointer"
                style={{ width, minWidth: 110 }}
                onClick={() => onSort(id)}
            >
                <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    {sortIndicator(id) || <ArrowUpDown className="w-4 h-4 text-muted-foreground/60" />}
                </div>
                <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize"
                    onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, id); }}
                />
            </TableHead>
        );
    }
}

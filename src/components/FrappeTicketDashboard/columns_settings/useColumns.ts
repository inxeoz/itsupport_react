import { useMemo } from "react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import type { ColumnVisibility, ColumnWidths } from "@/components/types/tickets";

const DEFAULT_WIDTHS: ColumnWidths = {
    select: 50, ticket_id: 120, title: 200, user_name: 150, department: 130,
    priority: 100, status: 120, category: 110, created_datetime: 160,
    due_datetime: 160, assignee: 130, actions: 100,
};

const DEFAULT_VISIBILITY: ColumnVisibility = {
    select: true, ticket_id: true, title: true, user_name: true, department: true,
    priority: true, status: true, category: true, created_datetime: true,
    due_datetime: true, assignee: true, actions: true,
};

export function useColumns() {
    const [widths, setWidths] = useLocalStorage<ColumnWidths>("frappe-dashboard-column-widths", DEFAULT_WIDTHS);
    const [visibility, setVisibility] = useLocalStorage<ColumnVisibility>("frappe-dashboard-column-visibility", DEFAULT_VISIBILITY);

    const visibleColumns = useMemo(
        () => Object.entries(visibility).filter(([,v]) => v).map(([k]) => k),
        [visibility]
    );

    const reset = () => { setWidths(DEFAULT_WIDTHS); setVisibility(DEFAULT_VISIBILITY); };

    return { widths, setWidths, visibility, setVisibility, visibleColumns, reset, DEFAULT_WIDTHS, DEFAULT_VISIBILITY };
}

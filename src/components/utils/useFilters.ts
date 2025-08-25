import { useMemo, useState } from "react";
import type { FilterState } from "@/components/types/tickets.ts";
import type { FrappeTicket } from "../../services/frappeApi.ts";
import { rangeThreshold } from "./date.ts";

const EMPTY: FilterState = {
    status: [], priority: [], category: [], impact: [],
    users: [], assignees: [], departments: [], dateRange: "all",
};

export function useFilters(allTickets: FrappeTicket[]) {
    const [pending, setPending] = useState<FilterState>({ ...EMPTY });
    const [applied, setApplied] = useState<FilterState>({ ...EMPTY });
    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const uniqueValues = useMemo(() => ({
        statuses: [...new Set(allTickets.map(t => t.status).filter(Boolean))].sort(),
        priorities: [...new Set(allTickets.map(t => t.priority).filter(Boolean))].sort(),
        categories: [...new Set(allTickets.map(t => t.category).filter(Boolean))].sort(),
        impacts: [...new Set(allTickets.map(t => t.impact).filter(Boolean))].sort(),
        users: [...new Set(allTickets.map(t => t.user_name).filter(Boolean))].sort(),
        assignees: [...new Set(allTickets.map(t => t.assignee).filter(Boolean))].sort(),
        departments: [...new Set(allTickets.map(t => t.department).filter(Boolean))].sort(),
    }), [allTickets]);

    const apply = () => { setApplied({ ...pending }); setAppliedSearch(search.trim()); };
    const clear = () => {
        setPending({ ...EMPTY }); setApplied({ ...EMPTY });
        setSearch(""); setAppliedSearch("");
    };

    const filtered = useMemo(() => {
        let rows = allTickets;

        // search
        if (appliedSearch) {
            const q = appliedSearch.toLowerCase();
            rows = rows.filter(t =>
                t.name?.toLowerCase().includes(q) ||
                t.ticket_id?.toLowerCase().includes(q) ||
                t.title?.toLowerCase().includes(q) ||
                t.user_name?.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q) ||
                t.department?.toLowerCase().includes(q) ||
                t.category?.toLowerCase().includes(q) ||
                t.tags?.toLowerCase().includes(q),
            );
        }

        // facets
        const f = applied;
        if (f.status.length)      rows = rows.filter(t => t.status && f.status.includes(t.status));
        if (f.priority.length)    rows = rows.filter(t => t.priority && f.priority.includes(t.priority));
        if (f.category.length)    rows = rows.filter(t => t.category && f.category.includes(t.category));
        if (f.impact.length)      rows = rows.filter(t => t.impact && f.impact.includes(t.impact));
        if (f.users.length)       rows = rows.filter(t => t.user_name && f.users.includes(t.user_name));
        if (f.assignees.length)   rows = rows.filter(t => t.assignee && f.assignees.includes(t.assignee));
        if (f.departments.length) rows = rows.filter(t => t.department && f.departments.includes(t.department));

        if (f.dateRange !== "all") {
            const th = rangeThreshold(f.dateRange);
            rows = rows.filter(t => {
                const d = t.created_datetime ? new Date(t.created_datetime)
                    : t.creation ? new Date(t.creation) : null;
                return d && d >= th;
            });
        }
        return rows;
    }, [allTickets, applied, appliedSearch]);

    const activeFilterCount = useMemo(() =>
        [
            ...applied.status, ...applied.priority, ...applied.category,
            ...applied.impact, ...applied.users, ...applied.assignees,
            ...applied.departments, ...(applied.dateRange !== "all" ? [applied.dateRange] : []),
        ].length + (appliedSearch ? 1 : 0), [applied, appliedSearch]);

    const hasUnapplied = JSON.stringify(pending) !== JSON.stringify(applied) || search !== appliedSearch;

    return {
        pending, setPending, applied, apply, clear,
        search, setSearch, appliedSearch,
        filtered, uniqueValues, activeFilterCount, hasUnapplied,
    };
}

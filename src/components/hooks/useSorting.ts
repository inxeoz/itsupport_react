import { useMemo, useState } from "react";
import type { SortCriteria, SortField } from "@/components/types/tickets.ts";
import type { FrappeTicket } from "../../services/frappeApi.ts";
import { sortFns } from "@/components/utils/sortFns.ts";

export function useSorting(rows: FrappeTicket[]) {
    const [criteria, setCriteria] = useState<SortCriteria[]>([]);

    const toggleSort = (field: SortField) => {
        setCriteria(prev => {
            const i = prev.findIndex(c => c.field === field);
            if (i >= 0) {
                const cur = prev[i];
                if (cur.direction === "asc") {
                    const copy = [...prev];
                    copy[i] = { field, direction: "desc" };
                    return copy;
                }
                // remove
                const copy = [...prev];
                copy.splice(i, 1);
                return copy;
            }
            return [...prev, { field, direction: "asc" }];
        });
    };

    const clear = () => setCriteria([]);

    const sorted = useMemo(() => {
        if (!criteria.length) return rows;
        return [...rows].sort((a,b) => {
            for (const c of criteria) {
                const r = sortFns[c.field](a,b,c.direction);
                if (r !== 0) return r;
            }
            return 0;
        });
    }, [rows, criteria]);

    return { criteria, toggleSort, clear, sorted };
}

import { useMemo, useState } from "react";

export function usePagination(totalCount: number | null, pageSize = 20, fallbackCount = 50) {
    const [page, setPage] = useState(1);
    const pages = useMemo(() => Math.max(1, Math.ceil((totalCount ?? fallbackCount) / pageSize)), [totalCount, pageSize, fallbackCount]);

    const canPrev = page > 1;
    const canNext = page < pages;

    const range = () => {
        const delta = 2;
        const res: (number | "...")[] = [];
        const start = Math.max(1, page - delta);
        const end = Math.min(pages, page + delta);
        if (start > 1) { res.push(1); if (start > 2) res.push("..."); }
        for (let i = start; i <= end; i++) res.push(i);
        if (end < pages) { if (end < pages - 1) res.push("..."); res.push(pages); }
        return res;
    };

    return { page, setPage, pages, canPrev, canNext, range, pageSize };
}

import { useCallback, useEffect, useState } from "react";
import type { ColumnWidths, ResizeState } from "@/components/types/tickets.ts";

export function useResizeColumns(
    initial: ColumnWidths,
    onCommit?: (w: ColumnWidths) => void
) {
    const [widths, setWidths] = useState<ColumnWidths>(initial);
    const [state, setState] = useState<ResizeState | null>(null);

    const start = useCallback((e: React.MouseEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        setState({
            isResizing: true,
            columnId: id,
            startX: e.clientX,
            startWidth: widths[id] || initial[id] || 100,
        });
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }, [widths, initial]);

    const move = useCallback((e: MouseEvent) => {
        if (!state?.isResizing) return;
        const delta = e.clientX - state.startX;
        const w = Math.max(50, state.startWidth + delta);
        setWidths(prev => ({ ...prev, [state.columnId]: w }));
    }, [state]);

    const end = useCallback(() => {
        if (state?.isResizing) {
            onCommit?.(widths);
            setState(null);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }
    }, [state, widths, onCommit]);

    useEffect(() => {
        if (!state?.isResizing) return;
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", end);
        return () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", end);
        };
    }, [state, move, end]);

    return { widths, setWidths, start, state };
}

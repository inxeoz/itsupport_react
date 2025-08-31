import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useDashboardStore } from "@/shared/store/GlobalStore.ts";
import ToolMenu from "./ToolMenu";

/* ------------------------- types ------------------------- */
export type SectionId = string;

export type DashboardSection = {
    id: SectionId;
    content: React.ReactNode;
    hidden?: boolean;
    className?: string;
    maxWidth?: number;   // optional: if omitted, computed on first mount
    maxHeight?: number;  // optional: if omitted, computed on first mount
};

export type UniversalDashboardProps = {
    sections: DashboardSection[];
    editable?: boolean;
    initialOrder?: SectionId[];
    onOrderChange?: (order: SectionId[]) => void;
    droppableId?: string;
    emoji?: string;
    className?: string;
    onEditSection?: (id: SectionId) => void;
    onHideSection?: (id: SectionId) => void;
    onPinSection?: (id: SectionId) => void;
};

/* ------------------------- config ------------------------- */
const MIN_SIZE = 40;

/* ------------------------- utils ------------------------- */
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const reorder = <T,>(list: T[], startIndex: number, endIndex: number) => {
    const copy = list.slice();
    const [removed] = copy.splice(startIndex, 1);
    copy.splice(endIndex, 0, removed);
    return copy;
};

/* ------------------------- hooks & helpers ------------------------- */

type SizeOverrides = Record<SectionId, { width?: number; height?: number }>;
type FixedMaxMap = Record<SectionId, { maxWidth: number; maxHeight: number }>;

function useVisibleOrder(sections: DashboardSection[], initialOrder?: SectionId[]) {
    const visibleIds = useMemo(
        () => sections.filter((s) => !s.hidden).map((s) => s.id),
        [sections]
    );

    const [order, setOrder] = useState<SectionId[]>(
        initialOrder?.length ? initialOrder : visibleIds
    );

    useEffect(() => {
        setOrder((prev) => {
            const existing = prev.filter((id) => visibleIds.includes(id));
            const additions = visibleIds.filter((id) => !existing.includes(id));
            return [...existing, ...additions];
        });
    }, [visibleIds]);

    return { order, setOrder, visibleIds };
}

function useFixedMaxSizes(sections: DashboardSection[]) {
    const fixedMaxSizes = useRef<FixedMaxMap>({});
    const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({});

    const attachMeasuredRef =
        (id: SectionId, section: DashboardSection) => (el: HTMLDivElement | null) => {
            sectionRefs.current[id] = el;

            if (el && !fixedMaxSizes.current[id]) {
                fixedMaxSizes.current[id] = {
                    maxWidth: section.maxWidth ?? el.offsetWidth,
                    maxHeight: section.maxHeight ?? el.offsetHeight,
                };
            }
        };

    const getMax = (id: SectionId) => fixedMaxSizes.current[id];

    useEffect(() => {
        const ids = new Set(sections.map((s) => s.id));
        Object.keys(fixedMaxSizes.current).forEach((id) => {
            if (!ids.has(id)) delete fixedMaxSizes.current[id as SectionId];
        });
    }, [sections]);

    return { attachMeasuredRef, getMax };
}

function createSizeController(
    getMax: (id: SectionId) => { maxWidth: number; maxHeight: number } | undefined,
    setOverrides: React.Dispatch<React.SetStateAction<SizeOverrides>>
) {
    const nudgeWidth = (id: SectionId, delta: number) => {
        const fixed = getMax(id);
        if (!fixed) return;
        setOverrides((prev) => {
            const current = prev[id]?.width ?? fixed.maxWidth;
            const next = clamp(current + delta, MIN_SIZE, fixed.maxWidth);
            return { ...prev, [id]: { ...prev[id], width: next } };
        });
    };

    const nudgeHeight = (id: SectionId, delta: number) => {
        const fixed = getMax(id);
        if (!fixed) return;
        setOverrides((prev) => {
            const current = prev[id]?.height ?? fixed.maxHeight;
            const next = clamp(current + delta, MIN_SIZE, fixed.maxHeight);
            return { ...prev, [id]: { ...prev[id], height: next } };
        });
    };

    const resetSize = (id: SectionId) => {
        setOverrides((prev) => {
            const { [id]: _omit, ...rest } = prev;
            return rest;
        });
    };

    return { nudgeWidth, nudgeHeight, resetSize };
}

/* ------------------------- component ------------------------- */

export default function UniversalDashboard({
                                               sections,
                                               editable = false,
                                               initialOrder,
                                               onOrderChange,
                                               droppableId = "universal_dashboard",
                                               emoji = "✨",
                                               className = "",
                                               onEditSection,
                                               onHideSection,
                                               onPinSection,
                                           }: UniversalDashboardProps) {
    const isEditableFromStore = useDashboardStore((s) => s.isEditable);
    const canEdit = editable || isEditableFromStore;

    const { order, setOrder } = useVisibleOrder(sections, initialOrder);

    const [overrides, setOverrides] = useState<SizeOverrides>({});
    useEffect(() => {
        const ids = new Set(sections.map((s) => s.id));
        setOverrides((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((id) => {
                if (!ids.has(id)) delete next[id as SectionId];
            });
            return next;
        });
    }, [sections]);

    const idToSection = useMemo(() => {
        const m = new Map<SectionId, DashboardSection>();
        sections.forEach((s) => m.set(s.id, s));
        return m;
    }, [sections]);

    const visibleSectionsOrdered = useMemo(
        () =>
            order
                .map((id) => idToSection.get(id))
                .filter((s): s is DashboardSection => !!s && !s.hidden),
        [order, idToSection]
    );

    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (!canEdit) return;
            const { source, destination } = result;
            if (!destination || destination.index === source.index) return;
            setOrder((prev) => {
                const next = reorder(prev, source.index, destination.index);
                onOrderChange?.(next);
                return next;
            });
        },
        [canEdit, onOrderChange, setOrder]
    );

    const { attachMeasuredRef, getMax } = useFixedMaxSizes(sections);
    const { nudgeWidth, nudgeHeight, resetSize } = createSizeController(getMax, setOverrides);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={droppableId} direction="vertical" isDropDisabled={!canEdit}>
                {(dropProvided, dropSnapshot) => (
                    <div
                        ref={dropProvided.innerRef}
                        {...dropProvided.droppableProps}
                        className={`space-y-6 p-4 ${className}`}
                        style={{
                            background: dropSnapshot.isDraggingOver ? "rgba(59,130,246,0.04)" : undefined,
                            transition: "background 120ms ease",
                            opacity: canEdit ? 1 : 0.96,
                            borderRadius: 12,
                        }}
                    >
                        {visibleSectionsOrdered.map((section, index) => {
                            const ov = overrides[section.id] || {};
                            const fixed = getMax(section.id);

                            return (
                                <Draggable
                                    key={section.id}
                                    draggableId={section.id}
                                    index={index}
                                    isDragDisabled={!canEdit}
                                >
                                    {(dragProvided, dragSnapshot) => (
                                        <div
                                            ref={(el) => {
                                                dragProvided.innerRef(el);
                                                attachMeasuredRef(section.id, section)(el);
                                            }}
                                            {...dragProvided.draggableProps}
                                            {...dragProvided.dragHandleProps}
                                            className={`relative group ${section.className ?? ""}`}
                                            style={{
                                                boxShadow: dragSnapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.10)" : "none",
                                                borderRadius: 12,
                                                cursor: canEdit ? "grab" : "default",
                                                background: "white",
                                                overflow: "hidden",
                                                ...(ov.width != null ? { width: ov.width } : {}),
                                                ...(ov.height != null ? { height: ov.height } : {}),
                                                ...(dragProvided.draggableProps.style || {}),
                                            }}
                                        >
                                            {section.content}

                                            <ToolMenu
                                                show={canEdit}
                                                emoji={emoji}
                                                sectionId={section.id}
                                                onEditSection={onEditSection}
                                                onHideSection={onHideSection}
                                                onPinSection={onPinSection}
                                                nudgeWidth={nudgeWidth}
                                                nudgeHeight={nudgeHeight}
                                                resetSize={resetSize}
                                                maxLabel={fixed ? `${fixed.maxWidth}×${fixed.maxHeight}` : undefined}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            );
                        })}
                        {dropProvided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}

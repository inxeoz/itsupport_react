import React, {useCallback, useEffect, useMemo, useState} from "react";
import {DragDropContext, Draggable, Droppable, type DropResult,} from "@hello-pangea/dnd";
import {useDashboardStore} from "@/common/GlobalStore.ts";


/** -------- helpers -------- */
const reorder = <T, >(list: T[], startIndex: number, endIndex: number) => {
    const copy = list.slice();
    const [removed] = copy.splice(startIndex, 1);
    copy.splice(endIndex, 0, removed);
    return copy;
};

/** -------- types -------- */
export type SectionId = string;

export type DashboardSection = {
    /** stable unique id for DnD */
    id: SectionId;
    /** what to render inside the section */
    content: React.ReactNode;
    /** optional visibility toggle (default: visible) */
    hidden?: boolean;
    /** optional className for the section wrapper */
    className?: string;
};

export type UniversalDashboardProps = {
    /** list of sections to render */
    sections: DashboardSection[];
    /** enable drag n drop (default: false) */
    editable?: boolean;
    /** initial order (ids). If omitted, uses `sections` order */
    initialOrder?: SectionId[];
    /** called whenever the order changes */
    onOrderChange?: (order: SectionId[]) => void;
    /** droppable id (useful when multiple dashboards on a page) */
    droppableId?: string;
    /** emoji shown on hover (default: ✨) */
    emoji?: string;
    /** optional className for the dashboard container */
    className?: string;
};

/** -------- component -------- */
export default function UniversalDashboard({
                                               sections,
                                               editable = false,
                                               initialOrder,
                                               onOrderChange,
                                               droppableId = "universal_dashboard",
                                               emoji = "✨",
                                               className = "",
                                           }: UniversalDashboardProps) {
    // derive the canonical list of visible ids from props
    const visibleIdsFromProps = useMemo(
        () => sections.filter((s) => !s.hidden).map((s) => s.id),
        [sections]
    );

    // local order state (ids). start from initialOrder or incoming sections order.
    const [order, setOrder] = useState<SectionId[]>(
        initialOrder?.length ? initialOrder : visibleIdsFromProps
    );

    // keep local order in sync when sections list changes:
    // - preserve existing order for ids that still exist
    // - append any new ids at the end
    // - drop ids no longer provided
    useEffect(() => {
        setOrder((prev) => {
            const existing = prev.filter((id) => visibleIdsFromProps.includes(id));
            const additions = visibleIdsFromProps.filter((id) => !existing.includes(id));
            const next = [...existing, ...additions];
            return next;
        });
    }, [visibleIdsFromProps]);

    const idToSection = useMemo(() => {
        const map = new Map<SectionId, DashboardSection>();
        sections.forEach((s) => map.set(s.id, s));
        return map;
    }, [sections]);

    const visibleSectionsOrdered: DashboardSection[] = useMemo(
        () =>
            order
                .map((id) => idToSection.get(id))
                .filter((s): s is DashboardSection => !!s && !s.hidden),
        [order, idToSection]
    );

    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (!editable) return;
            const {source, destination} = result;
            if (!destination || destination.index === source.index) return;
            setOrder((prev) => {
                const next = reorder(prev, source.index, destination.index);
                onOrderChange?.(next);
                return next;
            });
        },
        [editable, onOrderChange]
    );


    const {isEditable, toggleEditable} = useDashboardStore();


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
                droppableId={droppableId}
                direction="vertical"
                isDropDisabled={!editable}
            >
                {(dropProvided, dropSnapshot) => (
                    <div
                        ref={dropProvided.innerRef}
                        {...dropProvided.droppableProps}
                        className={`space-y-6 p-4 ${className}`}
                        style={{
                            background: dropSnapshot.isDraggingOver
                                ? "rgba(59,130,246,0.04)"
                                : undefined,
                            transition: "background 120ms ease",
                            opacity: editable ? 1 : 0.96,
                            borderRadius: 12,
                        }}
                    >
                        {visibleSectionsOrdered.map((section, index) => (
                            <Draggable
                                key={section.id}
                                draggableId={section.id}
                                index={index}
                                isDragDisabled={!editable}
                            >
                                {(dragProvided, dragSnapshot) => (
                                    <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        className={`relative group ${section.className ?? ""}`}
                                        style={{
                                            boxShadow: dragSnapshot.isDragging
                                                ? "0 8px 24px rgba(0,0,0,0.10)"
                                                : "none",
                                            borderRadius: 12,
                                            cursor: editable ? "grab" : "default",
                                            background: "white",
                                            ...dragProvided.draggableProps.style,
                                        }}
                                    >
                                        {/* user-provided content */}
                                        {section.content}

                                        {/* emoji on hover — the only visible affordance */}

                                        {
                                            isEditable && <span
                                                className="absolute -top-2 right-3 opacity-0 group-hover:opacity-100
                                 transition-opacity bg-white border border-gray-300 rounded-full
                                 text-sm px-1.5 cursor-pointer select-none"
                                                aria-hidden="true"

                                                onClick={() => window.alert("HII")}

                                            >
                      {emoji}
                    </span>}


                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {dropProvided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {DragDropContext, Draggable, Droppable, type DropResult} from "@hello-pangea/dnd";
import {useDashboardStore} from "@/common/GlobalStore.ts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    id: SectionId;
    content: React.ReactNode;
    hidden?: boolean;
    className?: string;
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

/** -------- component -------- */
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

    const visibleIdsFromProps = useMemo(
        () => sections.filter((s) => !s.hidden).map((s) => s.id),
        [sections]
    );

    const [order, setOrder] = useState<SectionId[]>(
        initialOrder?.length ? initialOrder : visibleIdsFromProps
    );

    useEffect(() => {
        setOrder((prev) => {
            const existing = prev.filter((id) => visibleIdsFromProps.includes(id));
            const additions = visibleIdsFromProps.filter((id) => !existing.includes(id));
            return [...existing, ...additions];
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
            if (!canEdit) return;
            const {source, destination} = result;
            if (!destination || destination.index === source.index) return;
            setOrder((prev) => {
                const next = reorder(prev, source.index, destination.index);
                onOrderChange?.(next);
                return next;
            });
        },
        [canEdit, onOrderChange]
    );

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
                        {visibleSectionsOrdered.map((section, index) => (
                            <Draggable
                                key={section.id}
                                draggableId={section.id}
                                index={index}
                                isDragDisabled={!canEdit}
                            >
                                {(dragProvided, dragSnapshot) => (
                                    <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        className={`relative group ${section.className ?? ""}`}
                                        style={{
                                            boxShadow: dragSnapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.10)" : "none",
                                            borderRadius: 12,
                                            cursor: canEdit ? "grab" : "default",
                                            background: "white",
                                            ...dragProvided.draggableProps.style,
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
                                        />
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

/** -------- submenu button -------- */
type ToolMenuProps = {
    show: boolean;
    emoji: string;
    sectionId: SectionId;
    onEditSection?: (id: SectionId) => void;
    onHideSection?: (id: SectionId) => void;
    onPinSection?: (id: SectionId) => void;
};

function ToolMenu({
                      show,
                      emoji,
                      sectionId,
                      onEditSection,
                      onHideSection,
                      onPinSection,
                  }: ToolMenuProps) {
    if (!show) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="absolute -top-2 right-3 opacity-0 group-hover:opacity-100
                       transition-opacity bg-white border border-gray-300 rounded-full
                       text-sm px-1.5 leading-[1.6] cursor-pointer select-none"
                    aria-label="Open section options"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    {emoji}
                </button>
            </DropdownMenuTrigger>


            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEditSection?.(sectionId)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onHideSection?.(sectionId)}>Hide</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => onPinSection?.(sectionId)}>Pin</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    );
}

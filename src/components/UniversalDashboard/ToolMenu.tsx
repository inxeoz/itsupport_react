import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

/* ------------------------- local types ------------------------- */
// Kept local to avoid circular deps. Matches the main file's definition.
export type SectionId = string;

/* ------------------------- config (local to menu) ------------------------- */
const WIDTH_STEP = 40;
const HEIGHT_STEP = 40;

/* ------------------------- props ------------------------- */
type ToolMenuProps = {
    show: boolean;
    emoji: string;
    sectionId: SectionId;
    onEditSection?: (id: SectionId) => void;
    onHideSection?: (id: SectionId) => void;
    onPinSection?: (id: SectionId) => void;
    nudgeWidth: (id: SectionId, delta: number) => void;
    nudgeHeight: (id: SectionId, delta: number) => void;
    resetSize: (id: SectionId) => void;
    maxLabel?: string;
};

/* ------------------------- component ------------------------- */
export default function ToolMenu({
                                     show,
                                     emoji,
                                     sectionId,
                                     onEditSection,
                                     onHideSection,
                                     onPinSection,
                                     nudgeWidth,
                                     nudgeHeight,
                                     resetSize,
                                     maxLabel,
                                 }: ToolMenuProps) {
    if (!show) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="absolute -top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded-full text-sm px-1.5 leading-[1.6] cursor-pointer select-none"
                    aria-label="Open section options"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    {emoji}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => onEditSection?.(sectionId)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onHideSection?.(sectionId)}>Hide</DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>{"< Width >"}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => nudgeWidth(sectionId, -WIDTH_STEP)}>Decrease</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => nudgeWidth(sectionId, +WIDTH_STEP)}>Increase</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>{"< Height >"}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => nudgeHeight(sectionId, -HEIGHT_STEP)}>Decrease</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => nudgeHeight(sectionId, +HEIGHT_STEP)}>Increase</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem onClick={() => resetSize(sectionId)}>Reset size</DropdownMenuItem>

                {maxLabel && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1 text-xs text-muted-foreground select-none">Max: {maxLabel}</div>
                    </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPinSection?.(sectionId)}>Pin</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

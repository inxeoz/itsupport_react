import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationBar({
                                  page, pages, canPrev, canNext, range, onPrev, onNext, onGoto, isLoading,
                              }: {
    page: number; pages: number; canPrev: boolean; canNext: boolean;
    range: () => (number | "...")[]; onPrev: () => void; onNext: () => void;
    onGoto: (n: number) => void; isLoading: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPrev} disabled={!canPrev || isLoading}>
                <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <div className="flex items-center gap-1">
                {range().map((p, i) => (
                    <div key={`${p}-${i}`}>
                        {p === "..." ? (
                            <span className="px-2 py-1 text-muted-foreground">...</span>
                        ) : (
                            <Button
                                variant={page === p ? "default" : "outline"}
                                size="sm"
                                disabled={isLoading}
                                onClick={() => onGoto(p as number)}
                            >
                                {p}
                            </Button>
                        )}
                    </div>
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={onNext} disabled={!canNext || isLoading}>
                Next <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="text-sm text-muted-foreground ml-2">Page {page} of {pages}</div>
        </div>
    );
}

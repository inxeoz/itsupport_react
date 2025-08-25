export const formatDateTime = (iso: string | null) => {
    if (!iso) return "N/A";
    try {
        return new Date(iso).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "Invalid Date";
    }
};

export const rangeThreshold = (range: "all" | "7days" | "30days" | "90days") => {
    if (range === "all") return new Date(0);
    const now = Date.now();
    const days = range === "7days" ? 7 : range === "30days" ? 30 : 90;
    return new Date(now - days * 24 * 60 * 60 * 1000);
};

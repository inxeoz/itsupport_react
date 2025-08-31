import type { FrappeTicket } from "../../services/frappeApi.ts";

export function exportCSV(rows: FrappeTicket[], namePrefix = "tickets") {
    if (!rows.length) return false;

    const headers = [
        "Ticket ID","Title","User","Department","Priority","Status",
        "Category","Created","Due Date","Assignee",
    ];
    const lines = rows.map(t => ([
        t.ticket_id || t.name || "",
        `"${(t.title || "").replace(/"/g, '""')}"`,
        t.user_name || "",
        t.department || "",
        t.priority || "",
        t.status || "",
        t.category || "",
        t.created_datetime ? new Date(t.created_datetime).toLocaleDateString() : "",
        t.due_datetime ? new Date(t.due_datetime).toLocaleDateString() : "",
        t.assignee || "",
    ].join(",")));

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${namePrefix}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
}

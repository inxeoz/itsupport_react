export type SortDirection = "asc" | "desc";
export type SortField =
    | "name"
    | "ticket_id"
    | "title"
    | "user_name"
    | "department"
    | "priority"
    | "status"
    | "category"
    | "created_datetime"
    | "due_datetime"
    | "assignee";

export interface SortCriteria {
    field: SortField;
    direction: SortDirection;
}

export interface FilterState {
    status: string[];
    priority: string[];
    category: string[];
    impact: string[];
    users: string[];
    assignees: string[];
    departments: string[];
    dateRange: "all" | "7days" | "30days" | "90days";
}

export interface ColumnWidths {
    [key: string]: number;
}

export interface ColumnVisibility {
    [key: string]: boolean;
}

export interface ResizeState {
    isResizing: boolean;
    columnId: string;
    startX: number;
    startWidth: number;
}

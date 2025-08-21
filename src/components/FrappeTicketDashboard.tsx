import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  Settings,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  FileSpreadsheet,
  Trash2,
  Archive,
  Send,
  X,
  Building,
  Mail,
  Phone,
  Tag,
  AlertTriangle,
  Target,
  UserCheck,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Check,
  TrendingUp,
  List,
  CheckCircle2,
  Columns,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import {
  frappeApi,
  mockTickets,
  type FrappeTicket,
  DEFAULT_API_CONFIG,
  type ApiConfig,
} from "../services/frappeApi";
import { ApiConfigDialog } from "./ApiConfigDialog";
import { NewTicketDialog } from "./NewTicketDialog";
import { TicketDetailsPopover } from "./TicketDetailsPopover";
import { ColumnSettingsDialog } from "./ColumnSettingsDialog";
import { toast } from "sonner";

type SortDirection = "asc" | "desc";
type SortField =
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

interface SortCriteria {
  field: SortField;
  direction: SortDirection;
}

interface FilterState {
  status: string[];
  priority: string[];
  category: string[];
  impact: string[];
  users: string[];
  assignees: string[];
  departments: string[];
  dateRange: string;
}

interface ColumnWidths {
  [key: string]: number;
}

interface ColumnVisibility {
  [key: string]: boolean;
}

interface ResizeState {
  isResizing: boolean;
  columnId: string;
  startX: number;
  startWidth: number;
}

export function FrappeTicketDashboard() {
  const [tickets, setTickets] = useState<FrappeTicket[]>([]);
  const [totalTicketCount, setTotalTicketCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "testing"
  >("testing");
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_API_CONFIG);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);
  const [columnSettingsDialogOpen, setColumnSettingsDialogOpen] =
    useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Search and Filter States - Separate pending and applied states
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  const [pendingFilters, setPendingFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: [],
    impact: [],
    users: [],
    assignees: [],
    departments: [],
    dateRange: "all",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: [],
    impact: [],
    users: [],
    assignees: [],
    departments: [],
    dateRange: "all",
  });

  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Ticket Details Popover State
  const [selectedTicket, setSelectedTicket] = useState<FrappeTicket | null>(
    null,
  );
  const [detailsPopoverOpen, setDetailsPopoverOpen] = useState(false);

  // Column management state
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    select: 50,
    ticket_id: 120,
    title: 200,
    user_name: 150,
    department: 130,
    priority: 100,
    status: 120,
    category: 110,
    created_datetime: 160,
    due_datetime: 160,
    assignee: 130,
    actions: 100,
  });

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    select: true,
    ticket_id: true,
    title: true,
    user_name: true,
    department: true,
    priority: true,
    status: true,
    category: true,
    created_datetime: true,
    due_datetime: true,
    assignee: true,
    actions: true,
  });

  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Default column widths
  const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
    select: 50,
    ticket_id: 120,
    title: 200,
    user_name: 150,
    department: 130,
    priority: 100,
    status: 120,
    category: 110,
    created_datetime: 160,
    due_datetime: 160,
    assignee: 130,
    actions: 100,
  };

  // Default column visibility
  const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
    select: true,
    ticket_id: true,
    title: true,
    user_name: true,
    department: true,
    priority: true,
    status: true,
    category: true,
    created_datetime: true,
    due_datetime: true,
    assignee: true,
    actions: true,
  };

  // Load column settings from localStorage on mount
  useEffect(() => {
    // Load column widths
    const savedWidths = localStorage.getItem("frappe-dashboard-column-widths");
    if (savedWidths) {
      try {
        const parsed = JSON.parse(savedWidths);
        setColumnWidths({
          ...DEFAULT_COLUMN_WIDTHS,
          ...parsed,
        });
      } catch (error) {
        console.error("Failed to parse saved column widths:", error);
      }
    }

    // Load column visibility
    const savedVisibility = localStorage.getItem(
      "frappe-dashboard-column-visibility",
    );
    if (savedVisibility) {
      try {
        const parsed = JSON.parse(savedVisibility);
        setColumnVisibility({
          ...DEFAULT_COLUMN_VISIBILITY,
          ...parsed,
        });
      } catch (error) {
        console.error("Failed to parse saved column visibility:", error);
      }
    }
  }, []);

  // Save column widths to localStorage
  const saveColumnWidths = useCallback((widths: ColumnWidths) => {
    localStorage.setItem(
      "frappe-dashboard-column-widths",
      JSON.stringify(widths),
    );
  }, []);

  // Save column visibility to localStorage
  const saveColumnVisibility = useCallback((visibility: ColumnVisibility) => {
    localStorage.setItem(
      "frappe-dashboard-column-visibility",
      JSON.stringify(visibility),
    );
  }, []);

  // Handle column visibility change
  const handleColumnVisibilityChange = useCallback(
    (visibility: ColumnVisibility) => {
      setColumnVisibility(visibility);
      saveColumnVisibility(visibility);
    },
    [saveColumnVisibility],
  );

  // Handle column widths change
  const handleColumnWidthsChange = useCallback(
    (widths: ColumnWidths) => {
      setColumnWidths(widths);
      saveColumnWidths(widths);
    },
    [saveColumnWidths],
  );

  // Reset all column settings to defaults
  const handleResetColumnSettings = useCallback(() => {
    setColumnWidths(DEFAULT_COLUMN_WIDTHS);
    setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
    saveColumnWidths(DEFAULT_COLUMN_WIDTHS);
    saveColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
  }, [saveColumnWidths, saveColumnVisibility]);

  // Get visible columns list
  const visibleColumns = useMemo(() => {
    return Object.entries(columnVisibility)
      .filter(([columnId, isVisible]) => isVisible)
      .map(([columnId]) => columnId);
  }, [columnVisibility]);

  // Handle mouse down on resize handle
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, columnId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth =
        columnWidths[columnId] || DEFAULT_COLUMN_WIDTHS[columnId] || 100;

      setResizeState({
        isResizing: true,
        columnId,
        startX,
        startWidth,
      });

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [columnWidths],
  );

  // Handle mouse move during resize
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState || !resizeState.isResizing) return;

      const deltaX = e.clientX - resizeState.startX;
      const newWidth = Math.max(50, resizeState.startWidth + deltaX); // Minimum width of 50px

      setColumnWidths((prev) => ({
        ...prev,
        [resizeState.columnId]: newWidth,
      }));
    },
    [resizeState],
  );

  // Handle mouse up to end resize
  const handleResizeEnd = useCallback(() => {
    if (resizeState && resizeState.isResizing) {
      saveColumnWidths(columnWidths);
      setResizeState(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  }, [resizeState, columnWidths, saveColumnWidths]);

  // Add global mouse event listeners for resizing
  useEffect(() => {
    if (resizeState?.isResizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);

      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [resizeState, handleResizeMove, handleResizeEnd]);

  // Fetch total ticket count from API
  const fetchTotalCount = async () => {
    if (connectionStatus === "disconnected") {
      return; // Skip if we're in offline mode
    }

    setCountLoading(true);
    try {
      const count = await frappeApi.getTotalTicketCount();
      setTotalTicketCount(count);
    } catch (err) {
      console.error("Error fetching total ticket count:", err);
      // Don't show error toast for count failures, just log it
      setTotalTicketCount(null);
    } finally {
      setCountLoading(false);
    }
  };

  const fetchTickets = async (showLoading = true, page = currentPage) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsPageLoading(true);
    }
    setError(null);
    setConnectionStatus("testing");

    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Try to fetch from Frappe API first with pagination
      const data = await frappeApi.getTickets(pageSize, offset);
      setTickets(data);
      setConnectionStatus("connected");
      setError(null);

      // Fetch total count after successful ticket fetch
      fetchTotalCount();
    } catch (err) {
      console.error("Error fetching tickets from Frappe API:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to Frappe API";
      setError(errorMessage);
      setConnectionStatus("disconnected");

      // Reset total count when disconnected
      setTotalTicketCount(null);

      // Fallback to mock data with a delay to simulate loading
      await new Promise((resolve) => setTimeout(resolve, 800));

      // For mock data, simulate pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMockTickets = mockTickets.slice(startIndex, endIndex);
      setTickets(paginatedMockTickets);
    } finally {
      setLoading(false);
      setIsPageLoading(false);
    }
  };

  const handleConfigChange = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    frappeApi.updateConfig(newConfig);

    // Store in localStorage for persistence
    localStorage.setItem("frappe-api-config", JSON.stringify(newConfig));

    // Reset pagination and total count when config changes
    setCurrentPage(1);
    setTotalTicketCount(null);

    // Trigger a refresh to test the new configuration
    setTimeout(() => {
      fetchTickets(true, 1);
    }, 100);
  };

  const handleTestConnection = async (testConfig: ApiConfig) => {
    try {
      // Call the frappeApi testConnection method which returns the full result object
      const result = await frappeApi.testConnection(testConfig);
      return result;
    } catch (error) {
      console.error("Connection test error:", error);
      // Return a properly formatted error result
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Connection test failed",
        details: error,
        suggestions: [
          "Check your network connection",
          "Verify the base URL is correct",
          "Ensure your API token is valid",
          "Check if the Frappe server is running",
        ],
      };
    }
  };

  const handleTicketCreated = (newTicket: FrappeTicket) => {
    // Add the new ticket to the beginning of the list
    setTickets((prev) => [newTicket, ...prev]);

    // Update total count if we have it
    if (totalTicketCount !== null) {
      setTotalTicketCount((prev) => (prev || 0) + 1);
    }

    // Show additional success info
    console.log("New ticket created:", newTicket);
  };

  const handleSubmitTicket = async (ticketId: string) => {
    setActionLoading(ticketId);
    try {
      if (connectionStatus === "connected") {
        await frappeApi.submitTicket(ticketId);
        await fetchTickets(false); // Refresh without showing loader

        toast.success("Ticket submitted successfully!", {
          description: `Ticket ${ticketId} has been submitted and is now active.`,
        });
      } else {
        // For demo when disconnected, update local state
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.name === ticketId
              ? {
                  ...ticket,
                  docstatus: 1,
                  modified: new Date().toISOString(),
                }
              : ticket,
          ),
        );

        toast.success("Ticket submitted (Demo Mode)", {
          description: `Ticket ${ticketId} status updated locally.`,
        });
      }
    } catch (err) {
      console.error("Error submitting ticket:", err);
      toast.error("Failed to submit ticket", {
        description: err instanceof Error ? err.message : "Please try again.",
      });

      // Fallback to local state update
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.name === ticketId
            ? {
                ...ticket,
                docstatus: 1,
                modified: new Date().toISOString(),
              }
            : ticket,
        ),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    setActionLoading(ticketId);
    try {
      if (connectionStatus === "connected") {
        await frappeApi.cancelTicket(ticketId);
        await fetchTickets(false);

        toast.success("Ticket cancelled successfully!", {
          description: `Ticket ${ticketId} has been cancelled.`,
        });
      } else {
        // For demo when disconnected, update local state
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.name === ticketId
              ? {
                  ...ticket,
                  docstatus: 2,
                  modified: new Date().toISOString(),
                }
              : ticket,
          ),
        );

        toast.success("Ticket cancelled (Demo Mode)", {
          description: `Ticket ${ticketId} status updated locally.`,
        });
      }
    } catch (err) {
      console.error("Error cancelling ticket:", err);
      toast.error("Failed to cancel ticket", {
        description: err instanceof Error ? err.message : "Please try again.",
      });

      // Fallback to local state update
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.name === ticketId
            ? {
                ...ticket,
                docstatus: 2,
                modified: new Date().toISOString(),
              }
            : ticket,
        ),
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Handle ticket row click to show details
  const handleTicketClick = (ticket: FrappeTicket) => {
    setSelectedTicket(ticket);
    setDetailsPopoverOpen(true);
  };

  // Enhanced sorting functions for new fields
  const sortFunctions = {
    name: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.name || "").toLowerCase();
      const bVal = (b.name || "").toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === "asc" ? result : -result;
    },
    ticket_id: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.ticket_id || a.name || "").toLowerCase();
      const bVal = (b.ticket_id || b.name || "").toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === "asc" ? result : -result;
    },
    title: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.title || "").toLowerCase();
      const bVal = (b.title || "").toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === "asc" ? result : -result;
    },
    user_name: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.user_name || "").toLowerCase();
      const bVal = (b.user_name || "").toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === "asc" ? result : -result;
    },
    department: (
      a: FrappeTicket,
      b: FrappeTicket,
      direction: SortDirection,
    ) => {
      const aVal = (a.department || "").toLowerCase();
      const bVal = (b.department || "").toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === "asc" ? result : -result;
    },
    priority: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const priorityOrder = {
        Critical: 4,
        High: 3,
        Medium: 2,
        Low: 1,
      };
      const aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      const result = aVal - bVal;
      return direction === "asc" ? result : -result;
    },
    status: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.status || "").toLowerCase();
      const bVal = (b.status || "").toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === "asc" ? result : -result;
    },
    category: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.category || "").toLowerCase();
      const bVal = (b.category || "").toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === "asc" ? result : -result;
    },
    created_datetime: (
      a: FrappeTicket,
      b: FrappeTicket,
      direction: SortDirection,
    ) => {
      const aVal = a.created_datetime
        ? new Date(a.created_datetime).getTime()
        : 0;
      const bVal = b.created_datetime
        ? new Date(b.created_datetime).getTime()
        : 0;
      const result = aVal - bVal;
      return direction === "asc" ? result : -result;
    },
    due_datetime: (
      a: FrappeTicket,
      b: FrappeTicket,
      direction: SortDirection,
    ) => {
      const aVal = a.due_datetime ? new Date(a.due_datetime).getTime() : 0;
      const bVal = b.due_datetime ? new Date(b.due_datetime).getTime() : 0;
      const result = aVal - bVal;
      return direction === "asc" ? result : -result;
    },
    assignee: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.assignee || "").toLowerCase();
      const bVal = (b.assignee || "").toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === "asc" ? result : -result;
    },
  };

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    setSortCriteria((prevCriteria) => {
      // Check if this field is already being sorted
      const existingIndex = prevCriteria.findIndex(
        (criteria) => criteria.field === field,
      );

      if (existingIndex >= 0) {
        // Field is already in sort criteria
        const existingCriteria = prevCriteria[existingIndex];
        const newCriteria = [...prevCriteria];

        if (existingCriteria.direction === "asc") {
          // Change to descending
          newCriteria[existingIndex] = {
            field,
            direction: "desc",
          };
        } else {
          // Remove this sort criteria (was descending, now remove)
          newCriteria.splice(existingIndex, 1);
        }

        return newCriteria;
      } else {
        // Add new sort criteria (ascending by default)
        return [...prevCriteria, { field, direction: "asc" }];
      }
    });
  };

  // Get sort indicator for a column - Enhanced with larger, more visible icons
  const getSortIndicator = (field: SortField) => {
    const criteria = sortCriteria.find((c) => c.field === field);
    if (!criteria) {
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted/80 transition-colors">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
        </div>
      );
    }

    const index = sortCriteria.findIndex((c) => c.field === field);
    const priority = sortCriteria.length > 1 ? index + 1 : null;

    return (
      <div className="flex items-center gap-1 bg-theme-accent/10 rounded px-1.5 py-1 border border-theme-accent/20">
        <div className="flex items-center justify-center">
          {criteria.direction === "asc" ? (
            <ChevronUp className="w-5 h-5 text-theme-accent font-bold stroke-[2.5]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-theme-accent font-bold stroke-[2.5]" />
          )}
        </div>
        {priority && (
          <div className="flex items-center justify-center w-4 h-4 bg-theme-accent text-theme-accent-foreground rounded-full text-xs font-bold leading-none">
            {priority}
          </div>
        )}
      </div>
    );
  };

  // Get unique values for filter dropdowns (based on current ticket data)
  const uniqueValues = useMemo(() => {
    return {
      statuses: [
        ...new Set(tickets.map((ticket) => ticket.status).filter(Boolean)),
      ].sort(),
      priorities: [
        ...new Set(tickets.map((ticket) => ticket.priority).filter(Boolean)),
      ].sort(),
      categories: [
        ...new Set(tickets.map((ticket) => ticket.category).filter(Boolean)),
      ].sort(),
      impacts: [
        ...new Set(tickets.map((ticket) => ticket.impact).filter(Boolean)),
      ].sort(),
      users: [
        ...new Set(tickets.map((ticket) => ticket.user_name).filter(Boolean)),
      ].sort(),
      assignees: [
        ...new Set(tickets.map((ticket) => ticket.assignee).filter(Boolean)),
      ].sort(),
      departments: [
        ...new Set(tickets.map((ticket) => ticket.department).filter(Boolean)),
      ].sort(),
    };
  }, [tickets]);

  // Enhanced filtering for new fields (using applied filters, not pending)
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Apply search filter across multiple fields (using applied search query)
    if (appliedSearchQuery.trim()) {
      const query = appliedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (ticket) =>
          ticket.name?.toLowerCase().includes(query) ||
          ticket.ticket_id?.toLowerCase().includes(query) ||
          ticket.title?.toLowerCase().includes(query) ||
          ticket.user_name?.toLowerCase().includes(query) ||
          ticket.description?.toLowerCase().includes(query) ||
          ticket.department?.toLowerCase().includes(query) ||
          ticket.category?.toLowerCase().includes(query) ||
          ticket.tags?.toLowerCase().includes(query),
      );
    }

    // Apply all filters (using applied filters, not pending)
    if (appliedFilters.status.length > 0) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.status && appliedFilters.status.includes(ticket.status),
      );
    }

    if (appliedFilters.priority.length > 0) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.priority && appliedFilters.priority.includes(ticket.priority),
      );
    }

    if (appliedFilters.category.length > 0) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.category && appliedFilters.category.includes(ticket.category),
      );
    }

    if (appliedFilters.impact.length > 0) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.impact && appliedFilters.impact.includes(ticket.impact),
      );
    }

    if (appliedFilters.users.length > 0) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.user_name && appliedFilters.users.includes(ticket.user_name),
      );
    }

    if (appliedFilters.assignees.length > 0) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.assignee && appliedFilters.assignees.includes(ticket.assignee),
      );
    }

    if (appliedFilters.departments.length > 0) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.department &&
          appliedFilters.departments.includes(ticket.department),
      );
    }

    // Apply date range filter
    if (appliedFilters.dateRange !== "all") {
      const now = new Date();
      let dateThreshold: Date;

      switch (appliedFilters.dateRange) {
        case "7days":
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90days":
          dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(0);
      }

      filtered = filtered.filter((ticket) => {
        const ticketDate = ticket.created_datetime
          ? new Date(ticket.created_datetime)
          : ticket.creation
            ? new Date(ticket.creation)
            : null;
        return ticketDate && ticketDate >= dateThreshold;
      });
    }

    return filtered;
  }, [tickets, appliedSearchQuery, appliedFilters]);

  // Sort filtered tickets based on current criteria
  const sortedTickets = useMemo(() => {
    if (sortCriteria.length === 0) {
      return filteredTickets;
    }

    return [...filteredTickets].sort((a, b) => {
      // Apply each sort criteria in order
      for (const criteria of sortCriteria) {
        const result = sortFunctions[criteria.field](a, b, criteria.direction);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    });
  }, [filteredTickets, sortCriteria]);

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    // Use all available tickets for current page stats, not just filtered ones
    const currentPageTickets = tickets;

    const openTickets = currentPageTickets.filter(
      (ticket) =>
        ticket.status &&
        ["New", "In Progress", "Waiting for Info"].includes(ticket.status),
    ).length;

    const criticalPriorityTickets = currentPageTickets.filter(
      (ticket) => ticket.priority === "Critical",
    ).length;

    const resolvedTodayTickets = currentPageTickets.filter((ticket) => {
      if (ticket.resolution_datetime) {
        const resolutionDate = new Date(ticket.resolution_datetime);
        return resolutionDate >= todayStart;
      }
      return false;
    }).length;

    return {
      totalTickets:
        totalTicketCount !== null
          ? totalTicketCount
          : connectionStatus === "disconnected"
            ? mockTickets.length
            : 0,
      openTickets,
      criticalPriorityTickets,
      resolvedTodayTickets,
    };
  }, [tickets, totalTicketCount, connectionStatus]);

  // Clear all sorting
  const clearAllSorting = () => {
    setSortCriteria([]);
    toast.success("Sorting cleared", {
      description: "All sorting criteria have been removed.",
    });
  };

  // Apply filters and search - this is the main function that applies pending changes
  const applyFilters = () => {
    setAppliedFilters({ ...pendingFilters });
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(1); // Reset to first page when applying filters

    // Count applied filters for toast message
    const totalActiveFilters = [
      ...pendingFilters.status,
      ...pendingFilters.priority,
      ...pendingFilters.category,
      ...pendingFilters.impact,
      ...pendingFilters.users,
      ...pendingFilters.assignees,
      ...pendingFilters.departments,
      ...(pendingFilters.dateRange !== "all" ? [pendingFilters.dateRange] : []),
    ].length;

    const searchActive = searchQuery.trim().length > 0;

    let description = "";
    if (totalActiveFilters > 0 && searchActive) {
      description = `Applied ${totalActiveFilters} filters and search query`;
    } else if (totalActiveFilters > 0) {
      description = `Applied ${totalActiveFilters} active filters`;
    } else if (searchActive) {
      description = `Applied search query: "${searchQuery.trim()}"`;
    } else {
      description = "Showing all tickets";
    }

    toast.success("Filters applied", { description });
  };

  // Clear all filters and search
  const clearAllFilters = () => {
    const clearedFilters = {
      status: [],
      priority: [],
      category: [],
      impact: [],
      users: [],
      assignees: [],
      departments: [],
      dateRange: "all",
    };

    setSearchQuery("");
    setPendingFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setAppliedSearchQuery("");
    setCurrentPage(1); // Reset to first page when clearing filters

    toast.success("Filters cleared", {
      description: "All filters and search have been reset.",
    });
  };

  // Check if there are unapplied changes
  const hasUnappliedChanges = useMemo(() => {
    const filtersChanged =
      JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters);
    const searchChanged = searchQuery !== appliedSearchQuery;
    return filtersChanged || searchChanged;
  }, [pendingFilters, appliedFilters, searchQuery, appliedSearchQuery]);

  // Count active filters for display
  const activeFilterCount = useMemo(() => {
    return (
      [
        ...appliedFilters.status,
        ...appliedFilters.priority,
        ...appliedFilters.category,
        ...appliedFilters.impact,
        ...appliedFilters.users,
        ...appliedFilters.assignees,
        ...appliedFilters.departments,
        ...(appliedFilters.dateRange !== "all"
          ? [appliedFilters.dateRange]
          : []),
      ].length + (appliedSearchQuery.trim() ? 1 : 0)
    );
  }, [appliedFilters, appliedSearchQuery]);

  // Pagination helpers
  const totalPages = totalTicketCount
    ? Math.ceil(totalTicketCount / pageSize)
    : Math.ceil(mockTickets.length / pageSize);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchTickets(false, newPage);
      toast.success(`Loading page ${newPage}`, {
        description: `Fetching batch ${(newPage - 1) * pageSize + 1}-${newPage * pageSize} of ${totalTicketCount || "N/A"} tickets`,
      });
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchTickets(false, newPage);
      toast.success(`Loading page ${newPage}`, {
        description: `Fetching batch ${(newPage - 1) * pageSize + 1}-${Math.min(newPage * pageSize, totalTicketCount || newPage * pageSize)} of ${totalTicketCount || "N/A"} tickets`,
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchTickets(false, page);
      toast.success(`Loading page ${page}`, {
        description: `Fetching batch ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalTicketCount || page * pageSize)} of ${totalTicketCount || "N/A"} tickets`,
      });
    }
  };

  // Get pagination range - show 5 pages around current page
  const getPaginationRange = () => {
    const delta = 2; // Show 2 pages before and after current page
    const range = [];
    const rangeStart = Math.max(1, currentPage - delta);
    const rangeEnd = Math.min(totalPages, currentPage + delta);

    // Always show first page
    if (rangeStart > 1) {
      range.push(1);
      if (rangeStart > 2) {
        range.push("...");
      }
    }

    // Add pages around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }

    // Always show last page
    if (rangeEnd < totalPages) {
      if (rangeEnd < totalPages - 1) {
        range.push("...");
      }
      range.push(totalPages);
    }

    return range;
  };

  // Generic filter handler (updates pending filters)
  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string,
    checked: boolean,
  ) => {
    setPendingFilters((prev) => ({
      ...prev,
      [filterType]: checked
        ? [...(prev[filterType] as string[]), value]
        : (prev[filterType] as string[]).filter((item) => item !== value),
    }));
  };

  // Handle bulk actions
  const handleBulkSubmit = async () => {
    if (selectedTickets.length === 0) {
      toast.error("No tickets selected");
      return;
    }

    toast.success(`Submitting ${selectedTickets.length} tickets...`);
    setSelectedTickets([]);
  };

  const handleBulkCancel = async () => {
    if (selectedTickets.length === 0) {
      toast.error("No tickets selected");
      return;
    }

    toast.success(`Archiving ${selectedTickets.length} tickets...`);
    setSelectedTickets([]);
  };

  // Export functions
  const handleExport = (format: "csv" | "excel") => {
    const dataToExport = sortedTickets;
    const count = dataToExport.length;

    if (count === 0) {
      toast.error("No data to export", {
        description: "Apply filters to get data or check your search criteria.",
      });
      return;
    }

    // Create CSV content
    if (format === "csv") {
      const headers = [
        "Ticket ID",
        "Title",
        "User",
        "Department",
        "Priority",
        "Status",
        "Category",
        "Created",
        "Due Date",
        "Assignee",
      ];
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((ticket) =>
          [
            ticket.ticket_id || ticket.name || "",
            `"${(ticket.title || "").replace(/"/g, '""')}"`,
            ticket.user_name || "",
            ticket.department || "",
            ticket.priority || "",
            ticket.status || "",
            ticket.category || "",
            ticket.created_datetime
              ? new Date(ticket.created_datetime).toLocaleDateString()
              : "",
            ticket.due_datetime
              ? new Date(ticket.due_datetime).toLocaleDateString()
              : "",
            ticket.assignee || "",
          ].join(","),
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `tickets_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${count} tickets to CSV`, {
        description: `File saved as tickets_${new Date().toISOString().split("T")[0]}.csv`,
      });
    } else {
      toast.info("Excel export not implemented", {
        description:
          "Excel export feature will be available in a future update.",
      });
    }
  };

  // Load saved config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("frappe-api-config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setApiConfig(parsed);
        frappeApi.updateConfig(parsed);
      } catch (error) {
        console.error("Failed to parse saved API config:", error);
      }
    }

    // Initial fetch
    fetchTickets();
  }, []);

  // Get priority badge color
  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "high":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "low":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    }
  };

  // Get status badge color
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "in progress":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "waiting for info":
        return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "resolved":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "closed":
        return "bg-gray-500 hover:bg-gray-600 text-white";
      default:
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    }
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleString("en-US", {
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

  return (
    <div className="space-y-6 bg-background text-foreground mytick-theme">
      {/* Header */}
      <Card className="bg-card border-border mytick-theme">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-theme-accent" />
                <CardTitle className="text-card-foreground">
                  Frappe Ticket Dashboard
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                )}
                {connectionStatus === "disconnected" && (
                  <div className="flex items-center gap-1 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">Offline Mode</span>
                  </div>
                )}
                {connectionStatus === "testing" && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Testing...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Active Filter Indicator */}
              {(activeFilterCount > 0 || sortCriteria.length > 0) && (
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-theme-accent/10 text-theme-accent border-theme-accent/20"
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      {activeFilterCount} Filter
                      {activeFilterCount > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {sortCriteria.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-theme-accent/10 text-theme-accent border-theme-accent/20"
                    >
                      <ArrowUpDown className="w-3 h-3 mr-1" />
                      {sortCriteria.length} Sort
                      {sortCriteria.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              )}

              {/* Ticket Count Display */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {sortedTickets.length} of{" "}
                  {totalTicketCount !== null
                    ? totalTicketCount
                    : mockTickets.length}{" "}
                  tickets
                </span>
                {countLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTickets()}
                disabled={loading}
                className="border-border text-foreground hover:bg-accent"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewTicketDialogOpen(true)}
                className="border-border text-foreground hover:bg-accent"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigDialogOpen(true)}
                className="border-border text-foreground hover:bg-accent"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <CardDescription className="text-muted-foreground">
            Manage and track support tickets from your Frappe/ERPNext instance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Stats Section - Theme Aware */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets - Primary Theme Card */}
        <Card className="bg-theme-accent/5 border-theme-accent/20 mytick-theme">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="bg-theme-accent text-theme-accent-foreground rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <List className="w-5 h-5" />
                      <span className="text-sm font-medium">Total Tickets</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {countLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        overviewStats.totalTickets
                      )}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {connectionStatus === "connected"
                    ? "Server: total ticket count"
                    : "Showing 50 of 31"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Tickets - Secondary Theme Card */}
        <Card className="bg-secondary/50 border-secondary mytick-theme">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">Open Tickets</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {overviewStats.openTickets}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Active support requests [current page]
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Priority - Destructive Theme Card */}
        <Card className="bg-destructive/5 border-destructive/20 mytick-theme">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="bg-destructive text-destructive-foreground rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Critical Priority
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {overviewStats.criticalPriorityTickets}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires immediate attention [current page]
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resolved Today - Success Theme Card */}
        <Card className="bg-muted/50 border-muted mytick-theme">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="bg-muted text-muted-foreground rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Resolved Today
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {overviewStats.resolvedTodayTickets}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed support tickets [current page]
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-900 mytick-theme">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>Connection Error:</strong> {error}
            <br />
            <span className="text-sm opacity-90">
              Currently showing demo data. Check your API configuration and try
              refreshing.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="bg-card border-border mytick-theme p-6">
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by ID, title, user, description, category, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input-background border-border text-foreground"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-between border-border text-foreground hover:bg-accent"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Status{" "}
                    {pendingFilters.status.length > 0 &&
                      `(${pendingFilters.status.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">
                    Filter by Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.statuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={pendingFilters.status.includes(status)}
                      onCheckedChange={(checked) =>
                        handleFilterChange("status", status, checked)
                      }
                      className="text-popover-foreground hover:bg-accent"
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Priority Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-between border-border text-foreground hover:bg-accent"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Priority{" "}
                    {pendingFilters.priority.length > 0 &&
                      `(${pendingFilters.priority.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">
                    Filter by Priority
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.priorities.map((priority) => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={pendingFilters.priority.includes(priority)}
                      onCheckedChange={(checked) =>
                        handleFilterChange("priority", priority, checked)
                      }
                      className="text-popover-foreground hover:bg-accent"
                    >
                      {priority}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-between border-border text-foreground hover:bg-accent"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Category{" "}
                    {pendingFilters.category.length > 0 &&
                      `(${pendingFilters.category.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">
                    Filter by Category
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={pendingFilters.category.includes(category)}
                      onCheckedChange={(checked) =>
                        handleFilterChange("category", category, checked)
                      }
                      className="text-popover-foreground hover:bg-accent"
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Users Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-between border-border text-foreground hover:bg-accent"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Users{" "}
                    {pendingFilters.users.length > 0 &&
                      `(${pendingFilters.users.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">
                    Filter by User
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.users.map((user) => (
                    <DropdownMenuCheckboxItem
                      key={user}
                      checked={pendingFilters.users.includes(user)}
                      onCheckedChange={(checked) =>
                        handleFilterChange("users", user, checked)
                      }
                      className="text-popover-foreground hover:bg-accent"
                    >
                      {user}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Assignee Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-between border-border text-foreground hover:bg-accent"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assignee{" "}
                    {pendingFilters.assignees.length > 0 &&
                      `(${pendingFilters.assignees.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">
                    Filter by Assignee
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.assignees.map((assignee) => (
                    <DropdownMenuCheckboxItem
                      key={assignee}
                      checked={pendingFilters.assignees.includes(assignee)}
                      onCheckedChange={(checked) =>
                        handleFilterChange("assignees", assignee, checked)
                      }
                      className="text-popover-foreground hover:bg-accent"
                    >
                      {assignee}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Department Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-between border-border text-foreground hover:bg-accent"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Department{" "}
                    {pendingFilters.departments.length > 0 &&
                      `(${pendingFilters.departments.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">
                    Filter by Department
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.departments.map((department) => (
                    <DropdownMenuCheckboxItem
                      key={department}
                      checked={pendingFilters.departments.includes(department)}
                      onCheckedChange={(checked) =>
                        handleFilterChange("departments", department, checked)
                      }
                      className="text-popover-foreground hover:bg-accent"
                    >
                      {department}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Date Range Filter */}
              <Select
                value={pendingFilters.dateRange}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    dateRange: value,
                  }))
                }
              >
                <SelectTrigger className="bg-input-background border-border text-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem
                    value="all"
                    className="text-popover-foreground hover:bg-accent"
                  >
                    All Time
                  </SelectItem>
                  <SelectItem
                    value="7days"
                    className="text-popover-foreground hover:bg-accent"
                  >
                    Last 7 days
                  </SelectItem>
                  <SelectItem
                    value="30days"
                    className="text-popover-foreground hover:bg-accent"
                  >
                    Last 30 days
                  </SelectItem>
                  <SelectItem
                    value="90days"
                    className="text-popover-foreground hover:bg-accent"
                  >
                    Last 90 days
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Bulk Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-between border-border text-foreground hover:bg-accent"
                  >
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Actions
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">
                    Bulk Actions
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleBulkSubmit}
                    className="text-popover-foreground hover:bg-accent"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleBulkCancel}
                    className="text-popover-foreground hover:bg-accent"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => handleExport("csv")}
                    className="text-popover-foreground hover:bg-accent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExport("excel")}
                    className="text-popover-foreground hover:bg-accent"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Filter Actions Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={applyFilters}
                  disabled={!hasUnappliedChanges}
                  className={`${
                    hasUnappliedChanges
                      ? "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  } transition-colors`}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Apply Filters
                  {hasUnappliedChanges && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-white/20 text-current"
                    >
                      {
                        [
                          ...Object.values(pendingFilters).flat(),
                          ...(pendingFilters.dateRange !== "all"
                            ? [pendingFilters.dateRange]
                            : []),
                          ...(searchQuery.trim() ? ["search"] : []),
                        ].length
                      }
                    </Badge>
                  )}
                </Button>

                {(activeFilterCount > 0 || appliedSearchQuery) && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <FilterX className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}

                {sortCriteria.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllSorting}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Clear Sorting
                  </Button>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {hasUnappliedChanges && (
                  <span className="text-theme-accent">
                    {
                      [
                        ...Object.values(pendingFilters).flat(),
                        ...(pendingFilters.dateRange !== "all"
                          ? [pendingFilters.dateRange]
                          : []),
                        ...(searchQuery.trim() ? ["search"] : []),
                      ].length
                    }{" "}
                    unapplied changes
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-card border-border mytick-theme">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-card-foreground">
              Tickets ({sortedTickets.length}
              {sortedTickets.length !== tickets.length &&
                ` of ${tickets.length}`}
              )
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* next prev button for betch records fetching*/}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!canGoPrevious || isPageLoading}
                  className="border-border text-foreground hover:bg-accent"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPaginationRange().map((page, index) => (
                    <div key={index}>
                      {page === "..." ? (
                        <span className="px-2 py-1 text-muted-foreground">
                          ...
                        </span>
                      ) : (
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          disabled={isPageLoading}
                          className={
                            currentPage === page
                              ? "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                              : "border-border text-foreground hover:bg-accent"
                          }
                        >
                          {page}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!canGoNext || isPageLoading}
                  className="border-border text-foreground hover:bg-accent"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                {isPageLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>

              {/* Column Settings Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setColumnSettingsDialogOpen(true)}
                className="border-border text-foreground hover:bg-accent"
              >
                <Columns className="w-4 h-4 mr-2" />
                Columns
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs bg-theme-accent/10 text-theme-accent"
                >
                  {visibleColumns.length}
                </Badge>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-theme-accent" />
                <span>Loading tickets...</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div
                ref={tableRef}
                className="overflow-x-auto"
                style={{
                  maxWidth: "100%",
                  userSelect: resizeState?.isResizing ? "none" : "auto",
                }}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                      {/* Select Column */}
                      {columnVisibility.select && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 relative"
                          style={{
                            width: columnWidths.select,
                            minWidth: 50,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedTickets.length === sortedTickets.length &&
                              sortedTickets.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTickets(
                                  sortedTickets.map((t) => t.name),
                                );
                              } else {
                                setSelectedTickets([]);
                              }
                            }}
                            className="rounded border-border"
                          />
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent"
                            onMouseDown={(e) => handleResizeStart(e, "select")}
                          />
                        </TableHead>
                      )}

                      {/* Ticket ID Column */}
                      {columnVisibility.ticket_id && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.ticket_id,
                            minWidth: 120,
                          }}
                          onClick={() => handleSort("ticket_id")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Ticket ID</span>
                            {getSortIndicator("ticket_id")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) =>
                              handleResizeStart(e, "ticket_id")
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* Title Column */}
                      {columnVisibility.title && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.title,
                            minWidth: 200,
                          }}
                          onClick={() => handleSort("title")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Title</span>
                            {getSortIndicator("title")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) => handleResizeStart(e, "title")}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* User Name Column */}
                      {columnVisibility.user_name && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.user_name,
                            minWidth: 150,
                          }}
                          onClick={() => handleSort("user_name")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>User</span>
                            {getSortIndicator("user_name")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) =>
                              handleResizeStart(e, "user_name")
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* Department Column */}
                      {columnVisibility.department && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.department,
                            minWidth: 130,
                          }}
                          onClick={() => handleSort("department")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Department</span>
                            {getSortIndicator("department")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) =>
                              handleResizeStart(e, "department")
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* Priority Column */}
                      {columnVisibility.priority && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.priority,
                            minWidth: 100,
                          }}
                          onClick={() => handleSort("priority")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Priority</span>
                            {getSortIndicator("priority")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) =>
                              handleResizeStart(e, "priority")
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* Status Column */}
                      {columnVisibility.status && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.status,
                            minWidth: 120,
                          }}
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Status</span>
                            {getSortIndicator("status")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) => handleResizeStart(e, "status")}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* Category Column */}
                      {columnVisibility.category && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.category,
                            minWidth: 110,
                          }}
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Category</span>
                            {getSortIndicator("category")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) =>
                              handleResizeStart(e, "category")
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* Created Date Column */}
                      {columnVisibility.created_datetime && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.created_datetime,
                            minWidth: 160,
                          }}
                          onClick={() => handleSort("created_datetime")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Created</span>
                            {getSortIndicator("created_datetime")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) =>
                              handleResizeStart(e, "created_datetime")
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* Due Date Column */}
                      {columnVisibility.due_datetime && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.due_datetime,
                            minWidth: 160,
                          }}
                          onClick={() => handleSort("due_datetime")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Due Date</span>
                            {getSortIndicator("due_datetime")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) =>
                              handleResizeStart(e, "due_datetime")
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* Assignee Column */}
                      {columnVisibility.assignee && (
                        <TableHead
                          className="bg-card border-r border-border py-3 px-3 cursor-pointer hover:bg-muted/50 relative group"
                          style={{
                            width: columnWidths.assignee,
                            minWidth: 130,
                          }}
                          onClick={() => handleSort("assignee")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Assignee</span>
                            {getSortIndicator("assignee")}
                          </div>
                          <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-theme-accent/50 active:bg-theme-accent z-10"
                            onMouseDown={(e) =>
                              handleResizeStart(e, "assignee")
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      )}

                      {/* Actions Column */}
                      {columnVisibility.actions && (
                        <TableHead
                          className="bg-card py-3 px-3 relative"
                          style={{
                            width: columnWidths.actions,
                            minWidth: 100,
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Actions</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <Settings className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-popover border-border"
                              >
                                <DropdownMenuItem
                                  onClick={handleResetColumnSettings}
                                  className="text-popover-foreground hover:bg-accent"
                                >
                                  Reset All Column Settings
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {sortedTickets.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={visibleColumns.length}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {appliedSearchQuery || activeFilterCount > 0 ? (
                            <div className="flex flex-col items-center gap-2">
                              <Search className="w-8 h-8 text-muted-foreground/50" />
                              <p>No tickets match your search criteria</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAllFilters}
                                className="border-border text-foreground hover:bg-accent"
                              >
                                Clear filters
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="w-8 h-8 text-muted-foreground/50" />
                              <p>No tickets found</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedTickets.map((ticket) => (
                        <TableRow
                          key={ticket.name}
                          className="border-border hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleTicketClick(ticket)}
                        >
                          {/* Select Cell */}
                          {columnVisibility.select && (
                            <TableCell
                              className="border-r border-border py-2 px-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selectedTickets.includes(ticket.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTickets((prev) => [
                                      ...prev,
                                      ticket.name,
                                    ]);
                                  } else {
                                    setSelectedTickets((prev) =>
                                      prev.filter((id) => id !== ticket.name),
                                    );
                                  }
                                }}
                                className="rounded border-border"
                              />
                            </TableCell>
                          )}

                          {/* Ticket ID Cell */}
                          {columnVisibility.ticket_id && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <div className="font-mono text-sm">
                                {ticket.ticket_id || ticket.name}
                              </div>
                            </TableCell>
                          )}

                          {/* Title Cell */}
                          {columnVisibility.title && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <div className="max-w-full">
                                <div
                                  className="truncate"
                                  title={ticket.title || "No title"}
                                >
                                  {ticket.title || "No title"}
                                </div>
                              </div>
                            </TableCell>
                          )}

                          {/* User Name Cell */}
                          {columnVisibility.user_name && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span
                                  className="truncate"
                                  title={ticket.user_name || "Unassigned"}
                                >
                                  {ticket.user_name || "Unassigned"}
                                </span>
                              </div>
                            </TableCell>
                          )}

                          {/* Department Cell */}
                          {columnVisibility.department && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-muted-foreground" />
                                <span
                                  className="truncate"
                                  title={ticket.department || "N/A"}
                                >
                                  {ticket.department || "N/A"}
                                </span>
                              </div>
                            </TableCell>
                          )}

                          {/* Priority Cell */}
                          {columnVisibility.priority && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <Badge
                                variant="secondary"
                                className={`${getPriorityColor(ticket.priority)} border-0 text-xs`}
                              >
                                {ticket.priority || "None"}
                              </Badge>
                            </TableCell>
                          )}

                          {/* Status Cell */}
                          {columnVisibility.status && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <Badge
                                variant="secondary"
                                className={`${getStatusColor(ticket.status)} border-0 text-xs`}
                              >
                                {ticket.status || "Unknown"}
                              </Badge>
                            </TableCell>
                          )}

                          {/* Category Cell */}
                          {columnVisibility.category && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-muted-foreground" />
                                <span
                                  className="truncate"
                                  title={ticket.category || "None"}
                                >
                                  {ticket.category || "None"}
                                </span>
                              </div>
                            </TableCell>
                          )}

                          {/* Created Date Cell */}
                          {columnVisibility.created_datetime && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {formatDateTime(
                                    ticket.created_datetime || ticket.creation,
                                  )}
                                </span>
                              </div>
                            </TableCell>
                          )}

                          {/* Due Date Cell */}
                          {columnVisibility.due_datetime && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {formatDateTime(ticket.due_datetime)}
                                </span>
                              </div>
                            </TableCell>
                          )}

                          {/* Assignee Cell */}
                          {columnVisibility.assignee && (
                            <TableCell className="border-r border-border py-2 px-3">
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-muted-foreground" />
                                <span
                                  className="truncate"
                                  title={ticket.assignee || "Unassigned"}
                                >
                                  {ticket.assignee || "Unassigned"}
                                </span>
                              </div>
                            </TableCell>
                          )}

                          {/* Actions Cell */}
                          {columnVisibility.actions && (
                            <TableCell
                              className="py-2 px-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTicketClick(ticket)}
                                  className="h-8 w-8 p-0 hover:bg-muted"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>

                                {ticket.docstatus === 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleSubmitTicket(ticket.name)
                                    }
                                    disabled={actionLoading === ticket.name}
                                    className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                  >
                                    {actionLoading === ticket.name ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                  </Button>
                                )}

                                {ticket.docstatus !== 2 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleCancelTicket(ticket.name)
                                    }
                                    disabled={actionLoading === ticket.name}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    {actionLoading === ticket.name ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <XCircle className="w-4 h-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <Card className="bg-card border-border mytick-theme">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}(
                {sortedTickets.length} of{" "}
                {totalTicketCount || mockTickets.length} tickets)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!canGoPrevious || isPageLoading}
                  className="border-border text-foreground hover:bg-accent"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPaginationRange().map((page, index) => (
                    <div key={index}>
                      {page === "..." ? (
                        <span className="px-2 py-1 text-muted-foreground">
                          ...
                        </span>
                      ) : (
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          disabled={isPageLoading}
                          className={
                            currentPage === page
                              ? "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                              : "border-border text-foreground hover:bg-accent"
                          }
                        >
                          {page}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!canGoNext || isPageLoading}
                  className="border-border text-foreground hover:bg-accent"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ApiConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        config={apiConfig}
        onConfigChange={handleConfigChange}
        onTestConnection={handleTestConnection}
      />

      <NewTicketDialog
        open={newTicketDialogOpen}
        onOpenChange={setNewTicketDialogOpen}
        onTicketCreated={handleTicketCreated}
      />

      <TicketDetailsPopover
        ticket={selectedTicket}
        open={detailsPopoverOpen}
        onOpenChange={setDetailsPopoverOpen}
      />

      <ColumnSettingsDialog
        open={columnSettingsDialogOpen}
        onOpenChange={setColumnSettingsDialogOpen}
        columnWidths={columnWidths}
        columnVisibility={columnVisibility}
        onColumnWidthsChange={handleColumnWidthsChange}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onResetToDefaults={handleResetColumnSettings}
      />
    </div>
  );
}

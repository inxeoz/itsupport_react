import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem
} from './ui/dropdown-menu';
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
  ChevronRight
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { frappeApi, mockTickets, type FrappeTicket, DEFAULT_API_CONFIG, type ApiConfig } from '../services/frappeApi';
import { ApiConfigDialog } from './ApiConfigDialog';
import { NewTicketDialog } from './NewTicketDialog';
import { TicketDetailsPopover } from './TicketDetailsPopover';
import { toast } from "sonner";

type SortDirection = 'asc' | 'desc';
type SortField = 'name' | 'ticket_id' | 'title' | 'user_name' | 'department' | 'priority' | 'status' | 'category' | 'created_datetime' | 'due_datetime' | 'assignee';

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
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_API_CONFIG);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isPageLoading, setIsPageLoading] = useState(false);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: [],
    impact: [],
    users: [],
    assignees: [],
    departments: [],
    dateRange: 'all'
  });
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Ticket Details Popover State
  const [selectedTicket, setSelectedTicket] = useState<FrappeTicket | null>(null);
  const [detailsPopoverOpen, setDetailsPopoverOpen] = useState(false);

  // Column resizing state
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
    actions: 100
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
    actions: 100
  };

  // Load column widths from localStorage on mount
  useEffect(() => {
    const savedWidths = localStorage.getItem('frappe-dashboard-column-widths');
    if (savedWidths) {
      try {
        const parsed = JSON.parse(savedWidths);
        setColumnWidths({ ...DEFAULT_COLUMN_WIDTHS, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved column widths:', error);
      }
    }
  }, []);

  // Save column widths to localStorage
  const saveColumnWidths = useCallback((widths: ColumnWidths) => {
    localStorage.setItem('frappe-dashboard-column-widths', JSON.stringify(widths));
  }, []);

  // Handle mouse down on resize handle
  const handleResizeStart = useCallback((e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startWidth = columnWidths[columnId] || DEFAULT_COLUMN_WIDTHS[columnId] || 100;
    
    setResizeState({
      isResizing: true,
      columnId,
      startX,
      startWidth
    });
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [columnWidths]);

  // Handle mouse move during resize
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeState || !resizeState.isResizing) return;
    
    const deltaX = e.clientX - resizeState.startX;
    const newWidth = Math.max(50, resizeState.startWidth + deltaX); // Minimum width of 50px
    
    setColumnWidths(prev => ({
      ...prev,
      [resizeState.columnId]: newWidth
    }));
  }, [resizeState]);

  // Handle mouse up to end resize
  const handleResizeEnd = useCallback(() => {
    if (resizeState && resizeState.isResizing) {
      saveColumnWidths(columnWidths);
      setResizeState(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [resizeState, columnWidths, saveColumnWidths]);

  // Add global mouse event listeners for resizing
  useEffect(() => {
    if (resizeState?.isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizeState, handleResizeMove, handleResizeEnd]);

  // Reset column widths to defaults
  const resetColumnWidths = useCallback(() => {
    setColumnWidths(DEFAULT_COLUMN_WIDTHS);
    saveColumnWidths(DEFAULT_COLUMN_WIDTHS);
    toast.success("Column widths reset to defaults", {
      description: "All column widths have been restored to their default sizes.",
    });
  }, [saveColumnWidths]);

  // Fetch total ticket count from API
  const fetchTotalCount = async () => {
    if (connectionStatus === 'disconnected') {
      return; // Skip if we're in offline mode
    }

    setCountLoading(true);
    try {
      const count = await frappeApi.getTotalTicketCount();
      setTotalTicketCount(count);
    } catch (err) {
      console.error('Error fetching total ticket count:', err);
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
    setConnectionStatus('testing');
    
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;
      
      // Try to fetch from Frappe API first with pagination
      const data = await frappeApi.getTickets(pageSize, offset);
      setTickets(data);
      setConnectionStatus('connected');
      setError(null);
      
      // Fetch total count after successful ticket fetch
      fetchTotalCount();
    } catch (err) {
      console.error('Error fetching tickets from Frappe API:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Frappe API';
      setError(errorMessage);
      setConnectionStatus('disconnected');
      
      // Reset total count when disconnected
      setTotalTicketCount(null);
      
      // Fallback to mock data with a delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
    localStorage.setItem('frappe-api-config', JSON.stringify(newConfig));
    
    // Reset pagination and total count when config changes
    setCurrentPage(1);
    setTotalTicketCount(null);
    
    // Trigger a refresh to test the new configuration
    setTimeout(() => {
      fetchTickets(true, 1);
    }, 100);
  };

  const handleTestConnection = async (testConfig: ApiConfig): Promise<boolean> => {
    try {
      return await frappeApi.testConnection(testConfig);
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  };

  const handleTicketCreated = (newTicket: FrappeTicket) => {
    // Add the new ticket to the beginning of the list
    setTickets(prev => [newTicket, ...prev]);
    
    // Update total count if we have it
    if (totalTicketCount !== null) {
      setTotalTicketCount(prev => (prev || 0) + 1);
    }
    
    // Show additional success info
    console.log('New ticket created:', newTicket);
  };

  const handleSubmitTicket = async (ticketId: string) => {
    setActionLoading(ticketId);
    try {
      if (connectionStatus === 'connected') {
        await frappeApi.submitTicket(ticketId);
        await fetchTickets(false); // Refresh without showing loader
        
        toast.success("Ticket submitted successfully!", {
          description: `Ticket ${ticketId} has been submitted and is now active.`,
        });
      } else {
        // For demo when disconnected, update local state
        setTickets(prev => prev.map(ticket => 
          ticket.name === ticketId 
            ? { ...ticket, docstatus: 1, modified: new Date().toISOString() }
            : ticket
        ));
        
        toast.success("Ticket submitted (Demo Mode)", {
          description: `Ticket ${ticketId} status updated locally.`,
        });
      }
    } catch (err) {
      console.error('Error submitting ticket:', err);
      toast.error("Failed to submit ticket", {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
      
      // Fallback to local state update
      setTickets(prev => prev.map(ticket => 
        ticket.name === ticketId 
          ? { ...ticket, docstatus: 1, modified: new Date().toISOString() }
          : ticket
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    setActionLoading(ticketId);
    try {
      if (connectionStatus === 'connected') {
        await frappeApi.cancelTicket(ticketId);
        await fetchTickets(false);
        
        toast.success("Ticket cancelled successfully!", {
          description: `Ticket ${ticketId} has been cancelled.`,
        });
      } else {
        // For demo when disconnected, update local state
        setTickets(prev => prev.map(ticket => 
          ticket.name === ticketId 
            ? { ...ticket, docstatus: 2, modified: new Date().toISOString() }
            : ticket
        ));
        
        toast.success("Ticket cancelled (Demo Mode)", {
          description: `Ticket ${ticketId} status updated locally.`,
        });
      }
    } catch (err) {
      console.error('Error cancelling ticket:', err);
      toast.error("Failed to cancel ticket", {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
      
      // Fallback to local state update
      setTickets(prev => prev.map(ticket => 
        ticket.name === ticketId 
          ? { ...ticket, docstatus: 2, modified: new Date().toISOString() }
          : ticket
      ));
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
      const aVal = (a.name || '').toLowerCase();
      const bVal = (b.name || '').toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === 'asc' ? result : -result;
    },
    ticket_id: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.ticket_id || a.name || '').toLowerCase();
      const bVal = (b.ticket_id || b.name || '').toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === 'asc' ? result : -result;
    },
    title: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.title || '').toLowerCase();
      const bVal = (b.title || '').toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === 'asc' ? result : -result;
    },
    user_name: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.user_name || '').toLowerCase();
      const bVal = (b.user_name || '').toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === 'asc' ? result : -result;
    },
    department: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.department || '').toLowerCase();
      const bVal = (b.department || '').toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === 'asc' ? result : -result;
    },
    priority: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      const result = aVal - bVal;
      return direction === 'asc' ? result : -result;
    },
    status: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.status || '').toLowerCase();
      const bVal = (b.status || '').toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === 'asc' ? result : -result;
    },
    category: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.category || '').toLowerCase();
      const bVal = (b.category || '').toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === 'asc' ? result : -result;
    },
    created_datetime: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = a.created_datetime ? new Date(a.created_datetime).getTime() : 0;
      const bVal = b.created_datetime ? new Date(b.created_datetime).getTime() : 0;
      const result = aVal - bVal;
      return direction === 'asc' ? result : -result;
    },
    due_datetime: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = a.due_datetime ? new Date(a.due_datetime).getTime() : 0;
      const bVal = b.due_datetime ? new Date(b.due_datetime).getTime() : 0;
      const result = aVal - bVal;
      return direction === 'asc' ? result : -result;
    },
    assignee: (a: FrappeTicket, b: FrappeTicket, direction: SortDirection) => {
      const aVal = (a.assignee || '').toLowerCase();
      const bVal = (b.assignee || '').toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === 'asc' ? result : -result;
    },
  };

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    setSortCriteria(prevCriteria => {
      // Check if this field is already being sorted
      const existingIndex = prevCriteria.findIndex(criteria => criteria.field === field);
      
      if (existingIndex >= 0) {
        // Field is already in sort criteria
        const existingCriteria = prevCriteria[existingIndex];
        const newCriteria = [...prevCriteria];
        
        if (existingCriteria.direction === 'asc') {
          // Change to descending
          newCriteria[existingIndex] = { field, direction: 'desc' };
        } else {
          // Remove this sort criteria (was descending, now remove)
          newCriteria.splice(existingIndex, 1);
        }
        
        return newCriteria;
      } else {
        // Add new sort criteria (ascending by default)
        return [...prevCriteria, { field, direction: 'asc' }];
      }
    });
  };

  // Get sort indicator for a column - Enhanced with larger, more visible icons
  const getSortIndicator = (field: SortField) => {
    const criteria = sortCriteria.find(c => c.field === field);
    if (!criteria) {
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted/80 transition-colors">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
        </div>
      );
    }
    
    const index = sortCriteria.findIndex(c => c.field === field);
    const priority = sortCriteria.length > 1 ? index + 1 : null;
    
    return (
      <div className="flex items-center gap-1 bg-theme-accent/10 rounded px-1.5 py-1 border border-theme-accent/20">
        <div className="flex items-center justify-center">
          {criteria.direction === 'asc' ? (
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

  // Get unique values for filter dropdowns
  const uniqueValues = useMemo(() => {
    return {
      statuses: [...new Set(tickets.map(ticket => ticket.status).filter(Boolean))].sort(),
      priorities: [...new Set(tickets.map(ticket => ticket.priority).filter(Boolean))].sort(),
      categories: [...new Set(tickets.map(ticket => ticket.category).filter(Boolean))].sort(),
      impacts: [...new Set(tickets.map(ticket => ticket.impact).filter(Boolean))].sort(),
      users: [...new Set(tickets.map(ticket => ticket.user_name).filter(Boolean))].sort(),
      assignees: [...new Set(tickets.map(ticket => ticket.assignee).filter(Boolean))].sort(),
      departments: [...new Set(tickets.map(ticket => ticket.department).filter(Boolean))].sort(),
    };
  }, [tickets]);

  // Enhanced filtering for new fields
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Apply search filter across multiple fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ticket => 
        (ticket.name?.toLowerCase().includes(query)) ||
        (ticket.ticket_id?.toLowerCase().includes(query)) ||
        (ticket.title?.toLowerCase().includes(query)) ||
        (ticket.user_name?.toLowerCase().includes(query)) ||
        (ticket.description?.toLowerCase().includes(query)) ||
        (ticket.department?.toLowerCase().includes(query)) ||
        (ticket.category?.toLowerCase().includes(query)) ||
        (ticket.tags?.toLowerCase().includes(query))
      );
    }

    // Apply all filters
    if (filters.status.length > 0) {
      filtered = filtered.filter(ticket => 
        ticket.status && filters.status.includes(ticket.status)
      );
    }

    if (filters.priority.length > 0) {
      filtered = filtered.filter(ticket => 
        ticket.priority && filters.priority.includes(ticket.priority)
      );
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter(ticket => 
        ticket.category && filters.category.includes(ticket.category)
      );
    }

    if (filters.impact.length > 0) {
      filtered = filtered.filter(ticket => 
        ticket.impact && filters.impact.includes(ticket.impact)
      );
    }

    if (filters.users.length > 0) {
      filtered = filtered.filter(ticket => 
        ticket.user_name && filters.users.includes(ticket.user_name)
      );
    }

    if (filters.assignees.length > 0) {
      filtered = filtered.filter(ticket => 
        ticket.assignee && filters.assignees.includes(ticket.assignee)
      );
    }

    if (filters.departments.length > 0) {
      filtered = filtered.filter(ticket => 
        ticket.department && filters.departments.includes(ticket.department)
      );
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let dateThreshold: Date;
      
      switch (filters.dateRange) {
        case '7days':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(0);
      }
      
      filtered = filtered.filter(ticket => {
        const ticketDate = ticket.created_datetime ? new Date(ticket.created_datetime) : 
                           ticket.creation ? new Date(ticket.creation) : null;
        return ticketDate && ticketDate >= dateThreshold;
      });
    }

    return filtered;
  }, [tickets, searchQuery, filters]);

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

  // Clear all sorting
  const clearAllSorting = () => {
    setSortCriteria([]);
    toast.success("Sorting cleared", {
      description: "All sorting criteria have been removed.",
    });
  };

  // Clear all filters and search
  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      status: [],
      priority: [],
      category: [],
      impact: [],
      users: [],
      assignees: [],
      departments: [],
      dateRange: 'all'
    });
    // Reset to first page when clearing filters
    setCurrentPage(1);
    toast.success("Filters cleared", {
      description: "All filters and search have been reset.",
    });
  };

  // Pagination helpers
  const totalPages = totalTicketCount ? Math.ceil(totalTicketCount / pageSize) : Math.ceil(mockTickets.length / pageSize);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchTickets(false, newPage);
      toast.success(`Loading page ${newPage}`, {
        description: `Fetching batch ${(newPage - 1) * pageSize + 1}-${newPage * pageSize} of ${totalTicketCount || 'N/A'} tickets`,
      });
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchTickets(false, newPage);
      toast.success(`Loading page ${newPage}`, {
        description: `Fetching batch ${(newPage - 1) * pageSize + 1}-${Math.min(newPage * pageSize, totalTicketCount || newPage * pageSize)} of ${totalTicketCount || 'N/A'} tickets`,
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchTickets(false, page);
      toast.success(`Loading page ${page}`, {
        description: `Fetching batch ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalTicketCount || page * pageSize)} of ${totalTicketCount || 'N/A'} tickets`,
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
        range.push('...');
      }
    }

    // Add pages around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }

    // Always show last page
    if (rangeEnd < totalPages) {
      if (rangeEnd < totalPages - 1) {
        range.push('...');
      }
      range.push(totalPages);
    }

    return range;
  };

  // Generic filter handler
  const handleFilterChange = (filterType: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...(prev[filterType] as string[]), value]
        : (prev[filterType] as string[]).filter(item => item !== value)
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
    
    toast.success(`Cancelling ${selectedTickets.length} tickets...`);
    setSelectedTickets([]);
  };

  const handleExport = (format: string) => {
    const totalCount = connectionStatus === 'connected' && totalTicketCount !== null ? totalTicketCount : mockTickets.length;
    toast.success(`Exporting ${totalCount} tickets as ${format.toUpperCase()}...`);
  };

  // Get active filters count
  const activeFiltersCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + filter.length;
    }
    return count + (filter !== 'all' ? 1 : 0);
  }, 0) + (searchQuery.trim() ? 1 : 0);

  // Priority badge helper
  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    const priorityConfig = {
      'Critical': { bg: 'bg-destructive/20 text-destructive border-destructive/20', icon: AlertTriangle },
      'High': { bg: 'bg-theme-accent/20 text-theme-accent border-theme-accent/20', icon: AlertTriangle },
      'Medium': { bg: 'bg-muted text-muted-foreground border-border', icon: Clock },
      'Low': { bg: 'bg-theme-accent/10 text-theme-accent border-theme-accent/10', icon: CheckCircle },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return <Badge variant="outline" className="text-foreground border-border">{priority}</Badge>;
    
    const IconComponent = config.icon;
    
    return (
      <Badge variant="secondary" className={`${config.bg} flex items-center gap-1 border`}>
        <IconComponent className="w-3 h-3" />
        <span>{priority}</span>
      </Badge>
    );
  };

  // Status badge helper
  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline" className="text-foreground border-border">Unknown</Badge>;
    
    const statusConfig = {
      'New': { bg: 'bg-theme-accent/20 text-theme-accent border-theme-accent/20', icon: FileText },
      'In Progress': { bg: 'bg-muted text-muted-foreground border-border', icon: Clock },
      'Waiting for Info': { bg: 'bg-secondary text-secondary-foreground border-border', icon: AlertCircle },
      'Resolved': { bg: 'bg-theme-accent/10 text-theme-accent border-theme-accent/10', icon: CheckCircle },
      'Closed': { bg: 'bg-muted/50 text-muted-foreground border-border', icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline" className="text-foreground border-border">{status}</Badge>;
    
    const IconComponent = config.icon;
    
    return (
      <Badge variant="secondary" className={`${config.bg} flex items-center gap-1 border`}>
        <IconComponent className="w-3 h-3" />
        <span>{status}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return <span className="text-muted-foreground">No date</span>;
    
    try {
      const date = new Date(dateString);
      return <span className="text-foreground">{date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</span>;
    } catch (error) {
      return <span className="text-muted-foreground">Invalid date</span>;
    }
  };

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return <span className="text-muted-foreground">No content</span>;
    const truncated = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    return <span className="text-foreground">{truncated}</span>;
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-theme-accent" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-destructive" />;
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
  };

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('frappe-api-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig) as ApiConfig;
        setApiConfig(config);
        frappeApi.updateConfig(config);
      } catch (error) {
        console.error('Failed to parse saved API config:', error);
      }
    }
    
    fetchTickets(true, 1);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-background">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center justify-center py-12 bg-card">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-theme-accent" />
              <p className="text-muted-foreground">Connecting to Frappe API...</p>
              <p className="text-sm text-muted-foreground">{apiConfig.baseUrl}{apiConfig.endpoint}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">Support Ticket Management</h1>
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-sm text-muted-foreground">
                {connectionStatus === 'connected' ? 'Live Data' : 
                 connectionStatus === 'disconnected' ? 'Demo Data' : 'Connecting...'}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground">
            {connectionStatus === 'connected' 
              ? 'Real-time data from your Frappe ERPNext system'
              : 'Demo data with comprehensive ticket management features'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              fetchTickets(true, currentPage);
              if (connectionStatus === 'connected') {
                fetchTotalCount();
              }
            }} 
            variant="outline" 
            disabled={loading || countLoading || isPageLoading} 
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 text-muted-foreground ${loading || countLoading || isPageLoading ? 'animate-spin' : ''}`} />
            <span className="text-foreground">Refresh</span>
          </Button>
          <Button 
            onClick={() => setNewTicketDialogOpen(true)}
            className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>New Ticket</span>
          </Button>
        </div>
      </div>

      {/* Connection Status Alert */}
      {error && (
        <Alert className={connectionStatus === 'disconnected' 
          ? "border-secondary bg-secondary/10"
          : "border-destructive bg-destructive/10"
        }>
          <AlertCircle className={`h-4 w-4 ${connectionStatus === 'disconnected' 
            ? 'text-secondary-foreground' 
            : 'text-destructive'}`} />
          <AlertDescription className={connectionStatus === 'disconnected' 
            ? 'text-secondary-foreground'
            : 'text-destructive'
          }>
            <strong className="text-foreground">API Status:</strong> <span className="text-foreground">{error}</span>
            <br />
            <span className="text-sm text-muted-foreground">
              {connectionStatus === 'disconnected' 
                ? 'Currently showing comprehensive demo data with all new ticket management features.'
                : 'Unable to connect to Frappe API.'}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Tickets</CardTitle>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' && (
                <Button
                  onClick={fetchTotalCount}
                  variant="ghost"
                  size="sm"
                  disabled={countLoading}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                  title="Refresh total count"
                >
                  <RefreshCw className={`h-3 w-3 ${countLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
              {countLoading && connectionStatus === 'connected' && (
                <Loader2 className="h-3 w-3 animate-spin text-theme-accent" />
              )}
              <FileText className="h-4 w-4 text-theme-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {connectionStatus === 'connected' && totalTicketCount !== null 
                ? totalTicketCount 
                : sortedTickets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {connectionStatus === 'connected' 
                ? (totalTicketCount !== null 
                    ? 'Server total count' 
                    : 'Local count (server count unavailable)') 
                : 'Demo data count'}
            </p>
            {connectionStatus === 'connected' && totalTicketCount !== null && sortedTickets.length !== totalTicketCount && (
              <p className="text-xs text-theme-accent mt-1">
                Showing {sortedTickets.length} of {totalTicketCount}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-theme-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {tickets.filter(t => t.status && !['Resolved', 'Closed'].includes(t.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active support requests (current page)
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Critical Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {tickets.filter(t => t.priority === 'Critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention (current page)
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-theme-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {tickets.filter(t => {
                if (t.status !== 'Resolved') return false;
                const today = new Date().toDateString();
                const ticketDate = t.resolution_date ? new Date(t.resolution_date).toDateString() : 
                                   t.modified ? new Date(t.modified).toDateString() : null;
                return ticketDate === today;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed support tickets (current page)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Search & Filter Tickets</CardTitle>
              <CardDescription className="text-muted-foreground">
                Find specific tickets using advanced search and filtering options
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-theme-accent/10 text-theme-accent">
                  {activeFiltersCount} filters active
                </Badge>
              )}
              {(activeFiltersCount > 0 || sortCriteria.length > 0) && (
                <div className="flex gap-2">
                  {activeFiltersCount > 0 && (
                    <Button
                      onClick={clearAllFilters}
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-accent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                  {sortCriteria.length > 0 && (
                    <Button
                      onClick={clearAllSorting}
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-accent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Sorting
                    </Button>
                  )}
                  <Button
                    onClick={resetColumnWidths}
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-accent"
                    title="Reset column widths to defaults"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Reset Columns
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
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
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-between border-border text-foreground hover:bg-accent">
                    <Filter className="w-4 h-4 mr-2" />
                    Status {filters.status.length > 0 && `(${filters.status.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.statuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={filters.status.includes(status)}
                      onCheckedChange={(checked) => handleFilterChange('status', status, checked)}
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
                  <Button variant="outline" size="sm" className="justify-between border-border text-foreground hover:bg-accent">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Priority {filters.priority.length > 0 && `(${filters.priority.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">Filter by Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.priorities.map((priority) => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={filters.priority.includes(priority)}
                      onCheckedChange={(checked) => handleFilterChange('priority', priority, checked)}
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
                  <Button variant="outline" size="sm" className="justify-between border-border text-foreground hover:bg-accent">
                    <Tag className="w-4 h-4 mr-2" />
                    Category {filters.category.length > 0 && `(${filters.category.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={filters.category.includes(category)}
                      onCheckedChange={(checked) => handleFilterChange('category', category, checked)}
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
                  <Button variant="outline" size="sm" className="justify-between border-border text-foreground hover:bg-accent">
                    <User className="w-4 h-4 mr-2" />
                    Users {filters.users.length > 0 && `(${filters.users.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">Filter by User</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.users.map((user) => (
                    <DropdownMenuCheckboxItem
                      key={user}
                      checked={filters.users.includes(user)}
                      onCheckedChange={(checked) => handleFilterChange('users', user, checked)}
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
                  <Button variant="outline" size="sm" className="justify-between border-border text-foreground hover:bg-accent">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assignee {filters.assignees.length > 0 && `(${filters.assignees.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">Filter by Assignee</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.assignees.map((assignee) => (
                    <DropdownMenuCheckboxItem
                      key={assignee}
                      checked={filters.assignees.includes(assignee)}
                      onCheckedChange={(checked) => handleFilterChange('assignees', assignee, checked)}
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
                  <Button variant="outline" size="sm" className="justify-between border-border text-foreground hover:bg-accent">
                    <Building className="w-4 h-4 mr-2" />
                    Department {filters.departments.length > 0 && `(${filters.departments.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">Filter by Department</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {uniqueValues.departments.map((department) => (
                    <DropdownMenuCheckboxItem
                      key={department}
                      checked={filters.departments.includes(department)}
                      onCheckedChange={(checked) => handleFilterChange('departments', department, checked)}
                      className="text-popover-foreground hover:bg-accent"
                    >
                      {department}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Date Range Filter */}
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger className="bg-input-background border-border text-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all" className="text-popover-foreground hover:bg-accent">All Time</SelectItem>
                  <SelectItem value="7days" className="text-popover-foreground hover:bg-accent">Last 7 days</SelectItem>
                  <SelectItem value="30days" className="text-popover-foreground hover:bg-accent">Last 30 days</SelectItem>
                  <SelectItem value="90days" className="text-popover-foreground hover:bg-accent">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              {/* Bulk Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-between border-border text-foreground hover:bg-accent">
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Actions
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-popover-foreground">Bulk Actions</DropdownMenuLabel>
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
                    onClick={() => handleExport('csv')}
                    className="text-popover-foreground hover:bg-accent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('excel')}
                    className="text-popover-foreground hover:bg-accent"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tickets Table with Resizable Columns */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">
                    Tickets (Page {currentPage} of {totalPages})
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {connectionStatus === 'connected' && totalTicketCount !== null 
                      ? `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalTicketCount)}-${Math.min(currentPage * pageSize, totalTicketCount)} of ${totalTicketCount} tickets`
                      : `Showing ${Math.min((currentPage - 1) * pageSize + 1, mockTickets.length)}-${Math.min(currentPage * pageSize, mockTickets.length)} of ${mockTickets.length} tickets (demo data)`
                    }
                  </CardDescription>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePreviousPage}
                    variant="outline"
                    size="sm"
                    disabled={!canGoPrevious || loading || isPageLoading}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {/* Show page numbers around current page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          disabled={loading || isPageLoading}
                          className={pageNum === currentPage 
                            ? "bg-theme-accent text-theme-accent-foreground hover:bg-theme-accent-hover" 
                            : "border-border text-foreground hover:bg-accent"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    onClick={handleNextPage}
                    variant="outline"
                    size="sm"
                    disabled={!canGoNext || loading || isPageLoading}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  
                  {(loading || isPageLoading) && (
                    <Loader2 className="w-4 h-4 animate-spin text-theme-accent" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={() => setConfigDialogOpen(true)}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-accent"
              >
                <Settings className="w-4 h-4 mr-2" />
                API Config
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden" ref={tableRef}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-border hover:bg-muted/80">
                    {/* Select Column */}
                    <TableHead 
                      className="relative border-r border-border bg-muted/50 text-muted-foreground"
                      style={{ width: columnWidths.select, minWidth: columnWidths.select }}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedTickets.length === tickets.length && tickets.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTickets(tickets.map(t => t.name));
                          } else {
                            setSelectedTickets([]);
                          }
                        }}
                      />
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'select')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Ticket ID Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('ticket_id')}
                      style={{ width: columnWidths.ticket_id, minWidth: columnWidths.ticket_id }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">Ticket ID</span>
                        {getSortIndicator('ticket_id')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'ticket_id')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Title Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('title')}
                      style={{ width: columnWidths.title, minWidth: columnWidths.title }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">Title</span>
                        {getSortIndicator('title')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'title')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* User Name Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('user_name')}
                      style={{ width: columnWidths.user_name, minWidth: columnWidths.user_name }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">User</span>
                        {getSortIndicator('user_name')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'user_name')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Department Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('department')}
                      style={{ width: columnWidths.department, minWidth: columnWidths.department }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">Department</span>
                        {getSortIndicator('department')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'department')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Priority Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('priority')}
                      style={{ width: columnWidths.priority, minWidth: columnWidths.priority }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">Priority</span>
                        {getSortIndicator('priority')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'priority')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Status Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('status')}
                      style={{ width: columnWidths.status, minWidth: columnWidths.status }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">Status</span>
                        {getSortIndicator('status')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'status')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Category Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('category')}
                      style={{ width: columnWidths.category, minWidth: columnWidths.category }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">Category</span>
                        {getSortIndicator('category')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'category')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Created Date Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('created_datetime')}
                      style={{ width: columnWidths.created_datetime, minWidth: columnWidths.created_datetime }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">Created</span>
                        {getSortIndicator('created_datetime')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'created_datetime')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Due Date Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('due_datetime')}
                      style={{ width: columnWidths.due_datetime, minWidth: columnWidths.due_datetime }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">Due Date</span>
                        {getSortIndicator('due_datetime')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'due_datetime')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Assignee Column */}
                    <TableHead 
                      className="relative cursor-pointer hover:bg-muted/50 transition-colors select-none border-r border-border"
                      onClick={() => handleSort('assignee')}
                      style={{ width: columnWidths.assignee, minWidth: columnWidths.assignee }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-card-foreground">Assignee</span>
                        {getSortIndicator('assignee')}
                      </div>
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-theme-accent/20 transition-colors group"
                        onMouseDown={(e) => handleResizeStart(e, 'assignee')}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-transparent group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </TableHead>

                    {/* Actions Column */}
                    <TableHead 
                      className="relative bg-muted/50 text-muted-foreground"
                      style={{ width: columnWidths.actions, minWidth: columnWidths.actions }}
                    >
                      <span className="font-semibold">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                        {loading || isPageLoading 
                          ? 'Loading tickets...' 
                          : 'No tickets available on this page.'
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((ticket) => (
                      <TableRow 
                        key={ticket.name} 
                        className="border-border hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        {/* Select Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.select, minWidth: columnWidths.select }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            checked={selectedTickets.includes(ticket.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTickets(prev => [...prev, ticket.name]);
                              } else {
                                setSelectedTickets(prev => prev.filter(id => id !== ticket.name));
                              }
                            }}
                          />
                        </TableCell>

                        {/* Ticket ID Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.ticket_id, minWidth: columnWidths.ticket_id }}
                        >
                          <div className="font-medium text-theme-accent">
                            {ticket.ticket_id || ticket.name}
                          </div>
                        </TableCell>

                        {/* Title Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.title, minWidth: columnWidths.title }}
                        >
                          <div className="max-w-[200px] truncate" title={ticket.title || 'No title'}>
                            {truncateText(ticket.title, 40)}
                          </div>
                        </TableCell>

                        {/* User Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.user_name, minWidth: columnWidths.user_name }}
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-theme-accent flex-shrink-0" />
                            <span className="truncate">{ticket.user_name || 'Unknown'}</span>
                          </div>
                        </TableCell>

                        {/* Department Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.department, minWidth: columnWidths.department }}
                        >
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-theme-accent flex-shrink-0" />
                            <span className="truncate">{ticket.department || 'N/A'}</span>
                          </div>
                        </TableCell>

                        {/* Priority Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.priority, minWidth: columnWidths.priority }}
                        >
                          {getPriorityBadge(ticket.priority)}
                        </TableCell>

                        {/* Status Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.status, minWidth: columnWidths.status }}
                        >
                          {getStatusBadge(ticket.status)}
                        </TableCell>

                        {/* Category Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.category, minWidth: columnWidths.category }}
                        >
                          <Badge variant="outline" className="text-foreground border-border">
                            {ticket.category || 'N/A'}
                          </Badge>
                        </TableCell>

                        {/* Created Date Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.created_datetime, minWidth: columnWidths.created_datetime }}
                        >
                          <div className="text-sm">
                            {formatDate(ticket.created_datetime || ticket.creation)}
                          </div>
                        </TableCell>

                        {/* Due Date Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.due_datetime, minWidth: columnWidths.due_datetime }}
                        >
                          <div className="text-sm">
                            {formatDate(ticket.due_datetime)}
                          </div>
                        </TableCell>

                        {/* Assignee Cell */}
                        <TableCell 
                          className="border-r border-border"
                          style={{ width: columnWidths.assignee, minWidth: columnWidths.assignee }}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-theme-accent flex-shrink-0" />
                            <span className="truncate">{ticket.assignee || 'Unassigned'}</span>
                          </div>
                        </TableCell>

                        {/* Actions Cell */}
                        <TableCell 
                          className="p-2"
                          style={{ width: columnWidths.actions, minWidth: columnWidths.actions }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTicketClick(ticket);
                              }}
                              className="h-7 w-7 p-0 hover:bg-accent"
                              title="View Details"
                            >
                              <Eye className="h-3 w-3 text-muted-foreground" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-accent"
                                >
                                  <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-popover border-border">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTicketClick(ticket);
                                  }}
                                  className="text-popover-foreground hover:bg-accent"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {ticket.docstatus === 0 && (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSubmitTicket(ticket.name);
                                    }}
                                    disabled={actionLoading === ticket.name}
                                    className="text-popover-foreground hover:bg-accent"
                                  >
                                    {actionLoading === ticket.name ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Send className="w-4 h-4 mr-2" />
                                    )}
                                    Submit Ticket
                                  </DropdownMenuItem>
                                )}
                                {ticket.docstatus === 1 && (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelTicket(ticket.name);
                                    }}
                                    disabled={actionLoading === ticket.name}
                                    className="text-popover-foreground hover:bg-accent"
                                  >
                                    {actionLoading === ticket.name ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Archive className="w-4 h-4 mr-2" />
                                    )}
                                    Archive Ticket
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration Dialog */}
      <ApiConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        config={apiConfig}
        onConfigChange={handleConfigChange}
        onTestConnection={handleTestConnection}
      />

      {/* New Ticket Dialog */}
      <NewTicketDialog
        open={newTicketDialogOpen}
        onOpenChange={setNewTicketDialogOpen}
        onTicketCreated={handleTicketCreated}
        connectionStatus={connectionStatus}
      />

      {/* Ticket Details Popover */}
      <TicketDetailsPopover
        ticket={selectedTicket}
        open={detailsPopoverOpen}
        onOpenChange={setDetailsPopoverOpen}
      />
    </div>
  );
}
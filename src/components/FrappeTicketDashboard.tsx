import { useState, useEffect, useMemo } from 'react';
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
  UserCheck
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

export function FrappeTicketDashboard() {
  const [tickets, setTickets] = useState<FrappeTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_API_CONFIG);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria[]>([]);
  
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

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    setConnectionStatus('testing');
    
    try {
      // Try to fetch from Frappe API first
      const data = await frappeApi.getTickets();
      setTickets(data);
      setConnectionStatus('connected');
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets from Frappe API:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Frappe API';
      setError(errorMessage);
      setConnectionStatus('disconnected');
      
      // Fallback to mock data with a delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 800));
      setTickets(mockTickets);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    frappeApi.updateConfig(newConfig);
    
    // Store in localStorage for persistence
    localStorage.setItem('frappe-api-config', JSON.stringify(newConfig));
    
    // Trigger a refresh to test the new configuration
    setTimeout(() => {
      fetchTickets();
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
    toast.success("Filters cleared", {
      description: "All filters and search have been reset.",
    });
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
    toast.success(`Exporting ${sortedTickets.length} tickets as ${format.toUpperCase()}...`);
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
    
    fetchTickets();
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
          <Button onClick={() => fetchTickets()} variant="outline" disabled={loading} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <RefreshCw className={`w-4 h-4 mr-2 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
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
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-accent">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {connectionStatus === 'connected' ? 'Live count' : 'Demo data'} 
              {filteredTickets.length !== tickets.length && (
                <span className="text-theme-accent ml-1">
                  ({filteredTickets.length} filtered)
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical/High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredTickets.filter(t => ['Critical', 'High'].includes(t.priority || '')).length}
            </div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredTickets.filter(t => ['New', 'In Progress'].includes(t.status || '')).length}
            </div>
            <p className="text-xs text-muted-foreground">Active tickets being worked on</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredTickets.filter(t => ['Resolved', 'Closed'].includes(t.status || '')).length}
            </div>
            <p className="text-xs text-muted-foreground">Completed tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Support Tickets
                {connectionStatus === 'connected' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                    Live Data
                  </Badge>
                )}
                {sortCriteria.length > 0 && (
                  <Badge variant="secondary" className="bg-theme-accent/10 text-theme-accent border-theme-accent/20">
                    Sorted by {sortCriteria.length} column{sortCriteria.length > 1 ? 's' : ''}
                  </Badge>
                )}
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span>Click any ticket row to view details • Showing {sortedTickets.length} of {tickets.length} tickets</span>
                {(sortCriteria.length > 0 || activeFiltersCount > 0) && (
                  <div className="flex gap-2">
                    {sortCriteria.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearAllSorting}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear sorting
                      </Button>
                    )}
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
              </CardDescription>
            </div>
            
            {connectionStatus === 'connected' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setConfigDialogOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                API Settings
              </Button>
            )}
          </div>

          {/* Enhanced Search and Filter Controls */}
          <div className="flex flex-col gap-4 pt-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tickets, users, departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Status
                    {filters.status.length > 0 && (
                      <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                        {filters.status.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueValues.statuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={filters.status.includes(status)}
                      onCheckedChange={(checked) => handleFilterChange('status', status, checked)}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Priority Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    Priority
                    {filters.priority.length > 0 && (
                      <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                        {filters.priority.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueValues.priorities.map((priority) => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={filters.priority.includes(priority)}
                      onCheckedChange={(checked) => handleFilterChange('priority', priority, checked)}
                    >
                      {priority}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Tag className="w-4 h-4 mr-2" />
                    Category
                    {filters.category.length > 0 && (
                      <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                        {filters.category.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueValues.categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={filters.category.includes(category)}
                      onCheckedChange={(checked) => handleFilterChange('category', category, checked)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Department Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Building className="w-4 h-4 mr-2" />
                    Department
                    {filters.departments.length > 0 && (
                      <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                        {filters.departments.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 max-h-64 overflow-y-auto">
                  <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueValues.departments.map((department) => (
                    <DropdownMenuCheckboxItem
                      key={department}
                      checked={filters.departments.includes(department)}
                      onCheckedChange={(checked) => handleFilterChange('departments', department, checked)}
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
                <SelectTrigger className="w-36">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={handleBulkSubmit}
                      disabled={selectedTickets.length === 0}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Selected ({selectedTickets.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleBulkCancel}
                      disabled={selectedTickets.length === 0}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Selected ({selectedTickets.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={selectedTickets.length === 0}>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Selected ({selectedTickets.length})
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedTickets.length === sortedTickets.length && sortedTickets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTickets(sortedTickets.map(t => t.name));
                        } else {
                          setSelectedTickets([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead 
                    className="w-[120px] cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('ticket_id')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Ticket ID</span>
                      {getSortIndicator('ticket_id')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="min-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Title</span>
                      {getSortIndicator('title')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[120px] cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('user_name')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">User</span>
                      {getSortIndicator('user_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[120px] cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Department</span>
                      {getSortIndicator('department')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[100px] cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Category</span>
                      {getSortIndicator('category')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[100px] cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Priority</span>
                      {getSortIndicator('priority')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[120px] cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Status</span>
                      {getSortIndicator('status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[120px] cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('assignee')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Assignee</span>
                      {getSortIndicator('assignee')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[150px] cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('created_datetime')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Created</span>
                      {getSortIndicator('created_datetime')}
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.name} 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={(e) => {
                      // Don't trigger row click if clicking on checkbox or action buttons
                      if ((e.target as HTMLElement).closest('input[type="checkbox"]') || 
                          (e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      handleTicketClick(ticket);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded"
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
                    <TableCell className="font-mono text-sm">
                      {ticket.ticket_id || ticket.name}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium truncate" title={ticket.title || 'No title'}>
                          {ticket.title || (
                            <span className="text-muted-foreground italic">No title</span>
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">
                          {ticket.user_name || (
                            <span className="text-muted-foreground italic">Unknown</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">
                          {ticket.department || (
                            <span className="text-muted-foreground italic">—</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ticket.category ? (
                        <Badge variant="outline" className="text-xs">
                          {ticket.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate text-sm">
                          {ticket.assignee ? truncateText(ticket.assignee, 15) : (
                            <span className="text-muted-foreground italic">Unassigned</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{formatDate(ticket.created_datetime || ticket.creation)}</span>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleTicketClick(ticket)}
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {ticket.docstatus === 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                            onClick={() => handleSubmitTicket(ticket.name)}
                            disabled={actionLoading === ticket.name}
                            title="Submit ticket"
                          >
                            {actionLoading === ticket.name ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        
                        {ticket.docstatus === 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleCancelTicket(ticket.name)}
                            disabled={actionLoading === ticket.name}
                            title="Cancel ticket"
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedTickets.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || activeFiltersCount > 0 ? 'No tickets match your criteria' : 'No tickets found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || activeFiltersCount > 0 
                  ? 'Try adjusting your search terms or filters to see more results.'
                  : connectionStatus === 'connected' 
                    ? 'No tickets are available in your Frappe system.'
                    : 'Unable to connect to Frappe API. Showing comprehensive demo interface.'
                }
              </p>
              {searchQuery || activeFiltersCount > 0 ? (
                <Button 
                  onClick={clearAllFilters}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear all filters
                </Button>
              ) : (
                <Button 
                  onClick={() => setNewTicketDialogOpen(true)}
                  className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Ticket
                </Button>
              )}
            </div>
          )}
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
      />

      {/* Ticket Details Popover */}
      <TicketDetailsPopover
        ticket={selectedTicket}
        open={detailsPopoverOpen}
        onOpenChange={setDetailsPopoverOpen}
        onEdit={(ticket) => {
          // Future: Implement edit functionality
          toast.info("Edit functionality coming soon!");
        }}
      />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Loader2, RefreshCw, AlertCircle, User, Calendar, FileText, Plus, Eye, CheckCircle, XCircle, Clock, Wifi, WifiOff, Settings } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { frappeApi, mockTickets, type FrappeTicket, DEFAULT_API_CONFIG, type ApiConfig } from '../services/frappeApi';
import { ApiConfigDialog } from './ApiConfigDialog';
import { NewTicketDialog } from './NewTicketDialog';
import { toast } from "sonner";

export function FrappeTicketDashboard() {
  const [tickets, setTickets] = useState<FrappeTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_API_CONFIG);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);

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

  const getStatusBadge = (docstatus: number | null) => {
    switch (docstatus) {
      case 0:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Draft
          </Badge>
        );
      case 1:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Submitted
          </Badge>
        );
      case 2:
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return 'No content';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-600" />;
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
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
            <h1 className="text-2xl font-semibold">Frappe Ticket Dashboard</h1>
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
              ? 'Real-time data from your Frappe ERPNext instance'
              : 'Showing demo data - check your API connection'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchTickets()} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setNewTicketDialogOpen(true)}
            className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Connection Status Alert */}
      {error && (
        <Alert className={connectionStatus === 'disconnected' 
          ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10"
          : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10"
        }>
          <AlertCircle className={`h-4 w-4 ${connectionStatus === 'disconnected' 
            ? 'text-yellow-600 dark:text-yellow-500' 
            : 'text-red-600 dark:text-red-500'}`} />
          <AlertDescription className={connectionStatus === 'disconnected' 
            ? 'text-yellow-800 dark:text-yellow-200'
            : 'text-red-800 dark:text-red-200'
          }>
            <strong>API Status:</strong> {error}
            <br />
            <span className="text-sm">
              {connectionStatus === 'disconnected' 
                ? 'Currently showing demo data. Check your Frappe server is running and API credentials are correct.'
                : 'Unable to connect to Frappe API.'}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* API Configuration Info */}
      {connectionStatus === 'disconnected' && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-lg text-blue-800 dark:text-blue-200">API Configuration</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300 mt-1">
                Current connection settings and field configuration
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setConfigDialogOpen(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Configuration
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <p><strong>Base URL:</strong> {apiConfig.baseUrl}</p>
                <p><strong>Endpoint:</strong> {apiConfig.endpoint}</p>
              </div>
              <div>
                <p><strong>Fields:</strong> {apiConfig.fields.length} configured</p>
                <p><strong>Timeout:</strong> {apiConfig.timeout}ms</p>
              </div>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p><strong>Fields:</strong> {apiConfig.fields.join(', ')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-accent">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {connectionStatus === 'connected' ? 'Live count' : 'Demo data'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Tickets</CardTitle>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 text-xs">
              Draft
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.docstatus === 0).length}</div>
            <p className="text-xs text-muted-foreground">Pending submission</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 text-xs">
              Active
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.docstatus === 1).length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 text-xs">
              Closed
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.docstatus === 2).length}</div>
            <p className="text-xs text-muted-foreground">Resolved/Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
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
              </CardTitle>
              <CardDescription>
                Frappe DocType: "Ticket" • Real API Response Structure • Handles null values gracefully
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
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Ticket ID</TableHead>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="w-[150px]">User</TableHead>
                  <TableHead className="min-w-[250px]">Description</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[150px]">Created</TableHead>
                  <TableHead className="w-[150px]">Modified</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.name} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{ticket.name}</TableCell>
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
                            <span className="text-muted-foreground italic">Unknown User</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px]">
                        <p className="text-sm text-muted-foreground" title={ticket.description || 'No description'}>
                          {ticket.description ? (
                            truncateText(ticket.description, 80)
                          ) : (
                            <span className="italic">No description</span>
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.docstatus)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{formatDate(ticket.creation)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(ticket.modified)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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

          {tickets.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tickets found</h3>
              <p className="text-muted-foreground mb-4">
                {connectionStatus === 'connected' 
                  ? 'No tickets are available in your Frappe system.'
                  : 'Unable to connect to Frappe API. Showing demo interface.'
                }
              </p>
              <Button 
                onClick={() => setNewTicketDialogOpen(true)}
                className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Ticket
              </Button>
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
    </div>
  );
}
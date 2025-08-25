import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Alert, AlertDescription } from '../ui/alert.tsx';
import { Skeleton } from '../ui/skeleton.tsx';
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Download,
  Activity,
  BarChart3,
  Target
} from 'lucide-react';
import { useTheme } from '../ThemeProvider.tsx';
import { frappeApi, type FrappeTicket, mockTickets } from '../../services/frappeApi.ts';
import { toast } from "sonner";

interface AnalyticsData {
  totalTickets: number;
  resolvedTickets: number;
  resolutionRate: number;
  avgResolutionTime: number;
  avgSatisfaction: number;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  priorityDistribution: Array<{ name: string; value: number; color: string }>;
  departmentDistribution: Array<{ name: string; value: number; color: string }>;
  weeklyTrends: Array<{ day: string; tickets: number; resolved: number }>;
  monthlyTrends: Array<{ month: string; tickets: number; resolved: number }>;
  resolutionTimeByPriority: Array<{ priority: string; avgHours: number; count: number }>;
}

interface DataSource {
  isLive: boolean;
  lastUpdated: Date;
  source: 'api' | 'demo';
  errorMessage?: string;
}

export function AnalyticsDashboard() {
  const { getThemeClasses } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>({
    isLive: false,
    lastUpdated: new Date(),
    source: 'demo'
  });
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Process ticket data to generate analytics
  const processTicketData = (tickets: FrappeTicket[]): AnalyticsData => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic metrics
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter(t =>
      t.status === 'Resolved' || t.status === 'Closed'
    ).length;
    const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

    // Calculate average resolution time for resolved tickets
    const resolvedWithTime = tickets.filter(t =>
      (t.status === 'Resolved' || t.status === 'Closed') &&
      t.created_datetime &&
      t.resolution_datetime
    );

    let avgResolutionTime = 0;
    if (resolvedWithTime.length > 0) {
      const totalResolutionTime = resolvedWithTime.reduce((acc, ticket) => {
        const created = new Date(ticket.created_datetime!);
        const resolved = new Date(ticket.resolution_datetime!);
        const diffHours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
        return acc + diffHours;
      }, 0);
      avgResolutionTime = totalResolutionTime / resolvedWithTime.length;
    }

    // Mock satisfaction score (in real app, this would come from customer feedback)
    const avgSatisfaction = 4.7;

    // Status distribution
    const statusCounts = tickets.reduce((acc, ticket) => {
      const status = ticket.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: getStatusColor(name)
    }));

    // Priority distribution
    const priorityCounts = tickets.reduce((acc, ticket) => {
      const priority = ticket.priority || 'Medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityDistribution = Object.entries(priorityCounts).map(([name, value]) => ({
      name,
      value,
      color: getPriorityColor(name)
    }));

    // Department distribution
    const departmentCounts = tickets.reduce((acc, ticket) => {
      const department = ticket.department || 'Other';
      acc[department] = (acc[department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const departmentDistribution = Object.entries(departmentCounts).map(([name, value]) => ({
      name,
      value,
      color: 'hsl(var(--theme-accent))'
    }));

    // Weekly trends (last 7 days)
    const weeklyTrends = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = dayNames[date.getDay()];

      const dayTickets = tickets.filter(t => {
        if (!t.created_datetime) return false;
        const ticketDate = new Date(t.created_datetime);
        return ticketDate.toDateString() === date.toDateString();
      });

      const dayResolved = tickets.filter(t => {
        if (!t.resolution_datetime) return false;
        const resolvedDate = new Date(t.resolution_datetime);
        return resolvedDate.toDateString() === date.toDateString();
      });

      weeklyTrends.push({
        day: dayName,
        tickets: dayTickets.length,
        resolved: dayResolved.length
      });
    }

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthNames[date.getMonth()];

      const monthTickets = tickets.filter(t => {
        if (!t.created_datetime) return false;
        const ticketDate = new Date(t.created_datetime);
        return ticketDate.getMonth() === date.getMonth() &&
               ticketDate.getFullYear() === date.getFullYear();
      });

      const monthResolved = tickets.filter(t => {
        if (!t.resolution_datetime) return false;
        const resolvedDate = new Date(t.resolution_datetime);
        return resolvedDate.getMonth() === date.getMonth() &&
               resolvedDate.getFullYear() === date.getFullYear();
      });

      monthlyTrends.push({
        month: monthName,
        tickets: monthTickets.length,
        resolved: monthResolved.length
      });
    }

    // Resolution time by priority
    const priorityResolutionTimes = ['Critical', 'High', 'Medium', 'Low'].map(priority => {
      const priorityTickets = resolvedWithTime.filter(t => t.priority === priority);
      let avgHours = 0;

      if (priorityTickets.length > 0) {
        const totalTime = priorityTickets.reduce((acc, ticket) => {
          const created = new Date(ticket.created_datetime!);
          const resolved = new Date(ticket.resolution_datetime!);
          const diffHours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
          return acc + diffHours;
        }, 0);
        avgHours = totalTime / priorityTickets.length;
      }

      return {
        priority,
        avgHours: Math.round(avgHours * 10) / 10,
        count: priorityTickets.length
      };
    });

    return {
      totalTickets,
      resolvedTickets,
      resolutionRate,
      avgResolutionTime,
      avgSatisfaction,
      statusDistribution,
      priorityDistribution,
      departmentDistribution,
      weeklyTrends,
      monthlyTrends,
      resolutionTimeByPriority: priorityResolutionTimes
    };
  };

  // Helper functions for colors
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'hsl(var(--theme-accent))';
      case 'in progress':
        return 'hsl(var(--chart-2))';
      case 'waiting for info':
        return 'hsl(var(--chart-3))';
      case 'resolved':
        return 'hsl(var(--chart-4))';
      case 'closed':
        return 'hsl(var(--chart-5))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'hsl(var(--destructive))';
      case 'high':
        return 'hsl(var(--chart-1))';
      case 'medium':
        return 'hsl(var(--theme-accent))';
      case 'low':
        return 'hsl(var(--chart-4))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  // Fetch data from API or use demo data
  const fetchAnalyticsData = async (showToast: boolean = true) => {
    setIsLoading(true);

    try {
      // Try to fetch from API first
      const tickets = await frappeApi.getTickets();
      const data = processTicketData(tickets);

      setAnalyticsData(data);
      setDataSource({
        isLive: true,
        lastUpdated: new Date(),
        source: 'api'
      });

      if (showToast) {
        toast.success('Analytics data refreshed from live API', {
          description: `Processed ${tickets.length} tickets`
        });
      }
    } catch (error) {
      // Fallback to demo data
      console.warn('Failed to fetch live data, using demo data:', error);
      const data = processTicketData(mockTickets);

      setAnalyticsData(data);
      setDataSource({
        isLive: false,
        lastUpdated: new Date(),
        source: 'demo',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      if (showToast) {
        toast.warning('Using demo data - API unavailable', {
          description: 'Check your API configuration in settings'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data every 5 minutes if live
  useEffect(() => {
    fetchAnalyticsData(false);

    // Set up auto-refresh for live data
    const interval = setInterval(() => {
      if (dataSource.isLive) {
        fetchAnalyticsData(false);
      }
    }, 5 * 60 * 1000); // 5 minutes

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    fetchAnalyticsData(true);
  };

  // Export data function
  const handleExport = () => {
    if (!analyticsData) return;

    const dataToExport = {
      generatedAt: new Date().toISOString(),
      dataSource: dataSource,
      analytics: analyticsData
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mytick-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Analytics data exported successfully');
  };

  if (isLoading || !analyticsData) {
    return (
      <div className={`p-6 space-y-6 bg-background ${getThemeClasses()}`}>
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-64 bg-muted" />
            <Skeleton className="h-4 w-96 mt-2 bg-muted" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32 bg-muted" />
            <Skeleton className="h-8 w-32 bg-muted" />
          </div>
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardHeader className="bg-card">
                <Skeleton className="h-4 w-24 bg-muted" />
              </CardHeader>
              <CardContent className="bg-card">
                <Skeleton className="h-8 w-16 bg-muted" />
                <Skeleton className="h-3 w-32 mt-2 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardHeader className="bg-card">
                <Skeleton className="h-5 w-40 bg-muted" />
                <Skeleton className="h-3 w-64 bg-muted" />
              </CardHeader>
              <CardContent className="bg-card">
                <Skeleton className="h-64 w-full bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 bg-background ${getThemeClasses()}`}>
      {/* Header with Data Source Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-medium text-foreground">Analytics Dashboard</h1>
            <div className="flex items-center gap-2">
              {dataSource.isLive ? (
                <Badge variant="secondary" className="bg-theme-accent/20 text-theme-accent border-theme-accent/20">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live Data
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-destructive/20 text-destructive border-destructive/20">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Demo Data
                </Badge>
              )}
              <Badge variant="outline" className="border-border text-muted-foreground">
                <Database className="w-3 h-3 mr-1" />
                {analyticsData.totalTickets} Tickets
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            IT Support Performance Metrics & Insights
            <span className="ml-2 text-xs">
              Last updated: {dataSource.lastUpdated.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">Last 30 Days</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="text-foreground">Export Report</span>
          </Button>
        </div>
      </div>

      {/* Data Source Alert */}
      {!dataSource.isLive && (
        <Alert className="border-destructive/20 bg-destructive/5">
          <WifiOff className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-foreground">
            Currently showing demo data. {dataSource.errorMessage ? `Error: ${dataSource.errorMessage}` : 'Check your API configuration to view live data.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-card">
            <div className="text-2xl font-medium text-foreground">{analyticsData.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-theme-accent flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                <span>Active tracking</span>
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card">
            <CardTitle className="text-sm font-medium text-card-foreground">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-card">
            <div className="text-2xl font-medium text-foreground">{analyticsData.resolutionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${analyticsData.resolutionRate >= 80 ? 'text-theme-accent' : 'text-destructive'}`}>
                {analyticsData.resolutionRate >= 80 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                <span>{analyticsData.resolvedTickets}/{analyticsData.totalTickets} resolved</span>
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card">
            <CardTitle className="text-sm font-medium text-card-foreground">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-card">
            <div className="text-2xl font-medium text-foreground">{analyticsData.avgResolutionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${analyticsData.avgResolutionTime <= 24 ? 'text-theme-accent' : 'text-destructive'}`}>
                <Target className="w-3 h-3 mr-1" />
                <span>Target: 24h</span>
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card">
            <CardTitle className="text-sm font-medium text-card-foreground">Customer Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-card">
            <div className="text-2xl font-medium text-foreground">{analyticsData.avgSatisfaction.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-theme-accent flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Simulated metric</span>
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="border-border bg-card">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle className="text-card-foreground">Monthly Ticket Trends</CardTitle>
            <CardDescription className="text-muted-foreground">Ticket creation vs resolution over time</CardDescription>
          </CardHeader>
          <CardContent className="bg-card">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Area type="monotone" dataKey="tickets" stackId="1" stroke="hsl(var(--theme-accent))" fill="hsl(var(--theme-accent))" fillOpacity={0.6} />
                <Area type="monotone" dataKey="resolved" stackId="2" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="border-border bg-card">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle className="text-card-foreground">Priority Distribution</CardTitle>
            <CardDescription className="text-muted-foreground">Breakdown of tickets by priority level</CardDescription>
          </CardHeader>
          <CardContent className="bg-card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}`}
                  labelStyle={{ fill: 'hsl(var(--foreground))' }}
                >
                  {analyticsData.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card className="border-border bg-card">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle className="text-card-foreground">Weekly Activity</CardTitle>
            <CardDescription className="text-muted-foreground">Daily ticket volume and resolution</CardDescription>
          </CardHeader>
          <CardContent className="bg-card">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Line type="monotone" dataKey="tickets" stroke="hsl(var(--theme-accent))" strokeWidth={2} name="Created" />
                <Line type="monotone" dataKey="resolved" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-border bg-card">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle className="text-card-foreground">Status Overview</CardTitle>
            <CardDescription className="text-muted-foreground">Current ticket status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="bg-card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--theme-accent))">
                  {analyticsData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Distribution */}
      {analyticsData.departmentDistribution.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle className="text-card-foreground">Department Workload</CardTitle>
            <CardDescription className="text-muted-foreground">Ticket distribution across departments</CardDescription>
          </CardHeader>
          <CardContent className="bg-card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--theme-accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Resolution Time by Priority */}
      <Card className="border-border bg-card">
        <CardHeader className="bg-card border-b border-border">
          <CardTitle className="text-card-foreground">Resolution Time by Priority</CardTitle>
          <CardDescription className="text-muted-foreground">Average resolution times for different priority levels</CardDescription>
        </CardHeader>
        <CardContent className="bg-card">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.resolutionTimeByPriority}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="priority" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
                formatter={(value, name) => [`${value} hours`, `${name === 'avgHours' ? 'Average Time' : name}`]}
              />
              <Bar dataKey="avgHours" fill="hsl(var(--theme-accent))" name="Average Hours" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

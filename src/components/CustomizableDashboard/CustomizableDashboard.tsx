import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Progress } from '../ui/progress.tsx';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
  Settings,
  Grid3X3,
  Plus,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function CustomizableDashboard() {
  const [widgets, setWidgets] = useState([
    { id: 'tickets-overview', title: 'Tickets Overview', type: 'stats', enabled: true, size: 'large' },
    { id: 'priority-breakdown', title: 'Priority Breakdown', type: 'chart', enabled: true, size: 'medium' },
    { id: 'recent-activity', title: 'Recent Activity', type: 'list', enabled: true, size: 'medium' },
    { id: 'team-performance', title: 'Team Performance', type: 'chart', enabled: true, size: 'large' },
    { id: 'sla-compliance', title: 'SLA Compliance', type: 'progress', enabled: true, size: 'small' },
    { id: 'system-health', title: 'System Health', type: 'status', enabled: true, size: 'small' }
  ]);

  // Sample data
  const ticketStats = {
    total: 156,
    open: 42,
    inProgress: 28,
    resolved: 71,
    closed: 15,
    critical: 8,
    high: 18,
    medium: 24,
    low: 7
  };

  const priorityData = [
    { name: 'Critical', value: ticketStats.critical, color: 'hsl(var(--destructive))' },
    { name: 'High', value: ticketStats.high, color: 'hsl(var(--theme-accent))' },
    { name: 'Medium', value: ticketStats.medium, color: 'hsl(var(--muted-foreground))' },
    { name: 'Low', value: ticketStats.low, color: 'hsl(var(--theme-accent))' }
  ];

  const teamPerformanceData = [
    { name: 'John Doe', resolved: 24, pending: 6, total: 30 },
    { name: 'Jane Smith', resolved: 18, pending: 4, total: 22 },
    { name: 'Mike Johnson', resolved: 15, pending: 8, total: 23 },
    { name: 'Sarah Wilson', resolved: 21, pending: 3, total: 24 }
  ];

  const trendData = [
    { month: 'Jan', tickets: 120 },
    { month: 'Feb', tickets: 135 },
    { month: 'Mar', tickets: 148 },
    { month: 'Apr', tickets: 162 },
    { month: 'May', tickets: 156 },
    { month: 'Jun', tickets: 143 }
  ];

  const recentActivities = [
    { id: 1, action: 'Ticket TK-2089 resolved', user: 'John Doe', time: '5 min ago', type: 'resolved' },
    { id: 2, action: 'New critical ticket TK-2090 created', user: 'System', time: '12 min ago', type: 'critical' },
    { id: 3, action: 'Ticket TK-2087 assigned to Jane Smith', user: 'Mike Johnson', time: '18 min ago', type: 'assigned' },
    { id: 4, action: 'Server maintenance completed', user: 'John Doe', time: '25 min ago', type: 'maintenance' },
    { id: 5, action: 'User training session scheduled', user: 'Sarah Wilson', time: '1 hour ago', type: 'scheduled' }
  ];

  const systemHealth = {
    servers: { status: 'healthy', uptime: '99.8%' },
    network: { status: 'warning', uptime: '98.2%' },
    applications: { status: 'healthy', uptime: '99.9%' },
    database: { status: 'healthy', uptime: '100%' }
  };

  const slaCompliance = {
    overall: 94.2,
    critical: 87.5,
    high: 92.3,
    medium: 96.8,
    low: 98.1
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-theme-accent';
      case 'warning': return 'text-secondary-foreground';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-theme-accent" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'assigned': return <Users className="h-4 w-4 text-theme-accent" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-muted-foreground" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-theme-accent" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'stats':
        return (
          <Card className="col-span-full border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BarChart3 className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Tickets Overview</span>
                <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground hover:text-foreground hover:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 rounded-lg bg-theme-accent/10 border border-theme-accent/20">
                  <div className="text-2xl font-semibold text-theme-accent">{ticketStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Tickets</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/20 border border-border">
                  <div className="text-2xl font-semibold text-secondary-foreground">{ticketStats.open}</div>
                  <div className="text-sm text-muted-foreground">Open</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-2xl font-semibold text-muted-foreground">{ticketStats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-theme-accent/20 border border-theme-accent/20">
                  <div className="text-2xl font-semibold text-theme-accent">{ticketStats.resolved}</div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted border border-border">
                  <div className="text-2xl font-semibold text-muted-foreground">{ticketStats.closed}</div>
                  <div className="text-sm text-muted-foreground">Closed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'chart':
        if (widget.id === 'priority-breakdown') {
          return (
            <Card className="md:col-span-2 border-border bg-card">
              <CardHeader className="bg-card border-b border-border">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="h-5 w-5 text-theme-accent" />
                  <span className="text-card-foreground">Priority Breakdown</span>
                  <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground hover:text-foreground hover:bg-accent">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-card">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="hsl(var(--theme-accent))"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        labelStyle={{ fill: 'hsl(var(--foreground))' }}
                      >
                        {priorityData.map((entry, index) => (
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
                </div>
              </CardContent>
            </Card>
          );
        } else {
          return (
            <Card className="col-span-full border-border bg-card">
              <CardHeader className="bg-card border-b border-border">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Users className="h-5 w-5 text-theme-accent" />
                  <span className="text-card-foreground">Team Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-card">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamPerformanceData}>
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
                      <Bar dataKey="resolved" fill="hsl(var(--theme-accent))" name="Resolved" />
                      <Bar dataKey="pending" fill="hsl(var(--muted-foreground))" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        }

      case 'list':
        return (
          <Card className="md:col-span-2 border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Activity className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-3 max-h-64 overflow-auto">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-muted-foreground">{activity.user}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'progress':
        return (
          <Card className="md:col-span-2 border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Clock className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">SLA Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-card">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">Overall</span>
                  <span className="text-sm font-medium text-foreground">{slaCompliance.overall}%</span>
                </div>
                <Progress value={slaCompliance.overall} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-destructive">Critical</span>
                  <span className="text-sm font-medium text-foreground">{slaCompliance.critical}%</span>
                </div>
                <Progress value={slaCompliance.critical} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-theme-accent">High</span>
                  <span className="text-sm font-medium text-foreground">{slaCompliance.high}%</span>
                </div>
                <Progress value={slaCompliance.high} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-foreground">Medium</span>
                  <span className="text-sm font-medium text-foreground">{slaCompliance.medium}%</span>
                </div>
                <Progress value={slaCompliance.medium} className="h-2" />
              </div>
            </CardContent>
          </Card>
        );

      case 'status':
        return (
          <Card className="md:col-span-2 border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Activity className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-card">
              {Object.entries(systemHealth).map(([system, health]) => (
                <div key={system} className="flex items-center justify-between p-2 rounded-lg bg-accent/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      health.status === 'healthy' ? 'bg-theme-accent' :
                      health.status === 'warning' ? 'bg-secondary-foreground' : 'bg-destructive'
                    }`}></div>
                    <span className="text-sm capitalize text-foreground">{system}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(health.status)}`}>
                      {health.status}
                    </div>
                    <div className="text-xs text-muted-foreground">{health.uptime}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-background">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2 text-foreground">Customizable Dashboard</h1>
          <p className="text-muted-foreground">Personalized overview of your IT support metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <Grid3X3 className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">Customize Layout</span>
          </Button>
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <Plus className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">Add Widget</span>
          </Button>
          <Button size="sm" className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Refresh All</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {widgets.filter(w => w.enabled).map(widget => (
          <div key={widget.id}>
            {renderWidget(widget)}
          </div>
        ))}

        {/* Ticket Trend Chart */}
        <Card className="col-span-full border-border bg-card">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="h-5 w-5 text-theme-accent" />
              <span className="text-card-foreground">Ticket Trends (Last 6 Months)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-card">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
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
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="hsl(var(--theme-accent))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--theme-accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="border-border bg-card">
          <CardContent className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                <p className="text-2xl font-semibold text-foreground">2.4h</p>
              </div>
              <Clock className="h-8 w-8 text-theme-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-semibold text-foreground">87%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-theme-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                <p className="text-2xl font-semibold text-foreground">4.7/5</p>
              </div>
              <Users className="h-8 w-8 text-theme-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-semibold text-foreground">99.8%</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

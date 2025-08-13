import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
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
    { name: 'Critical', value: ticketStats.critical, color: '#dc2626' },
    { name: 'High', value: ticketStats.high, color: '#ea580c' },
    { name: 'Medium', value: ticketStats.medium, color: '#ca8a04' },
    { name: 'Low', value: ticketStats.low, color: '#16a34a' }
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
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'assigned': return <Users className="h-4 w-4 text-blue-600" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-purple-600" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-emerald-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'stats':
        return (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tickets Overview
                <Button variant="ghost" size="sm" className="ml-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="text-2xl font-semibold text-blue-600">{ticketStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Tickets</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <div className="text-2xl font-semibold text-orange-600">{ticketStats.open}</div>
                  <div className="text-sm text-muted-foreground">Open</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <div className="text-2xl font-semibold text-purple-600">{ticketStats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="text-2xl font-semibold text-green-600">{ticketStats.resolved}</div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-950">
                  <div className="text-2xl font-semibold text-gray-600">{ticketStats.closed}</div>
                  <div className="text-sm text-muted-foreground">Closed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'chart':
        if (widget.id === 'priority-breakdown') {
          return (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Priority Breakdown
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        } else {
          return (
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="resolved" fill="#16a34a" name="Resolved" />
                      <Bar dataKey="pending" fill="#ea580c" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        }

      case 'list':
        return (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-auto">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
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
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall</span>
                  <span className="text-sm font-medium">{slaCompliance.overall}%</span>
                </div>
                <Progress value={slaCompliance.overall} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Critical</span>
                  <span className="text-sm font-medium">{slaCompliance.critical}%</span>
                </div>
                <Progress value={slaCompliance.critical} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-600">High</span>
                  <span className="text-sm font-medium">{slaCompliance.high}%</span>
                </div>
                <Progress value={slaCompliance.high} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600">Medium</span>
                  <span className="text-sm font-medium">{slaCompliance.medium}%</span>
                </div>
                <Progress value={slaCompliance.medium} className="h-2" />
              </div>
            </CardContent>
          </Card>
        );

      case 'status':
        return (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(systemHealth).map(([system, health]) => (
                <div key={system} className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      health.status === 'healthy' ? 'bg-green-600' :
                      health.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}></div>
                    <span className="text-sm capitalize">{system}</span>
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
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Customizable Dashboard</h1>
          <p className="text-muted-foreground">Personalized overview of your IT support metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Grid3X3 className="h-4 w-4 mr-2" />
            Customize Layout
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
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
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ticket Trends (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    dot={{ fill: '#16a34a' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                <p className="text-2xl font-semibold">2.4h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-semibold">87%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                <p className="text-2xl font-semibold">4.7/5</p>
              </div>
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-semibold">99.8%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
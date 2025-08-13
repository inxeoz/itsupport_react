import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Mock data for analytics
const ticketVolumeData = [
  { month: 'Jan', tickets: 120, resolved: 115 },
  { month: 'Feb', tickets: 135, resolved: 128 },
  { month: 'Mar', tickets: 148, resolved: 142 },
  { month: 'Apr', tickets: 162, resolved: 158 },
  { month: 'May', tickets: 178, resolved: 165 },
  { month: 'Jun', tickets: 195, resolved: 188 },
];

const priorityDistribution = [
  { name: 'Critical', value: 15, color: '#dc2626' },
  { name: 'High', value: 35, color: '#ea580c' },
  { name: 'Medium', value: 45, color: '#ca8a04' },
  { name: 'Low', value: 25, color: '#16a34a' },
];

const statusDistribution = [
  { name: 'New', value: 28, color: '#3b82f6' },
  { name: 'In Progress', value: 45, color: '#8b5cf6' },
  { name: 'Pending', value: 22, color: '#eab308' },
  { name: 'Resolved', value: 185, color: '#10b981' },
  { name: 'Closed', value: 98, color: '#6b7280' },
];

const resolutionTimeData = [
  { category: 'Critical', avgHours: 2.5, target: 4 },
  { category: 'High', avgHours: 8.2, target: 12 },
  { category: 'Medium', avgHours: 24.1, target: 48 },
  { category: 'Low', avgHours: 72.3, target: 96 },
];

const agentPerformance = [
  { name: 'John Smith', resolved: 45, avg_resolution: 18.5, satisfaction: 4.8 },
  { name: 'Sarah Wilson', resolved: 52, avg_resolution: 16.2, satisfaction: 4.9 },
  { name: 'Mike Johnson', resolved: 38, avg_resolution: 22.1, satisfaction: 4.6 },
  { name: 'David Brown', resolved: 41, avg_resolution: 19.8, satisfaction: 4.7 },
  { name: 'Lisa Anderson', resolved: 48, avg_resolution: 17.3, satisfaction: 4.8 },
];

const weeklyTrends = [
  { day: 'Mon', tickets: 35, resolved: 32 },
  { day: 'Tue', tickets: 42, resolved: 38 },
  { day: 'Wed', tickets: 38, resolved: 41 },
  { day: 'Thu', tickets: 45, resolved: 43 },
  { day: 'Fri', tickets: 52, resolved: 48 },
  { day: 'Sat', tickets: 28, resolved: 31 },
  { day: 'Sun', tickets: 22, resolved: 25 },
];

export function AnalyticsDashboard() {
  const totalTickets = statusDistribution.reduce((sum, item) => sum + item.value, 0);
  const resolvedTickets = statusDistribution.find(item => item.name === 'Resolved')?.value || 0;
  const resolutionRate = ((resolvedTickets / totalTickets) * 100).toFixed(1);
  
  const avgResolutionTime = agentPerformance.reduce((sum, agent) => sum + agent.avg_resolution, 0) / agentPerformance.length;
  const avgSatisfaction = agentPerformance.reduce((sum, agent) => sum + agent.satisfaction, 0) / agentPerformance.length;

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-medium text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">IT Support Performance Metrics & Insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.3% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{avgResolutionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                -15% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{avgSatisfaction.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +0.2 from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Volume Trends</CardTitle>
            <CardDescription>Monthly ticket creation vs resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ticketVolumeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="tickets" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="resolved" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Breakdown of tickets by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}`}
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Daily ticket volume and resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Status Overview</CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" fill="#8884d8">
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Time Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Resolution Time Performance</CardTitle>
          <CardDescription>Average resolution time vs targets by priority</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionTimeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="category" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="avgHours" fill="#3b82f6" name="Actual (hours)" />
              <Bar dataKey="target" fill="#10b981" name="Target (hours)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Agent Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
          <CardDescription>Individual agent metrics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Agent</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Tickets Resolved</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Avg Resolution Time</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Customer Satisfaction</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Performance</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((agent, index) => (
                  <tr key={index} className="border-b border-border hover:bg-accent">
                    <td className="p-3 font-medium text-foreground">{agent.name}</td>
                    <td className="p-3 text-foreground">{agent.resolved}</td>
                    <td className="p-3 text-foreground">{agent.avg_resolution}h</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{agent.satisfaction}/5</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(agent.satisfaction) ? 'text-yellow-400' : 'text-muted'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant="secondary" 
                        className={`${
                          agent.satisfaction >= 4.8 ? 'bg-green-600 text-white' :
                          agent.satisfaction >= 4.5 ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        }`}
                      >
                        {agent.satisfaction >= 4.8 ? 'Excellent' :
                         agent.satisfaction >= 4.5 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
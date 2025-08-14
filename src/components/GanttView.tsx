import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Calendar, Clock, User, MoreHorizontal, Filter, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function GanttView() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedProject, setSelectedProject] = useState('all');

  // Sample project data
  const projects = [
    {
      id: 1,
      name: 'Server Infrastructure Upgrade',
      progress: 75,
      startDate: '2024-08-01',
      endDate: '2024-08-31',
      status: 'In Progress',
      priority: 'High',
      assignee: 'John Doe',
      tasks: [
        { name: 'Hardware Procurement', start: 1, duration: 5, progress: 100, status: 'Completed' },
        { name: 'Server Installation', start: 6, duration: 7, progress: 80, status: 'In Progress' },
        { name: 'Configuration', start: 13, duration: 5, progress: 30, status: 'Pending' },
        { name: 'Testing', start: 18, duration: 4, progress: 0, status: 'Pending' },
        { name: 'Deployment', start: 22, duration: 3, progress: 0, status: 'Pending' }
      ]
    },
    {
      id: 2,
      name: 'Network Security Audit',
      progress: 45,
      startDate: '2024-08-05',
      endDate: '2024-09-15',
      status: 'In Progress',
      priority: 'Critical',
      assignee: 'Jane Smith',
      tasks: [
        { name: 'Vulnerability Assessment', start: 1, duration: 8, progress: 100, status: 'Completed' },
        { name: 'Penetration Testing', start: 9, duration: 10, progress: 60, status: 'In Progress' },
        { name: 'Report Generation', start: 19, duration: 5, progress: 0, status: 'Pending' },
        { name: 'Remediation Plan', start: 24, duration: 6, progress: 0, status: 'Pending' }
      ]
    },
    {
      id: 3,
      name: 'Software License Renewal',
      progress: 90,
      startDate: '2024-07-15',
      endDate: '2024-08-25',
      status: 'Near Completion',
      priority: 'Medium',
      assignee: 'Mike Johnson',
      tasks: [
        { name: 'License Inventory', start: 1, duration: 4, progress: 100, status: 'Completed' },
        { name: 'Vendor Negotiation', start: 5, duration: 8, progress: 100, status: 'Completed' },
        { name: 'Contract Review', start: 13, duration: 5, progress: 90, status: 'In Progress' },
        { name: 'Implementation', start: 18, duration: 3, progress: 50, status: 'In Progress' }
      ]
    }
  ];

  const statusColors = {
    'Completed': 'bg-theme-accent/20 text-theme-accent border-theme-accent/20',
    'In Progress': 'bg-muted text-muted-foreground border-border',
    'Near Completion': 'bg-theme-accent/10 text-theme-accent border-theme-accent/10',
    'Pending': 'bg-secondary text-secondary-foreground border-border',
    'Overdue': 'bg-destructive/20 text-destructive border-destructive/20'
  };

  const priorityColors = {
    'Critical': 'bg-destructive/20 text-destructive border-destructive/20',
    'High': 'bg-theme-accent/20 text-theme-accent border-theme-accent/20',
    'Medium': 'bg-muted text-muted-foreground border-border',
    'Low': 'bg-theme-accent/10 text-theme-accent border-theme-accent/10'
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="p-6 bg-background">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2 text-foreground">Project Timeline</h1>
          <p className="text-muted-foreground">Track project progress and timelines</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-40 bg-input border-border text-foreground">
              <SelectValue className="text-foreground" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all" className="text-foreground hover:bg-accent hover:text-accent-foreground">All Projects</SelectItem>
              <SelectItem value="infrastructure" className="text-foreground hover:bg-accent hover:text-accent-foreground">Infrastructure</SelectItem>
              <SelectItem value="security" className="text-foreground hover:bg-accent hover:text-accent-foreground">Security</SelectItem>
              <SelectItem value="software" className="text-foreground hover:bg-accent hover:text-accent-foreground">Software</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32 bg-input border-border text-foreground">
              <SelectValue className="text-foreground" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="week" className="text-foreground hover:bg-accent hover:text-accent-foreground">Week</SelectItem>
              <SelectItem value="month" className="text-foreground hover:bg-accent hover:text-accent-foreground">Month</SelectItem>
              <SelectItem value="quarter" className="text-foreground hover:bg-accent hover:text-accent-foreground">Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <Download className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">Export</span>
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="bg-card border-b border-border">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Calendar className="h-5 w-5 text-theme-accent" />
            <span className="text-card-foreground">August 2024 Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-card">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Calendar Header */}
              <div className="flex border-b border-border mb-4">
                <div className="w-80 p-3 font-medium bg-muted/50 text-foreground">Project / Task</div>
                <div className="flex-1 flex">
                  {calendarDays.map(day => (
                    <div key={day} className="flex-1 p-1 text-center text-xs border-l border-border">
                      <div className={`${day <= 13 ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Rows */}
              {projects.map(project => (
                <div key={project.id} className="mb-8">
                  {/* Project Header */}
                  <div className="flex border-b border-border/50">
                    <div className="w-80 p-4 bg-accent/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm text-foreground">{project.name}</h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs border ${statusColors[project.status as keyof typeof statusColors]}`}>
                          <span>{project.status}</span>
                        </Badge>
                        <Badge className={`text-xs border ${priorityColors[project.priority as keyof typeof priorityColors]}`}>
                          <span>{project.priority}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <User className="h-3 w-3" />
                        <span>{project.assignee}</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">{project.progress}% complete</div>
                    </div>
                    <div className="flex-1 relative">
                      {/* Project Timeline Bar */}
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 h-6 bg-theme-accent rounded-sm flex items-center justify-center"
                        style={{ 
                          left: '3%', 
                          width: `${Math.min(90, project.progress)}%`
                        }}
                      >
                        <span className="text-xs text-theme-accent-foreground font-medium">{project.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Task Rows */}
                  {project.tasks.map((task, index) => (
                    <div key={index} className="flex border-b border-border/20 last:border-b-0">
                      <div className="w-80 p-3 pl-8 bg-card">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">{task.name}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs border ${
                              task.status === 'Completed' ? 'text-theme-accent border-theme-accent' :
                              task.status === 'In Progress' ? 'text-muted-foreground border-border' :
                              'text-secondary-foreground border-border'
                            }`}
                          >
                            <span>{task.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{task.duration} days</span>
                        </div>
                      </div>
                      <div className="flex-1 relative">
                        {/* Task Timeline Bar */}
                        <div 
                          className={`absolute top-1/2 transform -translate-y-1/2 h-4 rounded-sm ${
                            task.status === 'Completed' ? 'bg-theme-accent' :
                            task.status === 'In Progress' ? 'bg-muted' :
                            'bg-secondary'
                          }`}
                          style={{ 
                            left: `${(task.start / 31) * 100}%`, 
                            width: `${(task.duration / 31) * 100}%`
                          }}
                        >
                          {task.progress > 0 && task.status !== 'Completed' && (
                            <div 
                              className="h-full bg-current rounded-sm opacity-80"
                              style={{ width: `${task.progress}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="border-border bg-card">
          <CardContent className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-semibold text-foreground">3</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardContent className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-semibold text-foreground">7</p>
              </div>
              <Clock className="h-8 w-8 text-theme-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardContent className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-semibold text-foreground">5</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardContent className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-semibold text-destructive">1</p>
              </div>
              <Clock className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
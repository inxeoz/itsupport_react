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
    'Completed': 'bg-green-600',
    'In Progress': 'bg-purple-600',
    'Near Completion': 'bg-blue-600',
    'Pending': 'bg-yellow-600',
    'Overdue': 'bg-red-600'
  };

  const priorityColors = {
    'Critical': 'bg-red-600',
    'High': 'bg-orange-600',
    'Medium': 'bg-yellow-600',
    'Low': 'bg-green-600'
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
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Project Timeline</h1>
          <p className="text-muted-foreground">Track project progress and timelines</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="software">Software</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            August 2024 Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Calendar Header */}
              <div className="flex border-b mb-4">
                <div className="w-80 p-3 font-medium bg-muted/50">Project / Task</div>
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
                        <h3 className="font-medium text-sm">{project.name}</h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-white text-xs ${statusColors[project.status as keyof typeof statusColors]}`}>
                          {project.status}
                        </Badge>
                        <Badge className={`text-white text-xs ${priorityColors[project.priority as keyof typeof priorityColors]}`}>
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <User className="h-3 w-3" />
                        {project.assignee}
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">{project.progress}% complete</div>
                    </div>
                    <div className="flex-1 relative">
                      {/* Project Timeline Bar */}
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 h-6 bg-emerald-600/80 rounded-sm flex items-center justify-center"
                        style={{ 
                          left: '3%', 
                          width: `${Math.min(90, project.progress)}%`
                        }}
                      >
                        <span className="text-xs text-white font-medium">{project.progress}%</span>
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
                            className={`text-xs ${
                              task.status === 'Completed' ? 'text-green-600 border-green-600' :
                              task.status === 'In Progress' ? 'text-purple-600 border-purple-600' :
                              'text-yellow-600 border-yellow-600'
                            }`}
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.duration} days
                        </div>
                      </div>
                      <div className="flex-1 relative">
                        {/* Task Timeline Bar */}
                        <div 
                          className={`absolute top-1/2 transform -translate-y-1/2 h-4 rounded-sm ${
                            task.status === 'Completed' ? 'bg-green-600' :
                            task.status === 'In Progress' ? 'bg-purple-600' :
                            'bg-yellow-600/60'
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-semibold">3</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-semibold">7</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-semibold">5</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-semibold">1</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
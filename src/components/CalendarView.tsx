import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, User, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 13)); // August 13, 2024
  const [view, setView] = useState('month');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Sample ticket events
  const ticketEvents = [
    { id: 'TK-2089', title: 'Server maintenance', date: 13, type: 'maintenance', priority: 'High', assignee: 'John Doe', time: '09:00' },
    { id: 'TK-2088', title: 'Software installation', date: 14, type: 'installation', priority: 'Medium', assignee: 'Jane Smith', time: '14:00' },
    { id: 'TK-2087', title: 'Network issue investigation', date: 14, type: 'investigation', priority: 'Critical', assignee: 'Mike Johnson', time: '10:30' },
    { id: 'TK-2086', title: 'User training session', date: 15, type: 'training', priority: 'Low', assignee: 'Sarah Wilson', time: '13:00' },
    { id: 'TK-2085', title: 'Database backup', date: 16, type: 'maintenance', priority: 'Medium', assignee: 'John Doe', time: '02:00' },
    { id: 'TK-2084', title: 'Security audit follow-up', date: 16, type: 'security', priority: 'High', assignee: 'Jane Smith', time: '15:30' },
    { id: 'TK-2083', title: 'Hardware replacement', date: 18, type: 'hardware', priority: 'High', assignee: 'Mike Johnson', time: '11:00' },
    { id: 'TK-2082', title: 'License renewal meeting', date: 19, type: 'meeting', priority: 'Medium', assignee: 'Sarah Wilson', time: '16:00' }
  ];

  const priorityColors = {
    'Critical': 'bg-destructive/20 text-destructive border-destructive/20',
    'High': 'bg-theme-accent/20 text-theme-accent border-theme-accent/20',
    'Medium': 'bg-muted text-muted-foreground border-border',
    'Low': 'bg-theme-accent/10 text-theme-accent border-theme-accent/10'
  };

  const typeColors = {
    'maintenance': 'bg-theme-accent text-theme-accent-foreground',
    'installation': 'bg-muted text-muted-foreground',
    'investigation': 'bg-destructive text-destructive-foreground',
    'training': 'bg-theme-accent text-theme-accent-foreground',
    'security': 'bg-theme-accent text-theme-accent-foreground',
    'hardware': 'bg-muted text-muted-foreground',
    'meeting': 'bg-theme-accent text-theme-accent-foreground'
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push({
        date: current.getDate(),
        month: current.getMonth(),
        year: current.getFullYear(),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        events: ticketEvents.filter(event => 
          event.date === current.getDate() && 
          current.getMonth() === month
        )
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const todayEvents = ticketEvents.filter(event => event.date === 13);
  const upcomingEvents = ticketEvents.filter(event => event.date > 13 && event.date <= 16);

  return (
    <div className="p-6 bg-background">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2 text-foreground">Ticket Calendar</h1>
          <p className="text-muted-foreground">Schedule and track ticket activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-32 bg-input border-border text-foreground">
              <SelectValue className="text-foreground" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="month" className="text-foreground hover:bg-accent hover:text-accent-foreground">Month</SelectItem>
              <SelectItem value="week" className="text-foreground hover:bg-accent hover:text-accent-foreground">Week</SelectItem>
              <SelectItem value="day" className="text-foreground hover:bg-accent hover:text-accent-foreground">Day</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-40 bg-input border-border text-foreground">
              <SelectValue placeholder="Filter by..." className="text-foreground" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all" className="text-foreground hover:bg-accent hover:text-accent-foreground">All Tickets</SelectItem>
              <SelectItem value="maintenance" className="text-foreground hover:bg-accent hover:text-accent-foreground">Maintenance</SelectItem>
              <SelectItem value="installation" className="text-foreground hover:bg-accent hover:text-accent-foreground">Installation</SelectItem>
              <SelectItem value="security" className="text-foreground hover:bg-accent hover:text-accent-foreground">Security</SelectItem>
              <SelectItem value="training" className="text-foreground hover:bg-accent hover:text-accent-foreground">Training</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">Filter</span>
          </Button>
          <Button size="sm" className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Event</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Calendar className="h-5 w-5 text-theme-accent" />
                  <span className="text-card-foreground">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                    <span>Today</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-card">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div key={day} className="p-3 text-center font-medium text-muted-foreground text-sm">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border border-border/50 ${
                      day.isCurrentMonth ? 'bg-card' : 'bg-muted/30'
                    } ${day.isToday ? 'bg-theme-accent/10 border-theme-accent' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    } ${day.isToday ? 'text-theme-accent' : ''}`}>
                      {day.date}
                    </div>
                    <div className="space-y-1">
                      {day.events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate ${
                            typeColors[event.type as keyof typeof typeColors]
                          }`}
                          title={`${event.title} - ${event.time}`}
                        >
                          <span>{event.title}</span>
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Clock className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Today's Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-3">
                {todayEvents.length > 0 ? (
                  todayEvents.map(event => (
                    <div key={event.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="font-medium text-sm truncate text-foreground">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{event.id}</div>
                        </div>
                        <Badge className={`text-xs border ${priorityColors[event.priority as keyof typeof priorityColors]}`}>
                          <span>{event.priority}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{event.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{event.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No events scheduled for today</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="text-card-foreground">Upcoming This Week</CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="font-medium text-sm truncate text-foreground">{event.title}</div>
                        <div className="text-xs text-muted-foreground">Aug {event.date}</div>
                      </div>
                      <Badge className={`text-xs border ${priorityColors[event.priority as keyof typeof priorityColors]}`}>
                        <span>{event.priority}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{event.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{event.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Stats */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="text-card-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Events</span>
                  <span className="font-medium text-foreground">{ticketEvents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Maintenance</span>
                  <span className="font-medium text-foreground">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Critical Issues</span>
                  <span className="font-medium text-destructive">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-theme-accent">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
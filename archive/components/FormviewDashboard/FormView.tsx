import { useState } from 'react';
import { Button } from '@/ui/components/button.tsx';
import { Input } from '@/ui/components/input.tsx';
import { Label } from '@/ui/components/label.tsx';
import { Textarea } from '@/ui/components/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/select.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card.tsx';
import { Badge } from '@/ui/components/badge.tsx';
import { Separator } from '@/ui/components/separator.tsx';
import { Calendar, User, Clock, AlertTriangle, Tag, FileText, Users, Building } from 'lucide-react';

export function FormView() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    status: 'New',
    assignee: '',
    department: '',
    category: '',
    dueDate: '',
    tags: '',
    customer: ''
  });

  const [recentTickets] = useState([
    { id: 'TK-2089', title: 'Server maintenance required', status: 'In Progress', priority: 'High', date: '2024-08-13' },
    { id: 'TK-2088', title: 'Software installation request', status: 'Resolved', priority: 'Medium', date: '2024-08-12' },
    { id: 'TK-2087', title: 'Network connectivity issue', status: 'Pending', priority: 'Critical', date: '2024-08-12' }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const statusColors = {
    'New': 'bg-theme-accent/20 text-theme-accent border-theme-accent/20',
    'In Progress': 'bg-muted text-muted-foreground border-border',
    'Pending': 'bg-secondary text-secondary-foreground border-border',
    'Resolved': 'bg-theme-accent/10 text-theme-accent border-theme-accent/10',
    'Closed': 'bg-muted/50 text-muted-foreground border-border'
  };

  const priorityColors = {
    'Critical': 'bg-destructive/20 text-destructive border-destructive/20',
    'High': 'bg-theme-accent/20 text-theme-accent border-theme-accent/20',
    'Medium': 'bg-muted text-muted-foreground border-border',
    'Low': 'bg-theme-accent/10 text-theme-accent border-theme-accent/10'
  };

  const priorityIndicatorColors = {
    'critical': 'bg-destructive',
    'high': 'bg-theme-accent',
    'medium': 'bg-muted-foreground',
    'low': 'bg-theme-accent'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2 text-foreground">Advanced Ticket Form</h1>
        <p className="text-muted-foreground">Create and manage support tickets with advanced form controls</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <FileText className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Create New Ticket</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2 text-foreground">
                    <Tag className="h-4 w-4 text-theme-accent" />
                    <span className="text-foreground">Basic Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter ticket title..."
                        className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer" className="text-foreground">Customer</Label>
                      <Input
                        id="customer"
                        value={formData.customer}
                        onChange={(e) => handleInputChange('customer', e.target.value)}
                        placeholder="Enter customer name..."
                        className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the issue in detail..."
                      rows={4}
                      className="w-full resize-none bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Assignment & Priority */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2 text-foreground">
                    <Users className="h-4 w-4 text-theme-accent" />
                    <span className="text-foreground">Assignment & Priority</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-foreground">Priority *</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Select priority" className="text-foreground" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="critical" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-destructive"></div>
                              <span className="text-foreground">Critical</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-theme-accent"></div>
                              <span className="text-foreground">High</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                              <span className="text-foreground">Medium</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="low" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-theme-accent"></div>
                              <span className="text-foreground">Low</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignee" className="text-foreground">Assignee</Label>
                      <Select value={formData.assignee} onValueChange={(value) => handleInputChange('assignee', value)}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Assign to..." className="text-foreground" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="john-doe" className="text-foreground hover:bg-accent hover:text-accent-foreground">John Doe</SelectItem>
                          <SelectItem value="jane-smith" className="text-foreground hover:bg-accent hover:text-accent-foreground">Jane Smith</SelectItem>
                          <SelectItem value="mike-johnson" className="text-foreground hover:bg-accent hover:text-accent-foreground">Mike Johnson</SelectItem>
                          <SelectItem value="sarah-wilson" className="text-foreground hover:bg-accent hover:text-accent-foreground">Sarah Wilson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-foreground">Department</Label>
                      <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Select department" className="text-foreground" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="it" className="text-foreground hover:bg-accent hover:text-accent-foreground">IT Support</SelectItem>
                          <SelectItem value="hr" className="text-foreground hover:bg-accent hover:text-accent-foreground">Human Resources</SelectItem>
                          <SelectItem value="finance" className="text-foreground hover:bg-accent hover:text-accent-foreground">Finance</SelectItem>
                          <SelectItem value="operations" className="text-foreground hover:bg-accent hover:text-accent-foreground">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2 text-foreground">
                    <Building className="h-4 w-4 text-theme-accent" />
                    <span className="text-foreground">Additional Details</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-foreground">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Select category" className="text-foreground" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="hardware" className="text-foreground hover:bg-accent hover:text-accent-foreground">Hardware</SelectItem>
                          <SelectItem value="software" className="text-foreground hover:bg-accent hover:text-accent-foreground">Software</SelectItem>
                          <SelectItem value="network" className="text-foreground hover:bg-accent hover:text-accent-foreground">Network</SelectItem>
                          <SelectItem value="security" className="text-foreground hover:bg-accent hover:text-accent-foreground">Security</SelectItem>
                          <SelectItem value="access" className="text-foreground hover:bg-accent hover:text-accent-foreground">Access Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate" className="text-foreground">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        className="w-full bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-foreground">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        placeholder="urgent, server, maintenance..."
                        className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Form Actions */}
                <div className="flex gap-3">
                  <Button type="submit" className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground">
                    <span>Create Ticket</span>
                  </Button>
                  <Button type="button" variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                    <span>Save Draft</span>
                  </Button>
                  <Button type="button" variant="ghost" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                    <span>Reset Form</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Tickets */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Clock className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Recent Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-sm font-medium truncate text-foreground">{ticket.title}</div>
                        <div className="text-xs text-muted-foreground">{ticket.id}</div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge
                          className={`text-xs border ${statusColors[ticket.status as keyof typeof statusColors]}`}
                        >
                          <span>{ticket.status}</span>
                        </Badge>
                        <Badge
                          className={`text-xs border ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}
                        >
                          <span>{ticket.priority}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{ticket.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Statistics */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <AlertTriangle className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Open Tickets</span>
                  <span className="font-medium text-foreground">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">My Tickets</span>
                  <span className="font-medium text-foreground">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Overdue</span>
                  <span className="font-medium text-destructive">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Response</span>
                  <span className="font-medium text-foreground">2.4h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Templates */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <User className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Quick Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                  <span>Hardware Issue</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                  <span>Software Installation</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                  <span>Access Request</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                  <span>Network Problem</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

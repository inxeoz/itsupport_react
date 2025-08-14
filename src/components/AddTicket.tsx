import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, User, Calendar, AlertTriangle, Tag } from 'lucide-react';

export function AddTicket() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    assignee: '',
    category: '',
    dueDate: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2 text-foreground">Create New Ticket</h1>
        <p className="text-muted-foreground">Fill out the form below to create a new support ticket</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Plus className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Ticket Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed description of the issue"
                    rows={4}
                    className="w-full resize-none bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground">
                    <span>Create Ticket</span>
                  </Button>
                  <Button type="button" variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                    <span>Save Draft</span>
                  </Button>
                  <Button type="button" variant="ghost" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                    <span>Reset</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Tag className="h-5 w-5 text-theme-accent" />
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

          {/* Recent Tickets */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Calendar className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Recent Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-3">
                {[
                  { id: 'TK-2089', title: 'Server maintenance required', status: 'In Progress', priority: 'High' },
                  { id: 'TK-2088', title: 'Software installation request', status: 'Resolved', priority: 'Medium' },
                  { id: 'TK-2087', title: 'Network connectivity issue', status: 'Pending', priority: 'Critical' }
                ].map((ticket) => (
                  <div key={ticket.id} className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-sm font-medium truncate text-foreground">{ticket.title}</div>
                        <div className="text-xs text-muted-foreground">{ticket.id}</div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge 
                          className={`text-xs border ${
                            ticket.status === 'In Progress' ? 'bg-muted text-muted-foreground border-border' :
                            ticket.status === 'Resolved' ? 'bg-theme-accent/10 text-theme-accent border-theme-accent/10' :
                            ticket.status === 'Pending' ? 'bg-secondary text-secondary-foreground border-border' : 'bg-theme-accent/20 text-theme-accent border-theme-accent/20'
                          }`}
                        >
                          <span>{ticket.status}</span>
                        </Badge>
                        <Badge 
                          className={`text-xs border ${
                            ticket.priority === 'Critical' ? 'bg-destructive/20 text-destructive border-destructive/20' :
                            ticket.priority === 'High' ? 'bg-theme-accent/20 text-theme-accent border-theme-accent/20' :
                            ticket.priority === 'Medium' ? 'bg-muted text-muted-foreground border-border' : 'bg-theme-accent/10 text-theme-accent border-theme-accent/10'
                          }`}
                        >
                          <span>{ticket.priority}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
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
        </div>
      </div>
    </div>
  );
}
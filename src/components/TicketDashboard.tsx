import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, Filter, MoreHorizontal, Users, UserCheck, Clock, CheckCircle, FolderPlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface Ticket {
  id: number;
  title: string;
  description: string;
  employeeName: string;
  agent: string | null;
  status: 'New' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  requestType: 'Access request' | 'Device request' | 'Software' | 'Hardware' | 'Login issue';
  requestCategory: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  creationDate: string;
  email: string;
  incidents: number;
  resolutionDate: string | null;
  selected?: boolean;
}

interface Group {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  tickets: Ticket[];
  collapsed?: boolean;
}

const mockTicketData: Group[] = [
  {
    id: 'unassigned',
    name: 'Unassigned tickets',
    icon: <Users className="w-4 h-4" />,
    count: 3,
    tickets: [
      {
        id: 1,
        title: 'New Ticket',
        description: 'Login issue: We help...',
        employeeName: 'Caroline',
        agent: null,
        status: 'New',
        priority: 'Medium',
        requestType: 'Access request',
        requestCategory: 'Login',
        sentiment: 'Positive',
        creationDate: 'Aug 12',
        email: 'caroline@mytick.com',
        incidents: 0,
        resolutionDate: null,
      },
      {
        id: 2,
        title: 'New Ticket',
        description: '',
        employeeName: '',
        agent: null,
        status: 'New',
        priority: 'Low',
        requestType: 'Access request',
        requestCategory: 'Account',
        sentiment: 'Neutral',
        creationDate: 'Aug 12',
        email: '',
        incidents: 0,
        resolutionDate: null,
      },
      {
        id: 3,
        title: 'Request for access - new employee',
        description: 'Hello team: We help...',
        employeeName: 'Caroline',
        agent: null,
        status: 'New',
        priority: 'Medium',
        requestType: 'Access request',
        requestCategory: 'Access',
        sentiment: 'Positive',
        creationDate: 'May 2, 2024',
        email: 'caroline@mytick.com',
        incidents: 0,
        resolutionDate: null,
      },
    ],
  },
  {
    id: 'open',
    name: 'Open tickets',
    icon: <Clock className="w-4 h-4" />,
    count: 2,
    tickets: [
      {
        id: 4,
        title: 'Need help with my laptop',
        description: 'Hi team! I\'m hav...',
        employeeName: 'Maria',
        agent: 'John Smith',
        status: 'In Progress',
        priority: 'High',
        requestType: 'Device request',
        requestCategory: 'Hardware',
        sentiment: 'Negative',
        creationDate: 'Apr 16, 2024',
        email: 'maria@domain.com',
        incidents: 2,
        resolutionDate: null,
      },
      {
        id: 5,
        title: 'Add new user',
        description: '',
        employeeName: '',
        agent: 'Sarah Wilson',
        status: 'In Progress',
        priority: 'Medium',
        requestType: 'Access request',
        requestCategory: 'User',
        sentiment: 'Neutral',
        creationDate: 'Apr 15, 2024',
        email: '',
        incidents: 1,
        resolutionDate: null,
      },
    ],
  },
  {
    id: 'waiting',
    name: 'Waiting for response',
    icon: <UserCheck className="w-4 h-4" />,
    count: 1,
    tickets: [
      {
        id: 6,
        title: 'Login issue',
        description: '',
        employeeName: '',
        agent: 'Mike Johnson',
        status: 'Pending',
        priority: 'Medium',
        requestType: 'Login issue',
        requestCategory: 'Access',
        sentiment: 'Neutral',
        creationDate: 'Apr 15, 2024',
        email: '',
        incidents: 0,
        resolutionDate: null,
      },
    ],
  },
  {
    id: 'resolved',
    name: 'Resolved tickets',
    icon: <CheckCircle className="w-4 h-4" />,
    count: 1,
    tickets: [
      {
        id: 7,
        title: 'Add new group',
        description: '',
        employeeName: '',
        agent: 'David Brown',
        status: 'Resolved',
        priority: 'Low',
        requestType: 'Access request',
        requestCategory: 'Group',
        sentiment: 'Positive',
        creationDate: 'Apr 15, 2024',
        email: '',
        incidents: 0,
        resolutionDate: 'Apr 20, 2024',
      },
    ],
  },
];

export function TicketDashboard() {
  const [groups, setGroups] = useState<Group[]>(mockTicketData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('folder');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-600 text-white border-blue-600';
      case 'In Progress': return 'bg-purple-600 text-white border-purple-600';
      case 'Pending': return 'bg-yellow-600 text-white border-yellow-600';
      case 'Resolved': return 'bg-green-600 text-white border-green-600';
      case 'Closed': return 'bg-gray-600 text-white border-gray-600';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-600 text-white border-red-600';
      case 'High': return 'bg-orange-600 text-white border-orange-600';
      case 'Medium': return 'bg-yellow-600 text-white border-yellow-600';
      case 'Low': return 'bg-green-600 text-white border-green-600';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-600 text-white border-green-600';
      case 'Neutral': return 'bg-gray-600 text-white border-gray-600';
      case 'Negative': return 'bg-red-600 text-white border-red-600';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const toggleGroup = (groupId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, collapsed: !group.collapsed }
        : group
    ));
  };

  const toggleTicketSelection = (ticketId: number) => {
    const newSelection = new Set(selectedTickets);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const getAgentInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'users': return <Users className="w-4 h-4" />;
      case 'clock': return <Clock className="w-4 h-4" />;
      case 'usercheck': return <UserCheck className="w-4 h-4" />;
      case 'checkcircle': return <CheckCircle className="w-4 h-4" />;
      case 'folder': return <FolderPlus className="w-4 h-4" />;
      default: return <FolderPlus className="w-4 h-4" />;
    }
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      icon: getIconComponent(newGroupIcon),
      count: 0,
      tickets: [],
      collapsed: false,
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupIcon('folder');
    setIsAddGroupDialogOpen(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
  };

  const moveTicketToGroup = (ticketId: number, targetGroupId: string) => {
    setGroups(prevGroups => {
      const newGroups = [...prevGroups];
      let ticketToMove: Ticket | null = null;
      
      // Find and remove the ticket from its current group
      newGroups.forEach(group => {
        const ticketIndex = group.tickets.findIndex(t => t.id === ticketId);
        if (ticketIndex !== -1) {
          ticketToMove = group.tickets[ticketIndex];
          group.tickets.splice(ticketIndex, 1);
          group.count = group.tickets.length;
        }
      });
      
      // Add the ticket to the target group
      if (ticketToMove) {
        const targetGroup = newGroups.find(g => g.id === targetGroupId);
        if (targetGroup) {
          targetGroup.tickets.push(ticketToMove);
          targetGroup.count = targetGroup.tickets.length;
        }
      }
      
      return newGroups;
    });
  };

  const addNewTicketToGroup = (groupId: string) => {
    const newTicket: Ticket = {
      id: Date.now(),
      title: 'New Ticket',
      description: '',
      employeeName: '',
      agent: null,
      status: 'New',
      priority: 'Medium',
      requestType: 'Access request',
      requestCategory: 'General',
      sentiment: 'Neutral',
      creationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      email: '',
      incidents: 0,
      resolutionDate: null,
    };

    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId
          ? { ...group, tickets: [...group.tickets, newTicket], count: group.tickets.length + 1 }
          : group
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Toolbar */}
      <div className="border-b border-border p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" className="bg-primary text-[rgba(255,255,255,1)] hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" />
              New Board
            </Button>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-background"
              />
            </div>
            
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
            
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              📊 Group by
            </Button>
            
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">4/4/6 / 1</span>
            <Button variant="outline" size="sm">
              Automate / 1
            </Button>
            <Button variant="outline" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
              1,944 / 1
            </Button>
          </div>
        </div>
      </div>

      {/* Table Header - Responsive */}
      <div className="bg-muted/50 border-b border-border px-4 py-3 overflow-x-auto">
        <div className="flex items-center gap-4 text-sm text-muted-foreground min-w-[1500px]">
          <div className="w-10 flex items-center">
            <Checkbox />
          </div>
          <div className="w-48">Ticket</div>
          <div className="w-32">Description</div>
          <div className="w-28">Employee</div>
          <div className="w-24">Agent</div>
          <div className="w-24">Status</div>
          <div className="w-24">Priority</div>
          <div className="w-28">Request Type</div>
          <div className="w-24">Category</div>
          <div className="w-20">Sentiment</div>
          <div className="w-28">Creation Date</div>
          <div className="w-32">Email</div>
          <div className="w-20">Incidents</div>
          <div className="w-28">Resolution Date</div>
          <div className="w-8">Actions</div>
        </div>
      </div>

      {/* Ticket Groups */}
      <div className="flex-1 overflow-auto">
        {groups.map((group) => (
          <div key={group.id} className="border-b border-border group">
            {/* Group Header */}
            <div className="flex items-center justify-between p-4 hover:bg-accent/50 bg-card">
              <div 
                className="flex items-center gap-2 cursor-pointer flex-1"
                onClick={() => toggleGroup(group.id)}
              >
                {group.collapsed ? (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
                {group.icon}
                <span className="text-foreground">{group.name}</span>
                <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                  {group.count}
                </Badge>
              </div>
              
              {/* Group Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    addNewTicketToGroup(group.id);
                  }}
                  title="Add ticket to this group"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGroup(group.id);
                  }}
                  title="Delete this group"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Tickets */}
            {!group.collapsed && (
              <div>
                {group.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="px-4 py-3 hover:bg-accent/30 border-l-4 border-l-transparent hover:border-l-primary/20 overflow-x-auto group"
                  >
                    <div className="flex items-center gap-4 text-sm min-w-[1500px]">
                      <div className="w-10 flex items-center">
                        <Checkbox
                          checked={selectedTickets.has(ticket.id)}
                          onCheckedChange={() => toggleTicketSelection(ticket.id)}
                        />
                      </div>
                      
                      {/* Ticket */}
                      <div className="w-48 flex items-center gap-2">
                        <div className="w-6 h-6 bg-muted rounded flex items-center justify-center text-xs">
                          📄
                        </div>
                        <span className="text-foreground truncate">{ticket.title || 'New Ticket'}</span>
                      </div>
                      
                      {/* Description */}
                      <div className="w-32 text-muted-foreground truncate">
                        {ticket.description}
                      </div>
                      
                      {/* Employee name */}
                      <div className="w-28 text-foreground truncate">
                        {ticket.employeeName}
                      </div>
                      
                      {/* Agent */}
                      <div className="w-24 flex items-center">
                        {ticket.agent ? (
                          <div className="flex items-center gap-1">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-emerald-600 text-white">
                                {getAgentInitials(ticket.agent)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground text-xs truncate">{ticket.agent.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Status */}
                      <div className="w-24">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </Badge>
                      </div>
                      
                      {/* Priority */}
                      <div className="w-24">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      
                      {/* Request Type */}
                      <div className="w-28">
                        <Badge variant="secondary" className="text-xs bg-blue-600 text-white truncate">
                          {ticket.requestType}
                        </Badge>
                      </div>
                      
                      {/* Request Category */}
                      <div className="w-24">
                        <Badge variant="secondary" className="text-xs bg-gray-600 text-white">
                          {ticket.requestCategory}
                        </Badge>
                      </div>
                      
                      {/* Sentiment */}
                      <div className="w-20">
                        <Badge variant="outline" className={`text-xs ${getSentimentColor(ticket.sentiment)}`}>
                          {ticket.sentiment === 'Positive' ? '😊' : ticket.sentiment === 'Negative' ? '😞' : '😐'}
                        </Badge>
                      </div>
                      
                      {/* Creation Date */}
                      <div className="w-28">
                        <Badge variant="outline" className="text-xs bg-red-600 text-white border-red-600">
                          {ticket.creationDate}
                        </Badge>
                      </div>
                      
                      {/* Email */}
                      <div className="w-32 text-muted-foreground text-xs truncate">
                        {ticket.email}
                      </div>
                      
                      {/* Incidents */}
                      <div className="w-20 text-center">
                        <Badge variant="secondary" className="text-xs">
                          {ticket.incidents}
                        </Badge>
                      </div>
                      
                      {/* Resolution Date */}
                      <div className="w-28">
                        {ticket.resolutionDate ? (
                          <Badge variant="outline" className="text-xs bg-green-600 text-white border-green-600">
                            {ticket.resolutionDate}
                          </Badge>
                        ) : (
                          <div className="w-20 h-6 bg-muted rounded"></div>
                        )}
                      </div>

                      {/* Actions Menu */}
                      <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="text-xs">
                              Edit Ticket
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">
                              Move to group:
                            </div>
                            {groups
                              .filter(g => g.id !== group.id)
                              .map(targetGroup => (
                                <DropdownMenuItem
                                  key={targetGroup.id}
                                  className="text-xs pl-4"
                                  onClick={() => moveTicketToGroup(ticket.id, targetGroup.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    {targetGroup.icon}
                                    {targetGroup.name}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-destructive">
                              Delete Ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div className="p-4">
          <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add new group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Group</DialogTitle>
                <DialogDescription>
                  Create a new group to organize your tickets. Choose a name and icon for the group.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="Enter group name..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddGroup();
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="group-icon">Icon</Label>
                  <Select value={newGroupIcon} onValueChange={setNewGroupIcon}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="folder">
                        <div className="flex items-center gap-2">
                          <FolderPlus className="w-4 h-4" />
                          Folder
                        </div>
                      </SelectItem>
                      <SelectItem value="users">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Users
                        </div>
                      </SelectItem>
                      <SelectItem value="clock">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Clock
                        </div>
                      </SelectItem>
                      <SelectItem value="usercheck">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          User Check
                        </div>
                      </SelectItem>
                      <SelectItem value="checkcircle">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Check Circle
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddGroupDialogOpen(false);
                      setNewGroupName('');
                      setNewGroupIcon('folder');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddGroup}
                    disabled={!newGroupName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Group
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
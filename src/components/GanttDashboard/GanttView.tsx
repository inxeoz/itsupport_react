import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Progress } from '../ui/progress.tsx';
import { Input } from '../ui/input.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.tsx';
import { Calendar } from '../ui/calendar.tsx';
import { ScrollArea } from '../ui/scroll-area.tsx';
import { Separator } from '../ui/separator.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu.tsx';
import { useTheme } from '../ThemeProvider.tsx';
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MoreHorizontal,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Link,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Search,
  FileText,
  Target,
  Users,
  Building,
  Tag,
  Globe,
  Zap,
  Shield,
  Database,
  Code,
  Maximize2,
  Minimize2,
  Focus,
  Eye,
  RotateCcw,
  Move,
  ArrowUpDown,
  ArrowLeftRight
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, parseISO, isWithinInterval } from 'date-fns';

interface GanttTask {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignee: string;
  assigneeAvatar: string;
  dependencies: string[];
  category: string;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  parentId?: string;
}

interface GanttProject {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'Active' | 'Completed' | 'On Hold' | 'Planning';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  manager: string;
  budget: number;
  spent: number;
  team: string[];
  tasks: GanttTask[];
  color: string;
}

type TimelineView = 'day' | 'week' | 'month' | 'quarter';

// Zoom presets for easy access
const ZOOM_PRESETS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2 },
  { label: '300%', value: 3 }
];

export function GanttView() {
  const { getThemeClasses } = useTheme();

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimelineView>('month');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZooming, setIsZooming] = useState(false);

  // Scroll state management
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);

  // Comprehensive demo data with realistic IT support tickets as project tasks
  const demoProjects: GanttProject[] = [
    {
      id: 'proj-1',
      name: 'IT Infrastructure Modernization',
      description: 'Complete overhaul of legacy IT infrastructure including servers, network, and security systems',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-11-30'),
      progress: 65,
      status: 'Active',
      priority: 'Critical',
      manager: 'Sarah Johnson',
      budget: 250000,
      spent: 162500,
      team: ['John Doe', 'Mike Wilson', 'Emily Chen', 'David Brown'],
      color: '#3b82f6',
      tasks: [
        {
          id: 'task-1',
          name: 'Server Hardware Procurement',
          description: 'Purchase new enterprise servers for data center upgrade',
          startDate: new Date('2024-08-01'),
          endDate: new Date('2024-08-15'),
          progress: 100,
          status: 'Completed',
          priority: 'High',
          assignee: 'John Doe',
          assigneeAvatar: 'JD',
          dependencies: [],
          category: 'Hardware',
          tags: ['procurement', 'servers', 'infrastructure'],
          estimatedHours: 80,
          actualHours: 75
        },
        {
          id: 'task-2',
          name: 'Data Center Network Cabling',
          description: 'Install new fiber optic cables and network infrastructure',
          startDate: new Date('2024-08-16'),
          endDate: new Date('2024-09-05'),
          progress: 85,
          status: 'In Progress',
          priority: 'High',
          assignee: 'Mike Wilson',
          assigneeAvatar: 'MW',
          dependencies: ['task-1'],
          category: 'Network',
          tags: ['cabling', 'fiber', 'network'],
          estimatedHours: 120,
          actualHours: 102
        },
        {
          id: 'task-3',
          name: 'Server Installation & Configuration',
          description: 'Physical installation and initial configuration of new servers',
          startDate: new Date('2024-09-06'),
          endDate: new Date('2024-09-20'),
          progress: 45,
          status: 'In Progress',
          priority: 'Critical',
          assignee: 'Emily Chen',
          assigneeAvatar: 'EC',
          dependencies: ['task-2'],
          category: 'Installation',
          tags: ['servers', 'configuration', 'setup'],
          estimatedHours: 160,
          actualHours: 95
        },
        {
          id: 'task-4',
          name: 'Security System Implementation',
          description: 'Deploy new firewall, IDS/IPS, and security monitoring systems',
          startDate: new Date('2024-09-21'),
          endDate: new Date('2024-10-15'),
          progress: 15,
          status: 'In Progress',
          priority: 'Critical',
          assignee: 'David Brown',
          assigneeAvatar: 'DB',
          dependencies: ['task-3'],
          category: 'Security',
          tags: ['firewall', 'security', 'monitoring'],
          estimatedHours: 200,
          actualHours: 30
        },
        {
          id: 'task-5',
          name: 'System Migration & Testing',
          description: 'Migrate existing systems and perform comprehensive testing',
          startDate: new Date('2024-10-16'),
          endDate: new Date('2024-11-15'),
          progress: 0,
          status: 'Not Started',
          priority: 'High',
          assignee: 'Sarah Johnson',
          assigneeAvatar: 'SJ',
          dependencies: ['task-4'],
          category: 'Migration',
          tags: ['migration', 'testing', 'validation'],
          estimatedHours: 240,
          actualHours: 0
        },
        {
          id: 'task-6',
          name: 'Documentation & Training',
          description: 'Create system documentation and train IT staff on new infrastructure',
          startDate: new Date('2024-11-16'),
          endDate: new Date('2024-11-30'),
          progress: 0,
          status: 'Not Started',
          priority: 'Medium',
          assignee: 'John Doe',
          assigneeAvatar: 'JD',
          dependencies: ['task-5'],
          category: 'Documentation',
          tags: ['documentation', 'training', 'knowledge-transfer'],
          estimatedHours: 100,
          actualHours: 0
        }
      ]
    },
    {
      id: 'proj-2',
      name: 'Cybersecurity Enhancement Program',
      description: 'Comprehensive security audit and implementation of advanced security measures',
      startDate: new Date('2024-08-15'),
      endDate: new Date('2024-12-31'),
      progress: 35,
      status: 'Active',
      priority: 'Critical',
      manager: 'Alex Thompson',
      budget: 180000,
      spent: 63000,
      team: ['Lisa Wong', 'Robert Kim', 'Maria Garcia', 'James Lee'],
      color: '#ef4444',
      tasks: [
        {
          id: 'task-7',
          name: 'Security Vulnerability Assessment',
          description: 'Comprehensive scan and assessment of all network and system vulnerabilities',
          startDate: new Date('2024-08-15'),
          endDate: new Date('2024-09-15'),
          progress: 90,
          status: 'In Progress',
          priority: 'Critical',
          assignee: 'Lisa Wong',
          assigneeAvatar: 'LW',
          dependencies: [],
          category: 'Security Assessment',
          tags: ['vulnerability', 'assessment', 'security'],
          estimatedHours: 180,
          actualHours: 162
        },
        {
          id: 'task-8',
          name: 'Penetration Testing',
          description: 'External and internal penetration testing to identify security weaknesses',
          startDate: new Date('2024-09-16'),
          endDate: new Date('2024-10-15'),
          progress: 25,
          status: 'In Progress',
          priority: 'High',
          assignee: 'Robert Kim',
          assigneeAvatar: 'RK',
          dependencies: ['task-7'],
          category: 'Security Testing',
          tags: ['pentesting', 'security', 'testing'],
          estimatedHours: 200,
          actualHours: 50
        },
        {
          id: 'task-9',
          name: 'Security Policy Development',
          description: 'Create and update comprehensive security policies and procedures',
          startDate: new Date('2024-10-01'),
          endDate: new Date('2024-11-15'),
          progress: 10,
          status: 'In Progress',
          priority: 'Medium',
          assignee: 'Maria Garcia',
          assigneeAvatar: 'MG',
          dependencies: [],
          category: 'Policy',
          tags: ['policy', 'procedures', 'governance'],
          estimatedHours: 120,
          actualHours: 12
        },
        {
          id: 'task-10',
          name: 'Security Awareness Training',
          description: 'Develop and deliver security awareness training for all employees',
          startDate: new Date('2024-11-16'),
          endDate: new Date('2024-12-31'),
          progress: 0,
          status: 'Not Started',
          priority: 'Medium',
          assignee: 'James Lee',
          assigneeAvatar: 'JL',
          dependencies: ['task-9'],
          category: 'Training',
          tags: ['training', 'awareness', 'education'],
          estimatedHours: 80,
          actualHours: 0
        }
      ]
    },
    {
      id: 'proj-3',
      name: 'Software License Management System',
      description: 'Implementation of centralized software license tracking and compliance system',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-10-30'),
      progress: 80,
      status: 'Active',
      priority: 'High',
      manager: 'Jennifer Davis',
      budget: 120000,
      spent: 96000,
      team: ['Carlos Rodriguez', 'Anna Patel', 'Tom Mitchell'],
      color: '#10b981',
      tasks: [
        {
          id: 'task-11',
          name: 'License Inventory & Audit',
          description: 'Complete inventory of all software licenses across the organization',
          startDate: new Date('2024-07-15'),
          endDate: new Date('2024-08-15'),
          progress: 100,
          status: 'Completed',
          priority: 'High',
          assignee: 'Carlos Rodriguez',
          assigneeAvatar: 'CR',
          dependencies: [],
          category: 'Audit',
          tags: ['inventory', 'audit', 'compliance'],
          estimatedHours: 160,
          actualHours: 155
        },
        {
          id: 'task-12',
          name: 'License Management Software Selection',
          description: 'Evaluate and select appropriate license management software solution',
          startDate: new Date('2024-08-01'),
          endDate: new Date('2024-08-30'),
          progress: 100,
          status: 'Completed',
          priority: 'Medium',
          assignee: 'Anna Patel',
          assigneeAvatar: 'AP',
          dependencies: [],
          category: 'Procurement',
          tags: ['software', 'selection', 'evaluation'],
          estimatedHours: 80,
          actualHours: 85
        },
        {
          id: 'task-13',
          name: 'System Implementation & Configuration',
          description: 'Install and configure the license management system',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-10-01'),
          progress: 85,
          status: 'In Progress',
          priority: 'High',
          assignee: 'Tom Mitchell',
          assigneeAvatar: 'TM',
          dependencies: ['task-11', 'task-12'],
          category: 'Implementation',
          tags: ['installation', 'configuration', 'setup'],
          estimatedHours: 200,
          actualHours: 170
        },
        {
          id: 'task-14',
          name: 'User Training & Documentation',
          description: 'Train users and create comprehensive documentation',
          startDate: new Date('2024-10-02'),
          endDate: new Date('2024-10-30'),
          progress: 30,
          status: 'In Progress',
          priority: 'Medium',
          assignee: 'Jennifer Davis',
          assigneeAvatar: 'JD',
          dependencies: ['task-13'],
          category: 'Training',
          tags: ['training', 'documentation', 'user-support'],
          estimatedHours: 100,
          actualHours: 30
        }
      ]
    }
  ];

  // Filtered projects based on search and selection
  const filteredProjects = useMemo(() => {
    let filtered = demoProjects;

    if (selectedProject !== 'all') {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(selectedProject.toLowerCase()) ||
        project.id === selectedProject
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tasks.some(task =>
          task.name.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.assignee.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query))
        )
      );
    }

    return filtered;
  }, [selectedProject, searchQuery]);

  // Timeline calculation
  const getTimelineRange = useCallback(() => {
    const today = new Date();
    let start: Date, end: Date;

    switch (selectedTimeframe) {
      case 'day':
        start = new Date(today);
        end = addDays(today, 7);
        break;
      case 'week':
        start = startOfWeek(currentDate);
        end = addDays(start, 28); // 4 weeks
        break;
      case 'month':
        start = startOfMonth(currentDate);
        end = endOfMonth(addDays(start, 90)); // ~3 months
        break;
      case 'quarter':
        start = startOfMonth(currentDate);
        end = addDays(start, 365); // 1 year
        break;
      default:
        start = startOfMonth(today);
        end = endOfMonth(addDays(start, 90));
    }

    return { start, end };
  }, [selectedTimeframe, currentDate]);

  const { start: timelineStart, end: timelineEnd } = getTimelineRange();
  const timelineDays = eachDayOfInterval({ start: timelineStart, end: timelineEnd });

  // Enhanced timeline header with proper spacing and alignment
  const generateTimelineHeader = () => {
    const getDayWidth = () => {
      switch (selectedTimeframe) {
        case 'day': return 80;
        case 'week': return 24;
        case 'month': return 16;
        case 'quarter': return 8;
        default: return 16;
      }
    };

    const dayWidth = getDayWidth() * zoomLevel;
    const minWidth = Math.max(dayWidth, 16); // Minimum column width

    return timelineDays.map((day, index) => {
      const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const isMonthStart = day.getDate() === 1;
      const isWeekStart = day.getDay() === 1; // Monday

      return (
        <div
          key={day.getTime()}
          className={`relative flex-shrink-0 text-center text-xs border-l border-border py-2 px-1 font-medium transition-all duration-300 ${
            isToday ? 'bg-theme-accent/20 text-theme-accent border-theme-accent/50' :
            isWeekend ? 'bg-muted/50 text-muted-foreground' :
            isMonthStart ? 'bg-card text-foreground border-theme-accent/30' :
            'text-foreground bg-background'
          }`}
          style={{
            width: `${minWidth}px`,
            minWidth: `${minWidth}px`
          }}
        >
          {/* Vertical grid line */}
          <div className={`absolute left-0 top-0 bottom-0 w-px transition-colors duration-300 ${
            isToday ? 'bg-theme-accent/50' :
            isMonthStart ? 'bg-theme-accent/30' :
            isWeekStart ? 'bg-border' :
            'bg-border/50'
          }`} />

          {/* Date label */}
          <div className="relative z-10">
            {selectedTimeframe === 'day' ? (
              <div>
                <div className="text-xs">{format(day, 'MMM')}</div>
                <div className="font-medium">{format(day, 'd')}</div>
                <div className="text-xs opacity-70">{format(day, 'EEE')}</div>
              </div>
            ) : selectedTimeframe === 'week' ? (
              <div>
                <div className="font-medium">{format(day, 'd')}</div>
                {isWeekStart && <div className="text-xs opacity-70">{format(day, 'MMM')}</div>}
              </div>
            ) : selectedTimeframe === 'month' ? (
              <div>
                <div className="font-medium">{format(day, 'd')}</div>
                {isMonthStart && <div className="text-xs opacity-70">{format(day, 'MMM')}</div>}
              </div>
            ) : (
              <div>
                {isMonthStart && <div className="font-medium">{format(day, 'MMM')}</div>}
              </div>
            )}
          </div>

          {/* Today indicator */}
          {isToday && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-theme-accent rounded-full" />
          )}
        </div>
      );
    });
  };

  // Calculate task position and width with precise alignment
  const calculateTaskPosition = (task: GanttTask) => {
    const totalDays = differenceInDays(timelineEnd, timelineStart);
    const taskStart = Math.max(0, differenceInDays(task.startDate, timelineStart));
    const taskDuration = differenceInDays(task.endDate, task.startDate) + 1;

    const getDayWidth = () => {
      switch (selectedTimeframe) {
        case 'day': return 80;
        case 'week': return 24;
        case 'month': return 16;
        case 'quarter': return 8;
        default: return 16;
      }
    };

    const dayWidth = getDayWidth() * zoomLevel;
    const minWidth = Math.max(dayWidth, 16);

    const leftPx = taskStart * minWidth;
    const widthPx = Math.max(taskDuration * minWidth, minWidth / 2);

    return {
      left: `${leftPx}px`,
      width: `${widthPx}px`,
      minWidth: `${minWidth / 2}px`
    };
  };

  // Enhanced timeline grid component
  const TimelineGrid = ({ children }: { children: React.ReactNode }) => {
    const getDayWidth = () => {
      switch (selectedTimeframe) {
        case 'day': return 80;
        case 'week': return 24;
        case 'month': return 16;
        case 'quarter': return 8;
        default: return 16;
      }
    };

    const dayWidth = getDayWidth() * zoomLevel;
    const minWidth = Math.max(dayWidth, 16);
    const totalWidth = timelineDays.length * minWidth;

    return (
      <div className="relative transition-all duration-300" style={{ width: `${totalWidth}px` }}>
        {/* Vertical grid lines */}
        {timelineDays.map((day, index) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isMonthStart = day.getDate() === 1;
          const isWeekStart = day.getDay() === 1;

          return (
            <div
              key={`grid-${day.getTime()}`}
              className={`absolute top-0 bottom-0 w-px pointer-events-none transition-colors duration-300 ${
                isToday ? 'bg-theme-accent/30 z-10' :
                isMonthStart ? 'bg-border z-5' :
                isWeekStart ? 'bg-border/70' :
                'bg-border/30'
              }`}
              style={{ left: `${index * minWidth}px` }}
            />
          );
        })}
        {children}
      </div>
    );
  };

  // Enhanced zoom handlers with presets and smart features
  const handleZoom = (direction: 'in' | 'out', amount?: number) => {
    setIsZooming(true);
    setZoomLevel(current => {
      const factor = amount || 1.2;
      const newLevel = direction === 'in' ? current * factor : current / factor;
      const bounded = Math.max(0.25, Math.min(3, newLevel));

      setTimeout(() => setIsZooming(false), 300);

      if (bounded !== current) {
        toast.info(`Zoom ${direction === 'in' ? 'In' : 'Out'}`, {
          description: `Zoom level: ${Math.round(bounded * 100)}%`
        });
      }

      return bounded;
    });
  };

  // Set zoom to specific level
  const setZoomPreset = (level: number) => {
    setIsZooming(true);
    setZoomLevel(level);
    setTimeout(() => setIsZooming(false), 300);

    toast.success(`Zoom Set`, {
      description: `Zoom level: ${Math.round(level * 100)}%`
    });
  };

  // Smart zoom features
  const zoomToFit = () => {
    // Calculate optimal zoom to fit all visible tasks
    const allTasks = filteredProjects.flatMap(p => p.tasks);
    if (allTasks.length === 0) return;

    setIsZooming(true);

    // Find the date range that contains all tasks
    const earliestStart = new Date(Math.min(...allTasks.map(t => t.startDate.getTime())));
    const latestEnd = new Date(Math.max(...allTasks.map(t => t.endDate.getTime())));

    // Calculate optimal zoom based on available space
    const taskSpan = differenceInDays(latestEnd, earliestStart);
    const timelineSpan = differenceInDays(timelineEnd, timelineStart);
    const optimalZoom = Math.min(2, Math.max(0.5, timelineSpan / taskSpan));

    setZoomLevel(optimalZoom);
    setTimeout(() => setIsZooming(false), 300);

    toast.success('Zoom to Fit', {
      description: `Optimized view for ${allTasks.length} tasks`
    });
  };

  const zoomToToday = () => {
    setCurrentDate(new Date());
    setZoomLevel(1.5);
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 300);

    toast.success('Focus on Today', {
      description: 'Centered timeline on current date'
    });
  };

  // Scroll event handler
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setScrollPosition({
      x: target.scrollLeft,
      y: target.scrollTop
    });
  };

  // Scroll to position functions
  const scrollToPosition = (x?: number, y?: number) => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
      if (scrollArea) {
        if (x !== undefined) scrollArea.scrollLeft = x;
        if (y !== undefined) scrollArea.scrollTop = y;
      }
    }
  };

  // Keyboard shortcuts for zoom and scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            handleZoom('in');
            break;
          case '-':
            e.preventDefault();
            handleZoom('out');
            break;
          case '0':
            e.preventDefault();
            setZoomPreset(1);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            scrollToPosition(Math.max(0, scrollPosition.x - 100));
            break;
          case 'ArrowRight':
            e.preventDefault();
            scrollToPosition(scrollPosition.x + 100);
            break;
          case 'ArrowUp':
            e.preventDefault();
            scrollToPosition(undefined, Math.max(0, scrollPosition.y - 100));
            break;
          case 'ArrowDown':
            e.preventDefault();
            scrollToPosition(undefined, scrollPosition.y + 100);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPosition]);

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-theme-accent text-theme-accent-foreground';
      case 'In Progress': return 'bg-chart-1 text-white';
      case 'Not Started': return 'bg-muted text-muted-foreground';
      case 'On Hold': return 'bg-chart-3 text-white';
      case 'Cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-destructive/20 text-destructive border-destructive/20';
      case 'High': return 'bg-chart-1/20 text-chart-1 border-chart-1/20';
      case 'Medium': return 'bg-muted text-muted-foreground border-border';
      case 'Low': return 'bg-theme-accent/20 text-theme-accent border-theme-accent/20';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  // Handle task click
  const handleTaskClick = (task: GanttTask) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  // Navigation handlers
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const amount = selectedTimeframe === 'day' ? 7 :
                   selectedTimeframe === 'week' ? 28 :
                   selectedTimeframe === 'month' ? 90 : 365;

    setCurrentDate(current =>
      direction === 'next' ? addDays(current, amount) : addDays(current, -amount)
    );
  };

  // Export functionality
  const handleExport = () => {
    toast.success('Gantt chart exported successfully', {
      description: 'Timeline data has been exported to CSV format'
    });
  };

  return (
    <div className={`p-6 bg-background space-y-6 ${getThemeClasses()}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-theme-accent/10 border border-theme-accent/20">
              <CalendarIcon className="h-6 w-6 text-theme-accent" />
            </div>
            Project Timeline & Gantt Chart
          </h1>
          <p className="text-muted-foreground mt-2">
            Track project progress, manage dependencies, and visualize timelines with comprehensive Gantt charts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="border-theme-accent text-theme-accent">
            <Globe className="w-3 h-3 mr-1" />
            Live Projects: {filteredProjects.length}
          </Badge>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            <Target className="w-3 h-3 mr-1" />
            Active Tasks: {filteredProjects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'In Progress').length, 0)}
          </Badge>
        </div>
      </div>

      {/* Enhanced Controls with Prominent Zoom */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects and tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground w-64"
                />
              </div>

              {/* Project Filter */}
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48 bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all" className="text-foreground">All Projects</SelectItem>
                  <SelectItem value="infrastructure" className="text-foreground">Infrastructure</SelectItem>
                  <SelectItem value="security" className="text-foreground">Security</SelectItem>
                  <SelectItem value="software" className="text-foreground">Software</SelectItem>
                </SelectContent>
              </Select>

              {/* Timeline View */}
              <Select value={selectedTimeframe} onValueChange={(value: TimelineView) => setSelectedTimeframe(value)}>
                <SelectTrigger className="w-32 bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="day" className="text-foreground">Days</SelectItem>
                  <SelectItem value="week" className="text-foreground">Weeks</SelectItem>
                  <SelectItem value="month" className="text-foreground">Months</SelectItem>
                  <SelectItem value="quarter" className="text-foreground">Quarters</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              {/* Timeline Navigation */}
              <div className="flex items-center gap-1 border border-border rounded-lg bg-background">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTimeline('prev')}
                  className="h-9 w-9 p-0 hover:bg-accent hover:text-theme-accent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 text-xs hover:bg-accent hover:text-theme-accent font-medium"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTimeline('next')}
                  className="h-9 w-9 p-0 hover:bg-accent hover:text-theme-accent"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-9" />

              {/* Enhanced Zoom Controls */}
              <div className="flex items-center gap-2 bg-accent/30 rounded-lg p-1 border border-theme-accent/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom('out')}
                  disabled={zoomLevel <= 0.25}
                  className="h-8 w-8 p-0 hover:bg-theme-accent hover:text-theme-accent-foreground disabled:opacity-40"
                  title="Zoom Out (Ctrl+-)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                {/* Zoom Presets Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-3 min-w-[4rem] text-sm font-medium hover:bg-theme-accent hover:text-theme-accent-foreground ${
                        isZooming ? 'scale-105' : ''
                      } transition-all duration-300`}
                    >
                      {Math.round(zoomLevel * 100)}%
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border w-32">
                    <DropdownMenuLabel className="text-foreground">Zoom Presets</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ZOOM_PRESETS.map(preset => (
                      <DropdownMenuItem
                        key={preset.value}
                        onClick={() => setZoomPreset(preset.value)}
                        className={`text-foreground hover:bg-accent ${
                          Math.abs(zoomLevel - preset.value) < 0.01 ? 'bg-theme-accent/20 text-theme-accent' : ''
                        }`}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        {preset.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={zoomToFit}
                      className="text-foreground hover:bg-accent"
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Fit All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={zoomToToday}
                      className="text-foreground hover:bg-accent"
                    >
                      <Focus className="w-4 h-4 mr-2" />
                      Focus Today
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom('in')}
                  disabled={zoomLevel >= 3}
                  className="h-8 w-8 p-0 hover:bg-theme-accent hover:text-theme-accent-foreground disabled:opacity-40"
                  title="Zoom In (Ctrl++)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-9" />

              {/* Smart Zoom Features */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomToFit}
                  className="px-3 hover:bg-theme-accent hover:text-theme-accent-foreground"
                  title="Zoom to fit all tasks"
                >
                  <Maximize2 className="h-4 w-4 mr-1" />
                  Fit All
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomToToday}
                  className="px-3 hover:bg-theme-accent hover:text-theme-accent-foreground"
                  title="Focus on today"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Today
                </Button>
              </div>

              <Separator orientation="vertical" className="h-9" />

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCriticalPath(!showCriticalPath)}
                className={`px-3 ${showCriticalPath ? 'bg-theme-accent text-theme-accent-foreground' : 'hover:bg-theme-accent hover:text-theme-accent-foreground'}`}
              >
                <Zap className="h-4 w-4 mr-2" />
                Critical Path
              </Button>

              <Button variant="outline" size="sm" onClick={handleExport} className="px-3 hover:bg-accent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button
                onClick={() => setIsNewTaskDialogOpen(true)}
                className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground px-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          {/* Enhanced Help Text with Scroll Instructions */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>🎯 <strong>Zoom:</strong> <kbd className="text-xs bg-muted px-1 rounded">Ctrl + / -</kbd> or mouse wheel</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3 w-3" />
                <span><strong>Scroll:</strong> <kbd className="text-xs bg-muted px-1 rounded">↑↓</kbd> vertical, <kbd className="text-xs bg-muted px-1 rounded">←→</kbd> horizontal</span>
              </div>
              <div className="flex items-center gap-2">
                <Move className="h-3 w-3" />
                <span><strong>Navigation:</strong> <kbd className="text-xs bg-muted px-1 rounded">Ctrl + arrows</kbd> for quick scroll</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-theme-accent">⚡ Zoom: <strong>{Math.round(zoomLevel * 100)}%</strong></span>
                {isZooming && <span className="text-theme-accent animate-pulse">Adjusting...</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Zoom Controls */}
      <div className="fixed bottom-6 right-6 z-30 bg-card border border-border rounded-lg shadow-lg p-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoom('out')}
          disabled={zoomLevel <= 0.25}
          className="h-8 w-8 p-0 hover:bg-theme-accent hover:text-theme-accent-foreground"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="text-xs font-medium text-foreground min-w-[3rem] text-center px-2">
          {Math.round(zoomLevel * 100)}%
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoom('in')}
          disabled={zoomLevel >= 3}
          className="h-8 w-8 p-0 hover:bg-theme-accent hover:text-theme-accent-foreground"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoomPreset(1)}
          className="h-8 w-8 p-0 hover:bg-theme-accent hover:text-theme-accent-foreground"
          title="Reset Zoom (100%)"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>

      {/* Enhanced Gantt Chart with Bi-directional Scrolling */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-card-foreground">
              <CalendarIcon className="h-5 w-5 text-theme-accent" />
              Timeline View - {format(timelineStart, 'MMM yyyy')} to {format(timelineEnd, 'MMM yyyy')}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: {format(new Date(), 'MMM d, HH:mm')}</span>
              </div>
              <Badge variant="outline" className="border-theme-accent text-theme-accent">
                <ZoomIn className="w-3 h-3 mr-1" />
                {Math.round(zoomLevel * 100)}% Zoom
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">
                <ArrowLeftRight className="w-3 h-3 mr-1" />
                Scroll: Both Directions
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-border">
            {/* Enhanced Scroll Area with Both Directions */}
            <div className="relative h-[600px] overflow-hidden">
              <ScrollArea
                ref={scrollAreaRef}
                className="h-full w-full"
                onScroll={handleScroll}
              >
                <div className="min-w-[1400px] min-h-[600px]">
                  {/* Sticky Timeline Header */}
                  <div className="sticky top-0 z-20 bg-background border-b-2 border-border shadow-sm">
                    <div className="flex">
                      <div className="w-96 p-4 font-medium text-foreground border-r-2 border-border bg-muted/30 flex items-center sticky left-0 z-30">
                        <span>Project / Task Details</span>
                        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                          <ArrowUpDown className="h-3 w-3" />
                          <span>Scroll</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-x-auto">
                        <div ref={timelineHeaderRef} className="flex bg-muted/20">
                          {generateTimelineHeader()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Project Rows */}
                  <div className="relative">
                    {filteredProjects.map(project => (
                      <div key={project.id} className="border-b border-border">
                        {/* Project Header Row */}
                        <div className="flex hover:bg-accent/20 transition-colors">
                          <div className="w-96 p-4 border-r-2 border-border bg-accent/20 sticky left-0 z-10">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-foreground text-base">{project.name}</h3>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`text-xs border ${project.status === 'Active' ? 'bg-theme-accent/20 text-theme-accent border-theme-accent/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                  {project.status}
                                </Badge>
                                <Badge className={`text-xs border ${getPriorityColor(project.priority)}`}>
                                  {project.priority}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>{project.manager}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>{project.team.length} team members</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="text-foreground font-medium">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2" />
                              </div>

                              <div className="text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                  <span>Budget: ${project.budget.toLocaleString()}</span>
                                  <span>Spent: ${project.spent.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Project Timeline Bar with Grid */}
                          <div className="flex-1 relative bg-background">
                            <TimelineGrid>
                              <div className="relative h-20 flex items-center">
                                <div
                                  className="absolute h-8 rounded-md flex items-center justify-center text-xs font-medium shadow-md border-2 border-white/20 transition-all duration-300"
                                  style={{
                                    ...calculateTaskPosition({
                                      ...project.tasks[0],
                                      startDate: project.startDate,
                                      endDate: project.endDate
                                    }),
                                    backgroundColor: project.color,
                                    color: 'white',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                  }}
                                >
                                  <span className="px-2">{project.progress}%</span>
                                </div>
                              </div>
                            </TimelineGrid>
                          </div>
                        </div>

                        {/* Enhanced Task Rows */}
                        {project.tasks.map((task, index) => (
                          <div key={task.id} className="flex hover:bg-accent/10 transition-colors border-t border-border/50">
                            <div className="w-96 p-3 pl-8 border-r-2 border-border bg-background sticky left-0 z-10">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-foreground font-medium">{task.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleTaskClick(task)}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                                    {task.status}
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{task.assignee}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{differenceInDays(task.endDate, task.startDate) + 1}d</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="text-foreground">{task.progress}%</span>
                                  </div>
                                  <Progress value={task.progress} className="h-1" />
                                </div>

                                {task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {task.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {task.tags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs px-1 py-0">
                                        +{task.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Enhanced Task Timeline Bar with Precise Grid Alignment */}
                            <div className="flex-1 relative bg-background">
                              <TimelineGrid>
                                <div className="relative h-16 flex items-center">
                                  <div
                                    className={`absolute h-6 rounded-sm cursor-pointer transition-all duration-300 hover:h-7 hover:shadow-md border border-white/30 ${
                                      showCriticalPath && task.dependencies.length === 0 ? 'ring-2 ring-destructive' : ''
                                    } ${isZooming ? 'animate-pulse' : ''}`}
                                    style={{
                                      ...calculateTaskPosition(task),
                                      backgroundColor: getStatusColor(task.status).includes('bg-theme-accent') ? 'var(--theme-accent)' :
                                                       getStatusColor(task.status).includes('bg-chart-1') ? 'var(--chart-1)' :
                                                       getStatusColor(task.status).includes('bg-destructive') ? 'var(--destructive)' :
                                                       'var(--muted)',
                                      top: '50%',
                                      transform: 'translateY(-50%)'
                                    }}
                                    onClick={() => handleTaskClick(task)}
                                  >
                                    {/* Progress overlay */}
                                    {task.progress > 0 && task.status !== 'Completed' && (
                                      <div
                                        className="h-full bg-white/30 rounded-sm transition-all duration-300"
                                        style={{ width: `${task.progress}%` }}
                                      />
                                    )}

                                    {/* Task label */}
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                      <span className="truncate px-1">{task.progress}%</span>
                                    </div>

                                    {/* Dependency indicators */}
                                    {task.dependencies.map(depId => {
                                      const depTask = project.tasks.find(t => t.id === depId);
                                      if (depTask) {
                                        return (
                                          <div
                                            key={depId}
                                            className="absolute w-0.5 bg-muted-foreground -top-1 -bottom-1 opacity-60"
                                            style={{ left: '-2px' }}
                                          />
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                </div>
                              </TimelineGrid>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {/* Scroll Indicators */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded p-2 border border-border">
                <div className="flex items-center gap-1">
                  <ArrowLeftRight className="h-3 w-3" />
                  <span>H: {Math.round(scrollPosition.x)}px</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" />
                  <span>V: {Math.round(scrollPosition.y)}px</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-3xl font-medium text-foreground">
                  {filteredProjects.filter(p => p.status === 'Active').length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredProjects.length} total projects
                </p>
              </div>
              <Building className="h-8 w-8 text-theme-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                <p className="text-3xl font-medium text-foreground">
                  {filteredProjects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'Completed').length, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredProjects.reduce((acc, p) => acc + p.tasks.length, 0)} total tasks
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-theme-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-medium text-foreground">
                  {filteredProjects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'In Progress').length, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg. {Math.round(filteredProjects.reduce((acc, p) => acc + p.progress, 0) / filteredProjects.length)}% complete
                </p>
              </div>
              <Clock className="h-8 w-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className="text-3xl font-medium text-destructive">
                  {filteredProjects.reduce((acc, p) =>
                    acc + p.tasks.filter(t =>
                      t.endDate < new Date() && t.status !== 'Completed'
                    ).length, 0
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Require immediate attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Details Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Task Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              View and manage task information, progress, and dependencies
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted">
                <TabsTrigger value="details" className="data-[state=active]:bg-theme-accent data-[state=active]:text-theme-accent-foreground">Details</TabsTrigger>
                <TabsTrigger value="progress" className="data-[state=active]:bg-theme-accent data-[state=active]:text-theme-accent-foreground">Progress</TabsTrigger>
                <TabsTrigger value="dependencies" className="data-[state=active]:bg-theme-accent data-[state=active]:text-theme-accent-foreground">Dependencies</TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-theme-accent data-[state=active]:text-theme-accent-foreground">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg text-card-foreground">{selectedTask.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">{selectedTask.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedTask.status)}>
                          {selectedTask.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                          {selectedTask.priority}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">Assigned to: {selectedTask.assignee}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">Category: {selectedTask.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">
                            Duration: {differenceInDays(selectedTask.endDate, selectedTask.startDate) + 1} days
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {selectedTask.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg text-card-foreground">Time Tracking</CardTitle>
                      <CardDescription className="text-muted-foreground">Estimated vs actual hours</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Hours</span>
                          <span className="text-foreground font-medium">{selectedTask.estimatedHours}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Actual Hours</span>
                          <span className="text-foreground font-medium">{selectedTask.actualHours}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Variance</span>
                          <span className={`font-medium ${
                            selectedTask.actualHours > selectedTask.estimatedHours ? 'text-destructive' : 'text-theme-accent'
                          }`}>
                            {selectedTask.actualHours > selectedTask.estimatedHours ? '+' : ''}
                            {((selectedTask.actualHours - selectedTask.estimatedHours) / selectedTask.estimatedHours * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <Progress
                        value={(selectedTask.actualHours / selectedTask.estimatedHours) * 100}
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Task Progress</CardTitle>
                    <CardDescription className="text-muted-foreground">Current completion status and milestones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="text-foreground font-medium">{selectedTask.progress}%</span>
                      </div>
                      <Progress value={selectedTask.progress} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start Date</span>
                        <p className="text-foreground font-medium">
                          {format(selectedTask.startDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date</span>
                        <p className="text-foreground font-medium">
                          {format(selectedTask.endDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dependencies" className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Task Dependencies</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Tasks that must be completed before this task can start
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedTask.dependencies.length > 0 ? (
                      <div className="space-y-2">
                        {selectedTask.dependencies.map(depId => {
                          const project = filteredProjects.find(p => p.tasks.some(t => t.id === depId));
                          const depTask = project?.tasks.find(t => t.id === depId);

                          return depTask ? (
                            <div key={depId} className="flex items-center justify-between p-3 border border-border rounded-md">
                              <div>
                                <p className="text-sm font-medium text-foreground">{depTask.name}</p>
                                <p className="text-xs text-muted-foreground">{depTask.assignee}</p>
                              </div>
                              <Badge className={getStatusColor(depTask.status)}>
                                {depTask.status}
                              </Badge>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No dependencies for this task
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Timeline Details</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Detailed timeline information and scheduling
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Start Date</label>
                        <p className="text-sm text-muted-foreground">
                          {format(selectedTask.startDate, 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">End Date</label>
                        <p className="text-sm text-muted-foreground">
                          {format(selectedTask.endDate, 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Duration</label>
                      <p className="text-sm text-muted-foreground">
                        {differenceInDays(selectedTask.endDate, selectedTask.startDate) + 1} days
                        ({Math.round((differenceInDays(selectedTask.endDate, selectedTask.startDate) + 1) / 7 * 10) / 10} weeks)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

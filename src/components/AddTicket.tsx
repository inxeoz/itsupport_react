import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { useTheme } from './ThemeProvider';
import { frappeApi, type FrappeTicket } from '../services/frappeApi';
import { toast } from "sonner";
import { 
  Plus, 
  User, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  Tag, 
  Clock,
  Building2,
  Phone,
  Mail,
  FileText,
  Upload,
  Save,
  Send,
  RefreshCw,
  Settings,
  Target,
  Users,
  Briefcase,
  CheckCircle2,
  Loader2,
  X,
  Copy,
  Zap,
  Database,
  Workflow,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface TicketFormData {
  // Basic Information
  title: string;
  description: string;
  user_name: string;
  
  // Contact Information
  contact_email: string;
  contact_phone: string;
  department: string;
  
  // Classification
  category: string;
  subcategory: string;
  priority: string;
  impact: string;
  
  // Assignment & Workflow
  status: string;
  assignee: string;
  due_datetime: string;
  
  // Resolution & Tracking
  resolution_summary: string;
  root_cause: string;
  requester_confirmation: string;
  time_spent: number | null;
  
  // Metadata
  tags: string;
  attachments: string;
  docstatus: number;
}

interface TemplateData extends Partial<TicketFormData> {
  id: string;
  name: string;
  description_preview: string;
}

export function AddTicket() {
  const { getThemeClasses } = useTheme();
  
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    description: '',
    user_name: '',
    contact_email: '',
    contact_phone: '',
    department: '',
    category: 'Software', // Set default instead of empty string
    subcategory: '',
    priority: 'Medium',
    impact: 'Single User',
    status: 'New',
    assignee: '',
    due_datetime: '',
    resolution_summary: '',
    root_cause: '',
    requester_confirmation: '',
    time_spent: null,
    tags: '',
    attachments: '',
    docstatus: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState('basic');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Professional templates for different ticket types
  const templates: TemplateData[] = [
    {
      id: 'hardware-failure',
      name: 'Hardware Failure',
      description_preview: 'Hardware component malfunction or failure',
      category: 'Hardware',
      subcategory: 'Hardware Failure',
      priority: 'High',
      impact: 'Single User',
      title: 'Hardware component failure',
      description: 'Hardware component is malfunctioning or has failed completely. Please provide details about the specific component, error symptoms, and any error messages.',
      tags: 'hardware,failure,urgent'
    },
    {
      id: 'software-installation',
      name: 'Software Installation',
      description_preview: 'Request for software installation or configuration',
      category: 'Software',
      subcategory: 'Installation',
      priority: 'Medium',
      impact: 'Single User',
      title: 'Software installation request',
      description: 'Request for installation or configuration of software application. Please specify the software name, version, licensing requirements, and business justification.',
      tags: 'software,installation,setup'
    },
    {
      id: 'network-connectivity',
      name: 'Network Issue',
      description_preview: 'Network connectivity or performance problems',
      category: 'Network',
      subcategory: 'Connectivity',
      priority: 'High',
      impact: 'Multiple Users',
      title: 'Network connectivity issue',
      description: 'Network connectivity problem affecting work productivity. Please describe the symptoms, affected areas, and any error messages encountered.',
      tags: 'network,connectivity,performance'
    },
    {
      id: 'security-incident',
      name: 'Security Incident',
      description_preview: 'Security-related incident or vulnerability',
      category: 'Security',
      subcategory: 'Incident Response',
      priority: 'Critical',
      impact: 'Organization-wide',
      title: 'Security incident report',
      description: 'Security incident requiring immediate attention. Please provide all available details while maintaining confidentiality. Do not include sensitive information in this description.',
      tags: 'security,incident,critical,confidential'
    },
    {
      id: 'access-request',
      name: 'Access Request',
      description_preview: 'Request for system or resource access',
      category: 'Access Request',
      subcategory: 'System Access',
      priority: 'Medium',
      impact: 'Single User',
      title: 'System access request',
      description: 'Request for access to system, application, or resource. Please specify the required access level, business justification, and supervisor approval.',
      tags: 'access,permissions,approval'
    },
    {
      id: 'performance-issue',
      name: 'Performance Issue',
      description_preview: 'System or application performance problems',
      category: 'Software',
      subcategory: 'Performance',
      priority: 'Medium',
      impact: 'Multiple Users',
      title: 'System performance issue',
      description: 'System or application experiencing performance degradation. Please provide specific symptoms, affected processes, and performance metrics if available.',
      tags: 'performance,optimization,slow'
    }
  ];

  // Department options
  const departments = [
    'IT', 'Development', 'Security', 'Operations', 'Sales', 'Marketing', 
    'Finance', 'HR', 'Legal', 'Procurement', 'Administration', 'Executive'
  ];

  // Priority options with SLA implications
  const priorities = [
    { value: 'Critical', sla: '4 hours', color: 'bg-destructive', description: 'Business-critical, immediate attention required' },
    { value: 'High', sla: '12 hours', color: 'bg-chart-1', description: 'High impact on business operations' },
    { value: 'Medium', sla: '2 days', color: 'bg-theme-accent', description: 'Normal business impact' },
    { value: 'Low', sla: '5 days', color: 'bg-chart-4', description: 'Minor impact, can be scheduled' }
  ];

  // Impact options
  const impacts = [
    'Single User',
    'Multiple Users',
    'Entire Department', 
    'Organization-wide'
  ];

  // Status options
  const statuses = [
    'New',
    'In Progress',
    'Waiting for Info',
    'Waiting for Approval',
    'Resolved',
    'Closed'
  ];

  // Categories with subcategories
  const categories = {
    'Software': ['Application Error', 'Installation', 'Configuration', 'Performance', 'License Management', 'Update/Patch'],
    'Hardware': ['Desktop/Laptop', 'Server', 'Network Equipment', 'Printer/Scanner', 'Mobile Device', 'Hardware Failure'],
    'Network': ['Connectivity', 'VPN', 'WiFi', 'Firewall', 'DNS', 'Bandwidth'],
    'Security': ['Incident Response', 'Access Control', 'Malware', 'Phishing', 'Vulnerability', 'Compliance'],
    'Access Request': ['System Access', 'Application Access', 'VPN Access', 'Physical Access', 'Privilege Escalation'],
    'Service Request': ['New User Setup', 'Equipment Request', 'Software License', 'Training', 'Documentation']
  };

  // Assignee options (in real app, this would come from API)
  const assignees = [
    'tech.support@company.com',
    'network.admin@company.com',
    'security.team@company.com',
    'system.admin@company.com',
    'help.desk@company.com',
    'dev.team@company.com'
  ];

  // Handle input changes
  const handleInputChange = (field: keyof TicketFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }

    // Auto-populate subcategories when category changes
    if (field === 'category' && typeof value === 'string') {
      const subcategoriesForCategory = categories[value as keyof typeof categories];
      if (subcategoriesForCategory && subcategoriesForCategory.length > 0) {
        setFormData(prev => ({ ...prev, subcategory: subcategoriesForCategory[0] }));
      }
    }

    // Auto-set due date based on priority
    if (field === 'priority' && typeof value === 'string') {
      const priority = priorities.find(p => p.value === value);
      if (priority && !formData.due_datetime) {
        const now = new Date();
        let dueDate = new Date(now);
        
        switch (value) {
          case 'Critical':
            dueDate.setHours(now.getHours() + 4);
            break;
          case 'High':
            dueDate.setHours(now.getHours() + 12);
            break;
          case 'Medium':
            dueDate.setDate(now.getDate() + 2);
            break;
          case 'Low':
            dueDate.setDate(now.getDate() + 5);
            break;
        }
        
        setFormData(prev => ({ 
          ...prev, 
          due_datetime: format(dueDate, "yyyy-MM-dd'T'HH:mm")
        }));
      }
    }
  };

  // Apply template
  const applyTemplate = (template: TemplateData) => {
    setFormData(prev => ({
      ...prev,
      title: template.title || '',
      description: template.description || '',
      category: template.category || '',
      subcategory: template.subcategory || '',
      priority: template.priority || 'Medium',
      impact: template.impact || 'Single User',
      tags: template.tags || ''
    }));
    
    toast.success('Template applied successfully', {
      description: `Applied "${template.name}" template`
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.user_name.trim()) {
      errors.user_name = 'User name is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.priority) {
      errors.priority = 'Priority is required';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errors.contact_email = 'Invalid email format';
    }

    if (formData.time_spent !== null && formData.time_spent < 0) {
      errors.time_spent = 'Time spent cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save draft
  const saveDraft = async () => {
    setIsDraftSaving(true);
    try {
      // Save to localStorage as draft
      const draftData = {
        ...formData,
        savedAt: new Date().toISOString(),
        isDraft: true
      };
      
      localStorage.setItem('mytick-ticket-draft', JSON.stringify(draftData));
      
      toast.success('Draft saved successfully', {
        description: 'Your changes have been saved locally'
      });
    } catch (error) {
      toast.error('Failed to save draft', {
        description: 'Please try again'
      });
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('mytick-ticket-draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        if (draftData.isDraft) {
          setFormData(draftData);
          toast.info('Draft restored', {
            description: `Loaded draft from ${format(new Date(draftData.savedAt), 'MMM dd, HH:mm')}`
          });
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Submit ticket
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix validation errors', {
        description: 'Check the form for required fields and correct any errors'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare ticket data for API
      const ticketData: Partial<FrappeTicket> = {
        title: formData.title,
        description: formData.description,
        user_name: formData.user_name,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        department: formData.department || null,
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        priority: formData.priority || 'Medium',
        impact: formData.impact || 'Single User',
        status: formData.status || 'New',
        assignee: formData.assignee || null,
        due_datetime: formData.due_datetime || null,
        resolution_summary: formData.resolution_summary || null,
        root_cause: formData.root_cause || null,
        requester_confirmation: formData.requester_confirmation || null,
        time_spent: formData.time_spent || null,
        tags: formData.tags || null,
        attachments: formData.attachments || null,
        docstatus: formData.docstatus
      };

      console.log('Submitting ticket:', ticketData);

      const createdTicket = await frappeApi.createTicket(ticketData);

      toast.success('✅ Ticket created successfully!', {
        description: `Ticket "${createdTicket.ticket_id || createdTicket.name}" created with ${formData.priority} priority. Status: ${formData.status}`
      });

      // Clear form and draft
      setFormData({
        title: '',
        description: '',
        user_name: '',
        contact_email: '',
        contact_phone: '',
        department: '',
        category: '',
        subcategory: '',
        priority: 'Medium',
        impact: 'Single User',
        status: 'New',
        assignee: '',
        due_datetime: '',
        resolution_summary: '',
        root_cause: '',
        requester_confirmation: '',
        time_spent: null,
        tags: '',
        attachments: '',
        docstatus: 0
      });

      localStorage.removeItem('mytick-ticket-draft');
      setValidationErrors({});

    } catch (error) {
      console.error('Failed to create ticket:', error);
      
      let errorMessage = 'Failed to create ticket';
      let errorDescription = '';
      
      if (error instanceof Error) {
        if (error.message.includes('CSRF')) {
          errorMessage = 'Security Token Error';
          errorDescription = 'Authentication token issue. Please try again.';
        } else if (error.message.includes('403') || error.message.includes('Permission denied')) {
          errorMessage = 'Permission Denied';
          errorDescription = 'You don\'t have permission to create tickets. Contact your administrator.';
        } else if (error.message.includes('401') || error.message.includes('Authentication')) {
          errorMessage = 'Authentication Failed';
          errorDescription = 'Your session expired. Please refresh the page and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request Timeout';
          errorDescription = 'Server took too long to respond. Check your connection and try again.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Connection Error';
          errorDescription = 'Unable to connect to server. Check your network connection.';
        } else {
          errorMessage = 'Server Error';
          errorDescription = error.message || 'An unexpected error occurred. Please try again.';
        }
      }
      
      toast.error(`❌ ${errorMessage}`, {
        description: errorDescription
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      user_name: '',
      contact_email: '',
      contact_phone: '',
      department: '',
      category: 'Software',
      subcategory: '',
      priority: 'Medium',
      impact: 'Single User',
      status: 'New',
      assignee: '',
      due_datetime: '',
      resolution_summary: '',
      root_cause: '',
      requester_confirmation: '',
      time_spent: null,
      tags: '',
      attachments: '',
      docstatus: 0
    });
    setValidationErrors({});
    localStorage.removeItem('mytick-ticket-draft');
    
    toast.info('Form reset', {
      description: 'All fields have been cleared'
    });
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto bg-background space-y-6 ${getThemeClasses()}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-medium text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-theme-accent/10 border border-theme-accent/20">
              <Plus className="h-6 w-6 text-theme-accent" />
            </div>
            Professional Ticket Creation
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive ticket creation interface for IT professionals, developers, and managers
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-theme-accent text-theme-accent">
            <Shield className="w-3 h-3 mr-1" />
            Professional Mode
          </Badge>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            <Database className="w-3 h-3 mr-1" />
            Live API
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Form Area */}
          <div className="xl:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-muted">
                <TabsTrigger value="basic" className="data-[state=active]:bg-theme-accent data-[state=active]:text-theme-accent-foreground">
                  <FileText className="w-4 h-4 mr-2" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="classification" className="data-[state=active]:bg-theme-accent data-[state=active]:text-theme-accent-foreground">
                  <Tag className="w-4 h-4 mr-2" />
                  Classification
                </TabsTrigger>
                <TabsTrigger value="assignment" className="data-[state=active]:bg-theme-accent data-[state=active]:text-theme-accent-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  Assignment
                </TabsTrigger>
                <TabsTrigger value="tracking" className="data-[state=active]:bg-theme-accent data-[state=active]:text-theme-accent-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  Tracking
                </TabsTrigger>
                <TabsTrigger value="metadata" className="data-[state=active]:bg-theme-accent data-[state=active]:text-theme-accent-foreground">
                  <Settings className="w-4 h-4 mr-2" />
                  Metadata
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Basic Ticket Information</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Core details about the ticket and issue description
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground">
                        Ticket Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Brief, descriptive title of the issue or request"
                        className={`bg-input border-border text-foreground ${validationErrors.title ? 'border-destructive' : ''}`}
                      />
                      {validationErrors.title && (
                        <p className="text-sm text-destructive">{validationErrors.title}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-foreground">
                        Detailed Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Provide comprehensive details about the issue, including symptoms, error messages, steps to reproduce, and business impact"
                        rows={6}
                        className={`bg-input border-border text-foreground resize-none ${validationErrors.description ? 'border-destructive' : ''}`}
                      />
                      {validationErrors.description && (
                        <p className="text-sm text-destructive">{validationErrors.description}</p>
                      )}
                    </div>

                    {/* User Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user_name" className="text-foreground">
                          Affected User <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="user_name"
                          value={formData.user_name}
                          onChange={(e) => handleInputChange('user_name', e.target.value)}
                          placeholder="Name of the affected user"
                          className={`bg-input border-border text-foreground ${validationErrors.user_name ? 'border-destructive' : ''}`}
                        />
                        {validationErrors.user_name && (
                          <p className="text-sm text-destructive">{validationErrors.user_name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-foreground">Department</Label>
                        <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept} className="text-foreground">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  {dept}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email" className="text-foreground">Contact Email</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          placeholder="user@company.com"
                          className={`bg-input border-border text-foreground ${validationErrors.contact_email ? 'border-destructive' : ''}`}
                        />
                        {validationErrors.contact_email && (
                          <p className="text-sm text-destructive">{validationErrors.contact_email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone" className="text-foreground">Contact Phone</Label>
                        <Input
                          id="contact_phone"
                          value={formData.contact_phone}
                          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                          placeholder="+1-555-0123"
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Classification Tab */}
              <TabsContent value="classification" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Issue Classification</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Categorize and prioritize the ticket for proper routing and SLA management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category and Subcategory */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-foreground">
                          Category <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className={`bg-input border-border text-foreground ${validationErrors.category ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {Object.keys(categories).map(category => (
                              <SelectItem key={category} value={category} className="text-foreground">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.category && (
                          <p className="text-sm text-destructive">{validationErrors.category}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subcategory" className="text-foreground">Subcategory</Label>
                        <Select 
                          value={formData.subcategory} 
                          onValueChange={(value) => handleInputChange('subcategory', value)}
                          disabled={!formData.category}
                        >
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {formData.category && categories[formData.category as keyof typeof categories]?.map(subcategory => (
                              <SelectItem key={subcategory} value={subcategory} className="text-foreground">
                                {subcategory}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Priority and Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-foreground">
                          Priority <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                          <SelectTrigger className={`bg-input border-border text-foreground ${validationErrors.priority ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {priorities.map(priority => (
                              <SelectItem key={priority.value} value={priority.value} className="text-foreground">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${priority.color}`}></div>
                                    <span>{priority.value}</span>
                                  </div>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    SLA: {priority.sla}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.priority && (
                          <p className="text-sm text-destructive">{validationErrors.priority}</p>
                        )}
                        {formData.priority && (
                          <p className="text-xs text-muted-foreground">
                            {priorities.find(p => p.value === formData.priority)?.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="impact" className="text-foreground">Impact</Label>
                        <Select value={formData.impact} onValueChange={(value) => handleInputChange('impact', value)}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Select impact" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {impacts.map(impact => (
                              <SelectItem key={impact} value={impact} className="text-foreground">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  {impact}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assignment Tab */}
              <TabsContent value="assignment" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Assignment & Workflow</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Manage ticket assignment, status, and due dates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status and Assignee */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-foreground">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {statuses.map(status => (
                              <SelectItem key={status} value={status} className="text-foreground">
                                <div className="flex items-center gap-2">
                                  <Workflow className="w-4 h-4" />
                                  {status}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assignee" className="text-foreground">Assignee</Label>
                        <Select value={formData.assignee} onValueChange={(value) => handleInputChange('assignee', value)}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {assignees.map(assignee => (
                              <SelectItem key={assignee} value={assignee} className="text-foreground">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {assignee}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label htmlFor="due_datetime" className="text-foreground">Due Date & Time</Label>
                      <Input
                        id="due_datetime"
                        type="datetime-local"
                        value={formData.due_datetime}
                        onChange={(e) => handleInputChange('due_datetime', e.target.value)}
                        className="bg-input border-border text-foreground"
                      />
                      {formData.priority && (
                        <p className="text-xs text-muted-foreground">
                          Recommended SLA: {priorities.find(p => p.value === formData.priority)?.sla}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tracking Tab */}
              <TabsContent value="tracking" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Resolution & Tracking</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Track resolution progress, time spent, and root cause analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Resolution Summary */}
                    <div className="space-y-2">
                      <Label htmlFor="resolution_summary" className="text-foreground">Resolution Summary</Label>
                      <Textarea
                        id="resolution_summary"
                        value={formData.resolution_summary}
                        onChange={(e) => handleInputChange('resolution_summary', e.target.value)}
                        placeholder="Summary of actions taken to resolve the issue"
                        rows={3}
                        className="bg-input border-border text-foreground resize-none"
                      />
                    </div>

                    {/* Root Cause */}
                    <div className="space-y-2">
                      <Label htmlFor="root_cause" className="text-foreground">Root Cause</Label>
                      <Textarea
                        id="root_cause"
                        value={formData.root_cause}
                        onChange={(e) => handleInputChange('root_cause', e.target.value)}
                        placeholder="Identified root cause of the issue"
                        rows={3}
                        className="bg-input border-border text-foreground resize-none"
                      />
                    </div>

                    {/* Time Spent and Confirmation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="time_spent" className="text-foreground">Time Spent (hours)</Label>
                        <Input
                          id="time_spent"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.time_spent || ''}
                          onChange={(e) => handleInputChange('time_spent', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="0.0"
                          className={`bg-input border-border text-foreground ${validationErrors.time_spent ? 'border-destructive' : ''}`}
                        />
                        {validationErrors.time_spent && (
                          <p className="text-sm text-destructive">{validationErrors.time_spent}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requester_confirmation" className="text-foreground">Requester Confirmation</Label>
                        <Select value={formData.requester_confirmation} onValueChange={(value) => handleInputChange('requester_confirmation', value)}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Select confirmation" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="Yes" className="text-foreground">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-theme-accent" />
                                Confirmed
                              </div>
                            </SelectItem>
                            <SelectItem value="No" className="text-foreground">
                              <div className="flex items-center gap-2">
                                <X className="w-4 h-4 text-destructive" />
                                Not Confirmed
                              </div>
                            </SelectItem>
                            <SelectItem value="Pending" className="text-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                Pending
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Metadata Tab */}
              <TabsContent value="metadata" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Metadata & Advanced Options</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Additional metadata, tags, attachments, and document status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tags */}
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-foreground">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        placeholder="urgent, hardware, printer (comma-separated)"
                        className="bg-input border-border text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use comma-separated tags for better searchability and categorization
                      </p>
                    </div>

                    {/* Attachments */}
                    <div className="space-y-2">
                      <Label htmlFor="attachments" className="text-foreground">Attachments</Label>
                      <Input
                        id="attachments"
                        value={formData.attachments}
                        onChange={(e) => handleInputChange('attachments', e.target.value)}
                        placeholder="File references or attachment metadata"
                        className="bg-input border-border text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Reference to attached files or documents related to this ticket
                      </p>
                    </div>

                    {/* Document Status */}
                    <div className="space-y-2">
                      <Label htmlFor="docstatus" className="text-foreground">Document Status</Label>
                      <Select value={formData.docstatus.toString()} onValueChange={(value) => handleInputChange('docstatus', parseInt(value))}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Select document status" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="0" className="text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                              Draft (0)
                            </div>
                          </SelectItem>
                          <SelectItem value="1" className="text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-theme-accent"></div>
                              Submitted (1)
                            </div>
                          </SelectItem>
                          <SelectItem value="2" className="text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-destructive"></div>
                              Cancelled (2)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Document workflow status in the ERP system
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Create Ticket
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={saveDraft}
                    disabled={isDraftSaving}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    {isDraftSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={resetForm}
                    className="text-foreground hover:bg-accent"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Professional Templates */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Zap className="h-5 w-5 text-theme-accent" />
                  Professional Templates
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Quick-start templates for common scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template)}
                        className="w-full justify-start border-border text-foreground hover:bg-accent p-3 h-auto"
                      >
                        <div className="text-left">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {template.description_preview}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.priority}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Form Progress */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Target className="h-5 w-5 text-theme-accent" />
                  Form Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Required Fields</span>
                    <span className="text-foreground">
                      {[formData.title, formData.description, formData.user_name, formData.category, formData.priority].filter(field => field.trim()).length}/5
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.keys(validationErrors).length > 0 && (
                      <Alert className="border-destructive/20 bg-destructive/5">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-foreground">
                          {Object.keys(validationErrors).length} validation error{Object.keys(validationErrors).length > 1 ? 's' : ''} found
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SLA Information */}
            {formData.priority && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Clock className="h-5 w-5 text-theme-accent" />
                    SLA Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const priority = priorities.find(p => p.value === formData.priority);
                      return priority ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Priority</span>
                            <Badge className={`${priority.color} text-white`}>
                              {priority.value}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Target SLA</span>
                            <span className="text-sm font-medium text-foreground">{priority.sla}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{priority.description}</p>
                        </>
                      ) : null;
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, Plus, User, FileText, MessageSquare, AlertTriangle, Building, Mail, Phone, Tag, Calendar, UserCheck, Clock, CheckCircle, Paperclip } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from "sonner";
import { frappeApi, type FrappeTicket } from '../services/frappeApi';

interface NewTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated: (ticket: FrappeTicket) => void;
}

interface TicketFormData {
  // Basic Information (required by DocType)
  title: string;
  user_name: string;
  description: string;
  
  // Contact & Department
  department: string;
  contact_email: string;
  contact_phone: string;
  
  // Classification
  category: string;
  subcategory: string;
  priority: string;
  impact: string;
  status: string;
  
  // Assignment & Scheduling
  assignee: string;
  due_datetime: string;
  
  // Resolution & Tracking (from DocType)
  resolution_datetime: string;
  resolution_summary: string;
  root_cause: string;
  requester_confirmation: string;
  time_spent: number | null;
  
  // Metadata
  tags: string;
  attachments: string;
}

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access Request', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const IMPACTS = ['Single User', 'Multiple Users', 'Entire Department', 'Organization-wide'];
const STATUSES = ['New', 'In Progress', 'Waiting for Info', 'Resolved', 'Closed'];
const REQUESTER_CONFIRMATIONS = ['Yes', 'No'];

export function NewTicketDialog({ open, onOpenChange, onTicketCreated }: NewTicketDialogProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    user_name: '',
    description: '',
    department: '',
    contact_email: '',
    contact_phone: '',
    category: 'Software',
    subcategory: '',
    priority: 'Medium',
    impact: 'Single User',
    status: 'New',
    assignee: '',
    due_datetime: '',
    resolution_datetime: '',
    resolution_summary: '',
    root_cause: '',
    requester_confirmation: '',
    time_spent: null,
    tags: '',
    attachments: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TicketFormData, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Real-time validation function
  const validateField = useCallback((field: keyof TicketFormData, value: string | number | null): string | undefined => {
    switch (field) {
      case 'title':
        if (!String(value).trim()) {
          return 'Title is required';
        } else if (String(value).trim().length < 3) {
          return 'Title must be at least 3 characters';
        }
        break;
        
      case 'user_name':
        if (!String(value).trim()) {
          return 'User name is required';
        } else if (String(value).trim().length < 2) {
          return 'User name must be at least 2 characters';
        }
        break;
        
      case 'description':
        if (!String(value).trim()) {
          return 'Description is required';
        } else if (String(value).trim().length < 10) {
          return 'Description must be at least 10 characters';
        }
        break;
        
      case 'contact_email':
        if (value && !String(value).includes('@')) {
          return 'Please enter a valid email address';
        }
        break;
        
      case 'due_datetime':
        if (value) {
          const dueDate = new Date(String(value));
          const now = new Date();
          if (dueDate <= now) {
            return 'Due date must be in the future';
          }
        }
        break;
        
      case 'resolution_datetime':
        if (value) {
          const resolutionDate = new Date(String(value));
          const now = new Date();
          if (resolutionDate > now) {
            return 'Resolution date cannot be in the future';
          }
        }
        break;
        
      case 'time_spent':
        if (value !== null && Number(value) < 0) {
          return 'Time spent cannot be negative';
        }
        break;
    }
    return undefined;
  }, []);

  // Validate entire form
  const validateAllFields = useCallback((data: TicketFormData): Record<keyof TicketFormData, string | undefined> => {
    const newErrors: Record<keyof TicketFormData, string | undefined> = {} as Record<keyof TicketFormData, string | undefined>;
    
    (Object.keys(data) as Array<keyof TicketFormData>).forEach(field => {
      newErrors[field] = validateField(field, data[field]);
    });
    
    return newErrors;
  }, [validateField]);

  // Real-time validation effect
  useEffect(() => {
    const allErrors = validateAllFields(formData);
    const validErrors = Object.fromEntries(
      Object.entries(allErrors).filter(([, error]) => error !== undefined)
    ) as Partial<Record<keyof TicketFormData, string>>;
    
    setErrors(validErrors);
    setIsFormValid(Object.keys(validErrors).length === 0);
  }, [formData, validateAllFields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    // Final validation check
    const allErrors = validateAllFields(formData);
    const hasErrors = Object.values(allErrors).some(error => error !== undefined);
    
    if (hasErrors) {
      toast.error("Please fix the form errors", {
        description: "Check the highlighted fields and try again."
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create the ticket using Frappe API
      const newTicket = await frappeApi.createTicket({
        title: formData.title.trim(),
        user_name: formData.user_name.trim(),
        department: formData.department.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory.trim() || null,
        priority: formData.priority,
        impact: formData.impact,
        status: formData.status,
        assignee: formData.assignee.trim() || null,
        due_datetime: formData.due_datetime || null,
        resolution_datetime: formData.resolution_datetime || null,
        resolution_summary: formData.resolution_summary.trim() || null,
        root_cause: formData.root_cause.trim() || null,
        requester_confirmation: formData.requester_confirmation || null,
        time_spent: formData.time_spent || null,
        tags: formData.tags.trim() || null,
        attachments: formData.attachments.trim() || null,
        docstatus: 0, // Draft status
      });

      // Show real success toast with actual ticket details - NO DEMO/DECOY DATA
      toast.success("✅ Ticket created successfully!", {
        description: `Ticket "${newTicket.ticket_id || newTicket.name}" created with ${formData.priority} priority. Status: ${formData.status}`,
        duration: 5000,
      });

      // Reset form
      setFormData({
        title: '',
        user_name: '',
        description: '',
        department: '',
        contact_email: '',
        contact_phone: '',
        category: 'Software',
        subcategory: '',
        priority: 'Medium',
        impact: 'Single User',
        status: 'New',
        assignee: '',
        due_datetime: '',
        resolution_datetime: '',
        resolution_summary: '',
        root_cause: '',
        requester_confirmation: '',
        time_spent: null,
        tags: '',
        attachments: '',
      });
      setErrors({});
      setApiError(null);

      // Notify parent component
      onTicketCreated(newTicket);
      
      // Close dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      
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
      
      // Set API error for display in the dialog
      setApiError(errorDescription);
      
      // Show real error toast - NO DEMO/DECOY DATA
      toast.error(`❌ ${errorMessage}`, {
        description: errorDescription,
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TicketFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: '',
        user_name: '',
        description: '',
        department: '',
        contact_email: '',
        contact_phone: '',
        category: 'Software',
        subcategory: '',
        priority: 'Medium',
        impact: 'Single User',
        status: 'New',
        assignee: '',
        due_datetime: '',
        resolution_datetime: '',
        resolution_summary: '',
        root_cause: '',
        requester_confirmation: '',
        time_spent: null,
        tags: '',
        attachments: '',
      });
      setErrors({});
      setApiError(null);
      onOpenChange(false);
    }
  };

  // Format datetime for input field
  const formatDatetimeForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Set default due date to 3 days from now
  const getDefaultDueDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    date.setHours(17, 0, 0, 0); // 5 PM
    return formatDatetimeForInput(date);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-popover border-border mytick-theme">
        <DialogHeader className="bg-popover mytick-theme">
          <DialogTitle className="flex items-center gap-2 text-popover-foreground mytick-theme">
            <Plus className="w-5 h-5 text-theme-accent mytick-theme" />
            <span className="text-popover-foreground mytick-theme">Create New Ticket</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mytick-theme">
            Fill in the ticket details. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        {/* API Error Alert */}
        {apiError && (
          <Alert variant="destructive" className="mb-4 mytick-theme">
            <AlertTriangle className="h-4 w-4 mytick-theme" />
            <AlertDescription className="mytick-theme">
              <strong>API Error:</strong> {apiError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-popover mytick-theme">
          <Tabs defaultValue="basic" className="w-full bg-popover mytick-theme">
            <TabsList className="grid w-full grid-cols-4 bg-muted border-border mytick-theme">
              <TabsTrigger value="basic" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground mytick-theme">Basic Info</TabsTrigger>
              <TabsTrigger value="details" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground mytick-theme">Details</TabsTrigger>
              <TabsTrigger value="assignment" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground mytick-theme">Assignment</TabsTrigger>
              <TabsTrigger value="resolution" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground mytick-theme">Resolution</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 bg-popover mytick-theme">
              {/* Title Field */}
              <div className="space-y-2 mytick-theme">
                <Label htmlFor="title" className="flex items-center gap-2 mytick-theme">
                  <FileText className="w-4 h-4 mytick-theme" />
                  Title <span className="text-destructive mytick-theme">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a clear, descriptive title..."
                  className={`mytick-theme ${errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={loading}
                  maxLength={200}
                />
                {errors.title && (
                  <p className="text-sm text-destructive mytick-theme">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground mytick-theme">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* User Name Field */}
              <div className="space-y-2 mytick-theme">
                <Label htmlFor="user_name" className="flex items-center gap-2 mytick-theme">
                  <User className="w-4 h-4 mytick-theme" />
                  User Name <span className="text-destructive mytick-theme">*</span>
                </Label>
                <Input
                  id="user_name"
                  value={formData.user_name}
                  onChange={(e) => handleInputChange('user_name', e.target.value)}
                  placeholder="Enter the user's name..."
                  className={`mytick-theme ${errors.user_name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={loading}
                  maxLength={100}
                />
                {errors.user_name && (
                  <p className="text-sm text-destructive mytick-theme">{errors.user_name}</p>
                )}
                <p className="text-xs text-muted-foreground mytick-theme">
                  The person this ticket is for
                </p>
              </div>

              {/* Department and Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mytick-theme">
                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="department" className="flex items-center gap-2 mytick-theme">
                    <Building className="w-4 h-4 mytick-theme" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g., IT, Sales, Marketing..."
                    className="mytick-theme"
                    disabled={loading}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="contact_email" className="flex items-center gap-2 mytick-theme">
                    <Mail className="w-4 h-4 mytick-theme" />
                    Contact Email
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="user@company.com"
                    className={`mytick-theme ${errors.contact_email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={loading}
                    maxLength={100}
                  />
                  {errors.contact_email && (
                    <p className="text-sm text-destructive mytick-theme">{errors.contact_email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mytick-theme">
                <Label htmlFor="contact_phone" className="flex items-center gap-2 mytick-theme">
                  <Phone className="w-4 h-4 mytick-theme" />
                  Contact Phone
                </Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+1-555-0123"
                  className="mytick-theme"
                  disabled={loading}
                  maxLength={50}
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2 mytick-theme">
                <Label htmlFor="description" className="flex items-center gap-2 mytick-theme">
                  <MessageSquare className="w-4 h-4 mytick-theme" />
                  Description <span className="text-destructive mytick-theme">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide detailed information about the issue or request..."
                  className={`min-h-[120px] resize-none mytick-theme ${errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={loading}
                  maxLength={1000}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mytick-theme">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground mytick-theme">
                  {formData.description.length}/1000 characters • Be specific about the problem
                </p>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 bg-popover mytick-theme">
              {/* Category and Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mytick-theme">
                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="category" className="mytick-theme">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="mytick-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="mytick-theme">
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category} className="mytick-theme">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="subcategory" className="mytick-theme">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    placeholder="e.g., Authentication, Database, etc."
                    className="mytick-theme"
                    disabled={loading}
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Priority and Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mytick-theme">
                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="priority" className="mytick-theme">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="mytick-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="mytick-theme">
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority} className="mytick-theme">
                          <div className="flex items-center gap-2 mytick-theme">
                            <div className={`w-2 h-2 rounded-full mytick-theme ${
                              priority === 'Critical' ? 'bg-destructive' :
                              priority === 'High' ? 'bg-theme-accent' :
                              priority === 'Medium' ? 'bg-muted-foreground' : 'bg-theme-accent'
                            }`} />
                            <span className="text-foreground mytick-theme">{priority}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="impact" className="mytick-theme">Impact</Label>
                  <Select value={formData.impact} onValueChange={(value) => handleInputChange('impact', value)}>
                    <SelectTrigger className="mytick-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="mytick-theme">
                      {IMPACTS.map((impact) => (
                        <SelectItem key={impact} value={impact} className="mytick-theme">
                          {impact}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2 mytick-theme">
                <Label htmlFor="status" className="mytick-theme">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="mytick-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="mytick-theme">
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status} className="mytick-theme">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2 mytick-theme">
                <Label htmlFor="tags" className="flex items-center gap-2 mytick-theme">
                  <Tag className="w-4 h-4 mytick-theme" />
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="e.g., urgent, authentication, mobile"
                  className="mytick-theme"
                  disabled={loading}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mytick-theme">
                  Separate multiple tags with commas
                </p>
              </div>
            </TabsContent>

            {/* Assignment Tab */}
            <TabsContent value="assignment" className="space-y-4 bg-popover mytick-theme">
              {/* Assignee */}
              <div className="space-y-2 mytick-theme">
                <Label htmlFor="assignee" className="flex items-center gap-2 mytick-theme">
                  <UserCheck className="w-4 h-4 mytick-theme" />
                  Assignee
                </Label>
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => handleInputChange('assignee', e.target.value)}
                  placeholder="e.g., tech.support@company.com"
                  className="mytick-theme"
                  disabled={loading}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mytick-theme">
                  Email or username of the person assigned to handle this ticket
                </p>
              </div>

              {/* Due Date */}
              <div className="space-y-2 mytick-theme">
                <Label htmlFor="due_datetime" className="flex items-center gap-2 mytick-theme">
                  <Calendar className="w-4 h-4 mytick-theme" />
                  Due Date & Time
                </Label>
                <Input
                  id="due_datetime"
                  type="datetime-local"
                  value={formData.due_datetime}
                  onChange={(e) => handleInputChange('due_datetime', e.target.value)}
                  className={`mytick-theme ${errors.due_datetime ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={loading}
                  min={formatDatetimeForInput(new Date())}
                />
                {errors.due_datetime && (
                  <p className="text-sm text-destructive mytick-theme">{errors.due_datetime}</p>
                )}
                <div className="flex gap-2 mytick-theme">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('due_datetime', getDefaultDueDate())}
                    disabled={loading}
                    className="mytick-theme"
                  >
                    Set to 3 days
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 7);
                      date.setHours(17, 0, 0, 0);
                      handleInputChange('due_datetime', formatDatetimeForInput(date));
                    }}
                    disabled={loading}
                    className="mytick-theme"
                  >
                    Set to 1 week
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Resolution Tab */}
            <TabsContent value="resolution" className="space-y-4 bg-popover mytick-theme">
              <div className="space-y-4 mytick-theme">
                <div className="flex items-center gap-2 pb-2 border-b border-border mytick-theme">
                  <CheckCircle className="w-5 h-5 text-theme-accent mytick-theme" />
                  <h4 className="text-foreground font-medium mytick-theme">Resolution & Tracking Information</h4>
                </div>
                
                {/* Resolution Date & Time */}
                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="resolution_datetime" className="flex items-center gap-2 mytick-theme">
                    <Calendar className="w-4 h-4 mytick-theme" />
                    Resolution Date & Time
                  </Label>
                  <Input
                    id="resolution_datetime"
                    type="datetime-local"
                    value={formData.resolution_datetime}
                    onChange={(e) => handleInputChange('resolution_datetime', e.target.value)}
                    className={`mytick-theme ${errors.resolution_datetime ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={loading}
                    max={formatDatetimeForInput(new Date())}
                  />
                  {errors.resolution_datetime && (
                    <p className="text-sm text-destructive mytick-theme">{errors.resolution_datetime}</p>
                  )}
                  <p className="text-xs text-muted-foreground mytick-theme">
                    When the ticket was resolved (leave empty for new tickets)
                  </p>
                </div>

                {/* Resolution Summary */}
                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="resolution_summary" className="flex items-center gap-2 mytick-theme">
                    <CheckCircle className="w-4 h-4 mytick-theme" />
                    Resolution Summary
                  </Label>
                  <Textarea
                    id="resolution_summary"
                    value={formData.resolution_summary}
                    onChange={(e) => handleInputChange('resolution_summary', e.target.value)}
                    placeholder="Describe how the issue was resolved..."
                    className="min-h-[80px] resize-none mytick-theme"
                    disabled={loading}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mytick-theme">
                    {formData.resolution_summary.length}/500 characters
                  </p>
                </div>

                {/* Root Cause */}
                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="root_cause" className="mytick-theme">Root Cause</Label>
                  <Textarea
                    id="root_cause"
                    value={formData.root_cause}
                    onChange={(e) => handleInputChange('root_cause', e.target.value)}
                    placeholder="What was the underlying cause of the issue?"
                    className="min-h-[80px] resize-none mytick-theme"
                    disabled={loading}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mytick-theme">
                    {formData.root_cause.length}/500 characters
                  </p>
                </div>

                {/* Time Spent */}
                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="time_spent" className="flex items-center gap-2 mytick-theme">
                    <Clock className="w-4 h-4 mytick-theme" />
                    Time Spent (hours)
                  </Label>
                  <Input
                    id="time_spent"
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.time_spent || ''}
                    onChange={(e) => handleInputChange('time_spent', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g., 2.5"
                    className={`mytick-theme ${errors.time_spent ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={loading}
                  />
                  {errors.time_spent && (
                    <p className="text-sm text-destructive mytick-theme">{errors.time_spent}</p>
                  )}
                  <p className="text-xs text-muted-foreground mytick-theme">
                    Total time spent resolving this ticket
                  </p>
                </div>

                {/* Requester Confirmation */}
                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="requester_confirmation" className="mytick-theme">Requester Confirmation</Label>
                  <Select value={formData.requester_confirmation} onValueChange={(value) => handleInputChange('requester_confirmation', value)}>
                    <SelectTrigger className="mytick-theme">
                      <SelectValue placeholder="Select confirmation status" />
                    </SelectTrigger>
                    <SelectContent className="mytick-theme">
                      {REQUESTER_CONFIRMATIONS.map((confirmation) => (
                        <SelectItem key={confirmation} value={confirmation} className="mytick-theme">
                          {confirmation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mytick-theme">
                    Has the requester confirmed the resolution?
                  </p>
                </div>

                {/* Attachments */}
                <div className="space-y-2 mytick-theme">
                  <Label htmlFor="attachments" className="flex items-center gap-2 mytick-theme">
                    <Paperclip className="w-4 h-4 mytick-theme" />
                    Attachments
                  </Label>
                  <Input
                    id="attachments"
                    value={formData.attachments}
                    onChange={(e) => handleInputChange('attachments', e.target.value)}
                    placeholder="Comma-separated list of file URLs or paths"
                    className="mytick-theme"
                    disabled={loading}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mytick-theme">
                    List any relevant files or screenshots
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between pt-4 bg-popover border-t border-border mytick-theme">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme"
            >
              <span className="text-foreground mytick-theme">Cancel</span>
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !isFormValid}
              className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground mytick-theme"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin mytick-theme" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2 mytick-theme" />
                  Create Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
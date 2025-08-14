import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Loader2, Plus, User, FileText, MessageSquare, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from "sonner";
import { frappeApi, type FrappeTicket } from '../services/frappeApi';

interface NewTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated: (ticket: FrappeTicket) => void;
}

interface TicketFormData {
  title: string;
  user_name: string;
  description: string;
}

export function NewTicketDialog({ open, onOpenChange, onTicketCreated }: NewTicketDialogProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    user_name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<TicketFormData>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<TicketFormData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.user_name.trim()) {
      newErrors.user_name = 'User name is required';
    } else if (formData.user_name.trim().length < 2) {
      newErrors.user_name = 'User name must be at least 2 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
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
        description: formData.description.trim(),
        docstatus: 0, // Draft status
      });

      // Show success toast with ticket details
      toast.success("Ticket created successfully!", {
        description: `Ticket "${newTicket.name}" has been created and saved as draft.`,
        duration: 5000,
      });

      // Reset form
      setFormData({
        title: '',
        user_name: '',
        description: '',
      });
      setErrors({});
      setApiError(null);

      // Notify parent component
      onTicketCreated(newTicket);
      
      // Close dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      let errorDescription = '';
      
      if (error instanceof Error) {
        if (error.message.includes('CSRF')) {
          errorMessage = 'Security Token Error';
          errorDescription = 'There was a security validation issue. This usually resolves itself - please try again.';
        } else if (error.message.includes('403') || error.message.includes('Permission denied')) {
          errorMessage = 'Permission Denied';
          errorDescription = 'You don\'t have permission to create tickets. Please check with your administrator.';
        } else if (error.message.includes('401') || error.message.includes('Authentication')) {
          errorMessage = 'Authentication Failed';
          errorDescription = 'Your session may have expired. Please refresh the page and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request Timeout';
          errorDescription = 'The server took too long to respond. Please check your connection and try again.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Connection Error';
          errorDescription = 'Unable to connect to the server. Please check your network connection.';
        } else {
          errorMessage = 'Server Error';
          errorDescription = error.message || 'Please try again or contact support if the problem persists.';
        }
      }
      
      // Set API error for display in the dialog
      setApiError(errorDescription);
      
      // Show error toast
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
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
      });
      setErrors({});
      setApiError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-theme-accent" />
            Create New Ticket
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new support ticket in your Frappe system.
          </DialogDescription>
        </DialogHeader>

        {/* API Error Alert */}
        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>API Error:</strong> {apiError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a clear, descriptive title..."
              className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={loading}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* User Name Field */}
          <div className="space-y-2">
            <Label htmlFor="user_name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              User Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="user_name"
              value={formData.user_name}
              onChange={(e) => handleInputChange('user_name', e.target.value)}
              placeholder="Enter the user's name..."
              className={errors.user_name ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={loading}
              maxLength={50}
            />
            {errors.user_name && (
              <p className="text-sm text-destructive">{errors.user_name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The person this ticket is for
            </p>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide detailed information about the issue or request..."
              className={`min-h-[120px] resize-none ${errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              disabled={loading}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters • Be specific about the problem
            </p>
          </div>

          {/* Form Actions */}
          <DialogFooter className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || Object.keys(errors).length > 0}
              className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground border-t pt-3 mt-2">
          <p><strong>Note:</strong> The ticket will be created as a draft and can be submitted later.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
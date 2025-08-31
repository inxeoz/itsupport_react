import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog.tsx";
import { Badge } from "@/ui/components/badge.tsx";
import { Button } from "@/ui/components/button.tsx";
import { Separator } from "@/ui/components/separator.tsx";
import { ScrollArea } from "@/ui/components/scroll-area.tsx";
import {
  User,
  Building,
  Mail,
  Phone,
  FileText,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  UserCheck,
  Tag,
  MessageSquare,
  CheckCircle,
  XCircle,
  Timer,
  Paperclip,
  Edit,
  ExternalLink,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import type { FrappeTicket } from "../../services/frappeApi.ts";
import { useEffect } from "react";
import { useTheme } from "../ThemeProvider.tsx";

interface TicketDetailsPopoverProps {
  ticket: FrappeTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (ticket: FrappeTicket) => void;
}

export function TicketDetailsPopover({
  ticket,
  open,
  onOpenChange,
  onEdit,
}: TicketDetailsPopoverProps) {
  const { getThemeClasses } = useTheme();

  if (!ticket) return null;

  // Update portal container theme classes when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const portals = document.querySelectorAll(
          "[data-radix-portal]",
        );
        portals.forEach((portal) => {
          // Remove existing theme classes
          portal.classList.remove(
            "dark",
            "blue-theme",
            "orange-theme",
            "green-theme",
          );

          // Add current theme classes
          const themeClasses = getThemeClasses();
          if (themeClasses.trim()) {
            themeClasses
              .trim()
              .split(" ")
              .forEach((cls) => {
                if (cls) portal.classList.add(cls);
              });
          }
        });
      }, 0);
    }
  }, [open, getThemeClasses]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return "Not set";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getPriorityConfig = (priority: string | null) => {
    const configs = {
      Critical: {
        bg: "bg-destructive/20 text-destructive border-destructive/20",
        icon: AlertTriangle,
        color: "text-destructive",
      },
      High: {
        bg: "bg-theme-accent/20 text-theme-accent border-theme-accent/20",
        icon: AlertTriangle,
        color: "text-theme-accent",
      },
      Medium: {
        bg: "bg-muted text-muted-foreground border-border",
        icon: Clock,
        color: "text-muted-foreground",
      },
      Low: {
        bg: "bg-theme-accent/10 text-theme-accent border-theme-accent/10",
        icon: CheckCircle,
        color: "text-theme-accent",
      },
    };
    return configs[priority as keyof typeof configs] || null;
  };

  const getStatusConfig = (status: string | null) => {
    const configs = {
      New: {
        bg: "bg-theme-accent/20 text-theme-accent border-theme-accent/20",
        icon: FileText,
        color: "text-theme-accent",
      },
      "In Progress": {
        bg: "bg-muted text-muted-foreground border-border",
        icon: Clock,
        color: "text-muted-foreground",
      },
      "Waiting for Info": {
        bg: "bg-secondary text-secondary-foreground border-border",
        icon: MessageSquare,
        color: "text-secondary-foreground",
      },
      Resolved: {
        bg: "bg-theme-accent/10 text-theme-accent border-theme-accent/10",
        icon: CheckCircle,
        color: "text-theme-accent",
      },
      Closed: {
        bg: "bg-muted/50 text-muted-foreground border-border",
        icon: XCircle,
        color: "text-muted-foreground",
      },
    };
    return configs[status as keyof typeof configs] || null;
  };

  const getDocStatusBadge = (docstatus: number | null) => {
    switch (docstatus) {
      case 0:
        return (
          <Badge
            variant="secondary"
            className="bg-secondary/20 text-secondary-foreground border-border"
          >
            <span>Draft</span>
          </Badge>
        );
      case 1:
        return (
          <Badge
            variant="secondary"
            className="bg-theme-accent/20 text-theme-accent border-theme-accent/20"
          >
            <span>Submitted</span>
          </Badge>
        );
      case 2:
        return (
          <Badge
            variant="secondary"
            className="bg-destructive/20 text-destructive border-destructive/20"
          >
            <span>Cancelled</span>
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-border text-foreground"
          >
            Unknown
          </Badge>
        );
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} copied to clipboard`);
      })
      .catch(() => {
        toast.error(`Failed to copy ${label}`);
      });
  };

  const priorityConfig = getPriorityConfig(ticket.priority);
  const statusConfig = getStatusConfig(ticket.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-popover border-border ${getThemeClasses()} overflow-auto`}
      >
        <DialogHeader className="px-6 py-4 border-b border-border bg-popover">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl text-popover-foreground">
                {ticket.title || "Untitled Ticket"}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-3 text-muted-foreground">
                <span className="font-mono text-sm bg-muted text-muted-foreground px-2 py-1 rounded">
                  {ticket.ticket_id || ticket.name}
                </span>
                {getDocStatusBadge(ticket.docstatus)}
                <span className="text-muted-foreground">
                  Created{" "}
                  {formatDateShort(
                    ticket.created_datetime || ticket.creation,
                  )}
                </span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    ticket.ticket_id || ticket.name,
                    "Ticket ID",
                  )
                }
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Copy className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">Copy ID</span>
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(ticket)}
                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-foreground">Edit</span>
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 bg-popover">
          <div className="space-y-8">
            {/* Status and Priority Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                  <Target className="w-5 h-5 text-theme-accent" />
                  <span className="text-foreground">
                    Status & Priority
                  </span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Status:
                    </span>
                    {statusConfig ? (
                      <Badge
                        variant="secondary"
                        className={`${statusConfig.bg} border`}
                      >
                        <statusConfig.icon className="w-3 h-3 mr-1" />
                        <span>{ticket.status}</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-border text-foreground"
                      >
                        {ticket.status || "Not set"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Priority:
                    </span>
                    {priorityConfig ? (
                      <Badge
                        variant="secondary"
                        className={`${priorityConfig.bg} border`}
                      >
                        <priorityConfig.icon className="w-3 h-3 mr-1" />
                        <span>{ticket.priority}</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-border text-foreground"
                      >
                        {ticket.priority || "Not set"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Impact:
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-foreground"
                    >
                      <span>
                        {ticket.impact || "Not specified"}
                      </span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Category:
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-foreground"
                    >
                      <span>
                        {ticket.category || "Not categorized"}
                      </span>
                    </Badge>
                  </div>

                  {ticket.subcategory && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Subcategory:
                      </span>
                      <span className="text-sm text-foreground">
                        {ticket.subcategory}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5 text-theme-accent" />
                  <span className="text-foreground">
                    Contact Information
                  </span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Requester
                      </p>
                      <p className="font-medium text-foreground">
                        {ticket.user_name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {ticket.department && (
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Department
                        </p>
                        <p className="font-medium text-foreground">
                          {ticket.department}
                        </p>
                      </div>
                    </div>
                  )}

                  {ticket.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Email
                        </p>
                        <p className="font-medium text-foreground">
                          {ticket.contact_email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            ticket.contact_email!,
                            "Email",
                          )
                        }
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {ticket.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Phone
                        </p>
                        <p className="font-medium text-foreground">
                          {ticket.contact_phone}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            ticket.contact_phone!,
                            "Phone",
                          )
                        }
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Description Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                <MessageSquare className="w-5 h-5 text-theme-accent" />
                <span className="text-foreground">
                  Description
                </span>
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                  {ticket.description ||
                    "No description provided."}
                </p>
              </div>
            </div>

            {/* Assignment and Dates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                  <UserCheck className="w-5 h-5 text-theme-accent" />
                  <span className="text-foreground">
                    Assignment
                  </span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Assigned to
                      </p>
                      <p className="font-medium text-foreground">
                        {ticket.assignee || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  {ticket.time_spent && (
                    <div className="flex items-center gap-3">
                      <Timer className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Time Spent
                        </p>
                        <p className="font-medium text-foreground">
                          {ticket.time_spent} hours
                        </p>
                      </div>
                    </div>
                  )}

                  {ticket.requester_confirmation && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Requester Confirmation
                        </p>
                        <Badge
                          variant={
                            ticket.requester_confirmation ===
                            "Yes"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            ticket.requester_confirmation ===
                            "Yes"
                              ? "bg-theme-accent text-theme-accent-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }
                        >
                          <span>
                            {ticket.requester_confirmation}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                  <Calendar className="w-5 h-5 text-theme-accent" />
                  <span className="text-foreground">
                    Important Dates
                  </span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Created
                      </p>
                      <p className="font-medium text-foreground">
                        {formatDate(
                          ticket.created_datetime ||
                            ticket.creation,
                        )}
                      </p>
                    </div>
                  </div>

                  {ticket.due_datetime && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Due Date
                        </p>
                        <p className="font-medium text-foreground">
                          {formatDate(ticket.due_datetime)}
                        </p>
                      </div>
                    </div>
                  )}

                  {ticket.resolution_datetime && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-theme-accent" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Resolved
                        </p>
                        <p className="font-medium text-foreground">
                          {formatDate(
                            ticket.resolution_datetime,
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Last Modified
                      </p>
                      <p className="font-medium text-foreground">
                        {formatDate(ticket.modified)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Section */}
            {(ticket.resolution_summary ||
              ticket.root_cause) && (
              <>
                <Separator className="bg-border" />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                    <CheckCircle className="w-5 h-5 text-theme-accent" />
                    <span className="text-foreground">
                      Resolution Details
                    </span>
                  </h3>

                  {ticket.resolution_summary && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Resolution Summary
                      </p>
                      <div className="bg-theme-accent/5 rounded-lg p-4 border border-theme-accent/20">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                          {ticket.resolution_summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {ticket.root_cause && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Root Cause
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4 border border-border">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                          {ticket.root_cause}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Additional Information */}
            <Separator className="bg-border" />
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-theme-accent" />
                <span className="text-foreground">
                  Additional Information
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ticket.tags && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>Tags</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags
                        .split(",")
                        .map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-secondary text-secondary-foreground border-border"
                          >
                            <span>{tag.trim()}</span>
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {ticket.attachments && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <span>Attachments</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-border text-foreground"
                      >
                        <span>File attached</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                <p className="text-muted-foreground">
                  System ID: {ticket.name}
                </p>
                {ticket.amended_from && (
                  <p className="text-muted-foreground">
                    Amended from: {ticket.amended_from}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

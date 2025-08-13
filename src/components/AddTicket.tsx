import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Clock, User, AlertCircle, Save, X } from "lucide-react";

interface TicketFormData {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical" | "";
  status: "Open" | "In Progress" | "Pending" | "Resolved" | "Closed" | "";
  assignee: string;
  department: string;
  category: string;
  dueDate: string;
  tags: string;
}

export function AddTicket() {
  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    description: "",
    priority: "",
    status: "Open",
    assignee: "",
    department: "",
    category: "",
    dueDate: "",
    tags: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Ticket created:", formData);
      setIsSubmitting(false);
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "",
        status: "Open",
        assignee: "",
        department: "",
        category: "",
        dueDate: "",
        tags: "",
      });
      // Show success message (you can add a toast here)
      alert("Ticket created successfully!");
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      priority: "",
      status: "Open",
      assignee: "",
      department: "",
      category: "",
      dueDate: "",
      tags: "",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-600 text-white";
      case "High":
        return "bg-orange-600 text-white";
      case "Medium":
        return "bg-yellow-600 text-white";
      case "Low":
        return "bg-green-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-600 text-white";
      case "In Progress":
        return "bg-purple-600 text-white";
      case "Pending":
        return "bg-yellow-600 text-white";
      case "Resolved":
        return "bg-green-600 text-white";
      case "Closed":
        return "bg-gray-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-2">Create New Support Ticket</h1>
        <p className="text-muted-foreground">
          Fill out the form below to create a new support ticket. All fields
          marked with * are required.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Ticket Details
          </CardTitle>
          <CardDescription>
            Provide detailed information about the issue or request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a clear, descriptive title for the ticket"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div className="lg:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the issue, including steps to reproduce, expected behavior, and any error messages"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Categorization */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {formData.priority && (
                  <Badge
                    className={`mt-2 ${getPriorityColor(formData.priority)}`}
                  >
                    {formData.priority}
                  </Badge>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                {formData.status && (
                  <Badge className={`mt-2 ${getStatusColor(formData.status)}`}>
                    {formData.status}
                  </Badge>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Access">Access</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Assignment and Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="assignee" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assignee
                </Label>
                <Select
                  value={formData.assignee}
                  onValueChange={(value) =>
                    handleInputChange("assignee", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john.doe">John Doe</SelectItem>
                    <SelectItem value="jane.smith">Jane Smith</SelectItem>
                    <SelectItem value="mike.johnson">Mike Johnson</SelectItem>
                    <SelectItem value="sarah.wilson">Sarah Wilson</SelectItem>
                    <SelectItem value="david.brown">David Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT Support">IT Support</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Infrastructure">
                      Infrastructure
                    </SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas (e.g., urgent, printer, network)"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Add relevant tags to help categorize and search for this ticket
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.title ||
                  !formData.description ||
                  !formData.priority
                }
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="space-y-1">
            <li>
              • <strong>Priority:</strong> Critical for system outages, High for
              business impact, Medium for general issues, Low for minor requests
            </li>
            <li>
              • <strong>Category:</strong> Choose the most relevant category to
              help route your ticket to the right team
            </li>
            <li>
              • <strong>Description:</strong> Include as much detail as possible
              - screenshots, error messages, and steps taken
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

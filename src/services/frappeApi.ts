// Frappe API Configuration
export interface ApiConfig {
  baseUrl: string;
  token: string;
  endpoint: string;
  fields: string[];
  timeout: number;
  retries: number;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:8000',
  token: '698c17f4c776340:1ee1056e3b01ed9',
  endpoint: '/api/resource/Ticket',
  fields: [
    'name', 'amended_from', 'ticket_id', 'user_name', 'department', 'contact_email', 
    'contact_phone', 'title', 'description', 'category', 'subcategory', 'priority', 
    'impact', 'status', 'assignee', 'created_datetime', 'due_datetime', 
    'resolution_datetime', 'resolution_summary', 'root_cause', 'requester_confirmation', 
    'time_spent', 'attachments', 'tags', 'creation', 'modified', 'docstatus'
  ],
  timeout: 10000,
  retries: 3,
};

export interface FrappeTicket {
  name: string;
  amended_from?: string | null;
  ticket_id?: string | null;
  user_name: string | null;
  department?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  title: string | null;
  description: string | null;
  category?: string | null;
  subcategory?: string | null;
  priority?: string | null;
  impact?: string | null;
  status?: string | null;
  assignee?: string | null;
  created_datetime?: string | null;
  due_datetime?: string | null;
  resolution_datetime?: string | null;
  resolution_summary?: string | null;
  root_cause?: string | null;
  requester_confirmation?: string | null;
  time_spent?: number | null;
  attachments?: string | null;
  tags?: string | null;
  creation: string | null;
  modified: string | null;
  docstatus: number | null;
}

export interface FrappeListResponse<T> {
  data: T[];
}

export interface FrappeDocResponse<T> {
  data: T;
}

// CSRF Token Detection Utilities (from Developer Dashboard)
export const extractCSRFToken = (): string | null => {
  // 1. Check meta tag (most common in Frappe)
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  const metaToken = metaTag?.getAttribute('content');
  if (metaToken) return metaToken;

  // 2. Check Frappe global object
  const frappeToken = (window as any).frappe?.csrf_token || (window as any).csrf_token;
  if (frappeToken) return frappeToken;

  // 3. Check cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token' || name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }

  // 4. Check localStorage as fallback
  const localStorageToken = localStorage.getItem('csrf_token') || localStorage.getItem('frappe_csrf_token');
  if (localStorageToken) return localStorageToken;

  return null;
};

class FrappeApiService {
  private config: ApiConfig;
  private csrfToken: string | null = null;

  constructor(initialConfig: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = { ...initialConfig };
  }

  // Update configuration
  updateConfig(newConfig: ApiConfig) {
    this.config = { ...newConfig };
    // Reset CSRF token when config changes
    this.csrfToken = null;
  }

  // Get current configuration
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  // Get CSRF token from Frappe session/environment
  private getCSRFToken(): string | null {
    // Always get fresh token from the environment
    const token = extractCSRFToken();
    
    if (token) {
      console.log('CSRF token found from environment:', token.substring(0, 8) + '...');
    } else {
      console.warn('No CSRF token found in environment. Request may fail if CSRF protection is enabled.');
    }
    
    return token;
  }

  private async getHeaders(includeCSRF: boolean = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Authorization': `token ${this.config.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Include CSRF token for POST/PUT/DELETE requests
    if (includeCSRF) {
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        headers['X-Frappe-CSRF-Token'] = csrfToken;
      }
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    customConfig?: Partial<ApiConfig>
  ): Promise<T> {
    const config = customConfig ? { ...this.config, ...customConfig } : this.config;
    const url = `${config.baseUrl}${endpoint}`;
    
    // Determine if we need CSRF token
    const method = options.method || 'GET';
    const needsCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const headers = await this.getHeaders(needsCSRF);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
        credentials: 'include', // Important for CSRF protection and session cookies
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If we get a CSRF error, try to get fresh token and retry once
        if (response.status === 403 || response.status === 400) {
          const errorText = await response.text();
          if (errorText.includes('CSRF') || errorText.includes('Invalid Request')) {
            console.warn('CSRF token invalid, getting fresh token and retrying...');
            
            // Get fresh token and retry the request once
            const newHeaders = await this.getHeaders(needsCSRF);
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...newHeaders,
                ...options.headers,
              },
              credentials: 'include',
            });
            
            if (!retryResponse.ok) {
              throw new Error(`Frappe API Error: ${retryResponse.status} ${retryResponse.statusText}`);
            }
            
            return retryResponse.json();
          }
        }
        
        throw new Error(`Frappe API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${config.timeout}ms`);
      }
      
      throw error;
    }
  }

  // Test API connection
  async testConnection(testConfig?: ApiConfig): Promise<boolean> {
    const config = testConfig || this.config;
    
    try {
      // Try a simple GET request first
      await this.makeRequest('/api/method/ping', { method: 'GET' }, config);
      return true;
    } catch (error) {
      // If ping fails, try the actual tickets endpoint with limit
      try {
        await this.makeRequest(`${config.endpoint}?limit=1`, { method: 'GET' }, config);
        return true;
      } catch (secondError) {
        console.error('Connection test failed:', secondError);
        return false;
      }
    }
  }

  // Get all tickets with configurable fields
  async getTickets(): Promise<FrappeTicket[]> {
    try {
      // Build fields parameter from configuration
      const fieldsParam = `[${this.config.fields.map(field => `"${field}"`).join(', ')}]`;
      const encodedFields = encodeURIComponent(fieldsParam);
      
      const response = await this.makeRequest<FrappeListResponse<FrappeTicket>>(
        `${this.config.endpoint}?fields=${encodedFields}`
      );
      
      // Handle the response and ensure proper typing
      const tickets = response.data || [];
      
      // Clean up and normalize the data
      return tickets.map(ticket => ({
        name: ticket.name || 'Unknown',
        amended_from: ticket.amended_from || null,
        ticket_id: ticket.ticket_id || null,
        user_name: ticket.user_name || null,
        department: ticket.department || null,
        contact_email: ticket.contact_email || null,
        contact_phone: ticket.contact_phone || null,
        title: ticket.title || null,
        description: ticket.description || null,
        category: ticket.category || null,
        subcategory: ticket.subcategory || null,
        priority: ticket.priority || null,
        impact: ticket.impact || null,
        status: ticket.status || null,
        assignee: ticket.assignee || null,
        created_datetime: ticket.created_datetime || null,
        due_datetime: ticket.due_datetime || null,
        resolution_datetime: ticket.resolution_datetime || null,
        resolution_summary: ticket.resolution_summary || null,
        root_cause: ticket.root_cause || null,
        requester_confirmation: ticket.requester_confirmation || null,
        time_spent: ticket.time_spent || null,
        attachments: ticket.attachments || null,
        tags: ticket.tags || null,
        creation: ticket.creation || null,
        modified: ticket.modified || null,
        docstatus: ticket.docstatus ?? 0,
      }));
      
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  // Create a new ticket
  async createTicket(ticket: Partial<FrappeTicket>): Promise<FrappeTicket> {
    try {
      console.log('Creating ticket with data:', ticket);
      console.log('CSRF token being used:', this.getCSRFToken()?.substring(0, 8) + '...' || 'None');
      
      const requestBody = {
        title: ticket.title || 'New Ticket',
        user_name: ticket.user_name || 'Unknown User',
        description: ticket.description || 'No description',
        category: ticket.category || 'Other',
        priority: ticket.priority || 'Medium',
        impact: ticket.impact || 'Single User',
        status: ticket.status || 'New',
        contact_email: ticket.contact_email || null,
        contact_phone: ticket.contact_phone || null,
        department: ticket.department || null,
        subcategory: ticket.subcategory || null,
        assignee: ticket.assignee || null,
        due_datetime: ticket.due_datetime || null,
        tags: ticket.tags || null,
        docstatus: ticket.docstatus ?? 0,
      };
      
      console.log('Request body:', requestBody);
      
      const response = await this.makeRequest<FrappeDocResponse<FrappeTicket>>(
        this.config.endpoint,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );
      
      console.log('Create ticket response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('CSRF')) {
          throw new Error('CSRF token error. Please refresh the page and try again.');
        } else if (error.message.includes('403')) {
          throw new Error('Permission denied. Check your API credentials.');
        } else if (error.message.includes('401')) {
          throw new Error('Authentication failed. Please check your token.');
        }
      }
      
      throw error;
    }
  }

  // Update a ticket
  async updateTicket(ticketId: string, updates: Partial<FrappeTicket>): Promise<FrappeTicket> {
    try {
      const response = await this.makeRequest<FrappeDocResponse<FrappeTicket>>(
        `${this.config.endpoint}/${ticketId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // Delete a ticket
  async deleteTicket(ticketId: string): Promise<void> {
    try {
      await this.makeRequest<void>(
        `${this.config.endpoint}/${ticketId}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error) {
      console.error(`Error deleting ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // Submit a ticket (change docstatus to 1)
  async submitTicket(ticketId: string): Promise<FrappeTicket> {
    try {
      const response = await this.makeRequest<FrappeDocResponse<FrappeTicket>>(
        `${this.config.endpoint}/${ticketId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ docstatus: 1 }),
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error submitting ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // Cancel a ticket (change docstatus to 2)
  async cancelTicket(ticketId: string): Promise<FrappeTicket> {
    try {
      const response = await this.makeRequest<FrappeDocResponse<FrappeTicket>>(
        `${this.config.endpoint}/${ticketId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ docstatus: 2 }),
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error cancelling ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // Get debug information
  getDebugInfo() {
    return {
      config: this.config,
      csrfToken: this.getCSRFToken(),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }
    };
  }
}

// Export singleton instance
export const frappeApi = new FrappeApiService();

// Export comprehensive mock data with all new fields
export const mockTickets: FrappeTicket[] = [
  {
    name: "TICK-2025-001",
    ticket_id: "TKT-001-2025",
    title: "Unable to Access Customer Portal",
    user_name: "Alice Johnson",
    department: "Sales",
    contact_email: "alice.johnson@company.com",
    contact_phone: "+1-555-0101",
    description: "Customer cannot log into the portal after password reset. Getting 'Account temporarily locked' message even with correct credentials. This is affecting their ability to view order history and make new purchases.",
    category: "Software",
    subcategory: "Authentication",
    priority: "High",
    impact: "Multiple Users",
    status: "New",
    assignee: "tech.support@company.com",
    created_datetime: "2025-01-15 09:30:00.000000",
    due_datetime: "2025-01-16 17:00:00.000000",
    resolution_datetime: null,
    resolution_summary: null,
    root_cause: null,
    requester_confirmation: null,
    time_spent: null,
    attachments: null,
    tags: "authentication,portal,access",
    creation: "2025-01-15 09:30:00.000000",
    modified: "2025-01-15 14:45:00.000000",
    docstatus: 0,
  },
  {
    name: "TICK-2025-002",
    ticket_id: "TKT-002-2025",
    title: "Email Notifications Not Working",
    user_name: "Bob Chen",
    department: "IT",
    contact_email: "bob.chen@company.com",
    contact_phone: "+1-555-0102",
    description: "SMTP server configuration appears to be incorrect. Users are not receiving password reset emails, order confirmations, or system notifications. This is a critical issue affecting user communication.",
    category: "Network",
    subcategory: "Email Configuration",
    priority: "Critical",
    impact: "Organization-wide",
    status: "In Progress",
    assignee: "network.admin@company.com",
    created_datetime: "2025-01-14 16:20:00.000000",
    due_datetime: "2025-01-15 10:00:00.000000",
    resolution_datetime: null,
    resolution_summary: null,
    root_cause: null,
    requester_confirmation: null,
    time_spent: 3.5,
    attachments: null,
    tags: "email,smtp,notifications,critical",
    creation: "2025-01-14 16:20:00.000000",
    modified: "2025-01-15 11:30:00.000000",
    docstatus: 1,
  },
  {
    name: "TICK-2025-003",
    ticket_id: "TKT-003-2025",
    title: "Database Connection Timeouts During Peak Hours",
    user_name: "Carol Martinez",
    department: "Operations",
    contact_email: "carol.martinez@company.com",
    contact_phone: "+1-555-0103",
    description: "Experiencing intermittent database connection timeouts between 2-4 PM daily. This causes page load failures and transaction errors. Database performance monitoring shows high CPU usage during these periods.",
    category: "Software",
    subcategory: "Database Performance",
    priority: "High",
    impact: "Entire Department",
    status: "Waiting for Info",
    assignee: "database.admin@company.com",
    created_datetime: "2025-01-13 14:10:00.000000",
    due_datetime: "2025-01-17 17:00:00.000000",
    resolution_datetime: null,
    resolution_summary: null,
    root_cause: null,
    requester_confirmation: null,
    time_spent: 2.0,
    attachments: null,
    tags: "database,performance,timeout",
    creation: "2025-01-13 14:10:00.000000",
    modified: "2025-01-14 09:15:00.000000",
    docstatus: 0,
  },
  {
    name: "TICK-2025-004",
    ticket_id: "TKT-004-2025",
    title: "Monthly Sales Report Generation Failure",
    user_name: "David Rodriguez",
    department: "Finance",
    contact_email: "david.rodriguez@company.com",
    contact_phone: "+1-555-0104",
    description: "The automated monthly sales report generation is failing with 'Memory limit exceeded' error. Reports over 500 records cause the system to crash. This affects month-end financial processes.",
    category: "Software",
    subcategory: "Reporting",
    priority: "Medium",
    impact: "Entire Department",
    status: "Resolved",
    assignee: "dev.team@company.com",
    created_datetime: "2025-01-12 11:45:00.000000",
    due_datetime: "2025-01-15 17:00:00.000000",
    resolution_datetime: "2025-01-14 15:30:00.000000",
    resolution_summary: "Increased memory limits and optimized report generation queries. Implemented pagination for large datasets.",
    root_cause: "Insufficient memory allocation for large dataset processing",
    requester_confirmation: "Yes",
    time_spent: 6.5,
    attachments: null,
    tags: "reports,memory,optimization",
    creation: "2025-01-12 11:45:00.000000",
    modified: "2025-01-14 15:30:00.000000",
    docstatus: 2,
  },
  {
    name: "TICK-2025-005",
    ticket_id: "TKT-005-2025",
    title: "Mobile App Synchronization Issues",
    user_name: "Emma Thompson",
    department: "Marketing",
    contact_email: "emma.thompson@company.com",
    contact_phone: "+1-555-0105",
    description: "Mobile application is not syncing properly with the server. Offline changes are not being uploaded when internet connection is restored. Users are losing data and experiencing frustration.",
    category: "Software",
    subcategory: "Mobile Application",
    priority: "High",
    impact: "Multiple Users",
    status: "In Progress",
    assignee: "mobile.dev@company.com",
    created_datetime: "2025-01-11 13:25:00.000000",
    due_datetime: "2025-01-18 17:00:00.000000",
    resolution_datetime: null,
    resolution_summary: null,
    root_cause: null,
    requester_confirmation: null,
    time_spent: 8.0,
    attachments: null,
    tags: "mobile,sync,data-loss",
    creation: "2025-01-11 13:25:00.000000",
    modified: "2025-01-13 16:40:00.000000",
    docstatus: 1,
  },
  {
    name: "TICK-2025-006",
    ticket_id: "TKT-006-2025",
    title: "Payment Gateway Integration Error",
    user_name: "Frank Wilson",
    department: "E-commerce",
    contact_email: "frank.wilson@company.com",
    contact_phone: "+1-555-0106",
    description: "Credit card payments are failing with 'Invalid merchant configuration' error. This is preventing customers from completing purchases and affecting revenue. PayPal integration works fine.",
    category: "Software",
    subcategory: "Payment Processing",
    priority: "Critical",
    impact: "Organization-wide",
    status: "New",
    assignee: "payment.team@company.com",
    created_datetime: "2025-01-10 10:15:00.000000",
    due_datetime: "2025-01-11 12:00:00.000000",
    resolution_datetime: null,
    resolution_summary: null,
    root_cause: null,
    requester_confirmation: null,
    time_spent: null,
    attachments: null,
    tags: "payment,integration,revenue-impact",
    creation: "2025-01-10 10:15:00.000000",
    modified: "2025-01-15 08:20:00.000000",
    docstatus: 0,
  },
  {
    name: "TICK-2025-007",
    ticket_id: "TKT-007-2025",
    title: "New Laptop Setup Request",
    user_name: "Grace Lee",
    department: "HR",
    contact_email: "grace.lee@company.com",
    contact_phone: "+1-555-0107",
    description: "New employee onboarding requires laptop setup with standard software package, domain join, and access permissions for HR systems.",
    category: "Hardware",
    subcategory: "Laptop Setup",
    priority: "Low",
    impact: "Single User",
    status: "Closed",
    assignee: "hardware.support@company.com",
    created_datetime: "2025-01-09 15:50:00.000000",
    due_datetime: "2025-01-12 17:00:00.000000",
    resolution_datetime: "2025-01-11 14:30:00.000000",
    resolution_summary: "Laptop configured with standard HR software package. Domain joined and user permissions granted.",
    root_cause: "Standard onboarding process",
    requester_confirmation: "Yes",
    time_spent: 2.5,
    attachments: null,
    tags: "hardware,setup,onboarding",
    creation: "2025-01-09 15:50:00.000000",
    modified: "2025-01-11 14:30:00.000000",
    docstatus: 1,
  },
  {
    name: "TICK-2025-008",
    ticket_id: "TKT-008-2025",
    title: "VPN Access Request for Remote Work",
    user_name: "Henry Zhang",
    department: "Development",
    contact_email: "henry.zhang@company.com",
    contact_phone: "+1-555-0108",
    description: "Remote employee needs VPN access to company network for development work. Requires access to development servers and internal documentation.",
    category: "Access Request",
    subcategory: "VPN Access",
    priority: "Medium",
    impact: "Single User",
    status: "Resolved",
    assignee: "network.security@company.com",
    created_datetime: "2025-01-08 12:30:00.000000",
    due_datetime: "2025-01-10 17:00:00.000000",
    resolution_datetime: "2025-01-09 16:45:00.000000",
    resolution_summary: "VPN credentials provided and access configured for development resources.",
    root_cause: "New remote work arrangement",
    requester_confirmation: "Yes",
    time_spent: 1.5,
    attachments: null,
    tags: "vpn,access,remote-work",
    creation: "2025-01-08 12:30:00.000000",
    modified: "2025-01-09 16:45:00.000000",
    docstatus: 2,
  },
  {
    name: "TICK-2025-009",
    ticket_id: "TKT-009-2025",
    title: "Printer Network Configuration Issue",
    user_name: "Ivy Parker",
    department: "Administration",
    contact_email: "ivy.parker@company.com",
    contact_phone: "+1-555-0109",
    description: "Office printer is not appearing in the network printer list. Multiple users cannot print documents. Printer shows as offline in the print queue.",
    category: "Hardware",
    subcategory: "Printer Configuration",
    priority: "Medium",
    impact: "Multiple Users",
    status: "New",
    assignee: "hardware.support@company.com",
    created_datetime: "2025-01-07 09:40:00.000000",
    due_datetime: "2025-01-09 17:00:00.000000",
    resolution_datetime: null,
    resolution_summary: null,
    root_cause: null,
    requester_confirmation: null,
    time_spent: null,
    attachments: null,
    tags: "printer,network,hardware",
    creation: "2025-01-07 09:40:00.000000",
    modified: "2025-01-11 14:55:00.000000",
    docstatus: 0,
  },
  {
    name: "TICK-2025-010",
    ticket_id: "TKT-010-2025",
    title: "Software License Renewal Request",
    user_name: "Jack Morrison",
    department: "IT",
    contact_email: "jack.morrison@company.com",
    contact_phone: "+1-555-0110",
    description: "Adobe Creative Suite licenses expiring next month. Need to renew for 15 users in the design team. Budget approval already obtained.",
    category: "Software",
    subcategory: "License Management",
    priority: "Low",
    impact: "Entire Department",
    status: "In Progress",
    assignee: "procurement@company.com",
    created_datetime: "2025-01-06 16:05:00.000000",
    due_datetime: "2025-01-20 17:00:00.000000",
    resolution_datetime: null,
    resolution_summary: null,
    root_cause: null,
    requester_confirmation: null,
    time_spent: 1.0,
    attachments: null,
    tags: "software,license,renewal",
    creation: "2025-01-06 16:05:00.000000",
    modified: "2025-01-13 10:25:00.000000",
    docstatus: 1,
  },
  {
    name: "TICK-2025-011",
    ticket_id: "TKT-011-2025",
    title: "Monitor Replacement - Flickering Display",
    user_name: "Karen Davis",
    department: "Accounting",
    contact_email: "karen.davis@company.com",
    contact_phone: "+1-555-0111",
    description: "Primary monitor flickering constantly, making work impossible. Monitor is 3 years old and showing signs of hardware failure. Need replacement urgently.",
    category: "Hardware",
    subcategory: "Monitor Replacement",
    priority: "High",
    impact: "Single User",
    status: "Waiting for Info",
    assignee: "hardware.support@company.com",
    created_datetime: "2025-01-05 11:20:00.000000",
    due_datetime: "2025-01-08 17:00:00.000000",
    resolution_datetime: null,
    resolution_summary: null,
    root_cause: null,
    requester_confirmation: null,
    time_spent: 0.5,
    attachments: null,
    tags: "hardware,monitor,replacement",
    creation: "2025-01-05 11:20:00.000000",
    modified: "2025-01-05 11:20:00.000000",
    docstatus: 0,
  },
  {
    name: "TICK-2025-012",
    ticket_id: "TKT-012-2025",
    title: "Database Backup System Malfunction",
    user_name: "Luke Anderson",
    department: "IT",
    contact_email: "luke.anderson@company.com",
    contact_phone: "+1-555-0112",
    description: "Automated daily backups have been failing for the past week. The backup logs show 'Insufficient disk space' errors. This creates a critical data loss risk for the organization.",
    category: "Software",
    subcategory: "Backup Systems",
    priority: "Critical",
    impact: "Organization-wide",
    status: "Resolved",
    assignee: "database.admin@company.com",
    created_datetime: "2025-01-04 08:10:00.000000",
    due_datetime: "2025-01-05 17:00:00.000000",
    resolution_datetime: "2025-01-05 14:20:00.000000",
    resolution_summary: "Cleared old backup files and increased storage allocation. Implemented automated cleanup policies.",
    root_cause: "Insufficient disk space due to accumulated old backup files",
    requester_confirmation: "Yes",
    time_spent: 4.0,
    attachments: null,
    tags: "backup,storage,critical,database",
    creation: "2025-01-04 08:10:00.000000",
    modified: "2025-01-05 14:20:00.000000",
    docstatus: 2,
  }
];
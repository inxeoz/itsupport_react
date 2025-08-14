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
  fields: ['name', 'title', 'user_name', 'description', 'creation', 'modified', 'docstatus', 'amended_from'],
  timeout: 10000,
  retries: 3,
};

export interface FrappeTicket {
  name: string;
  title: string | null;
  user_name: string | null;
  description: string | null;
  creation: string | null;
  modified: string | null;
  docstatus: number | null;
  amended_from?: string | null;
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
        title: ticket.title || null,
        user_name: ticket.user_name || null,
        description: ticket.description || null,
        creation: ticket.creation || null,
        modified: ticket.modified || null,
        docstatus: ticket.docstatus ?? 0,
        amended_from: ticket.amended_from || undefined,
      }));
      
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  // Get a specific ticket with all fields
  async getTicket(ticketId: string): Promise<FrappeTicket> {
    try {
      const response = await this.makeRequest<FrappeDocResponse<FrappeTicket>>(
        `${this.config.endpoint}/${ticketId}`
      );
      
      const ticket = response.data;
      
      // Normalize the single ticket data
      return {
        name: ticket.name || 'Unknown',
        title: ticket.title || null,
        user_name: ticket.user_name || null,
        description: ticket.description || null,
        creation: ticket.creation || null,
        modified: ticket.modified || null,
        docstatus: ticket.docstatus ?? 0,
        amended_from: ticket.amended_from || undefined,
      };
      
    } catch (error) {
      console.error(`Error fetching ticket ${ticketId}:`, error);
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

  // Retry mechanism for failed requests
  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.config.retries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt <= this.config.retries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          console.warn(`API request failed, retrying in ${delay}ms (attempt ${attempt}/${this.config.retries + 1})`);
        }
      }
    }
    
    throw lastError;
  }

  // Get API configuration info
  getConnectionInfo(): {
    endpoint: string;
    fieldsCount: number;
    timeout: number;
    retries: number;
    csrfToken: string | null;
  } {
    return {
      endpoint: `${this.config.baseUrl}${this.config.endpoint}`,
      fieldsCount: this.config.fields.length,
      timeout: this.config.timeout,
      retries: this.config.retries,
      csrfToken: this.getCSRFToken(),
    };
  }

  // Clear cached CSRF token (useful for logout or token refresh)
  clearCSRFToken(): void {
    this.csrfToken = null;
  }

  // Get debug information
  getDebugInfo() {
    return {
      config: this.config,
      csrfToken: this.getCSRFToken(),
      connectionInfo: this.getConnectionInfo(),
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

// Export mock data for development/fallback (updated to match real structure)
export const mockTickets: FrappeTicket[] = [
  {
    name: "TICK-MOCK-001",
    title: "Login Issue - Cannot Access Dashboard",
    user_name: "John Doe",
    description: "User unable to login to the system after recent password reset. Error message shows 'Invalid credentials' even with correct password.",
    creation: "2025-08-14 10:30:00.000000",
    modified: "2025-08-14 11:45:00.000000",
    docstatus: 0,
  },
  {
    name: "TICK-MOCK-002", 
    title: "Email Configuration Problem",
    user_name: "Sarah Johnson",
    description: "SMTP settings not working correctly for automated notifications. Users not receiving password reset emails.",
    creation: "2025-08-14 09:15:00.000000",
    modified: "2025-08-14 09:15:00.000000",
    docstatus: 1,
  },
  {
    name: "TICK-MOCK-003",
    title: "Database Connection Timeout",
    user_name: "Mike Wilson",
    description: "Intermittent database connection issues causing application slowdown during peak hours. Response times exceeding 30 seconds.",
    creation: "2025-08-13 16:20:00.000000",
    modified: "2025-08-14 08:30:00.000000",
    docstatus: 0,
  },
  {
    name: "TICK-MOCK-004",
    title: "Report Generation Error",
    user_name: "Emily Chen",
    description: "Monthly sales reports failing to generate with timeout errors. PDF export functionality broken for reports over 100 pages.",
    creation: "2025-08-13 14:10:00.000000",
    modified: "2025-08-13 14:10:00.000000",
    docstatus: 2,
  },
  {
    name: "TICK-MOCK-005",
    title: "Mobile App Sync Issues",
    user_name: "David Brown",
    description: "Mobile application not syncing data properly with server. Offline changes not being uploaded when connection restored.",
    creation: "2025-08-12 11:45:00.000000",
    modified: "2025-08-14 09:20:00.000000",
    docstatus: 1,
  }
];
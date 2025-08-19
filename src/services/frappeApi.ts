// Frappe API Configuration with Enhanced CSRF Token Handling
export interface ApiConfig {
  baseUrl: string;
  token: string;
  endpoint: string;
  fields: string[];
  timeout: number;
  retries: number;
  allowCookies: boolean;
  customCookies: string;
  // Enhanced auth options
  username?: string;
  password?: string;
  apiKey?: string;
  apiSecret?: string;
  skipCSRF?: boolean; // Option to skip CSRF for API-only access
  // DocType validation options
  validateDocTypes?: boolean;
  fallbackMode?: boolean;
  // CORS and Cookie options
  forceCookies?: boolean; // Force cookies even for cross-origin (may cause SameSite issues)
}

import { API_TOKEN, BASE_URL } from "../env";

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: BASE_URL,
  token: API_TOKEN,
  endpoint: "/api/resource/Ticket",
  fields: [
    "name",
    "amended_from",
    "ticket_id",
    "user_name",
    "contact_email",
    "contact_phone",
    "title",
    "description",
    "category",
    "subcategory",
    "priority",
    "impact",
    "status",
    "assignee",
    "created_datetime",
    "due_datetime",
    "resolution_datetime",
    "resolution_summary",
    "root_cause",
    "requester_confirmation",
    "time_spent",
    "attachments",
    "tags",
    "creation",
    "modified",
    "docstatus",
  ],
  timeout: 15000,
  retries: 3,
  allowCookies: false, // Disable cookies by default for cross-origin requests
  customCookies: "", // Remove custom cookies to avoid SameSite issues
  skipCSRF: true, // Skip CSRF by default to avoid token issues
  validateDocTypes: true,
  fallbackMode: true,
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

export interface FrappeAuthResponse {
  message: string;
  home_page?: string;
  full_name?: string;
  csrf_token?: string;
  session_id?: string;
}

export interface FrappeCSRFResponse {
  csrf_token: string;
}

export interface DocTypeInfo {
  name: string;
  exists: boolean;
  accessible: boolean;
  error?: string;
}

export interface SystemInfo {
  docTypes: DocTypeInfo[];
  recommendations: string[];
  fallbacksAvailable: string[];
}

// Bulk creation configuration interface
export interface BulkCreateConfig {
  batchSize?: number;
  delayBetweenRequests?: number;
  delayBetweenBatches?: number;
  stopOnError?: boolean;
  maxRetries?: number;
  onProgress?: (progress: BulkCreateProgress) => void;
  onBatchComplete?: (
    batchResult: BulkCreateBatchResult,
  ) => void;
}

// Progress tracking interface
export interface BulkCreateProgress {
  total: number;
  completed: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  currentTicketIndex: number;
  currentTicketTitle?: string;
  retries: number;
  startTime: Date;
  estimatedTimeRemaining?: number;
}

// Individual ticket result
export interface BulkCreateTicketResult {
  index: number;
  success: boolean;
  ticket?: FrappeTicket;
  error?: string;
  originalData: Partial<FrappeTicket>;
  attempts: number;
}

// Batch result
export interface BulkCreateBatchResult {
  batchIndex: number;
  batchStart: number;
  batchEnd: number;
  results: BulkCreateTicketResult[];
  completed: number;
  failed: number;
}

// Final result
export interface BulkCreateResult {
  success: boolean;
  total: number;
  completed: number;
  failed: number;
  retries: number;
  duration: number;
  results: BulkCreateTicketResult[];
  batchResults: BulkCreateBatchResult[];
  errors: string[];
  successfulTickets: FrappeTicket[];
}

// Enhanced CSRF Token Detection and Fetching
export const extractCSRFToken = (): string | null => {
  try {
    // 1. Check meta tag (most common in Frappe)
    const metaTag = document.querySelector(
      'meta[name="csrf-token"]',
    );
    const metaToken = metaTag?.getAttribute("content");
    if (metaToken) return metaToken;

    // 2. Check Frappe global object
    const frappeToken =
      (window as any).frappe?.csrf_token ||
      (window as any).csrf_token;
    if (frappeToken) return frappeToken;

    // 3. Check cookies
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrf_token" || name === "csrftoken") {
        return decodeURIComponent(value);
      }
    }

    // 4. Check localStorage as fallback
    const localStorageToken =
      localStorage.getItem("csrf_token") ||
      localStorage.getItem("frappe_csrf_token");
    if (localStorageToken) return localStorageToken;

    return null;
  } catch (error) {
    console.warn("Error extracting CSRF token:", error);
    return null;
  }
};

class FrappeApiService {
  private config: ApiConfig;
  private csrfToken: string | null = null;
  private sessionCookies: string | null = null;
  private lastCSRFError: number = 0;
  private docTypeCache: Map<string, DocTypeInfo> = new Map();
  private systemInfo: SystemInfo | null = null;
  private isCrossOrigin: boolean = false;
  private hasShownCookieWarning: boolean = false;

  constructor(initialConfig: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = { ...initialConfig };
    this.checkCrossOrigin();
  }

  // Check if the request will be cross-origin
  private checkCrossOrigin() {
    try {
      const currentOrigin = window.location.origin;
      const apiUrl = new URL(this.config.baseUrl);
      const apiOrigin = apiUrl.origin;
      
      this.isCrossOrigin = currentOrigin !== apiOrigin;
      
      if (this.isCrossOrigin) {
        console.info(
          `🌐 Cross-origin detected: ${currentOrigin} → ${apiOrigin}. Cookies will be disabled for SameSite compatibility.`
        );
      } else {
        console.info(
          `🏠 Same-origin detected: ${currentOrigin}. Cookies can be used if configured.`
        );
      }
    } catch (error) {
      console.warn("⚠️ Failed to determine origin, assuming cross-origin for safety:", error);
      this.isCrossOrigin = true;
    }
  }

  // Update configuration
  updateConfig(newConfig: ApiConfig) {
    this.config = { ...newConfig };
    // Reset tokens and cache when config changes
    this.csrfToken = null;
    this.sessionCookies = null;
    this.docTypeCache.clear();
    this.systemInfo = null;
    // Re-check cross-origin status
    this.checkCrossOrigin();
  }

  // Get current configuration
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  // Check if a DocType exists and is accessible
  private async checkDocType(
    docTypeName: string,
    isOptional: boolean = false,
  ): Promise<DocTypeInfo> {
    // Check cache first
    if (this.docTypeCache.has(docTypeName)) {
      return this.docTypeCache.get(docTypeName)!;
    }

    const docTypeInfo: DocTypeInfo = {
      name: docTypeName,
      exists: false,
      accessible: false,
    };

    try {
      if (!isOptional) {
        console.log(`🔍 Checking DocType: ${docTypeName}`);
      }

      // Try to access the DocType metadata
      const response = await this.makeRequest(
        `/api/resource/DocType/${docTypeName}`,
        {
          method: "GET",
        },
        undefined,
        true,
      ); // Skip CSRF retry for this check

      if (response) {
        docTypeInfo.exists = true;
        docTypeInfo.accessible = true;
        if (!isOptional) {
          console.log(
            `✅ DocType ${docTypeName} exists and is accessible`,
          );
        }
      }
    } catch (error) {
      if (!isOptional) {
        console.warn(
          `⚠️ DocType ${docTypeName} check failed:`,
          error,
        );
      }
      docTypeInfo.error =
        error instanceof Error
          ? error.message
          : "Unknown error";

      // Try alternative endpoints to check existence (only for required DocTypes)
      if (!isOptional) {
        try {
          await this.makeRequest(
            `/api/resource/${docTypeName}?limit=1`,
            {
              method: "GET",
            },
            undefined,
            true,
          );

          docTypeInfo.exists = true;
          docTypeInfo.accessible = true;
          console.log(
            `✅ DocType ${docTypeName} accessible via resource endpoint`,
          );
        } catch (secondError) {
          console.warn(
            `❌ DocType ${docTypeName} not accessible via any method`,
          );
        }
      }
    }

    // Cache the result
    this.docTypeCache.set(docTypeName, docTypeInfo);
    return docTypeInfo;
  }

  // Get system information and recommendations
  async getSystemInfo(): Promise<SystemInfo> {
    if (this.systemInfo) {
      return this.systemInfo;
    }

    console.log("🔍 Gathering system information...");

    // Define required and optional DocTypes
    const requiredDocTypes = ["Ticket", "Issue", "Task"];
    const optionalDocTypes = ["Department", "Employee", "User"];
    const docTypes: DocTypeInfo[] = [];

    // Check required DocTypes with full logging
    for (const docType of requiredDocTypes) {
      const info = await this.checkDocType(docType, false);
      docTypes.push(info);
    }

    // Check optional DocTypes silently
    for (const docType of optionalDocTypes) {
      const info = await this.checkDocType(docType, true);
      docTypes.push(info);
    }

    const recommendations: string[] = [];
    const fallbacksAvailable: string[] = [];

    // Analyze results and provide recommendations
    const ticketDocType = docTypes.find(
      (dt) => dt.name === "Ticket",
    );
    if (!ticketDocType?.exists) {
      recommendations.push(
        "The Ticket DocType does not exist. You may need to create it in your ERPNext instance.",
      );

      // Check for alternatives
      const issueDocType = docTypes.find(
        (dt) => dt.name === "Issue",
      );
      const taskDocType = docTypes.find(
        (dt) => dt.name === "Task",
      );

      if (issueDocType?.exists) {
        fallbacksAvailable.push(
          "Issue DocType can be used as an alternative to Ticket",
        );
        recommendations.push(
          "Consider using the Issue DocType as an alternative endpoint.",
        );
      }

      if (taskDocType?.exists) {
        fallbacksAvailable.push(
          "Task DocType can be used as an alternative to Ticket",
        );
        recommendations.push(
          "Consider using the Task DocType as an alternative endpoint.",
        );
      }
    }

    const departmentDocType = docTypes.find(
      (dt) => dt.name === "Department",
    );
    if (!departmentDocType?.exists) {
      // Only add this as an info message, not a warning
      fallbacksAvailable.push(
        "Department fields will be stored as plain text (Department DocType not available)",
      );
    }

    this.systemInfo = {
      docTypes,
      recommendations,
      fallbacksAvailable,
    };

    console.log(
      "📊 System analysis complete:",
      this.systemInfo,
    );
    return this.systemInfo;
  }

  // Fetch CSRF token directly from Frappe server
  private async fetchCSRFToken(): Promise<string | null> {
    try {
      console.log(
        "🔄 Fetching CSRF token from Frappe server...",
      );

      const response = await fetch(
        `${this.config.baseUrl}/api/method/frappe.sessions.get_csrf_token`,
        {
          method: "GET",
          headers: {
            Authorization: `token ${this.config.token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        const token = data.message || data.csrf_token;

        if (token) {
          console.log(
            "✅ CSRF token fetched:",
            token.substring(0, 8) + "...",
          );
          this.csrfToken = token;
          localStorage.setItem("frappe_csrf_token", token);
          return token;
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to fetch CSRF token:", error);
    }

    return null;
  }

  // Get CSRF token with multiple fallback methods
  private async getCSRFToken(): Promise<string | null> {
    // Skip CSRF if configured
    if (this.config.skipCSRF) {
      return null;
    }

    // 1. Try cached token
    if (this.csrfToken) {
      return this.csrfToken;
    }

    // 2. Try extracting from environment
    const envToken = extractCSRFToken();
    if (envToken) {
      console.log(
        "✅ CSRF token found from environment:",
        envToken.substring(0, 8) + "...",
      );
      this.csrfToken = envToken;
      return envToken;
    }

    // 3. Try fetching directly from server (if not in rate limit)
    const now = Date.now();
    if (now - this.lastCSRFError > 30000) {
      // Wait 30 seconds between attempts
      const fetchedToken = await this.fetchCSRFToken();
      if (fetchedToken) {
        return fetchedToken;
      }
      this.lastCSRFError = now;
    }

    console.warn(
      "⚠️ No CSRF token available. Proceeding without CSRF protection.",
    );
    return null;
  }

  private async getHeaders(
    includeCSRF: boolean = false,
  ): Promise<HeadersInit> {
    const headers: HeadersInit = {
      Authorization: `token ${this.config.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Handle cookie inclusion based on origin and configuration
    const shouldIncludeCookies = (!this.isCrossOrigin || this.config.forceCookies) && 
                                (this.sessionCookies || (this.config.allowCookies && this.config.customCookies));

    if (shouldIncludeCookies) {
      const cookies = [];

      if (this.sessionCookies) {
        cookies.push(this.sessionCookies);
      }

      if (
        this.config.allowCookies &&
        this.config.customCookies?.trim()
      ) {
        cookies.push(this.config.customCookies.trim());
      }

      if (cookies.length > 0) {
        headers["Cookie"] = cookies.join("; ");
        if (!this.isCrossOrigin) {
          console.log("🍪 Including cookies for same-origin request");
        } else {
          console.warn("⚠️ Force-including cookies for cross-origin request (may cause SameSite issues)");
        }
      }
    } else if (this.isCrossOrigin && (this.sessionCookies || this.config.customCookies)) {
      // Only show this info message once per session to avoid spam
      if (!this.hasShownCookieWarning) {
        console.info("🚫 Skipping cookies for cross-origin request to avoid SameSite issues. Using Authorization token only.");
        this.hasShownCookieWarning = true;
      }
    }

    // Include CSRF token for POST/PUT/DELETE requests (only for same-origin)
    if (includeCSRF && !this.config.skipCSRF && !this.isCrossOrigin) {
      const csrfToken = await this.getCSRFToken();
      if (csrfToken) {
        headers["X-Frappe-CSRF-Token"] = csrfToken;
        console.log(
          "🛡️ Using CSRF token:",
          csrfToken.substring(0, 8) + "...",
        );
      }
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    customConfig?: Partial<ApiConfig>,
    skipCSRFRetry: boolean = false,
  ): Promise<T> {
    const config = customConfig
      ? { ...this.config, ...customConfig }
      : this.config;
    const url = `${config.baseUrl}${endpoint}`;

    // Determine if we need CSRF token
    const method = options.method || "GET";
    const needsCSRF =
      ["POST", "PUT", "DELETE", "PATCH"].includes(
        method.toUpperCase(),
      ) && !config.skipCSRF;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout,
    );

    try {
      const headers = await this.getHeaders(needsCSRF);

      console.log(`📡 ${method} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
        // Use appropriate credentials policy based on origin and configuration
        credentials: this.isCrossOrigin && !config.forceCookies
          ? "omit" 
          : (config.allowCookies ? "include" : "same-origin"),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        // Parse Frappe error messages
        let frappeError = null;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData._server_messages) {
            const serverMessages = JSON.parse(
              errorData._server_messages,
            );
            if (
              Array.isArray(serverMessages) &&
              serverMessages.length > 0
            ) {
              const firstMessage = JSON.parse(
                serverMessages[0],
              );
              frappeError = firstMessage.message;
            }
          }
        } catch (parseError) {
          // Ignore parsing errors
        }

        // Handle specific Frappe errors
        if (frappeError) {
          if (
            frappeError.includes("DocType") &&
            frappeError.includes("not found")
          ) {
            const docTypeName = frappeError.match(
              /DocType (\w+) not found/,
            )?.[1];
            if (docTypeName) {
              // Don't throw errors for optional DocTypes like Department
              if (["Department", "Employee", "User"].includes(docTypeName)) {
                console.info(
                  `ℹ️ Optional DocType '${docTypeName}' not found - this is expected and the application will work normally.`,
                );
                // Return a minimal response instead of throwing
                return { data: [] } as T;
              }
              throw new Error(
                `DocType '${docTypeName}' does not exist in your ERPNext instance. Please create the ${docTypeName} DocType or remove references to it.`,
              );
            }
            throw new Error(
              `DocType not found: ${frappeError}`,
            );
          }
        }

        // Handle authentication errors
        if (response.status === 401) {
          throw new Error(
            "Authentication failed. Please verify your API token is correct and has the necessary permissions.",
          );
        }

        if (response.status === 403) {
          throw new Error(
            "Permission denied. Your API credentials don't have permission to access this resource.",
          );
        }

        if (response.status === 404) {
          if (endpoint.includes("/api/resource/Ticket")) {
            throw new Error(
              "The Ticket DocType does not exist in your ERPNext instance. Please create the Ticket DocType first, or use an alternative DocType like Issue or Task.",
            );
          }
          throw new Error(
            `Resource not found: ${endpoint}. Please check if the required DocTypes exist in your ERPNext instance.`,
          );
        }

        if (response.status === 500) {
          throw new Error(
            "Internal server error. Please check your Frappe server logs and ensure all required DocTypes are properly configured.",
          );
        }

        throw new Error(
          `Frappe API Error: ${response.status} ${response.statusText}${frappeError ? ` - ${frappeError}` : ""}`,
        );
      }

      const result = await response.json();
      console.log("✅ Request successful:", {
        status: response.status,
        endpoint,
      });

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new Error(
          `Request timeout after ${config.timeout}ms`,
        );
      }

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          `Network error: Cannot reach Frappe server at ${config.baseUrl}. ` +
            `Please check if the server is running and accessible.`,
        );
      }

      throw error;
    }
  }

  // Test API connection with comprehensive checks
  async testConnection(testConfig?: ApiConfig): Promise<{
    success: boolean;
    message: string;
    details?: any;
    suggestions?: string[];
    systemInfo?: SystemInfo;
  }> {
    const config = testConfig || this.config;

    try {
      console.log("🧪 Testing Frappe API connection...");

      // First, test basic connectivity
      try {
        const pingResult = await this.makeRequest(
          "/api/method/ping",
          { method: "GET" },
          config,
          true,
        );

        // If basic connection works, get system info
        const systemInfo = await this.getSystemInfo();

        return {
          success: true,
          message:
            "Connection successful! Frappe API is responding.",
          details: pingResult,
          systemInfo,
          suggestions: systemInfo.recommendations,
        };
      } catch (pingError) {
        console.warn(
          "⚠️ Ping failed, trying system analysis:",
          pingError,
        );

        // Even if ping fails, try to get system info
        try {
          const systemInfo = await this.getSystemInfo();

          return {
            success: false,
            message: `Connection partially working but some issues detected: ${pingError instanceof Error ? pingError.message : "Unknown error"}`,
            details: { pingError },
            systemInfo,
            suggestions: [
              ...systemInfo.recommendations,
              "Basic connectivity may be limited but some endpoints are accessible",
              "Check your API token permissions",
            ],
          };
        } catch (systemError) {
          return {
            success: false,
            message: `Connection failed: ${systemError instanceof Error ? systemError.message : "Unknown error"}`,
            details: { pingError, systemError },
            suggestions: [
              "Check if your Frappe server is running and accessible",
              "Verify your API token is correct and has proper permissions",
              "Ensure the required DocTypes exist in your ERPNext instance",
              "Check if CORS is properly configured for cross-origin requests",
            ],
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
        suggestions: [
          "Verify the base URL is correct",
          "Check your network connection",
          "Ensure API credentials are valid",
          "Create the required DocTypes in your ERPNext instance",
        ],
      };
    }
  }

  // Get total ticket count from server
  async getTotalTicketCount(): Promise<number> {
    try {
      console.log("📊 Fetching total ticket count from Frappe...");

      // First check if Ticket DocType exists (required check, not silent)
      const ticketInfo = await this.checkDocType("Ticket", false);
      let docTypeName = "Ticket";

      if (!ticketInfo.exists && this.config.fallbackMode) {
        console.warn(
          "⚠️ Ticket DocType not found, checking alternatives for count...",
        );

        // Try Issue DocType as fallback
        const issueInfo = await this.checkDocType("Issue", false);
        if (issueInfo.exists) {
          console.log("🔄 Using Issue DocType as fallback for count");
          docTypeName = "Issue";
        } else {
          // Try Task DocType as fallback
          const taskInfo = await this.checkDocType("Task", false);
          if (taskInfo.exists) {
            console.log("🔄 Using Task DocType as fallback for count");
            docTypeName = "Task";
          }
        }
      }

      const response = await this.makeRequest<{ message: number }>(
        `/api/method/frappe.client.get_count?doctype=${docTypeName}`
      );

      const count = response.message || 0;
      console.log(`✅ Retrieved total count: ${count} from DocType: ${docTypeName}`);

      return count;
    } catch (error) {
      console.error("❌ Error fetching total ticket count:", error);
      throw error;
    }
  }

  // Get tickets with pagination support
  async getTickets(limit?: number, offset?: number): Promise<FrappeTicket[]> {
    try {
      console.log("📋 Fetching tickets from Frappe...");

      // First check if Ticket DocType exists (required check, not silent)
      const ticketInfo = await this.checkDocType("Ticket", false);
      if (!ticketInfo.exists && this.config.fallbackMode) {
        console.warn(
          "⚠️ Ticket DocType not found, checking alternatives...",
        );

        // Try Issue DocType as fallback
        const issueInfo = await this.checkDocType("Issue", false);
        if (issueInfo.exists) {
          console.log("🔄 Using Issue DocType as fallback");
          this.config.endpoint = "/api/resource/Issue";
        } else {
          // Try Task DocType as fallback
          const taskInfo = await this.checkDocType("Task", false);
          if (taskInfo.exists) {
            console.log("🔄 Using Task DocType as fallback");
            this.config.endpoint = "/api/resource/Task";
          }
        }
      }

      // Build fields parameter from configuration
      const fieldsParam = `[${this.config.fields.map((field) => `"${field}"`).join(", ")}]`;
      const encodedFields = encodeURIComponent(fieldsParam);

      // Build URL with pagination parameters
      let url = `${this.config.endpoint}?fields=${encodedFields}`;
      if (limit !== undefined) {
        url += `&limit=${limit}`;
      }
      if (offset !== undefined) {
        url += `&offset=${offset}`;
      }

      const response = await this.makeRequest<
        FrappeListResponse<FrappeTicket>
      >(url);

      // Handle the response and ensure proper typing
      const tickets = response.data || [];
      console.log(
        `✅ Retrieved ${tickets.length} tickets from Frappe${limit ? ` (limit: ${limit}, offset: ${offset || 0})` : ''}`,
      );

      // Clean up and normalize the data
      return tickets.map((ticket) => ({
        name: ticket.name || "Unknown",
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
        requester_confirmation:
          ticket.requester_confirmation || null,
        time_spent: ticket.time_spent || null,
        attachments: ticket.attachments || null,
        tags: ticket.tags || null,
        creation: ticket.creation || null,
        modified: ticket.modified || null,
        docstatus: ticket.docstatus ?? 0,
      }));
    } catch (error) {
      console.error("❌ Error fetching tickets:", error);
      throw error;
    }
  }

  // Sanitize ticket data to remove fields that reference non-existent DocTypes
  private async sanitizeTicketData(
    ticket: Partial<FrappeTicket>,
  ): Promise<Partial<FrappeTicket>> {
    const sanitizedTicket = { ...ticket };

    // Check if Department DocType exists (silent check) - only log once per session
    const departmentInfo =
      await this.checkDocType("Department", true);
    if (!departmentInfo.exists) {
      // Keep the department field as it will be treated as plain text
      // No need to log this repeatedly since it's expected behavior
    }

    // Remove any null or undefined values that might cause issues
    Object.keys(sanitizedTicket).forEach((key) => {
      const value = sanitizedTicket[key as keyof FrappeTicket];
      if (value === undefined) {
        delete sanitizedTicket[key as keyof FrappeTicket];
      }
    });

    return sanitizedTicket;
  }

  // Create a new ticket with enhanced logging and DocType validation
  async createTicket(
    ticket: Partial<FrappeTicket>,
  ): Promise<FrappeTicket> {
    try {
      console.log("📝 Creating ticket with data:", ticket);

      // Sanitize ticket data first
      const sanitizedTicket =
        await this.sanitizeTicketData(ticket);
      console.log("🧹 Sanitized ticket data:", sanitizedTicket);

      // Check if the primary endpoint exists
      const ticketInfo = await this.checkDocType("Ticket");
      let endpoint = this.config.endpoint;

      if (!ticketInfo.exists && this.config.fallbackMode) {
        console.warn(
          "⚠️ Ticket DocType not found, trying alternatives...",
        );

        // Try Issue DocType as fallback
        const issueInfo = await this.checkDocType("Issue");
        if (issueInfo.exists) {
          console.log("🔄 Using Issue DocType as fallback");
          endpoint = "/api/resource/Issue";
        } else {
          // Try Task DocType as fallback
          const taskInfo = await this.checkDocType("Task");
          if (taskInfo.exists) {
            console.log("🔄 Using Task DocType as fallback");
            endpoint = "/api/resource/Task";
          } else {
            throw new Error(
              "No suitable DocType found. Please create a Ticket, Issue, or Task DocType in your ERPNext instance.",
            );
          }
        }
      }

      const requestBody = {
        title: sanitizedTicket.title || "New Ticket",
        user_name: sanitizedTicket.user_name || "Unknown User",
        description:
          sanitizedTicket.description || "No description",
        category: sanitizedTicket.category || "Other",
        priority: sanitizedTicket.priority || "Medium",
        impact: sanitizedTicket.impact || "Single User",
        status: sanitizedTicket.status || "New",
        contact_email: sanitizedTicket.contact_email || null,
        contact_phone: sanitizedTicket.contact_phone || null,
        subcategory: sanitizedTicket.subcategory || null,
        assignee: sanitizedTicket.assignee || null,
        due_datetime: sanitizedTicket.due_datetime || null,
        tags: sanitizedTicket.tags || null,
        docstatus: sanitizedTicket.docstatus ?? 0,
        // Only include department if it exists in sanitized data
        ...(sanitizedTicket.department && {
          department: sanitizedTicket.department,
        }),
      };

      console.log("📤 Request body:", requestBody);
      console.log("🎯 Using endpoint:", endpoint);

      const response = await this.makeRequest<
        FrappeDocResponse<FrappeTicket>
      >(endpoint, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      console.log(
        "✅ Ticket created successfully:",
        response.data,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error creating ticket:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (
          error.message.includes("DocType") &&
          error.message.includes("not found")
        ) {
          throw new Error(
            "DocType missing: " +
              error.message +
              " Please create the required DocTypes in your ERPNext instance or enable fallback mode.",
          );
        } else if (error.message.includes("CSRF")) {
          throw new Error(
            "CSRF token error. Try refreshing the page or contact your administrator.",
          );
        } else if (error.message.includes("403")) {
          throw new Error(
            "Permission denied. Your API credentials don't have permission to create tickets.",
          );
        } else if (error.message.includes("401")) {
          throw new Error(
            "Authentication failed. Please check your API token.",
          );
        } else if (error.message.includes("400")) {
          throw new Error(
            "Bad request. Please check the ticket data format and ensure all required DocTypes exist.",
          );
        }
      }

      throw error;
    }
  }

  // NEW: Create tickets in bulk using the single createTicket method
  async create_ticket_in_bulk(
    tickets: Partial<FrappeTicket>[],
    config: BulkCreateConfig = {},
  ): Promise<BulkCreateResult> {
    const startTime = new Date();
    console.log(
      `🚀 Starting bulk ticket creation for ${tickets.length} tickets`,
    );

    // Get system info first to understand what's available
    const systemInfo = await this.getSystemInfo();
    console.log(
      "📊 System analysis for bulk creation:",
      systemInfo,
    );

    // Default configuration
    const {
      batchSize = 5,
      delayBetweenRequests = 2000,
      delayBetweenBatches = 3000,
      stopOnError = false,
      maxRetries = 3,
      onProgress,
      onBatchComplete,
    } = config;

    // Initialize tracking variables
    const results: BulkCreateTicketResult[] = [];
    const batchResults: BulkCreateBatchResult[] = [];
    const errors: string[] = [];
    const successfulTickets: FrappeTicket[] = [];
    let totalCompleted = 0;
    let totalFailed = 0;
    let totalRetries = 0;

    const totalBatches = Math.ceil(tickets.length / batchSize);

    // Helper function to delay execution
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Helper function to calculate estimated time remaining
    const calculateETA = (
      completed: number,
      total: number,
      elapsed: number,
    ): number => {
      if (completed === 0) return 0;
      const avgTimePerTicket = elapsed / completed;
      const remaining = total - completed;
      return Math.round((remaining * avgTimePerTicket) / 1000); // Return in seconds
    };

    // Helper function to create a single ticket with retry logic
    const createTicketWithRetry = async (
      ticketData: Partial<FrappeTicket>,
      index: number,
      maxAttempts: number = maxRetries,
    ): Promise<BulkCreateTicketResult> => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(
            `📝 Creating ticket ${index + 1}/${tickets.length} (attempt ${attempt}/${maxAttempts})`,
          );

          const createdTicket =
            await this.createTicket(ticketData);

          return {
            index,
            success: true,
            ticket: createdTicket,
            originalData: ticketData,
            attempts: attempt,
          };
        } catch (error) {
          lastError =
            error instanceof Error
              ? error
              : new Error("Unknown error");
          console.error(
            `❌ Attempt ${attempt} failed for ticket ${index + 1}:`,
            lastError.message,
          );

          // If it's a DocType error and we have system info, stop retrying
          if (
            lastError.message.includes("DocType") &&
            lastError.message.includes("not found")
          ) {
            console.error(
              "🛑 DocType error detected, stopping retries for this ticket",
            );
            break;
          }

          if (attempt < maxAttempts) {
            // Exponential backoff: 2s, 4s, 8s
            const retryDelay = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Retrying in ${retryDelay}ms...`);
            await delay(retryDelay);
            totalRetries++;
          }
        }
      }

      // All attempts failed
      return {
        index,
        success: false,
        error: lastError?.message || "Unknown error",
        originalData: ticketData,
        attempts: maxAttempts,
      };
    };

    try {
      // Process tickets in batches
      for (
        let batchIndex = 0;
        batchIndex < totalBatches;
        batchIndex++
      ) {
        const batchStart = batchIndex * batchSize;
        const batchEnd = Math.min(
          batchStart + batchSize,
          tickets.length,
        );
        const batchTickets = tickets.slice(
          batchStart,
          batchEnd,
        );

        console.log(
          `🔄 Processing batch ${batchIndex + 1}/${totalBatches}: tickets ${batchStart + 1}-${batchEnd}`,
        );

        const batchResults_current: BulkCreateTicketResult[] =
          [];
        let batchCompleted = 0;
        let batchFailed = 0;

        // Process each ticket in the current batch
        for (let i = 0; i < batchTickets.length; i++) {
          const globalIndex = batchStart + i;
          const ticketData = batchTickets[i];

          // Update progress
          if (onProgress) {
            const elapsed = Date.now() - startTime.getTime();
            const progress: BulkCreateProgress = {
              total: tickets.length,
              completed: totalCompleted,
              failed: totalFailed,
              currentBatch: batchIndex + 1,
              totalBatches,
              currentTicketIndex: globalIndex + 1,
              currentTicketTitle: ticketData.title,
              retries: totalRetries,
              startTime,
              estimatedTimeRemaining: calculateETA(
                totalCompleted + totalFailed,
                tickets.length,
                elapsed,
              ),
            };
            onProgress(progress);
          }

          // Create the ticket with retry logic
          const result = await createTicketWithRetry(
            ticketData,
            globalIndex,
          );

          batchResults_current.push(result);
          results.push(result);

          if (result.success) {
            totalCompleted++;
            batchCompleted++;
            if (result.ticket) {
              successfulTickets.push(result.ticket);
            }
            console.log(
              `✅ Ticket ${globalIndex + 1} created successfully`,
            );
          } else {
            totalFailed++;
            batchFailed++;
            if (result.error) {
              errors.push(
                `Ticket ${globalIndex + 1}: ${result.error}`,
              );
            }
            console.error(
              `❌ Ticket ${globalIndex + 1} failed: ${result.error}`,
            );

            // Stop on error if configured
            if (stopOnError) {
              console.warn(
                "🛑 Stopping bulk creation due to error (stopOnError = true)",
              );
              break;
            }
          }

          // Add delay between requests (except for the last ticket in batch)
          if (i < batchTickets.length - 1) {
            console.log(
              `⏳ Waiting ${delayBetweenRequests}ms before next request...`,
            );
            await delay(delayBetweenRequests);
          }
        }

        // Store batch results
        const batchResult: BulkCreateBatchResult = {
          batchIndex,
          batchStart,
          batchEnd: batchEnd - 1,
          results: batchResults_current,
          completed: batchCompleted,
          failed: batchFailed,
        };
        batchResults.push(batchResult);

        // Call batch completion callback
        if (onBatchComplete) {
          onBatchComplete(batchResult);
        }

        console.log(
          `✅ Batch ${batchIndex + 1} completed: ${batchCompleted} success, ${batchFailed} failed`,
        );

        // Stop processing if stopOnError is true and we have failures
        if (stopOnError && batchFailed > 0) {
          break;
        }

        // Add delay between batches (except for the last batch)
        if (batchIndex < totalBatches - 1) {
          console.log(
            `⏳ Waiting ${delayBetweenBatches}ms before next batch...`,
          );
          await delay(delayBetweenBatches);
        }
      }
    } catch (error) {
      console.error(
        "💥 Critical error during bulk creation:",
        error,
      );
      errors.push(
        `Critical error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - startTime.getTime()) / 1000,
    );

    // Final progress update
    if (onProgress) {
      const finalProgress: BulkCreateProgress = {
        total: tickets.length,
        completed: totalCompleted,
        failed: totalFailed,
        currentBatch: totalBatches,
        totalBatches,
        currentTicketIndex: tickets.length,
        retries: totalRetries,
        startTime,
        estimatedTimeRemaining: 0,
      };
      onProgress(finalProgress);
    }

    const finalResult: BulkCreateResult = {
      success: totalFailed === 0,
      total: tickets.length,
      completed: totalCompleted,
      failed: totalFailed,
      retries: totalRetries,
      duration,
      results,
      batchResults,
      errors,
      successfulTickets,
    };

    console.log(`🏁 Bulk creation completed:`, {
      total: tickets.length,
      completed: totalCompleted,
      failed: totalFailed,
      retries: totalRetries,
      duration: `${duration}s`,
      successRate: `${Math.round((totalCompleted / tickets.length) * 100)}%`,
    });

    return finalResult;
  }

  // Update a ticket
  async updateTicket(
    ticketId: string,
    updates: Partial<FrappeTicket>,
  ): Promise<FrappeTicket> {
    try {
      console.log(
        `📝 Updating ticket ${ticketId} with:`,
        updates,
      );

      // Sanitize updates first
      const sanitizedUpdates =
        await this.sanitizeTicketData(updates);

      const response = await this.makeRequest<
        FrappeDocResponse<FrappeTicket>
      >(`${this.config.endpoint}/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify(sanitizedUpdates),
      });

      console.log(`✅ Ticket ${ticketId} updated successfully`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error updating ticket ${ticketId}:`,
        error,
      );
      throw error;
    }
  }

  // Delete a ticket
  async deleteTicket(ticketId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting ticket ${ticketId}`);

      await this.makeRequest<void>(
        `${this.config.endpoint}/${ticketId}`,
        {
          method: "DELETE",
        },
      );

      console.log(`✅ Ticket ${ticketId} deleted successfully`);
    } catch (error) {
      console.error(
        `❌ Error deleting ticket ${ticketId}:`,
        error,
      );
      throw error;
    }
  }

  // Submit a ticket (change docstatus to 1)
  async submitTicket(ticketId: string): Promise<FrappeTicket> {
    try {
      const response = await this.makeRequest<
        FrappeDocResponse<FrappeTicket>
      >(`${this.config.endpoint}/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify({ docstatus: 1 }),
      });
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error submitting ticket ${ticketId}:`,
        error,
      );
      throw error;
    }
  }

  // Cancel a ticket (change docstatus to 2)
  async cancelTicket(ticketId: string): Promise<FrappeTicket> {
    try {
      const response = await this.makeRequest<
        FrappeDocResponse<FrappeTicket>
      >(`${this.config.endpoint}/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify({ docstatus: 2 }),
      });
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error cancelling ticket ${ticketId}:`,
        error,
      );
      throw error;
    }
  }

  // Get comprehensive debug information
  getDebugInfo() {
    return {
      config: {
        baseUrl: this.config.baseUrl,
        endpoint: this.config.endpoint,
        hasToken: !!this.config.token,
        tokenPreview: this.config.token
          ? this.config.token.substring(0, 10) + "..."
          : "None",
        timeout: this.config.timeout,
        allowCookies: this.config.allowCookies,
        skipCSRF: this.config.skipCSRF,
        validateDocTypes: this.config.validateDocTypes,
        fallbackMode: this.config.fallbackMode,
      },
      session: {
        hasCSRFToken: !!this.csrfToken,
        csrfTokenPreview: this.csrfToken
          ? this.csrfToken.substring(0, 8) + "..."
          : null,
        hasSessionCookies: !!this.sessionCookies,
        lastCSRFError: this.lastCSRFError,
      },
      docTypes: Object.fromEntries(this.docTypeCache),
      systemInfo: this.systemInfo,
      environment: {
        userAgent:
          typeof navigator !== "undefined"
            ? navigator.userAgent
            : "N/A",
        url:
          typeof window !== "undefined"
            ? window.location.href
            : "N/A",
        timestamp: new Date().toISOString(),
        localStorage:
          typeof localStorage !== "undefined"
            ? "Available"
            : "Not available",
        cookies:
          typeof document !== "undefined"
            ? "Available"
            : "Not available",
      },
    };
  }

  // Clear all cached tokens and session data
  clearSession() {
    this.csrfToken = null;
    this.sessionCookies = null;
    this.lastCSRFError = 0;
    this.docTypeCache.clear();
    this.systemInfo = null;

    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("frappe_csrf_token");
    }

    console.log("🧹 Session data cleared");
  }
}

// Export singleton instance
export const frappeApi = new FrappeApiService();

// Export comprehensive mock data (unchanged from original)
export const mockTickets: FrappeTicket[] = [
  {
    name: "TICK-2025-001",
    ticket_id: "TKT-001-2025",
    title: "Unable to Access Customer Portal",
    user_name: "Alice Johnson",
    department: "Sales",
    contact_email: "alice.johnson@company.com",
    contact_phone: "+1-555-0101",
    description:
      "Customer cannot log into the portal after password reset. Getting 'Account temporarily locked' message even with correct credentials. This is affecting their ability to view order history and make new purchases.",
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
  // ... (rest of mock tickets remain the same)
];
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

import {API_TOKEN, BASE_URL} from "../env";

export const DEFAULT_API_CONFIG: ApiConfig = {
    baseUrl: BASE_URL,
    token: API_TOKEN,
    endpoint: "/api/resource/Ticket",
    fields: [
        "name",
        "amended_from",
        "ticket_id",
        "user_name",
        "department",
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
        this.config = {...initialConfig};
        this.checkCrossOrigin();
    }

    // Update configuration
    updateConfig(newConfig: ApiConfig) {
        this.config = {...newConfig};
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
        return {...this.config};
    }

    // Get system information and recommendations
    async getSystemInfo(): Promise<SystemInfo> {
        if (this.systemInfo) {
            return this.systemInfo;
        }

        console.log("🔍 Gathering system information...");

        // Define required and optional DocTypes
        const requiredDocTypes = ["Ticket"];
        const fallbackDocTypes = ["Issue", "Task"];
        const docTypes: DocTypeInfo[] = [];

        // Check required DocTypes with full logging
        for (const docType of requiredDocTypes) {
            const info = await this.checkDocType(docType, false);
            docTypes.push(info);
        }

        // Check fallback DocTypes
        for (const docType of fallbackDocTypes) {
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
        } else {
            console.log("✅ Ticket DocType is available and accessible");
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
                    {method: "GET"},
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
                        details: {pingError},
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
                        details: {pingError, systemError},
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
            console.log(`📋 Fetching tickets from Frappe (limit: ${limit || 'all'}, offset: ${offset || 0})...`);

            // First check if Ticket DocType exists (required check, not silent)
            const ticketInfo = await this.checkDocType("Ticket", false);
            let endpoint = this.config.endpoint;

            if (!ticketInfo.exists && this.config.fallbackMode) {
                console.warn(
                    "⚠️ Ticket DocType not found, checking alternatives...",
                );

                // Try Issue DocType as fallback
                const issueInfo = await this.checkDocType("Issue", false);
                if (issueInfo.exists) {
                    console.log("🔄 Using Issue DocType as fallback");
                    endpoint = "/api/resource/Issue";
                } else {
                    // Try Task DocType as fallback
                    const taskInfo = await this.checkDocType("Task", false);
                    if (taskInfo.exists) {
                        console.log("🔄 Using Task DocType as fallback");
                        endpoint = "/api/resource/Task";
                    }
                }
            }

            // Build pagination parameters
            const params = new URLSearchParams();

            // Add fields parameter as JSON array string (required by Frappe)
            if (this.config.fields && this.config.fields.length > 0) {
                const fieldsJson = JSON.stringify(this.config.fields);
                params.append('fields', fieldsJson);
                console.log(`🔧 Fields parameter: ${fieldsJson}`);
            }

            // Add pagination parameters if provided
            if (limit) {
                params.append('limit_page_length', limit.toString());
            }
            if (offset) {
                params.append('limit_start', offset.toString());
            }

            // Add ordering to ensure consistent pagination
            params.append('order_by', 'creation desc');

            const url = `${endpoint}?${params.toString()}`;
            console.log(`🔗 Request URL: ${url}`);

            const response = await this.makeRequest<FrappeListResponse<FrappeTicket>>(url);

            const tickets = response.data || [];
            console.log(`✅ Retrieved ${tickets.length} tickets (batch: ${offset || 0}-${(offset || 0) + tickets.length})`);

            return tickets;
        } catch (error) {
            console.error("❌ Error fetching tickets:", error);
            throw error;
        }
    }

    // Create a new ticket
    async createTicket(ticketData: Partial<FrappeTicket>): Promise<FrappeTicket> {
        try {
            console.log("📝 Creating new ticket...");

            const response = await this.makeRequest<FrappeDocResponse<FrappeTicket>>(
                this.config.endpoint,
                {
                    method: "POST",
                    body: JSON.stringify(ticketData),
                }
            );

            console.log("✅ Ticket created successfully:", response.data.name);
            return response.data;
        } catch (error) {
            console.error("❌ Error creating ticket:", error);
            throw error;
        }
    }

    // Submit a ticket (change docstatus from 0 to 1)
    async submitTicket(ticketName: string): Promise<FrappeTicket> {
        try {
            console.log(`📤 Submitting ticket: ${ticketName}`);

            const response = await this.makeRequest<FrappeDocResponse<FrappeTicket>>(
                `${this.config.endpoint}/${ticketName}`,
                {
                    method: "PUT",
                    body: JSON.stringify({docstatus: 1}),
                }
            );

            console.log("✅ Ticket submitted successfully:", ticketName);
            return response.data;
        } catch (error) {
            console.error("❌ Error submitting ticket:", error);
            throw error;
        }
    }

    // Cancel a ticket (change docstatus to 2)
    async cancelTicket(ticketName: string): Promise<FrappeTicket> {
        try {
            console.log(`❌ Cancelling ticket: ${ticketName}`);

            const response = await this.makeRequest<FrappeDocResponse<FrappeTicket>>(
                `${this.config.endpoint}/${ticketName}`,
                {
                    method: "PUT",
                    body: JSON.stringify({docstatus: 2}),
                }
            );

            console.log("✅ Ticket cancelled successfully:", ticketName);
            return response.data;
        } catch (error) {
            console.error("❌ Error cancelling ticket:", error);
            throw error;
        }
    }

    // Bulk create tickets with progress tracking
    async bulkCreateTickets(
        ticketsData: Partial<FrappeTicket>[],
        config?: BulkCreateConfig
    ): Promise<BulkCreateResult> {
        const defaultConfig: BulkCreateConfig = {
            batchSize: 5,
            delayBetweenRequests: 200,
            delayBetweenBatches: 1000,
            stopOnError: false,
            maxRetries: 2,
        };

        const finalConfig = {...defaultConfig, ...config};
        const startTime = new Date();
        const results: BulkCreateTicketResult[] = [];
        const batchResults: BulkCreateBatchResult[] = [];
        const errors: string[] = [];
        let completed = 0;
        let failed = 0;
        let totalRetries = 0;

        console.log(`🚀 Starting bulk creation of ${ticketsData.length} tickets...`);

        // Calculate batches
        const totalBatches = Math.ceil(ticketsData.length / finalConfig.batchSize!);

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const batchStart = batchIndex * finalConfig.batchSize!;
            const batchEnd = Math.min(batchStart + finalConfig.batchSize!, ticketsData.length);
            const batchData = ticketsData.slice(batchStart, batchEnd);

            console.log(`📦 Processing batch ${batchIndex + 1}/${totalBatches} (${batchData.length} tickets)`);

            const batchResult: BulkCreateBatchResult = {
                batchIndex,
                batchStart,
                batchEnd,
                results: [],
                completed: 0,
                failed: 0,
            };

            // Process tickets in current batch
            for (let i = 0; i < batchData.length; i++) {
                const ticketIndex = batchStart + i;
                const ticketData = batchData[i];
                let attempts = 0;
                let success = false;
                let ticket: FrappeTicket | undefined;
                let error: string | undefined;

                // Update progress
                if (finalConfig.onProgress) {
                    const estimatedTimeRemaining = completed > 0
                        ? ((Date.now() - startTime.getTime()) / completed) * (ticketsData.length - completed - 1)
                        : undefined;

                    finalConfig.onProgress({
                        total: ticketsData.length,
                        completed,
                        failed,
                        currentBatch: batchIndex + 1,
                        totalBatches,
                        currentTicketIndex: ticketIndex,
                        currentTicketTitle: ticketData.title || `Ticket ${ticketIndex + 1}`,
                        retries: totalRetries,
                        startTime,
                        estimatedTimeRemaining,
                    });
                }

                // Retry logic
                while (attempts <= finalConfig.maxRetries! && !success) {
                    attempts++;

                    try {
                        ticket = await this.createTicket(ticketData);
                        success = true;
                        completed++;
                        batchResult.completed++;
                    } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                        error = errorMessage;

                        if (attempts <= finalConfig.maxRetries!) {
                            totalRetries++;
                            console.warn(`⚠️ Retry ${attempts}/${finalConfig.maxRetries!} for ticket ${ticketIndex + 1}: ${errorMessage}`);

                            // Wait before retry
                            await new Promise(resolve => setTimeout(resolve, finalConfig.delayBetweenRequests!));
                        } else {
                            failed++;
                            batchResult.failed++;
                            errors.push(`Ticket ${ticketIndex + 1}: ${errorMessage}`);
                            console.error(`❌ Failed to create ticket ${ticketIndex + 1} after ${finalConfig.maxRetries!} retries: ${errorMessage}`);

                            if (finalConfig.stopOnError) {
                                console.log("🛑 Stopping bulk creation due to error");
                                break;
                            }
                        }
                    }

                    // Delay between requests (except for retries)
                    if (attempts === 1 && i < batchData.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, finalConfig.delayBetweenRequests!));
                    }
                }

                const ticketResult: BulkCreateTicketResult = {
                    index: ticketIndex,
                    success,
                    ticket,
                    error,
                    originalData: ticketData,
                    attempts,
                };

                results.push(ticketResult);
                batchResult.results.push(ticketResult);

                if (finalConfig.stopOnError && !success) {
                    break;
                }
            }

            batchResults.push(batchResult);

            // Call batch completion callback
            if (finalConfig.onBatchComplete) {
                finalConfig.onBatchComplete(batchResult);
            }

            // Delay between batches (except for the last batch)
            if (batchIndex < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, finalConfig.delayBetweenBatches!));
            }

            if (finalConfig.stopOnError && batchResult.failed > 0) {
                break;
            }
        }

        const duration = Date.now() - startTime.getTime();
        const successfulTickets = results.filter(r => r.success).map(r => r.ticket!);

        const finalResult: BulkCreateResult = {
            success: failed === 0,
            total: ticketsData.length,
            completed,
            failed,
            retries: totalRetries,
            duration,
            results,
            batchResults,
            errors,
            successfulTickets,
        };

        console.log(`🎯 Bulk creation completed: ${completed}/${ticketsData.length} successful, ${failed} failed, ${totalRetries} retries, ${duration}ms total`);

        return finalResult;
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
                    credentials: "omit",
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
            ? {...this.config, ...customConfig}
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
                // Always omit credentials to ensure API token is used instead of cookies
                credentials: "omit",
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
}

// Create and export the singleton instance
export const frappeApi = new FrappeApiService();

// Mock data for testing/demo purposes
export const mockTickets: FrappeTicket[] = [
    {
        name: "TICK-001",
        ticket_id: "TICK-001",
        user_name: "John Doe",
        department: "IT",
        contact_email: "john.doe@company.com",
        contact_phone: "+1-555-0123",
        title: "Computer won't start",
        description: "My computer won't turn on after the weekend. The power button doesn't respond.",
        category: "Hardware",
        subcategory: "Desktop",
        priority: "High",
        impact: "Single User",
        status: "New",
        assignee: "Tech Support",
        created_datetime: "2024-01-15T09:30:00Z",
        due_datetime: "2024-01-16T17:00:00Z",
        resolution_datetime: null,
        resolution_summary: null,
        root_cause: null,
        requester_confirmation: null,
        time_spent: null,
        attachments: null,
        tags: "hardware,desktop,urgent",
        creation: "2024-01-15T09:30:00Z",
        modified: "2024-01-15T09:30:00Z",
        docstatus: 0,
    },
    {
        name: "TICK-002",
        ticket_id: "TICK-002",
        user_name: "Jane Smith",
        department: "Marketing",
        contact_email: "jane.smith@company.com",
        contact_phone: "+1-555-0124",
        title: "Email not syncing",
        description: "My Outlook email hasn't been syncing since yesterday. I'm missing important client emails.",
        category: "Software",
        subcategory: "Email",
        priority: "Medium",
        impact: "Single User",
        status: "In Progress",
        assignee: "Email Admin",
        created_datetime: "2024-01-15T10:15:00Z",
        due_datetime: "2024-01-17T17:00:00Z",
        resolution_datetime: null,
        resolution_summary: null,
        root_cause: null,
        requester_confirmation: null,
        time_spent: 45,
        attachments: null,
        tags: "software,email,outlook",
        creation: "2024-01-15T10:15:00Z",
        modified: "2024-01-15T11:30:00Z",
        docstatus: 0,
    },
    {
        name: "TICK-003",
        ticket_id: "TICK-003",
        user_name: "Mike Johnson",
        department: "Finance",
        contact_email: "mike.johnson@company.com",
        contact_phone: "+1-555-0125",
        title: "VPN connection issues",
        description: "Cannot connect to company VPN from home. Getting authentication errors.",
        category: "Network",
        subcategory: "VPN",
        priority: "High",
        impact: "Single User",
        status: "Resolved",
        assignee: "Network Team",
        created_datetime: "2024-01-14T14:20:00Z",
        due_datetime: "2024-01-15T17:00:00Z",
        resolution_datetime: "2024-01-15T16:45:00Z",
        resolution_summary: "Reset VPN credentials and updated client configuration",
        root_cause: "Expired VPN certificate",
        requester_confirmation: "Yes",
        time_spent: 120,
        attachments: null,
        tags: "network,vpn,remote-access",
        creation: "2024-01-14T14:20:00Z",
        modified: "2024-01-15T16:45:00Z",
        docstatus: 1,
    },
    {
        name: "TICK-004",
        ticket_id: "TICK-004",
        user_name: "Sarah Wilson",
        department: "HR",
        contact_email: "sarah.wilson@company.com",
        contact_phone: "+1-555-0126",
        title: "Printer not working",
        description: "Office printer is showing paper jam error but there's no paper stuck.",
        category: "Hardware",
        subcategory: "Printer",
        priority: "Low",
        impact: "Multiple Users",
        status: "New",
        assignee: null,
        created_datetime: "2024-01-15T13:45:00Z",
        due_datetime: "2024-01-18T17:00:00Z",
        resolution_datetime: null,
        resolution_summary: null,
        root_cause: null,
        requester_confirmation: null,
        time_spent: null,
        attachments: null,
        tags: "hardware,printer,paper-jam",
        creation: "2024-01-15T13:45:00Z",
        modified: "2024-01-15T13:45:00Z",
        docstatus: 0,
    },
    {
        name: "TICK-005",
        ticket_id: "TICK-005",
        user_name: "David Brown",
        department: "Sales",
        contact_email: "david.brown@company.com",
        contact_phone: "+1-555-0127",
        title: "Software license expired",
        description: "Adobe Creative Suite license has expired and I need it for client presentations.",
        category: "Software",
        subcategory: "Licensing",
        priority: "Critical",
        impact: "Single User",
        status: "In Progress",
        assignee: "License Manager",
        created_datetime: "2024-01-15T08:00:00Z",
        due_datetime: "2024-01-15T12:00:00Z",
        resolution_datetime: null,
        resolution_summary: null,
        root_cause: null,
        requester_confirmation: null,
        time_spent: 30,
        attachments: null,
        tags: "software,license,adobe,critical",
        creation: "2024-01-15T08:00:00Z",
        modified: "2024-01-15T09:15:00Z",
        docstatus: 0,
    },
    // Additional mock tickets for testing pagination
    ...Array.from({length: 45}, (_, i) => ({
        name: `TICK-${String(i + 6).padStart(3, '0')}`,
        ticket_id: `TICK-${String(i + 6).padStart(3, '0')}`,
        user_name: `User ${i + 6}`,
        department: ["IT", "Marketing", "Finance", "HR", "Sales"][i % 5],
        contact_email: `user${i + 6}@company.com`,
        contact_phone: `+1-555-${String(i + 128).padStart(4, '0')}`,
        title: `Sample ticket ${i + 6}`,
        description: `This is a sample ticket description for testing purposes ${i + 6}`,
        category: ["Hardware", "Software", "Network", "Access Request", "Other"][i % 5],
        subcategory: ["Desktop", "Laptop", "Server", "Email", "Database", "VPN"][i % 6],
        priority: ["Low", "Medium", "High", "Critical"][i % 4],
        impact: ["Single User", "Multiple Users", "Entire Department", "Organization-wide"][i % 4],
        status: ["New", "In Progress", "Waiting for Info", "Resolved", "Closed"][i % 5],
        assignee: i % 3 === 0 ? null : `Assignee ${(i % 5) + 1}`,
        created_datetime: new Date(Date.now() - (i * 86400000)).toISOString(),
        due_datetime: new Date(Date.now() + ((7 - i % 7) * 86400000)).toISOString(),
        resolution_datetime: i % 5 === 3 ? new Date(Date.now() - ((i % 3) * 86400000)).toISOString() : null,
        resolution_summary: i % 5 === 3 ? `Resolved issue ${i + 6}` : null,
        root_cause: i % 5 === 3 ? `Root cause ${i + 6}` : null,
        requester_confirmation: i % 5 === 3 ? ["Yes", "No"][i % 2] : null,
        time_spent: i % 3 === 0 ? null : (i % 120) + 30,
        attachments: null,
        tags: `tag${i % 3 + 1},sample,test`,
        creation: new Date(Date.now() - (i * 86400000)).toISOString(),
        modified: new Date(Date.now() - (i * 86400000)).toISOString(),
        docstatus: i % 5 === 3 ? 1 : 0,
    }))
];

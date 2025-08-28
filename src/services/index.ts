// types/index.ts
export interface ApiConfig {
    baseUrl: string;
    token: string;
    endpoint: string;
    fields: string[];
    timeout: number;
    retries: number;
    allowCookies: boolean;
    customCookies: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiSecret?: string;
    skipCSRF?: boolean;
    validateDocTypes?: boolean;
    fallbackMode?: boolean;
    forceCookies?: boolean;
}

export interface LoginData {
    usr: string;
    pwd: string;
}

export interface RequestOptions {
    method: string;
    hostname: string;
    path: string;
    headers: {
        Accept: string;
        'Content-Type': string;
        Cookie?: string;
        'X-Frappe-CSRF-Token'?: string;
        Authorization?: string;
    };
}

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

export interface BulkCreateConfig {
    batchSize?: number;
    delayBetweenRequests?: number;
    delayBetweenBatches?: number;
    stopOnError?: boolean;
    maxRetries?: number;
    onProgress?: (progress: BulkCreateProgress) => void;
    onBatchComplete?: (batchResult: BulkCreateBatchResult) => void;
}

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

export interface BulkCreateTicketResult {
    index: number;
    success: boolean;
    ticket?: FrappeTicket;
    error?: string;
    originalData: Partial<FrappeTicket>;
    attempts: number;
}

export interface BulkCreateBatchResult {
    batchIndex: number;
    batchStart: number;
    batchEnd: number;
    results: BulkCreateTicketResult[];
    completed: number;
    failed: number;
}

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

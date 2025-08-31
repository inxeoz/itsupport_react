// config/apiConfig.ts
import { ApiConfig, LoginData } from '@/shared/services/index.ts';
import {useAuthToken, useBASE_URL} from "@/shared/store/GlobalStore.ts";
// Environment variables (replace with your actual values)
// export const API_TOKEN = process.env.FRAPPE_API_TOKEN || 'your-api-token-here';
// export const BASE_URL = process.env.FRAPPE_BASE_URL || 'https://itsupport.inxeoz.com';

const { base_url } = useBASE_URL();
const {AuthToken } = useAuthToken();

export const DEFAULT_API_CONFIG: ApiConfig = {
    baseUrl: base_url,
    token: AuthToken,
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
    allowCookies: false,
    customCookies: "",
    skipCSRF: true,
    validateDocTypes: true,
    fallbackMode: true,
};

export const DEFAULT_LOGIN_CREDENTIALS: LoginData = {
    usr: 'Administrator',
    pwd: '1212'
};

export const ENDPOINTS = {
    LOGIN: '/api/method/login',
    CSRF_TOKEN: '/api/method/frappe.sessions.get_csrf_token',
    PING: '/api/method/ping',
    TICKETS: '/api/resource/Ticket',
    ISSUES: '/api/resource/Issue',
    TASKS: '/api/resource/Task',
    DOCTYPE: '/api/resource/DocType',
    COUNT: '/api/method/frappe.client.get_count'
} as const;

export const DEFAULT_BULK_CONFIG = {
    batchSize: 5,
    delayBetweenRequests: 200,
    delayBetweenBatches: 1000,
    stopOnError: false,
    maxRetries: 2,
};

// services/httpService.ts
import * as https from 'https';
import { ApiConfig, RequestOptions } from '@/services/index.ts';
import { AuthService } from '@/services/AuthService.ts';

export class HttpService {
    private authService: AuthService;
    private isCrossOrigin: boolean = false;
    private hasShownCookieWarning: boolean = false;

    constructor(private config: ApiConfig) {
        this.authService = new AuthService(config.baseUrl);
        this.checkCrossOrigin();
    }

    // Check if the request will be cross-origin
    private checkCrossOrigin() {
        try {
            if (typeof window !== 'undefined') {
                const currentOrigin = window.location.origin;
                const apiUrl = new URL(this.config.baseUrl);
                const apiOrigin = apiUrl.origin;
                this.isCrossOrigin = currentOrigin !== apiOrigin;
            } else {
                // In Node.js environment, assume cross-origin for safety
                this.isCrossOrigin = true;
            }
        } catch (error) {
            console.warn('Failed to determine origin, assuming cross-origin for safety:', error);
            this.isCrossOrigin = true;
        }
    }

    // Get headers for requests
    private async getHeaders(includeCSRF: boolean = false): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Authorization': `token ${this.config.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Handle cookie inclusion based on origin and configuration
        const shouldIncludeCookies = (!this.isCrossOrigin || this.config.forceCookies) &&
            (this.authService.getSessionCookies() || (this.config.allowCookies && this.config.customCookies));

        if (shouldIncludeCookies) {
            const cookies = [];

            const sessionCookies = this.authService.getSessionCookies();
            if (sessionCookies) {
                cookies.push(sessionCookies);
            }

            if (this.config.allowCookies && this.config.customCookies?.trim()) {
                cookies.push(this.config.customCookies.trim());
            }

            if (cookies.length > 0) {
                headers['Cookie'] = cookies.join('; ');
            }
        }

        // Include CSRF token for POST/PUT/DELETE requests (only for same-origin)
        if (includeCSRF && !this.config.skipCSRF && !this.isCrossOrigin) {
            const csrfToken = await this.authService.getCSRFToken(this.config.token, this.config.skipCSRF);
            if (csrfToken) {
                headers['X-Frappe-CSRF-Token'] = csrfToken;
            }
        }

        return headers;
    }

    // Make HTTP request using Node.js https module
    public async request<T>(endpoint: string, options: Partial<RequestOptions> = {}): Promise<T> {
        return new Promise(async (resolve, reject) => {
            const url = new URL(`${this.config.baseUrl}${endpoint}`);
            const method = options.method || 'GET';
            const needsCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase()) && !this.config.skipCSRF;

            // Get headers
            const headers = await this.getHeaders(needsCSRF);

            const requestOptions: RequestOptions = {
                method: method,
                hostname: url.hostname,
                path: url.pathname + url.search,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...headers,
                    ...options.headers,
                }
            };

            console.log(`${method} ${url.toString()}`);

            // Set up timeout
            const timeout = setTimeout(() => {
                req.destroy();
                reject(new Error(`Request timeout after ${this.config.timeout}ms`));
            }, this.config.timeout);

            const req = https.request(requestOptions, (res) => {
                clearTimeout(timeout);

                const chunks: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    const body = Buffer.concat(chunks);
                    const responseText = body.toString();

                    if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
                        console.error('API Error Response:', {
                            status: res.statusCode,
                            statusText: res.statusMessage,
                            body: responseText,
                        });

                        // Parse Frappe error messages
                        let frappeError = null;
                        try {
                            const errorData = JSON.parse(responseText);
                            if (errorData._server_messages) {
                                const serverMessages = JSON.parse(errorData._server_messages);
                                if (Array.isArray(serverMessages) && serverMessages.length > 0) {
                                    const firstMessage = JSON.parse(serverMessages[0]);
                                    frappeError = firstMessage.message;
                                }
                            }
                        } catch (parseError) {
                            // Ignore parsing errors
                        }

                        // Handle specific error codes
                        if (res.statusCode === 401) {
                            reject(new Error('Authentication failed. Please verify your API token is correct and has the necessary permissions.'));
                            return;
                        }

                        if (res.statusCode === 403) {
                            reject(new Error('Permission denied. Your API credentials don\'t have permission to access this resource.'));
                            return;
                        }

                        if (res.statusCode === 404) {
                            if (endpoint.includes('/api/resource/Ticket')) {
                                reject(new Error('The Ticket DocType does not exist in your ERPNext instance. Please create the Ticket DocType first, or use an alternative DocType like Issue or Task.'));
                                return;
                            }
                            reject(new Error(`Resource not found: ${endpoint}. Please check if the required DocTypes exist in your ERPNext instance.`));
                            return;
                        }

                        if (res.statusCode === 500) {
                            reject(new Error('Internal server error. Please check your Frappe server logs and ensure all required DocTypes are properly configured.'));
                            return;
                        }

                        reject(new Error(`Frappe API Error: ${res.statusCode} ${res.statusMessage}${frappeError ? ` - ${frappeError}` : ''}`));
                        return;
                    }

                    try {
                        const result = JSON.parse(responseText);
                        console.log('Request successful:', { status: res.statusCode, endpoint });
                        resolve(result);
                    } catch (parseError) {
                        reject(new Error(`Failed to parse response JSON: ${parseError}`));
                    }
                });

                res.on('error', (error: Error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });

            req.on('error', (error: Error) => {
                clearTimeout(timeout);
                if (error.message.includes('getaddrinfo ENOTFOUND')) {
                    reject(new Error(`Network error: Cannot reach Frappe server at ${this.config.baseUrl}. Please check if the server is running and accessible.`));
                } else {
                    reject(error);
                }
            });

            // Write request body if provided
            if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
                // For Node.js https module, we need to handle the body differently
                // The body should be passed as a string in the write method
                if ((options as any).body) {
                    req.write((options as any).body);
                }
            }

            req.end();
        });
    }

    // Get auth service for external access
    public getAuthService(): AuthService {
        return this.authService;
    }

    // Update configuration
    public updateConfig(newConfig: ApiConfig): void {
        this.config = { ...newConfig };
        this.authService = new AuthService(newConfig.baseUrl);
        this.checkCrossOrigin();
    }
}

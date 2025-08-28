// services/AuthService.ts
import * as https from 'https';
import {LoginData, RequestOptions} from '@/services/index.ts';
import {ENDPOINTS} from '@/services/ApiConfig.ts';

export class AuthService {
    private cookies: string[] = [];
    private csrfToken: string | null = null;
    private sessionCookies: string | null = null;
    private lastCSRFError: number = 0;

    constructor(private baseUrl: string) {
    }

    // Login using username and password
    public async login(credentials: LoginData): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const url = new URL(this.baseUrl);

            const loginOptions: RequestOptions = {
                method: 'POST',
                hostname: url.hostname,
                path: ENDPOINTS.LOGIN,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };

            console.log('Making login request...');

            const req = https.request(loginOptions, (res) => {
                console.log('Login Response Headers:', res.headers);

                const setCookieHeader = res.headers['set-cookie'];
                if (setCookieHeader) {
                    console.log('Set-Cookie Header received');
                    setCookieHeader.forEach((cookie, index) => {
                        console.log(`Cookie ${index + 1}: ${cookie}`);
                    });
                    this.cookies = setCookieHeader;
                    this.sessionCookies = setCookieHeader.join('; ');
                } else {
                    console.log('No set-cookie header found');
                }

                const chunks: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    const body: Buffer = Buffer.concat(chunks);
                    console.log('Login Response Body:', body.toString());
                    resolve(this.cookies);
                });

                res.on('error', (error: Error) => {
                    console.error('Login Error:', error);
                    reject(error);
                });
            });

            req.on('error', (error: Error) => {
                console.error('Login Request Error:', error);
                reject(error);
            });

            req.write(JSON.stringify(credentials));
            req.end();
        });
    }

    // Get CSRF token with multiple fallback methods
    public async getCSRFToken(apiToken: string, skipCSRF: boolean = false): Promise<string | null> {
        if (skipCSRF) {
            return null;
        }

        // 1. Try cached token
        if (this.csrfToken) {
            return this.csrfToken;
        }

        // 2. Try extracting from environment
        const envToken = this.extractCSRFToken();
        if (envToken) {
            console.log('CSRF token found from environment');
            this.csrfToken = envToken;
            return envToken;
        }

        // 3. Try fetching directly from server (if not in rate limit)
        const now = Date.now();
        if (now - this.lastCSRFError > 30000) { // Wait 30 seconds between attempts
            const fetchedToken = await this.fetchCSRFToken(apiToken);
            if (fetchedToken) {
                return fetchedToken;
            }
            this.lastCSRFError = now;
        }

        console.warn('No CSRF token available. Proceeding without CSRF protection.');
        return null;
    }

    // Get stored cookies
    public getCookies(): string[] {
        return this.cookies;
    }

    // Get session cookies as string
    public getSessionCookies(): string | null {
        return this.sessionCookies;
    }

    // Clear authentication data
    public clearAuth(): void {
        this.cookies = [];
        this.csrfToken = null;
        this.sessionCookies = null;
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem("frappe_csrf_token");
        }
    }

    // Extract CSRF token from various sources
    private extractCSRFToken(): string | null {
        try {
            // 1. Check meta tag (most common in Frappe)
            if (typeof document !== 'undefined') {
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                const metaToken = metaTag?.getAttribute("content");
                if (metaToken) return metaToken;

                // 2. Check Frappe global object
                const frappeToken = (window as any).frappe?.csrf_token || (window as any).csrf_token;
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
                const localStorageToken = localStorage.getItem("csrf_token") || localStorage.getItem("frappe_csrf_token");
                if (localStorageToken) return localStorageToken;
            }

            return null;
        } catch (error) {
            console.warn("Error extracting CSRF token:", error);
            return null;
        }
    }

    // Fetch CSRF token from server
    private async fetchCSRFToken(apiToken: string): Promise<string | null> {
        try {
            console.log('Fetching CSRF token from Frappe server...');
            const url = new URL(this.baseUrl);

            return new Promise((resolve, reject) => {
                const options: RequestOptions = {
                    method: 'GET',
                    hostname: url.hostname,
                    path: ENDPOINTS.CSRF_TOKEN,
                    headers: {
                        'Authorization': `token ${apiToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                };

                const req = https.request(options, (res) => {
                    const chunks: Buffer[] = [];

                    res.on('data', (chunk: Buffer) => {
                        chunks.push(chunk);
                    });

                    res.on('end', () => {
                        try {
                            const body = Buffer.concat(chunks);
                            const data = JSON.parse(body.toString());
                            const token = data.message || data.csrf_token;

                            if (token) {
                                console.log('CSRF token fetched successfully');
                                this.csrfToken = token;
                                if (typeof localStorage !== 'undefined') {
                                    localStorage.setItem("frappe_csrf_token", token);
                                }
                                resolve(token);
                            } else {
                                resolve(null);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    });

                    res.on('error', (error: Error) => {
                        reject(error);
                    });
                });

                req.on('error', (error: Error) => {
                    reject(error);
                });

                req.end();
            });
        } catch (error) {
            console.warn('Failed to fetch CSRF token:', error);
            return null;
        }
    }
}

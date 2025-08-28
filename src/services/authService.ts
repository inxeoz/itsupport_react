import { BASE_URL } from "../env";

export interface AuthResponse {
  message: string;
  home_page?: string;
  full_name?: string;
  csrf_token?: string;
  session_id?: string;
}

export interface UserInfo {
  full_name: string;
  email: string;
  username: string;
  roles: string[];
}

class AuthService {
  private baseUrl: string;
  private currentUser: UserInfo | null = null;
  private sessionCookies: string | null = null;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadUserFromStorage();
    this.loadSessionFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.warn('Failed to load user from storage:', error);
      localStorage.removeItem('current_user');
    }
  }

  private saveUserToStorage(user: UserInfo) {
    try {
      localStorage.setItem('current_user', JSON.stringify(user));
      this.currentUser = user;
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  }

  private loadSessionFromStorage() {
    try {
      const storedSession = localStorage.getItem('session_cookies');
      if (storedSession) {
        this.sessionCookies = storedSession;
      }
    } catch (error) {
      console.warn('Failed to load session from storage:', error);
      localStorage.removeItem('session_cookies');
    }
  }

  private saveSessionToStorage(cookies: string) {
    try {
      localStorage.setItem('session_cookies', cookies);
      this.sessionCookies = cookies;
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  }

  private clearUserFromStorage() {
    localStorage.removeItem('current_user');
    localStorage.removeItem('frappe_csrf_token');
    localStorage.removeItem('session_cookies');
    this.currentUser = null;
    this.sessionCookies = null;
  }

  async login(username: string, password: string): Promise<{ success: boolean; user?: UserInfo }> {
    try {
      console.log('🔐 Attempting login...');

      const response = await fetch(`${this.baseUrl}/api/method/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          usr: username,
          pwd: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = 'Login failed';
        
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError._server_messages) {
            const serverMessages = JSON.parse(parsedError._server_messages);
            if (Array.isArray(serverMessages) && serverMessages.length > 0) {
              const firstMessage = JSON.parse(serverMessages[0]);
              errorMessage = firstMessage.message || errorMessage;
            }
          }
        } catch (parseError) {
          errorMessage = response.statusText || 'Login failed';
        }

        throw new Error(errorMessage);
      }

      // Extract and save cookies from response
      const setCookieHeaders = response.headers.get('set-cookie');
      if (setCookieHeaders) {
        console.log('🍪 Received cookies from server, saving for future requests');
        this.saveSessionToStorage(setCookieHeaders);
      }

      const authData: AuthResponse = await response.json();
      console.log('✅ Login successful:', authData.message);

      // Create user info from login data and the username we used to login
      const userInfo: UserInfo = {
        username: username,
        email: username, // Often username is email in Frappe
        full_name: authData.full_name || username,
        roles: [],
      };

      // Save user info
      this.saveUserToStorage(userInfo);

      return {
        success: true,
        user: userInfo,
      };

    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  private getCurrentUser(): UserInfo | null {
    // Simply return the stored current user info
    return this.currentUser;
  }

  async verifyCookieAuth(): Promise<boolean> {
    try {
      if (!this.sessionCookies) {
        return false;
      }

      console.log('🔍 Verifying authentication with saved cookies...');

      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': this.sessionCookies,
      };

      // Use the same login endpoint but without usr/pwd to verify cookies
      const response = await fetch(`${this.baseUrl}/api/method/login`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({}), // Empty body - no usr/pwd, just relying on cookies
      });

      if (!response.ok) {
        console.warn('❌ Cookie authentication failed');
        this.clearUserFromStorage();
        return false;
      }

      const authData = await response.json();
      
      // Check if we got a successful response (not an error about missing credentials)
      if (authData.message && authData.message.includes && authData.message.includes('Logged In')) {
        console.log('✅ Cookie authentication successful');
        return true;
      }

      // If the response doesn't indicate successful login, try a different approach
      // Check if we can access a simple authenticated endpoint
      const testResponse = await fetch(`${this.baseUrl}/api/method/ping`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cookie': this.sessionCookies,
        },
        credentials: 'include',
      });

      if (testResponse.ok) {
        console.log('✅ Cookie authentication verified via ping endpoint');
        return true;
      }

      console.warn('❌ Cookie authentication failed - session expired or invalid');
      this.clearUserFromStorage();
      return false;
    } catch (error) {
      console.error('❌ Error verifying cookie authentication:', error);
      this.clearUserFromStorage();
      return false;
    }
  }


  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');

      await fetch(`${this.baseUrl}/api/method/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      this.clearUserFromStorage();
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      this.clearUserFromStorage();
    }
  }

  getCurrentUserInfo(): UserInfo | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null && this.hasValidCookies();
  }

  hasValidCookies(): boolean {
    return !!this.sessionCookies;
  }

  getStoredCookies(): string | null {
    return this.sessionCookies;
  }
}

export const authService = new AuthService();
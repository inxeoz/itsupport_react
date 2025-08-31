import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/card.tsx';
import { Badge } from '@/ui/components/badge.tsx';
import { Button } from '@/ui/components/button.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/tabs.tsx';
import { Alert, AlertDescription } from '@/ui/components/alert.tsx';
import {
  Code,
  Key,
  Cookie,
  Server,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  Globe,
  Database,
  Terminal,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  User,
  Clock,
  Shield
} from 'lucide-react';
import { toast } from "sonner";

interface CSRFTokenInfo {
  source: string;
  value: string | null;
  found: boolean;
  description: string;
}

interface SessionInfo {
  sessionId: string | null;
  userId: string | null;
  fullName: string | null;
  userRoles: string[];
  systemUser: boolean;
  language: string | null;
}

interface FrappeGlobals {
  csrf_token?: string;
  session?: any;
  user?: any;
  boot?: any;
  ready?: boolean;
}

export function DeveloperDashboard() {
  const [csrfTokens, setCsrfTokens] = useState<CSRFTokenInfo[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [frappeGlobals, setFrappeGlobals] = useState<FrappeGlobals>({});
  const [showTokenValues, setShowTokenValues] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract CSRF token from various sources
  const extractCSRFTokens = (): CSRFTokenInfo[] => {
    const tokens: CSRFTokenInfo[] = [];

    // 1. Check meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    tokens.push({
      source: 'Meta Tag',
      value: metaTag?.getAttribute('content') || null,
      found: !!metaTag?.getAttribute('content'),
      description: 'CSRF token from HTML meta tag (most common in Frappe)'
    });

    // 2. Check cookies
    const cookies = document.cookie.split(';');
    let csrfFromCookie = null;

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrf_token' || name === 'csrftoken') {
        csrfFromCookie = decodeURIComponent(value);
        break;
      }
    }

    tokens.push({
      source: 'Document Cookies',
      value: csrfFromCookie,
      found: !!csrfFromCookie,
      description: 'CSRF token stored in browser cookies'
    });

    // 3. Check Frappe global object
    const frappeToken = (window as any).frappe?.csrf_token || (window as any).csrf_token;
    tokens.push({
      source: 'Frappe Global',
      value: frappeToken || null,
      found: !!frappeToken,
      description: 'CSRF token from global frappe object'
    });

    // 4. Check window variables
    const windowToken = (window as any).csrf_token;
    tokens.push({
      source: 'Window Variable',
      value: windowToken || null,
      found: !!windowToken,
      description: 'CSRF token from window.csrf_token'
    });

    // 5. Check localStorage
    const localStorageToken = localStorage.getItem('csrf_token') || localStorage.getItem('frappe_csrf_token');
    tokens.push({
      source: 'Local Storage',
      value: localStorageToken,
      found: !!localStorageToken,
      description: 'CSRF token from browser local storage'
    });

    return tokens;
  };

  // Extract session information
  const extractSessionInfo = (): SessionInfo => {
    const cookies = document.cookie.split(';');
    const cookieObj: Record<string, string> = {};

    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookieObj[name] = decodeURIComponent(value);
      }
    });

    const frappe = (window as any).frappe;

    return {
      sessionId: cookieObj.sid || cookieObj.session_id || null,
      userId: cookieObj.user_id || frappe?.session?.user || null,
      fullName: cookieObj.full_name || frappe?.session?.user_fullname || null,
      userRoles: frappe?.session?.user_roles || [],
      systemUser: cookieObj.system_user === 'yes' || frappe?.session?.user === 'Administrator',
      language: cookieObj.user_lang || frappe?.session?.lang || null,
    };
  };

  // Extract Frappe global variables
  const extractFrappeGlobals = (): FrappeGlobals => {
    const frappe = (window as any).frappe;

    return {
      csrf_token: frappe?.csrf_token,
      session: frappe?.session,
      user: frappe?.user,
      boot: frappe?.boot,
      ready: frappe?.ready || false,
    };
  };

  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true);

    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      setCsrfTokens(extractCSRFTokens());
      setSessionInfo(extractSessionInfo());
      setFrappeGlobals(extractFrappeGlobals());

      toast.success("Developer data refreshed", {
        description: "All tokens and session information have been updated."
      });
    } catch (error) {
      toast.error("Failed to refresh data", {
        description: "There was an error updating the developer information."
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`, {
        description: "Copied to clipboard successfully."
      });
    } catch (err) {
      toast.error("Failed to copy", {
        description: "Unable to copy to clipboard."
      });
    }
  };

  // Mask token for display
  const maskToken = (token: string): string => {
    if (token.length <= 8) return token;
    return token.substring(0, 4) + '•'.repeat(token.length - 8) + token.substring(token.length - 4);
  };

  // Load data on component mount
  useEffect(() => {
    setCsrfTokens(extractCSRFTokens());
    setSessionInfo(extractSessionInfo());
    setFrappeGlobals(extractFrappeGlobals());
  }, []);

  // Find the best CSRF token
  const primaryToken = csrfTokens.find(token => token.found && token.value) || null;

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Developer Dashboard</h1>
          <p className="text-muted-foreground">
            Debug tools and session information for Frappe integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refreshData} variant="outline" disabled={isRefreshing} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <RefreshCw className={`w-4 h-4 mr-2 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-foreground">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Button
            onClick={() => setShowTokenValues(!showTokenValues)}
            variant="outline"
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {showTokenValues ? <EyeOff className="w-4 h-4 mr-2 text-muted-foreground" /> : <Eye className="w-4 h-4 mr-2 text-muted-foreground" />}
            <span className="text-foreground">{showTokenValues ? 'Hide' : 'Show'} Tokens</span>
          </Button>
        </div>
      </div>

      {/* Primary CSRF Token Alert */}
      {primaryToken ? (
        <Alert className="border-theme-accent/20 bg-theme-accent/10">
          <CheckCircle className="h-4 w-4 text-theme-accent" />
          <AlertDescription className="text-foreground">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-foreground">Active CSRF Token Found!</strong>
                <br />
                <span className="text-sm text-muted-foreground">
                  Primary token from: <code className="bg-theme-accent/20 text-theme-accent px-1 rounded">{primaryToken.source}</code>
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(primaryToken.value!, 'CSRF Token')}
                className="border-theme-accent/30 text-theme-accent hover:bg-theme-accent/20"
              >
                <Copy className="w-4 h-4 mr-1" />
                <span>Copy</span>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-destructive/20 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-foreground">
            <strong className="text-foreground">No CSRF Token Found!</strong>
            <br />
            <span className="text-muted-foreground">This may indicate that the app is not properly integrated with Frappe or is running in standalone mode.</span>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="csrf" className="space-y-6 bg-background">
        <TabsList className="grid w-full grid-cols-4 bg-muted border-border">
          <TabsTrigger value="csrf" className="flex items-center gap-2 text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Shield className="w-4 h-4" />
            <span>CSRF Tokens</span>
          </TabsTrigger>
          <TabsTrigger value="session" className="flex items-center gap-2 text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
            <User className="w-4 h-4" />
            <span>Session Info</span>
          </TabsTrigger>
          <TabsTrigger value="globals" className="flex items-center gap-2 text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Globe className="w-4 h-4" />
            <span>Frappe Globals</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2 text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Terminal className="w-4 h-4" />
            <span>Debug Tools</span>
          </TabsTrigger>
        </TabsList>

        {/* CSRF Tokens Tab */}
        <TabsContent value="csrf" className="space-y-4 bg-background">
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Key className="w-5 h-5 text-theme-accent" />
                <span className="text-card-foreground">CSRF Token Sources</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                All possible sources where CSRF tokens can be found in a Frappe environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-card">
              {csrfTokens.map((token, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={token.found ? "default" : "secondary"} className={token.found ? "bg-theme-accent text-theme-accent-foreground" : "bg-secondary text-secondary-foreground"}>
                        <span>{token.source}</span>
                      </Badge>
                      {token.found ? (
                        <CheckCircle className="w-4 h-4 text-theme-accent" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {token.description}
                    </p>
                    {token.found && token.value ? (
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                          {showTokenValues ? token.value : maskToken(token.value)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(token.value!, `${token.source} Token`)}
                          className="text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Not found</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Info Tab */}
        <TabsContent value="session" className="space-y-4 bg-background">
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <User className="w-5 h-5 text-theme-accent" />
                <span className="text-card-foreground">Session Information</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Current user session and authentication details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-card">
              {sessionInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                          {sessionInfo.sessionId || 'Not available'}
                        </code>
                        {sessionInfo.sessionId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(sessionInfo.sessionId!, 'Session ID')}
                            className="text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User ID</label>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">
                          {sessionInfo.userId || 'Guest'}
                        </code>
                        {sessionInfo.userId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(sessionInfo.userId!, 'User ID')}
                            className="text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-sm text-foreground">{sessionInfo.fullName || 'Not available'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">System User</label>
                      <Badge variant={sessionInfo.systemUser ? "default" : "secondary"} className={sessionInfo.systemUser ? "bg-theme-accent text-theme-accent-foreground" : "bg-secondary text-secondary-foreground"}>
                        <span>{sessionInfo.systemUser ? 'Yes' : 'No'}</span>
                      </Badge>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Language</label>
                      <p className="text-sm text-foreground">{sessionInfo.language || 'Not set'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User Roles</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sessionInfo.userRoles.length > 0 ? (
                          sessionInfo.userRoles.map((role, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-border text-foreground">
                              <span>{role}</span>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground italic">No roles available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cookies Card */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Cookie className="w-5 h-5 text-theme-accent" />
                <span className="text-card-foreground">Browser Cookies</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                All cookies available in the current session
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-2">
                {document.cookie.split(';').filter(cookie => cookie.trim()).map((cookie, index) => {
                  const [name, value] = cookie.trim().split('=');
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-medium text-foreground">{name}</code>
                        <span className="text-muted-foreground">=</span>
                        <code className="text-sm text-foreground">
                          {showTokenValues ? decodeURIComponent(value || '') : maskToken(decodeURIComponent(value || ''))}
                        </code>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${name}=${value}`, 'Cookie')}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Frappe Globals Tab */}
        <TabsContent value="globals" className="space-y-4 bg-background">
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Globe className="w-5 h-5 text-theme-accent" />
                <span className="text-card-foreground">Frappe Global Variables</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Global JavaScript objects and variables provided by Frappe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Frappe Ready</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={frappeGlobals.ready ? "default" : "secondary"} className={frappeGlobals.ready ? "bg-theme-accent text-theme-accent-foreground" : "bg-secondary text-secondary-foreground"}>
                      <span>{frappeGlobals.ready ? 'Yes' : 'No'}</span>
                    </Badge>
                    {frappeGlobals.ready ? (
                      <Wifi className="w-4 h-4 text-theme-accent" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">CSRF Token</label>
                  <div className="flex items-center gap-2">
                    {frappeGlobals.csrf_token ? (
                      <>
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                          {showTokenValues ? frappeGlobals.csrf_token : maskToken(frappeGlobals.csrf_token)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(frappeGlobals.csrf_token!, 'Frappe CSRF Token')}
                          className="text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Not available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Raw Objects */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Session Object</label>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-32 text-foreground">
                    {JSON.stringify(frappeGlobals.session, null, 2) || 'Not available'}
                  </pre>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Object</label>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-32 text-foreground">
                    {JSON.stringify(frappeGlobals.user, null, 2) || 'Not available'}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debug Tools Tab */}
        <TabsContent value="tools" className="space-y-4 bg-background">
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Terminal className="w-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Debug Tools</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Utilities for debugging and testing the Frappe integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Environment Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Environment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User Agent:</span>
                      <code className="text-xs max-w-[200px] truncate text-foreground" title={navigator.userAgent}>
                        {navigator.userAgent.split(' ')[0]}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language:</span>
                      <code className="text-xs text-foreground">{navigator.language}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform:</span>
                      <code className="text-xs text-foreground">{navigator.platform}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current URL:</span>
                      <code className="text-xs max-w-[200px] truncate text-foreground" title={window.location.href}>
                        {window.location.pathname}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Timing Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Timing Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Page Load:</span>
                      <code className="text-xs text-foreground">
                        {new Date().toLocaleTimeString()}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time Zone:</span>
                      <code className="text-xs text-foreground">
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UTC Offset:</span>
                      <code className="text-xs text-foreground">
                        {new Date().getTimezoneOffset() / -60}h
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify({
                    csrf_tokens: csrfTokens,
                    session_info: sessionInfo,
                    frappe_globals: frappeGlobals,
                    timestamp: new Date().toISOString()
                  }, null, 2), 'Debug Data')}
                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Copy className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-foreground">Copy All Debug Data</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('MYTICK Debug Data:', {
                      csrf_tokens: csrfTokens,
                      session_info: sessionInfo,
                      frappe_globals: frappeGlobals,
                      timestamp: new Date().toISOString()
                    });
                    toast.success("Debug data logged to console");
                  }}
                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Terminal className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-foreground">Log to Console</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem('mytick_debug', JSON.stringify({
                      csrf_tokens: csrfTokens,
                      session_info: sessionInfo,
                      frappe_globals: frappeGlobals,
                      timestamp: new Date().toISOString()
                    }));
                    toast.success("Debug data saved to localStorage");
                  }}
                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Database className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-foreground">Save to Storage</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

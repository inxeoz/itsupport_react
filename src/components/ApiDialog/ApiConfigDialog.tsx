import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Label } from '../ui/label.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Badge } from '../ui/badge.tsx';
import { Separator } from '../ui/separator.tsx';
import { Switch } from '../ui/switch.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Settings, Save, RotateCcw, TestTube, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert.tsx';
import { useTheme } from '../ThemeProvider.tsx';

export interface ApiConfig {
  baseUrl: string;
  token: string;
  endpoint: string;
  fields: string[];
  timeout: number;
  retries: number;
  allowCookies: boolean;
  customCookies: string;
}

interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: any;
  suggestions?: string[];
  systemInfo?: any;
}

interface ApiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ApiConfig;
  onConfigChange: (config: ApiConfig) => void;
  onTestConnection: (config: ApiConfig) => Promise<TestConnectionResult>;
}

export function ApiConfigDialog({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onTestConnection
}: ApiConfigDialogProps) {
  const [localConfig, setLocalConfig] = useState<ApiConfig>(config);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [showToken, setShowToken] = useState(false);
  const { getThemeClasses } = useTheme();

  // Update portal container theme classes when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const portals = document.querySelectorAll("[data-radix-portal]");
        portals.forEach((portal) => {
          // Remove existing theme classes
          portal.classList.remove(
            "dark",
            "blue-theme",
            "orange-theme",
            "green-theme"
          );

          // Add current theme classes
          const themeClasses = getThemeClasses();
          if (themeClasses.trim()) {
            themeClasses.trim().split(" ").forEach((cls) => {
              if (cls) portal.classList.add(cls);
            });
          }
        });
      }, 0);
    }
  }, [open, getThemeClasses]);

  // Default configuration
  const defaultConfig: ApiConfig = {
    baseUrl: 'https://itsupport.inxeoz.com',
    token: '698c17f4c776340:1ee1056e3b01ed9',
    endpoint: '/api/resource/Ticket',
    fields: ['user_name', 'title'],
    timeout: 10000,
    retries: 3,
    allowCookies: false, // Disable cookies by default to avoid SameSite issues
    customCookies: '', // Remove default cookies
  };

  // Update local config when prop config changes
  useEffect(() => {
    if (config && config.baseUrl) {
      setLocalConfig(config);
    } else {
      // If config is undefined or incomplete, use default
      setLocalConfig(defaultConfig);
    }
  }, [config]);

  // Initialize localConfig with defaultConfig if it's undefined
  useEffect(() => {
    if (!localConfig || !localConfig.baseUrl) {
      setLocalConfig(defaultConfig);
    }
  }, []);

  const handleSave = () => {
    if (localConfig && localConfig.baseUrl) {
      onConfigChange(localConfig);
      onOpenChange(false);
      setTestStatus('idle');
    }
  };

  const handleReset = () => {
    setLocalConfig(defaultConfig);
    setTestStatus('idle');
  };

  const handleTestConnection = async () => {
    if (!localConfig || !localConfig.baseUrl) {
      setTestStatus('error');
      setTestMessage('Configuration is incomplete. Please check all required fields.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('');

    try {
      const result = await onTestConnection(localConfig);
      if (result.success) {
        setTestStatus('success');
        setTestMessage(result.message || 'Successfully connected to Frappe API!');
      } else {
        setTestStatus('error');
        setTestMessage(result.message || 'Failed to connect to Frappe API. Check your configuration.');
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(error instanceof Error ? error.message : 'Connection test failed');
    }
  };

  const handleFieldsChange = (value: string) => {
    // Parse comma-separated fields
    const fields = value.split(',').map(field => field.trim()).filter(field => field.length > 0);
    setLocalConfig(prev => ({ ...prev, fields }));
  };

  const getTestIcon = () => {
    switch (testStatus) {
      case 'testing':
        return <TestTube className="w-4 h-4 animate-pulse text-foreground" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-theme-accent" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <TestTube className="w-4 h-4 text-foreground" />;
    }
  };

  const getAlertStyles = () => {
    switch (testStatus) {
      case 'success':
        return {
          container: 'border-theme-accent/20 bg-theme-accent/5',
          icon: 'text-theme-accent',
          text: 'text-foreground'
        };
      case 'error':
        return {
          container: 'border-destructive/20 bg-destructive/5',
          icon: 'text-destructive',
          text: 'text-foreground'
        };
      default:
        return {
          container: 'border-muted bg-muted/5',
          icon: 'text-muted-foreground',
          text: 'text-foreground'
        };
    }
  };

  const alertStyles = getAlertStyles();

  // Ensure localConfig is valid before rendering
  if (!localConfig || !localConfig.baseUrl) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto bg-popover border-border ${getThemeClasses()}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Settings className="w-5 h-5 text-foreground" />
            Frappe API Configuration
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your Frappe ERPNext API connection settings for real-time data synchronization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Settings */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-card-foreground">Connection Settings</CardTitle>
              <CardDescription className="text-muted-foreground">Basic API connection configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="baseUrl" className="text-foreground">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={localConfig.baseUrl || ''}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://itsupport.inxeoz.com"
                    className="font-mono text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Frappe ERPNext server URL (including protocol and port). Example: http://localhost:8000
                  </p>
                </div>

                <div>
                  <Label htmlFor="token" className="text-foreground">Authentication Token</Label>
                  <div className="relative">
                    <Input
                      id="token"
                      type={showToken ? "text" : "password"}
                      value={localConfig.token || ''}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, token: e.target.value }))}
                      placeholder="api_key:api_secret"
                      className="font-mono text-sm bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showToken ? "Hide token" : "Show token"}
                      </span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate from Frappe: User → API Access → Generate Keys
                  </p>
                </div>

                <div>
                  <Label htmlFor="endpoint" className="text-foreground">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={localConfig.endpoint || ''}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="/api/resource/Ticket"
                    className="font-mono text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    API resource endpoint for your DocType
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Configuration */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-card-foreground">Field Configuration</CardTitle>
              <CardDescription className="text-muted-foreground">Specify which fields to fetch from your Ticket DocType</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fields" className="text-foreground">Fields to Fetch</Label>
                <Textarea
                  id="fields"
                  value={(localConfig.fields || []).join(', ')}
                  onChange={(e) => handleFieldsChange(e.target.value)}
                  placeholder="name, title, user_name, description, creation, modified, docstatus"
                  className="font-mono text-sm min-h-[80px] bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated list of field names to fetch from the API
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(localConfig.fields || []).map((field, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                    {field}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-card-foreground">Advanced Settings</CardTitle>
              <CardDescription className="text-muted-foreground">Timeout, retry, and security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeout" className="text-foreground">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={localConfig.timeout || 10000}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 10000 }))}
                    placeholder="10000"
                    min="1000"
                    max="60000"
                    step="1000"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="retries" className="text-foreground">Max Retries</Label>
                  <Input
                    id="retries"
                    type="number"
                    value={localConfig.retries || 3}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, retries: parseInt(e.target.value) || 3 }))}
                    placeholder="3"
                    min="0"
                    max="10"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allowCookies" className="text-foreground">Allow Cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Include cookies in API requests for session-based authentication and CSRF protection
                  </p>
                </div>
                <Switch
                  id="allowCookies"
                  checked={localConfig.allowCookies || false}
                  onCheckedChange={(checked) => setLocalConfig(prev => ({ ...prev, allowCookies: checked }))}
                  className="data-[state=checked]:bg-theme-accent"
                />
              </div>

              {localConfig.allowCookies && (
                <div>
                  <Label htmlFor="customCookies" className="text-foreground">Custom Cookie Header</Label>
                  <Textarea
                    id="customCookies"
                    value={localConfig.customCookies || ''}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, customCookies: e.target.value }))}
                    placeholder="full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en"
                    className="font-mono text-sm min-h-[80px] bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional custom cookie values to send with requests. Format: name=value; name2=value2
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Connection */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-card-foreground">Connection Test</CardTitle>
              <CardDescription className="text-muted-foreground">Test your API configuration before saving</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                variant="outline"
                className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {getTestIcon()}
                <span className="ml-2 text-foreground">
                  {testStatus === 'testing' ? 'Testing Connection...' : 'Test Connection'}
                </span>
              </Button>

              {testStatus !== 'idle' && (
                <Alert className={`${alertStyles.container} border`}>
                  {testStatus === 'success' ? (
                    <CheckCircle className={`h-4 w-4 ${alertStyles.icon}`} />
                  ) : testStatus === 'error' ? (
                    <XCircle className={`h-4 w-4 ${alertStyles.icon}`} />
                  ) : (
                    <AlertTriangle className={`h-4 w-4 ${alertStyles.icon}`} />
                  )}
                  <AlertDescription className={alertStyles.text}>
                    {testMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Configuration Preview */}
          <Card className="border-dashed border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-card-foreground">Configuration Preview</CardTitle>
              <CardDescription className="text-muted-foreground">Generated API request configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md font-mono text-sm border border-border">
                <div className="text-muted-foreground">URL:</div>
                <div className="break-all mb-2 text-foreground">
                  {localConfig.baseUrl}{localConfig.endpoint}?fields=[ {(localConfig.fields || []).map(f => `"${f}"`).join(', ')} ]
                </div>

                <div className="text-muted-foreground">Headers:</div>
                <div className="text-foreground">Authorization: token {(localConfig.token || '').split(':')[0]}:***</div>
                <div className="text-foreground">Content-Type: application/json</div>
                {localConfig.allowCookies && localConfig.customCookies && (
                  <div className="text-foreground">Cookie: {localConfig.customCookies.substring(0, 50)}{localConfig.customCookies.length > 50 ? '...' : ''}</div>
                )}

                <div className="text-muted-foreground mt-2">Options:</div>
                <div className="text-foreground">Credentials: {localConfig.allowCookies ? 'include' : 'same-origin'}</div>
                <div className="text-foreground">Timeout: {localConfig.timeout || 10000}ms</div>
                <div className="text-foreground">Max Retries: {localConfig.retries || 3}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border" />

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <RotateCcw className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">Reset to Default</span>
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Settings, Save, RotateCcw, TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useTheme } from './ThemeProvider';

export interface ApiConfig {
  baseUrl: string;
  token: string;
  endpoint: string;
  fields: string[];
  timeout: number;
  retries: number;
}

interface ApiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ApiConfig;
  onConfigChange: (config: ApiConfig) => void;
  onTestConnection: (config: ApiConfig) => Promise<boolean>;
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
    baseUrl: 'http://localhost:8000',
    token: '698c17f4c776340:1ee1056e3b01ed9',
    endpoint: '/api/resource/Ticket',
    fields: ['name', 'title', 'user_name', 'description', 'creation', 'modified', 'docstatus', 'amended_from', 'ticket_id', 'department', 'contact_name', 'contact_email', 'contact_phone', 'category', 'priority', 'status', 'assigned_to', 'resolution', 'resolution_date', 'time_logged', 'billable_hours', 'tags', 'attachments', 'customer'],
    timeout: 10000,
    retries: 3,
  };

  // Update local config when prop config changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    onConfigChange(localConfig);
    onOpenChange(false);
    setTestStatus('idle');
  };

  const handleReset = () => {
    setLocalConfig(defaultConfig);
    setTestStatus('idle');
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    
    try {
      const isConnected = await onTestConnection(localConfig);
      if (isConnected) {
        setTestStatus('success');
        setTestMessage('Successfully connected to Frappe API!');
      } else {
        setTestStatus('error');
        setTestMessage('Failed to connect to Frappe API. Check your configuration.');
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
                    value={localConfig.baseUrl}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="http://localhost:8000"
                    className="font-mono text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Frappe ERPNext server URL (including protocol and port)
                  </p>
                </div>

                <div>
                  <Label htmlFor="token" className="text-foreground">Authentication Token</Label>
                  <Input
                    id="token"
                    type="password"
                    value={localConfig.token}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="api_key:api_secret"
                    className="font-mono text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate from Frappe: User → API Access → Generate Keys
                  </p>
                </div>

                <div>
                  <Label htmlFor="endpoint" className="text-foreground">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={localConfig.endpoint}
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
                  value={localConfig.fields.join(', ')}
                  onChange={(e) => handleFieldsChange(e.target.value)}
                  placeholder="name, title, user_name, description, creation, modified, docstatus"
                  className="font-mono text-sm min-h-[80px] bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated list of field names to fetch from the API
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {localConfig.fields.map((field, index) => (
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
              <CardDescription className="text-muted-foreground">Timeout and retry configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeout" className="text-foreground">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={localConfig.timeout}
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
                    value={localConfig.retries}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, retries: parseInt(e.target.value) || 3 }))}
                    placeholder="3"
                    min="0"
                    max="10"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
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
                  {localConfig.baseUrl}{localConfig.endpoint}?fields=[{localConfig.fields.map(f => `"${f}"`).join(', ')}]
                </div>
                
                <div className="text-muted-foreground">Headers:</div>
                <div className="text-foreground">Authorization: token {localConfig.token.split(':')[0]}:***</div>
                <div className="text-foreground">Content-Type: application/json</div>
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
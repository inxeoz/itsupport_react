import { useState } from 'react';
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

  // Default configuration
  const defaultConfig: ApiConfig = {
    baseUrl: 'http://localhost:8000',
    token: '698c17f4c776340:1ee1056e3b01ed9',
    endpoint: '/api/resource/Ticket',
    fields: ['name', 'title', 'user_name', 'description', 'creation', 'modified', 'docstatus', 'amended_from'],
    timeout: 10000,
    retries: 3,
  };

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
        return <TestTube className="w-4 h-4 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <TestTube className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Frappe API Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your Frappe ERPNext API connection settings for real-time data synchronization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Connection Settings</CardTitle>
              <CardDescription>Basic API connection configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={localConfig.baseUrl}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="http://localhost:8000"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Frappe ERPNext server URL (including protocol and port)
                  </p>
                </div>

                <div>
                  <Label htmlFor="token">Authentication Token</Label>
                  <Input
                    id="token"
                    type="password"
                    value={localConfig.token}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="api_key:api_secret"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate from Frappe: User → API Access → Generate Keys
                  </p>
                </div>

                <div>
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={localConfig.endpoint}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="/api/resource/Ticket"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    API resource endpoint for your DocType
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Field Configuration</CardTitle>
              <CardDescription>Specify which fields to fetch from your Ticket DocType</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fields">Fields to Fetch</Label>
                <Textarea
                  id="fields"
                  value={localConfig.fields.join(', ')}
                  onChange={(e) => handleFieldsChange(e.target.value)}
                  placeholder="name, title, user_name, description, creation, modified, docstatus"
                  className="font-mono text-sm min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated list of field names to fetch from the API
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {localConfig.fields.map((field, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Advanced Settings</CardTitle>
              <CardDescription>Timeout and retry configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={localConfig.timeout}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 10000 }))}
                    placeholder="10000"
                    min="1000"
                    max="60000"
                    step="1000"
                  />
                </div>

                <div>
                  <Label htmlFor="retries">Max Retries</Label>
                  <Input
                    id="retries"
                    type="number"
                    value={localConfig.retries}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, retries: parseInt(e.target.value) || 3 }))}
                    placeholder="3"
                    min="0"
                    max="10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Connection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Connection Test</CardTitle>
              <CardDescription>Test your API configuration before saving</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                variant="outline"
                className="w-full"
              >
                {getTestIcon()}
                <span className="ml-2">
                  {testStatus === 'testing' ? 'Testing Connection...' : 'Test Connection'}
                </span>
              </Button>

              {testStatus !== 'idle' && (
                <Alert className={
                  testStatus === 'success' 
                    ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10'
                    : testStatus === 'error'
                    ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10'
                    : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10'
                }>
                  {testStatus === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                  ) : testStatus === 'error' ? (
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                  )}
                  <AlertDescription className={
                    testStatus === 'success' 
                      ? 'text-green-800 dark:text-green-200'
                      : testStatus === 'error'
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-yellow-800 dark:text-yellow-200'
                  }>
                    {testMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Configuration Preview */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Configuration Preview</CardTitle>
              <CardDescription>Generated API request configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                <div className="text-muted-foreground">URL:</div>
                <div className="break-all mb-2">
                  {localConfig.baseUrl}{localConfig.endpoint}?fields=[{localConfig.fields.map(f => `"${f}"`).join(', ')}]
                </div>
                
                <div className="text-muted-foreground">Headers:</div>
                <div>Authorization: token {localConfig.token.split(':')[0]}:***</div>
                <div>Content-Type: application/json</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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
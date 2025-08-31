import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/card.tsx';
import { Button } from '@/ui/components/button.tsx';
import { Badge } from '@/ui/components/badge.tsx';
import { Progress } from '@/ui/components/progress.tsx';
import { Separator } from '@/ui/components/separator.tsx';
import { Alert, AlertDescription } from '@/ui/components/alert.tsx';
import { ScrollArea } from '@/ui/components/scroll-area.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/tabs.tsx';
import { Input } from '@/ui/components/input.tsx';
import { Label } from '@/ui/components/label.tsx';
import { Textarea } from '@/ui/components/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/select.tsx';
import { Switch } from '@/ui/components/switch.tsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/components/dialog.tsx';
import { useTheme } from '@/app/providers';
import {
  frappeApi,
  type FrappeTicket,
  type SystemInfo,
  type BulkCreateResult,
  type ApiConfig
} from '@/shared/services/frappeApi.ts';
import { toast } from "sonner";
import {
  TestTube,
  Wifi,
  WifiOff,
  Database,
  Plus,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  Zap,
  Bug,
  Shield,
  Server,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Info,
  Activity,
  Target,
  Loader2,
  Save,
  Download,
  Upload,
  Copy,
  Filter,
  Search,
  Calendar,
  FileText,
  Globe,
  Key,
  Timer,
  BarChart3,
  History,
  CheckCheck,
  AlertCircle,
  Wrench
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  duration?: number;
  result?: any;
  error?: string;
  timestamp?: Date;
  category?: string;
}

interface TestSession {
  startTime: Date;
  endTime?: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
}

interface ConfigurationSettings {
  api: ApiConfig;
  testing: {
    defaultBatchSize: number;
    defaultDelay: number;
    maxRetries: number;
    timeoutMultiplier: number;
    enableDebugMode: boolean;
    saveTestResults: boolean;
    autoRunSystemTests: boolean;
  };
  performance: {
    maxConcurrentRequests: number;
    requestThrottleMs: number;
    cacheTimeout: number;
    enableRequestCaching: boolean;
    enablePerformanceMetrics: boolean;
  };
  debug: {
    enableVerboseLogging: boolean;
    enableNetworkLogging: boolean;
    enableErrorTracking: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    preserveFailedRequests: boolean;
  };
}

interface ConfigurationPreset {
  id: string;
  name: string;
  description: string;
  settings: ConfigurationSettings;
  createdAt: Date;
  isDefault?: boolean;
}

export function TesterDashboard() {
  const { getThemeClasses } = useTheme();

  const [session, setSession] = useState<TestSession>({
    startTime: new Date(),
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    results: []
  });

  const [isRunningAll, setIsRunningAll] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [configChanged, setConfigChanged] = useState(false);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');

  // Enhanced configuration with multiple categories
  const [configuration, setConfiguration] = useState<ConfigurationSettings>({
    api: {
      baseUrl: 'http://localhost:8000',
      token: '698c17f4c776340:1ee1056e3b01ed9',
      endpoint: '/api/resource/Ticket',
      fields: ['name', 'title', 'user_name', 'description', 'creation', 'modified', 'docstatus', 'amended_from', 'ticket_id', 'department', 'contact_name', 'contact_email', 'contact_phone', 'category', 'priority', 'status', 'assigned_to', 'resolution', 'resolution_date', 'time_logged', 'billable_hours', 'tags', 'attachments', 'customer'],
      timeout: 10000,
      retries: 3,
      skipCSRF: false,
      fallbackMode: false,
      validateDocTypes: true
    },
    testing: {
      defaultBatchSize: 5,
      defaultDelay: 1000,
      maxRetries: 3,
      timeoutMultiplier: 1.5,
      enableDebugMode: false,
      saveTestResults: true,
      autoRunSystemTests: false
    },
    performance: {
      maxConcurrentRequests: 10,
      requestThrottleMs: 100,
      cacheTimeout: 300000, // 5 minutes
      enableRequestCaching: false,
      enablePerformanceMetrics: true
    },
    debug: {
      enableVerboseLogging: false,
      enableNetworkLogging: false,
      enableErrorTracking: true,
      logLevel: 'info',
      preserveFailedRequests: true
    }
  });

  // Configuration presets
  const [presets, setPresets] = useState<ConfigurationPreset[]>([
    {
      id: 'default',
      name: 'Default Configuration',
      description: 'Standard testing configuration for development',
      settings: configuration,
      createdAt: new Date(),
      isDefault: true
    }
  ]);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('mytick-tester-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfiguration(parsed);
      } catch (error) {
        console.error('Failed to parse saved configuration:', error);
      }
    }

    const savedPresets = localStorage.getItem('mytick-tester-presets');
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets);
        setPresets(parsed);
      } catch (error) {
        console.error('Failed to parse saved presets:', error);
      }
    }
  }, []);

  // Save configuration changes
  const saveConfiguration = async () => {
    setIsConfigSaving(true);
    try {
      localStorage.setItem('mytick-tester-config', JSON.stringify(configuration));

      // Update the frappeApi configuration
      frappeApi.updateConfig(configuration.api);

      setConfigChanged(false);
      toast.success('Configuration saved successfully!', {
        description: 'All settings have been updated and applied.',
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('Failed to save configuration', {
        description: 'Please try again or check console for details.',
        duration: 5000
      });
    } finally {
      setIsConfigSaving(false);
    }
  };

  // Export configuration
  const exportConfiguration = () => {
    const configData = {
      configuration,
      presets,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mytick-tester-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Configuration exported!', {
      description: 'Configuration file has been downloaded.',
      duration: 3000
    });
  };

  // Import configuration
  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configData = JSON.parse(e.target?.result as string);

        if (configData.configuration) {
          setConfiguration(configData.configuration);
        }

        if (configData.presets) {
          setPresets(configData.presets);
        }

        setConfigChanged(true);
        toast.success('Configuration imported!', {
          description: 'Settings have been loaded. Remember to save changes.',
          duration: 5000
        });
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import configuration', {
          description: 'Invalid configuration file format.',
          duration: 5000
        });
      }
    };
    reader.readAsText(file);
  };

  // Save current configuration as preset
  const saveAsPreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Preset name is required');
      return;
    }

    const newPreset: ConfigurationPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      description: newPresetDescription.trim(),
      settings: { ...configuration },
      createdAt: new Date()
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('mytick-tester-presets', JSON.stringify(updatedPresets));

    setNewPresetName('');
    setNewPresetDescription('');
    setShowPresetDialog(false);

    toast.success('Configuration preset saved!', {
      description: `Preset "${newPreset.name}" has been created.`,
      duration: 3000
    });
  };

  // Load preset
  const loadPreset = (preset: ConfigurationPreset) => {
    setConfiguration(preset.settings);
    setConfigChanged(true);
    toast.success(`Preset "${preset.name}" loaded!`, {
      description: 'Configuration has been updated. Remember to save changes.',
      duration: 3000
    });
  };

  // Helper function to update configuration
  const updateConfiguration = (path: string[], value: any) => {
    setConfiguration(prev => {
      const newConfig = { ...prev };
      let current: any = newConfig;

      // Navigate to the parent object
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }

      // Set the value
      current[path[path.length - 1]] = value;

      setConfigChanged(true);
      return newConfig;
    });
  };

  // Helper function to update test result
  const updateTestResult = (
    testId: string,
    name: string,
    status: TestResult['status'],
    result?: any,
    error?: string,
    duration?: number,
    category?: string
  ) => {
    setSession(prev => {
      const existingIndex = prev.results.findIndex(r => r.id === testId);
      const testResult: TestResult = {
        id: testId,
        name,
        status,
        result,
        error,
        duration,
        timestamp: new Date(),
        category
      };

      let newResults;
      if (existingIndex >= 0) {
        newResults = [...prev.results];
        newResults[existingIndex] = testResult;
      } else {
        newResults = [...prev.results, testResult];
      }

      // Update session stats
      const passed = newResults.filter(r => r.status === 'success').length;
      const failed = newResults.filter(r => r.status === 'error').length;

      return {
        ...prev,
        results: newResults,
        totalTests: newResults.length,
        passedTests: passed,
        failedTests: failed
      };
    });
  };

  // Test runner wrapper
  const runTest = async (testId: string, testName: string, testFn: () => Promise<any>, category: string = 'general') => {
    const startTime = Date.now();
    updateTestResult(testId, testName, 'running', undefined, undefined, undefined, category);

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testId, testName, 'success', result, undefined, duration, category);
      toast.success(`✅ ${testName} passed`, {
        description: `Completed in ${duration}ms`,
        duration: 3000
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTestResult(testId, testName, 'error', undefined, errorMessage, duration, category);
      toast.error(`❌ ${testName} failed`, {
        description: errorMessage,
        duration: 5000
      });
      throw error;
    }
  };

  // Connection Tests
  const testBasicConnection = () => runTest(
    'basic-connection',
    'Basic Connection Test',
    async () => {
      const result = await frappeApi.testConnection();
      setSystemInfo(result.systemInfo || null);
      return result;
    },
    'connection'
  );

  const testSystemInfo = () => runTest(
    'system-info',
    'Get System Information',
    async () => {
      const info = await frappeApi.getSystemInfo();
      setSystemInfo(info);
      return info;
    },
    'connection'
  );

  // Data Tests
  const testFetchTickets = () => runTest(
    'fetch-tickets',
    'Fetch Tickets',
    async () => {
      const tickets = await frappeApi.getTickets();
      return {
        count: tickets.length,
        tickets: tickets.slice(0, 3)
      };
    },
    'data'
  );

  const testCreateTicket = () => runTest(
    'create-ticket',
    'Create Single Ticket',
    async () => {
      const testTicket: Partial<FrappeTicket> = {
        title: `Test Ticket ${Date.now()}`,
        user_name: 'API Tester',
        description: 'This is a test ticket created by the API tester dashboard',
        category: 'Software',
        priority: 'Medium',
        status: 'New',
        contact_email: 'tester@example.com',
        tags: 'api-test,automated'
      };

      return await frappeApi.createTicket(testTicket);
    },
    'data'
  );

  // Bulk Tests
  const testBulkCreateSmall = () => runTest(
    'bulk-create-small',
    'Bulk Create (5 tickets)',
    async () => {
      const tickets: Partial<FrappeTicket>[] = [];

      for (let i = 1; i <= 5; i++) {
        tickets.push({
          title: `Bulk Test Ticket ${i} - ${Date.now()}`,
          user_name: `Tester ${i}`,
          description: `Bulk test ticket number ${i}`,
          category: ['Software', 'Hardware', 'Network'][i % 3],
          priority: ['Low', 'Medium', 'High'][i % 3],
          status: 'New',
          contact_email: `tester${i}@example.com`
        });
      }

      return await frappeApi.create_ticket_in_bulk(tickets, {
        batchSize: configuration.testing.defaultBatchSize,
        delayBetweenRequests: configuration.testing.defaultDelay,
        maxRetries: configuration.testing.maxRetries
      });
    },
    'bulk'
  );

  // Run all tests
  const runAllTests = async () => {
    setIsRunningAll(true);

    // Reset session
    setSession({
      startTime: new Date(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      results: []
    });

    const tests = [
      testBasicConnection,
      testSystemInfo,
      testFetchTickets,
      testCreateTicket,
      testBulkCreateSmall
    ];

    for (const test of tests) {
      try {
        await test();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Test failed:', error);
      }
    }

    setSession(prev => ({ ...prev, endTime: new Date() }));
    setIsRunningAll(false);

    toast.success('🏁 All tests completed', {
      description: `${session.passedTests} passed, ${session.failedTests} failed`,
      duration: 5000
    });
  };

  // Filter test results
  const filteredResults = session.results.filter(result => {
    const matchesSearch = result.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         (result.category && result.category.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to get status icon
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-theme-accent" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-theme-accent" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="bg-theme-accent/10 text-theme-accent">Running</Badge>;
      case 'success':
        return <Badge variant="secondary" className="bg-theme-accent/10 text-theme-accent">Passed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className={`min-h-full bg-background text-foreground p-6 space-y-6 ${getThemeClasses()}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-card border-border border rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-theme-accent/10 border border-theme-accent/20">
            <TestTube className="w-8 h-8 text-theme-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">API Tester Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive testing suite with configuration management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-theme-accent text-theme-accent">
            <Activity className="w-3 h-3 mr-1" />
            Live Testing
          </Badge>
          {session.totalTests > 0 && (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {session.passedTests}/{session.totalTests} passed
            </Badge>
          )}
          {configChanged && (
            <Badge variant="outline" className="border-orange-500 text-orange-500">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      {/* Session Stats */}
      {session.totalTests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-accent">{session.totalTests}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-accent">{session.passedTests}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{session.failedTests}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {session.totalTests > 0 ? Math.round((session.passedTests / session.totalTests) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted border-border">
          <TabsTrigger value="tests" className="text-foreground data-[state=active]:bg-background">
            Test Suite
          </TabsTrigger>
          <TabsTrigger value="results" className="text-foreground data-[state=active]:bg-background">
            Results
          </TabsTrigger>
          <TabsTrigger value="config" className="text-foreground data-[state=active]:bg-background">
            Configuration
          </TabsTrigger>
          <TabsTrigger value="presets" className="text-foreground data-[state=active]:bg-background">
            Presets
          </TabsTrigger>
          <TabsTrigger value="system" className="text-foreground data-[state=active]:bg-background">
            System Info
          </TabsTrigger>
        </TabsList>

        {/* Test Suite Tab */}
        <TabsContent value="tests" className="space-y-6">
          {/* Control Panel */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Settings className="w-5 h-5 text-theme-accent" />
                Test Controls
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Run individual tests or execute the complete test suite
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                onClick={runAllTests}
                disabled={isRunningAll}
                className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
              >
                {isRunningAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running All Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>

              <Button
                onClick={() => setSession({
                  startTime: new Date(),
                  totalTests: 0,
                  passedTests: 0,
                  failedTests: 0,
                  results: []
                })}
                variant="outline"
                disabled={isRunningAll}
                className="border-border text-foreground hover:bg-accent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Session
              </Button>
            </CardContent>
          </Card>

          {/* Quick Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-card-foreground">Connection Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={testBasicConnection}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border text-foreground hover:bg-accent"
                >
                  <Server className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button
                  onClick={testSystemInfo}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border text-foreground hover:bg-accent"
                >
                  <Info className="w-4 h-4 mr-2" />
                  System Info
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-card-foreground">Data Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={testFetchTickets}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border text-foreground hover:bg-accent"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Fetch Tickets
                </Button>
                <Button
                  onClick={testCreateTicket}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border text-foreground hover:bg-accent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-card-foreground">Bulk Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={testBulkCreateSmall}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border text-foreground hover:bg-accent"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Bulk Create (5)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Activity className="w-5 h-5 text-theme-accent" />
                Test Results
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Detailed results for all executed tests with filtering and search
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tests..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-10 bg-input-background border-border text-foreground"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-input-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Passed</SelectItem>
                    <SelectItem value="error">Failed</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {session.results.length === 0
                    ? "No tests have been run yet. Use the Test Suite tab to start testing."
                    : "No tests match your current filters."
                  }
                </div>
              ) : (
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-3">
                    {filteredResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-start gap-3 p-4 rounded-md border border-border bg-muted/30"
                      >
                        <div className="mt-0.5">
                          {getStatusIcon(result.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-card-foreground">{result.name}</h4>
                              {result.category && (
                                <Badge variant="outline" className="text-xs border-border">
                                  {result.category}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {result.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {result.duration}ms
                                </span>
                              )}
                              {getStatusBadge(result.status)}
                            </div>
                          </div>

                          {result.error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mt-2">
                              {result.error}
                            </div>
                          )}

                          {result.result && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                              <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-32">
                                {JSON.stringify(result.result, null, 2)}
                              </pre>
                            </div>
                          )}

                          {result.timestamp && (
                            <div className="text-xs text-muted-foreground mt-2">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {result.timestamp.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          {/* Configuration Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">Configuration Settings</h2>
              <p className="text-muted-foreground">Manage all API and testing configurations</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={importConfiguration}
                className="hidden"
                id="config-import"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('config-import')?.click()}
                className="border-border text-foreground hover:bg-accent"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportConfiguration}
                className="border-border text-foreground hover:bg-accent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={saveConfiguration}
                disabled={!configChanged || isConfigSaving}
                className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
              >
                {isConfigSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Configuration */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Globe className="w-5 h-5 text-theme-accent" />
                  API Configuration
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure Frappe API connection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl" className="text-card-foreground">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={configuration.api.baseUrl}
                    onChange={(e) => updateConfiguration(['api', 'baseUrl'], e.target.value)}
                    className="bg-input-background border-border text-foreground"
                    placeholder="http://localhost:8000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token" className="text-card-foreground">API Token</Label>
                  <Input
                    id="token"
                    type="password"
                    value={configuration.api.token}
                    onChange={(e) => updateConfiguration(['api', 'token'], e.target.value)}
                    className="bg-input-background border-border text-foreground"
                    placeholder="api_key:api_secret"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint" className="text-card-foreground">Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={configuration.api.endpoint}
                    onChange={(e) => updateConfiguration(['api', 'endpoint'], e.target.value)}
                    className="bg-input-background border-border text-foreground"
                    placeholder="/api/resource/Ticket"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout" className="text-card-foreground">Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={configuration.api.timeout}
                      onChange={(e) => updateConfiguration(['api', 'timeout'], parseInt(e.target.value) || 10000)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retries" className="text-card-foreground">Max Retries</Label>
                    <Input
                      id="retries"
                      type="number"
                      value={configuration.api.retries}
                      onChange={(e) => updateConfiguration(['api', 'retries'], parseInt(e.target.value) || 3)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="skipCSRF" className="text-card-foreground">Skip CSRF Validation</Label>
                    <Switch
                      id="skipCSRF"
                      checked={configuration.api.skipCSRF}
                      onCheckedChange={(checked) => updateConfiguration(['api', 'skipCSRF'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="fallbackMode" className="text-card-foreground">Enable Fallback Mode</Label>
                    <Switch
                      id="fallbackMode"
                      checked={configuration.api.fallbackMode}
                      onCheckedChange={(checked) => updateConfiguration(['api', 'fallbackMode'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="validateDocTypes" className="text-card-foreground">Validate DocTypes</Label>
                    <Switch
                      id="validateDocTypes"
                      checked={configuration.api.validateDocTypes}
                      onCheckedChange={(checked) => updateConfiguration(['api', 'validateDocTypes'], checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testing Configuration */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <TestTube className="w-5 h-5 text-theme-accent" />
                  Testing Configuration
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure testing behavior and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchSize" className="text-card-foreground">Default Batch Size</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={configuration.testing.defaultBatchSize}
                      onChange={(e) => updateConfiguration(['testing', 'defaultBatchSize'], parseInt(e.target.value) || 5)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultDelay" className="text-card-foreground">Default Delay (ms)</Label>
                    <Input
                      id="defaultDelay"
                      type="number"
                      value={configuration.testing.defaultDelay}
                      onChange={(e) => updateConfiguration(['testing', 'defaultDelay'], parseInt(e.target.value) || 1000)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxRetries" className="text-card-foreground">Max Test Retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      value={configuration.testing.maxRetries}
                      onChange={(e) => updateConfiguration(['testing', 'maxRetries'], parseInt(e.target.value) || 3)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeoutMultiplier" className="text-card-foreground">Timeout Multiplier</Label>
                    <Input
                      id="timeoutMultiplier"
                      type="number"
                      step="0.1"
                      value={configuration.testing.timeoutMultiplier}
                      onChange={(e) => updateConfiguration(['testing', 'timeoutMultiplier'], parseFloat(e.target.value) || 1.5)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="debugMode" className="text-card-foreground">Enable Debug Mode</Label>
                    <Switch
                      id="debugMode"
                      checked={configuration.testing.enableDebugMode}
                      onCheckedChange={(checked) => updateConfiguration(['testing', 'enableDebugMode'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="saveResults" className="text-card-foreground">Save Test Results</Label>
                    <Switch
                      id="saveResults"
                      checked={configuration.testing.saveTestResults}
                      onCheckedChange={(checked) => updateConfiguration(['testing', 'saveTestResults'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoRunSystem" className="text-card-foreground">Auto-run System Tests</Label>
                    <Switch
                      id="autoRunSystem"
                      checked={configuration.testing.autoRunSystemTests}
                      onCheckedChange={(checked) => updateConfiguration(['testing', 'autoRunSystemTests'], checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Configuration */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <BarChart3 className="w-5 h-5 text-theme-accent" />
                  Performance Configuration
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure performance and caching settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxConcurrent" className="text-card-foreground">Max Concurrent Requests</Label>
                    <Input
                      id="maxConcurrent"
                      type="number"
                      value={configuration.performance.maxConcurrentRequests}
                      onChange={(e) => updateConfiguration(['performance', 'maxConcurrentRequests'], parseInt(e.target.value) || 10)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="throttle" className="text-card-foreground">Request Throttle (ms)</Label>
                    <Input
                      id="throttle"
                      type="number"
                      value={configuration.performance.requestThrottleMs}
                      onChange={(e) => updateConfiguration(['performance', 'requestThrottleMs'], parseInt(e.target.value) || 100)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cacheTimeout" className="text-card-foreground">Cache Timeout (ms)</Label>
                  <Input
                    id="cacheTimeout"
                    type="number"
                    value={configuration.performance.cacheTimeout}
                    onChange={(e) => updateConfiguration(['performance', 'cacheTimeout'], parseInt(e.target.value) || 300000)}
                    className="bg-input-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableCaching" className="text-card-foreground">Enable Request Caching</Label>
                    <Switch
                      id="enableCaching"
                      checked={configuration.performance.enableRequestCaching}
                      onCheckedChange={(checked) => updateConfiguration(['performance', 'enableRequestCaching'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableMetrics" className="text-card-foreground">Enable Performance Metrics</Label>
                    <Switch
                      id="enableMetrics"
                      checked={configuration.performance.enablePerformanceMetrics}
                      onCheckedChange={(checked) => updateConfiguration(['performance', 'enablePerformanceMetrics'], checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Debug Configuration */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Bug className="w-5 h-5 text-theme-accent" />
                  Debug Configuration
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure logging and debugging options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logLevel" className="text-card-foreground">Log Level</Label>
                  <Select
                    value={configuration.debug.logLevel}
                    onValueChange={(value) => updateConfiguration(['debug', 'logLevel'], value)}
                  >
                    <SelectTrigger className="bg-input-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verboseLogging" className="text-card-foreground">Enable Verbose Logging</Label>
                    <Switch
                      id="verboseLogging"
                      checked={configuration.debug.enableVerboseLogging}
                      onCheckedChange={(checked) => updateConfiguration(['debug', 'enableVerboseLogging'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="networkLogging" className="text-card-foreground">Enable Network Logging</Label>
                    <Switch
                      id="networkLogging"
                      checked={configuration.debug.enableNetworkLogging}
                      onCheckedChange={(checked) => updateConfiguration(['debug', 'enableNetworkLogging'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="errorTracking" className="text-card-foreground">Enable Error Tracking</Label>
                    <Switch
                      id="errorTracking"
                      checked={configuration.debug.enableErrorTracking}
                      onCheckedChange={(checked) => updateConfiguration(['debug', 'enableErrorTracking'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="preserveFailed" className="text-card-foreground">Preserve Failed Requests</Label>
                    <Switch
                      id="preserveFailed"
                      checked={configuration.debug.preserveFailedRequests}
                      onCheckedChange={(checked) => updateConfiguration(['debug', 'preserveFailedRequests'], checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">Configuration Presets</h2>
              <p className="text-muted-foreground">Save and load configuration presets for different environments</p>
            </div>
            <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
              <DialogTrigger asChild>
                <Button className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Save Current as Preset
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">Save Configuration Preset</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Save your current configuration as a reusable preset
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="presetName" className="text-card-foreground">Preset Name</Label>
                    <Input
                      id="presetName"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g., Development Environment"
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="presetDescription" className="text-card-foreground">Description (Optional)</Label>
                    <Textarea
                      id="presetDescription"
                      value={newPresetDescription}
                      onChange={(e) => setNewPresetDescription(e.target.value)}
                      placeholder="Describe when to use this preset..."
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => setShowPresetDialog(false)}
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveAsPreset}
                    className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                  >
                    Save Preset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <Card key={preset.id} className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                        {preset.name}
                        {preset.isDefault && (
                          <Badge variant="secondary" className="bg-theme-accent/10 text-theme-accent text-xs">
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      {preset.description && (
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                          {preset.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      <span>{preset.settings.api.baseUrl}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-3 h-3" />
                      <span>{preset.settings.api.timeout}ms timeout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{preset.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => loadPreset(preset)}
                      size="sm"
                      className="flex-1 bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Load
                    </Button>
                    {!preset.isDefault && (
                      <Button
                        onClick={() => {
                          const updatedPresets = presets.filter(p => p.id !== preset.id);
                          setPresets(updatedPresets);
                          localStorage.setItem('mytick-tester-presets', JSON.stringify(updatedPresets));
                          toast.success('Preset deleted');
                        }}
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-accent"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* System Info Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Shield className="w-5 h-5 text-theme-accent" />
                System Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Current system status and DocType availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!systemInfo ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No system information available. Run the System Info test to gather data.
                  </p>
                  <Button
                    onClick={testSystemInfo}
                    className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Get System Info
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* DocTypes */}
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-3">DocTypes Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {systemInfo.docTypes.map((docType) => (
                        <div
                          key={docType.name}
                          className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30"
                        >
                          <span className="font-medium text-card-foreground">{docType.name}</span>
                          <div className="flex items-center gap-2">
                            {docType.exists ? (
                              <Badge variant="secondary" className="bg-theme-accent/10 text-theme-accent">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Missing</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* Recommendations */}
                  {systemInfo.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {systemInfo.recommendations.map((rec, index) => (
                          <Alert key={index} className="border-theme-accent/20 bg-theme-accent/5">
                            <AlertTriangle className="h-4 w-4 text-theme-accent" />
                            <AlertDescription className="text-foreground">{rec}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallbacks */}
                  {systemInfo.fallbacksAvailable.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-3">Available Fallbacks</h3>
                      <div className="space-y-2">
                        {systemInfo.fallbacksAvailable.map((fallback, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-md bg-muted/30 border border-border text-muted-foreground"
                          >
                            {fallback}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

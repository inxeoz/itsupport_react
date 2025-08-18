import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { useTheme } from './ThemeProvider';
import { 
  frappeApi, 
  type FrappeTicket, 
  type BulkCreateConfig, 
  type BulkCreateProgress,
  type BulkCreateBatchResult,
  type BulkCreateResult 
} from '../services/frappeApi';
import { toast } from "sonner";
import { 
  Zap, 
  Database, 
  Cpu, 
  Terminal, 
  Code, 
  Bug, 
  Shield, 
  Rocket, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Timer,
  Wifi,
  WifiOff
} from 'lucide-react';

interface BulkTicketConfig {
  count: number;
  departments: string[];
  priorities: string[];
  categories: string[];
  useRandomUsers: boolean;
  customUsers: string;
  includeDescriptions: boolean;
  simulateTimeSpread: boolean;
  batchSize: number;
  delayBetweenRequests: number;
  delayBetweenBatches: number;
  stopOnError: boolean;
}

interface GenerationStats {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
  startTime?: Date;
  endTime?: Date;
  currentBatch?: number;
  totalBatches?: number;
  retries: number;
  currentTicketIndex?: number;
  currentTicketTitle?: string;
  estimatedTimeRemaining?: number;
}

export function HackerProDashboard() {
  const { getThemeClasses } = useTheme();
  
  const [config, setConfig] = useState<BulkTicketConfig>({
    count: 50,
    departments: ['IT', 'Development', 'Security', 'Operations'],
    priorities: ['Low', 'Medium', 'High', 'Critical'],
    categories: ['Software', 'Hardware', 'Network', 'Security'],
    useRandomUsers: true,
    customUsers: '',
    includeDescriptions: true,
    simulateTimeSpread: false,
    batchSize: 5, // Process tickets in batches of 5
    delayBetweenRequests: 2000, // 2 second delay between each ticket
    delayBetweenBatches: 3000, // 3 second delay between batches
    stopOnError: false, // Continue even if some tickets fail
  });

  const [stats, setStats] = useState<GenerationStats>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false,
    retries: 0,
  });

  const [generatedTickets, setGeneratedTickets] = useState<FrappeTicket[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');

  // Demo data templates
  const demoUsers = [
    'Alice Johnson', 'Bob Chen', 'Carol Martinez', 'David Rodriguez', 'Emma Thompson',
    'Frank Wilson', 'Grace Lee', 'Henry Zhang', 'Ivy Parker', 'Jack Morrison',
    'Karen Davis', 'Luke Anderson', 'Maria Santos', 'Nathan Cooper', 'Olivia Brown',
    'Paul Kim', 'Quinn Taylor', 'Rachel Green', 'Sam Miller', 'Tina Wang'
  ];

  const demoTitles = {
    Software: [
      'Application crashes on startup',
      'Database connection timeout',
      'Login authentication failure',
      'Email notifications not working',
      'Report generation error',
      'API endpoint returning 500 error',
      'File upload functionality broken',
      'Search feature not returning results',
      'Password reset not working',
      'Mobile app sync issues'
    ],
    Hardware: [
      'Monitor flickering display',
      'Keyboard keys not responding',
      'Printer paper jam',
      'Computer won\'t boot',
      'Network cable damaged',
      'Hard drive making noise',
      'RAM memory error',
      'Power supply fan failure',
      'USB ports not working',
      'Graphics card overheating'
    ],
    Network: [
      'Internet connection unstable',
      'VPN connection drops frequently',
      'WiFi signal weak in conference room',
      'Server unreachable from subnet',
      'DNS resolution failures',
      'Firewall blocking legitimate traffic',
      'Bandwidth throttling issues',
      'Switch port configuration error',
      'DHCP pool exhausted',
      'Network latency spikes'
    ],
    Security: [
      'Suspicious login attempts detected',
      'Malware alert on workstation',
      'Phishing email received',
      'SSL certificate expiring soon',
      'Unauthorized access attempt',
      'Data breach investigation',
      'Security patch deployment',
      'Access control review needed',
      'Encryption key rotation',
      'Vulnerability scan results'
    ]
  };

  const demoDescriptions = {
    Software: [
      'The application fails to initialize properly and crashes with error code 0x80070005. Users cannot access core functionality. This affects daily operations significantly.',
      'Database queries are timing out after 30 seconds. Connection pool seems exhausted. Multiple users reporting slow performance across the system.',
      'Authentication service returning invalid credentials error even with correct username and password. Users locked out of system.',
      'SMTP configuration appears incorrect. Users not receiving password reset emails, notifications, or system alerts. Critical communication failure.',
      'Monthly report generation process crashes with memory limit exceeded error. Affects financial reporting and compliance requirements.'
    ],
    Hardware: [
      'Monitor display shows intermittent flickering and color distortion. Affects user productivity and may cause eye strain. Hardware appears to be failing.',
      'Several keys on the keyboard are unresponsive. Affects typing efficiency and user productivity. May need hardware replacement.',
      'Printer frequently jams and shows error codes. Paper feed mechanism appears damaged. Affecting office workflow and document processing.',
      'Workstation fails to complete POST sequence. Power LED indicates system power but no display output. Possible motherboard failure.',
      'Network connection unstable due to damaged ethernet cable. Intermittent connectivity affecting work productivity.'
    ],
    Network: [
      'Internet connectivity drops every 30-45 minutes. Affects all users in the department. ISP reports no issues on their end.',
      'VPN tunnel disconnects randomly during work hours. Users lose access to internal resources. Affects remote work capability.',
      'Conference room WiFi signal strength inadequate for meetings. Video calls drop frequently. Affects client presentations.',
      'Database server unreachable from development subnet. Blocking development work and testing. Network routing issue suspected.',
      'DNS queries failing intermittently. Web browsing and email affected. May be related to DNS server configuration.'
    ],
    Security: [
      'Multiple failed login attempts detected from unknown IP addresses. Possible brute force attack in progress. Immediate attention required.',
      'Antivirus software detected potential malware on employee workstation. System quarantined pending investigation. Data integrity concern.',
      'Employee received sophisticated phishing email attempting to steal credentials. Security awareness training may be needed.',
      'SSL certificates for main website expire in 7 days. Will cause browser warnings and affect customer trust. Renewal urgent.',
      'Unauthorized access attempt detected on file server. Security audit required to assess potential data exposure.'
    ]
  };

  // Generate random ticket data
  const generateRandomTicket = (): Partial<FrappeTicket> => {
    const department = config.departments[Math.floor(Math.random() * config.departments.length)];
    const priority = config.priorities[Math.floor(Math.random() * config.priorities.length)];
    const category = config.categories[Math.floor(Math.random() * config.categories.length)];
    
    const userName = config.useRandomUsers 
      ? demoUsers[Math.floor(Math.random() * demoUsers.length)]
      : config.customUsers.split(',')[Math.floor(Math.random() * config.customUsers.split(',').length)]?.trim() || 'Demo User';

    const titles = demoTitles[category as keyof typeof demoTitles] || demoTitles.Software;
    const descriptions = demoDescriptions[category as keyof typeof demoDescriptions] || demoDescriptions.Software;
    
    const title = titles[Math.floor(Math.random() * titles.length)];
    const description = config.includeDescriptions 
      ? descriptions[Math.floor(Math.random() * descriptions.length)]
      : `Demo ticket for ${category.toLowerCase()} issue`;

    const impacts = ['Single User', 'Multiple Users', 'Entire Department', 'Organization-wide'];
    const statuses = ['New', 'In Progress', 'Waiting for Info', 'Resolved'];
    const subcategories = {
      Software: ['Application Error', 'Database', 'Authentication', 'Reporting', 'Integration'],
      Hardware: ['Monitor', 'Keyboard', 'Printer', 'Computer', 'Network Hardware'],
      Network: ['Connectivity', 'VPN', 'WiFi', 'DNS', 'Security'],
      Security: ['Access Control', 'Malware', 'Phishing', 'Certificates', 'Audit']
    };

    return {
      title: title.trim(),
      user_name: userName.trim(),
      department: department.trim() || null,
      contact_email: `${userName.toLowerCase().replace(' ', '.')}@company.com`,
      contact_phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      description: description.trim(),
      category: category,
      subcategory: subcategories[category as keyof typeof subcategories]?.[Math.floor(Math.random() * 5)]?.trim() || null,
      priority: priority,
      impact: impacts[Math.floor(Math.random() * impacts.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      assignee: Math.random() > 0.5 ? `${category.toLowerCase()}.support@company.com` : null,
      due_datetime: null,
      tags: `${category.toLowerCase()},${priority.toLowerCase()},demo`,
      docstatus: 0, // Draft status
    };
  };

  // Generate array of ticket data for bulk creation
  const generateBulkTicketData = (): Partial<FrappeTicket>[] => {
    const ticketData: Partial<FrappeTicket>[] = [];
    
    for (let i = 0; i < config.count; i++) {
      ticketData.push(generateRandomTicket());
    }
    
    return ticketData;
  };

  // Handle progress updates from bulk creation
  const handleProgress = (progress: BulkCreateProgress) => {
    setStats(prev => ({
      ...prev,
      total: progress.total,
      completed: progress.completed,
      failed: progress.failed,
      currentBatch: progress.currentBatch,
      totalBatches: progress.totalBatches,
      retries: progress.retries,
      currentTicketIndex: progress.currentTicketIndex,
      currentTicketTitle: progress.currentTicketTitle,
      estimatedTimeRemaining: progress.estimatedTimeRemaining,
    }));

    // Update current operation display
    if (progress.currentTicketTitle) {
      setCurrentOperation(`Creating ticket ${progress.currentTicketIndex}/${progress.total}: ${progress.currentTicketTitle}`);
    } else {
      setCurrentOperation(`Processing batch ${progress.currentBatch}/${progress.totalBatches}...`);
    }
  };

  // Handle batch completion
  const handleBatchComplete = (batchResult: BulkCreateBatchResult) => {
    console.log(`✅ Batch ${batchResult.batchIndex + 1} completed:`, batchResult);
    
    // Show batch completion toast
    if (batchResult.failed === 0) {
      toast.success(`Batch ${batchResult.batchIndex + 1} completed`, {
        description: `Successfully created ${batchResult.completed} tickets`,
        duration: 2000,
      });
    } else {
      toast.warning(`Batch ${batchResult.batchIndex + 1} completed with errors`, {
        description: `Created ${batchResult.completed} tickets, ${batchResult.failed} failed`,
        duration: 3000,
      });
    }
  };

  // Main bulk generation function using the new API method
  const generateBulkTickets = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setCurrentOperation('Preparing bulk ticket creation...');
    
    const startTime = new Date();
    setStats({
      total: config.count,
      completed: 0,
      failed: 0,
      inProgress: true,
      startTime,
      retries: 0,
    });

    try {
      // Generate all ticket data
      console.log('🎯 Generating ticket data for bulk creation...');
      const ticketsData = generateBulkTicketData();
      
      // Configure bulk creation
      const bulkConfig: BulkCreateConfig = {
        batchSize: config.batchSize,
        delayBetweenRequests: config.simulateTimeSpread 
          ? Math.random() * config.delayBetweenRequests 
          : config.delayBetweenRequests,
        delayBetweenBatches: config.delayBetweenBatches,
        stopOnError: config.stopOnError,
        maxRetries: 3,
        onProgress: handleProgress,
        onBatchComplete: handleBatchComplete,
      };

      // Start bulk creation using the new API method
      console.log('🚀 Starting bulk creation with new API method...');
      const result: BulkCreateResult = await frappeApi.create_ticket_in_bulk(ticketsData, bulkConfig);

      // Update final stats
      setStats(prev => ({
        ...prev,
        inProgress: false,
        endTime: new Date(),
        completed: result.completed,
        failed: result.failed,
        retries: result.retries,
      }));

      // Store successful tickets
      setGeneratedTickets(result.successfulTickets);
      setCurrentOperation('');

      // Show final result
      if (result.success) {
        toast.success("Bulk generation completed successfully!", {
          description: `Created ${result.completed} tickets in ${result.duration}s`,
          duration: 5000,
        });
      } else {
        toast.error("Bulk generation completed with errors", {
          description: `Created ${result.completed} tickets, ${result.failed} failed in ${result.duration}s`,
          duration: 8000,
        });
      }

      // Log detailed results
      console.log('🏁 Bulk creation final results:', result);

    } catch (error) {
      console.error('💥 Critical error during bulk generation:', error);
      
      setStats(prev => ({
        ...prev,
        inProgress: false,
        endTime: new Date(),
      }));
      
      setCurrentOperation('');
      
      toast.error("Bulk generation failed", {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 8000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetStats = () => {
    setStats({
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: false,
      retries: 0,
    });
    setGeneratedTickets([]);
    setCurrentOperation('');
    setIsGenerating(false);
  };

  const calculateProgress = () => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.completed + stats.failed) / stats.total) * 100);
  };

  const calculateDuration = () => {
    if (!stats.startTime) return 0;
    const endTime = stats.endTime || new Date();
    return Math.round((endTime.getTime() - stats.startTime.getTime()) / 1000);
  };

  return (
    <div className={`min-h-full bg-background text-foreground p-6 space-y-6 ${getThemeClasses()}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-card border-border border rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-theme-accent/10 border border-theme-accent/20">
            <Zap className="w-8 h-8 text-theme-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Hacker Pro Dashboard</h1>
            <p className="text-muted-foreground">Advanced bulk ticket creation using new bulk API method</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            <Terminal className="w-3 h-3 mr-1" />
            Pro Mode
          </Badge>
          <Badge variant="outline" className="border-theme-accent text-theme-accent">
            <Database className="w-3 h-3 mr-1" />
            {stats.inProgress ? 'Generating' : 'Bulk API'}
          </Badge>
          {stats.inProgress && (
            <Badge variant="outline" className="border-theme-accent text-theme-accent">
              <Wifi className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Code className="w-5 h-5 text-theme-accent" />
                Bulk Generation Configuration
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure bulk ticket generation using the new create_ticket_in_bulk API method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="count" className="text-card-foreground">Ticket Count</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="1000"
                    value={config.count}
                    onChange={(e) => setConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                    className="bg-input border-border text-foreground"
                    disabled={isGenerating}
                  />
                </div>
                
                <div>
                  <Label htmlFor="batchSize" className="text-card-foreground">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="1"
                    max="20"
                    value={config.batchSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 1 }))}
                    className="bg-input border-border text-foreground"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of tickets to process in each batch
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delay" className="text-card-foreground">Request Delay (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="500"
                    max="10000"
                    step="500"
                    value={config.delayBetweenRequests}
                    onChange={(e) => setConfig(prev => ({ ...prev, delayBetweenRequests: parseInt(e.target.value) || 2000 }))}
                    className="bg-input border-border text-foreground"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Delay between individual ticket requests
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="batchDelay" className="text-card-foreground">Batch Delay (ms)</Label>
                  <Input
                    id="batchDelay"
                    type="number"
                    min="1000"
                    max="15000"
                    step="500"
                    value={config.delayBetweenBatches}
                    onChange={(e) => setConfig(prev => ({ ...prev, delayBetweenBatches: parseInt(e.target.value) || 3000 }))}
                    className="bg-input border-border text-foreground"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Delay between processing batches
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departments" className="text-card-foreground">Departments</Label>
                  <Select 
                    value={config.departments.join(',')} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, departments: value.split(',') }))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select departments" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="IT,Development,Security,Operations">IT + Dev + Security + Ops</SelectItem>
                      <SelectItem value="IT,Support,Helpdesk">IT Support Stack</SelectItem>
                      <SelectItem value="Development,QA,DevOps">Engineering Stack</SelectItem>
                      <SelectItem value="Sales,Marketing,Finance,HR">Business Stack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priorities" className="text-card-foreground">Priority Levels</Label>
                  <Select 
                    value={config.priorities.join(',')} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, priorities: value.split(',') }))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select priorities" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Low,Medium,High,Critical">All Levels</SelectItem>
                      <SelectItem value="Medium,High,Critical">High Priority Only</SelectItem>
                      <SelectItem value="Low,Medium">Normal Priority</SelectItem>
                      <SelectItem value="Critical">Critical Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="categories" className="text-card-foreground">Categories</Label>
                <Select 
                  value={config.categories.join(',')} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, categories: value.split(',') }))}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="Software,Hardware,Network,Security">All Categories</SelectItem>
                    <SelectItem value="Software,Network">Software + Network</SelectItem>
                    <SelectItem value="Hardware,Security">Hardware + Security</SelectItem>
                    <SelectItem value="Software">Software Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-border" />

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-theme-accent" />
                  Advanced Options
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30">
                    <div>
                      <Label htmlFor="randomUsers" className="text-card-foreground">Random Users</Label>
                      <p className="text-xs text-muted-foreground">Use predefined demo users</p>
                    </div>
                    <Switch
                      id="randomUsers"
                      checked={config.useRandomUsers}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, useRandomUsers: checked }))}
                      className="data-[state=checked]:bg-theme-accent"
                      disabled={isGenerating}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30">
                    <div>
                      <Label htmlFor="descriptions" className="text-card-foreground">Rich Descriptions</Label>
                      <p className="text-xs text-muted-foreground">Include detailed problem descriptions</p>
                    </div>
                    <Switch
                      id="descriptions"
                      checked={config.includeDescriptions}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeDescriptions: checked }))}
                      className="data-[state=checked]:bg-theme-accent"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30">
                    <div>
                      <Label htmlFor="timeSpread" className="text-card-foreground">Randomize Delays</Label>
                      <p className="text-xs text-muted-foreground">Add random variation to delays</p>
                    </div>
                    <Switch
                      id="timeSpread"
                      checked={config.simulateTimeSpread}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, simulateTimeSpread: checked }))}
                      className="data-[state=checked]:bg-theme-accent"
                      disabled={isGenerating}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30">
                    <div>
                      <Label htmlFor="stopOnError" className="text-card-foreground">Stop on Error</Label>
                      <p className="text-xs text-muted-foreground">Stop if any ticket fails</p>
                    </div>
                    <Switch
                      id="stopOnError"
                      checked={config.stopOnError}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, stopOnError: checked }))}
                      className="data-[state=checked]:bg-theme-accent"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {!config.useRandomUsers && (
                  <div>
                    <Label htmlFor="customUsers" className="text-card-foreground">Custom Users</Label>
                    <Textarea
                      id="customUsers"
                      value={config.customUsers}
                      onChange={(e) => setConfig(prev => ({ ...prev, customUsers: e.target.value }))}
                      placeholder="John Doe, Jane Smith, Mike Johnson"
                      className="bg-input border-border text-foreground"
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Comma-separated list of user names
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Controls */}
        <div className="space-y-6">
          {/* Generation Stats */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <TrendingUp className="w-5 h-5 text-theme-accent" />
                Bulk Creation Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.inProgress && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-card-foreground">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="bg-muted" />
                  
                  {stats.currentBatch && stats.totalBatches && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Batch {stats.currentBatch}/{stats.totalBatches}</span>
                      {stats.estimatedTimeRemaining && (
                        <span className="text-muted-foreground">
                          ETA: {stats.estimatedTimeRemaining}s
                        </span>
                      )}
                    </div>
                  )}
                  
                  {stats.currentTicketIndex && (
                    <div className="text-xs mt-1 text-muted-foreground">
                      Ticket {stats.currentTicketIndex}/{stats.total}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-md bg-muted/30 border border-border">
                  <div className="text-lg font-bold text-theme-accent">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 rounded-md bg-muted/30 border border-border">
                  <div className="text-lg font-bold text-destructive">{stats.failed}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>

              {stats.retries > 0 && (
                <div className="text-center p-3 rounded-md bg-muted/30 border border-border">
                  <div className="text-lg font-bold text-orange-500">{stats.retries}</div>
                  <div className="text-xs text-muted-foreground">Retries</div>
                </div>
              )}

              {stats.startTime && (
                <div className="text-center p-3 rounded-md bg-muted/30 border border-border">
                  <div className="text-lg font-bold text-card-foreground">{calculateDuration()}s</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Rocket className="w-5 h-5 text-theme-accent" />
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={generateBulkTickets}
                disabled={isGenerating}
                className="w-full bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
              >
                {isGenerating ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate {config.count} Tickets
                  </>
                )}
              </Button>

              <Button
                onClick={resetStats}
                variant="outline"
                className="w-full border-border text-foreground hover:bg-accent"
                disabled={isGenerating}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Stats
              </Button>
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-card-foreground">API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Timer className="w-4 h-4 text-theme-accent" />
                <span className="text-muted-foreground">Request Delay:</span>
                <span className="text-card-foreground">{config.delayBetweenRequests}ms</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-theme-accent" />
                <span className="text-muted-foreground">Batch Size:</span>
                <span className="text-card-foreground">{config.batchSize}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-theme-accent" />
                <span className="text-muted-foreground">Batch Delay:</span>
                <span className="text-card-foreground">{config.delayBetweenBatches}ms</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4 text-theme-accent" />
                <span className="text-muted-foreground">Stop on Error:</span>
                <span className={config.stopOnError ? "text-destructive" : "text-theme-accent"}>
                  {config.stopOnError ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-theme-accent" />
                <span className="text-muted-foreground">Method:</span>
                <span className="text-theme-accent">Bulk API</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current Operation Status */}
      {currentOperation && (
        <Alert className="border-theme-accent/20 bg-theme-accent/5">
          <Clock className="h-4 w-4 text-theme-accent" />
          <AlertDescription className="text-foreground">
            {currentOperation}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Alert */}
      {stats.inProgress && (
        <Alert className="border-theme-accent/20 bg-theme-accent/5">
          <Wifi className="h-4 w-4 text-theme-accent" />
          <AlertDescription className="text-foreground">
            Generating tickets using bulk API method... 
            {' '}{stats.completed + stats.failed}/{stats.total} processed
            {stats.retries > 0 && ` (${stats.retries} retries)`}
            {stats.currentBatch && ` • Batch ${stats.currentBatch}/${stats.totalBatches}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Completion Alert */}
      {!stats.inProgress && stats.total > 0 && (
        <Alert className={stats.failed === 0 ? "border-theme-accent/20 bg-theme-accent/5" : "border-destructive/20 bg-destructive/5"}>
          {stats.failed === 0 ? (
            <CheckCircle2 className="h-4 w-4 text-theme-accent" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
          <AlertDescription className="text-foreground">
            Bulk creation completed using new bulk API method! Created {stats.completed} tickets
            {stats.failed > 0 && `, ${stats.failed} failed`}
            {stats.retries > 0 && ` (${stats.retries} retries)`} in {calculateDuration()} seconds.
            <br />
            <span className="text-sm text-muted-foreground">
              Success rate: {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
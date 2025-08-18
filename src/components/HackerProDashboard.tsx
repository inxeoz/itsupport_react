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
import { frappeApi, type FrappeTicket } from '../services/frappeApi';
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
  Clock
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
}

interface GenerationStats {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
  startTime?: Date;
  endTime?: Date;
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
  });

  const [stats, setStats] = useState<GenerationStats>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false,
  });

  const [generatedTickets, setGeneratedTickets] = useState<FrappeTicket[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
      title,
      description,
      user_name: userName,
      department,
      priority,
      category,
      subcategory: subcategories[category as keyof typeof subcategories]?.[Math.floor(Math.random() * 5)] || 'General',
      impact: impacts[Math.floor(Math.random() * impacts.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      contact_email: `${userName.toLowerCase().replace(' ', '.')}@company.com`,
      contact_phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    };
  };

  const generateBulkTickets = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setStats({
      total: config.count,
      completed: 0,
      failed: 0,
      inProgress: true,
      startTime: new Date(),
    });

    const newTickets: FrappeTicket[] = [];
    let completed = 0;
    let failed = 0;

    for (let i = 0; i < config.count; i++) {
      try {
        const ticketData = generateRandomTicket();
        
        // Simulate time spread if enabled
        if (config.simulateTimeSpread && i > 0) {
          const delay = Math.random() * 1000; // Random delay up to 1 second
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const createdTicket = await frappeApi.createTicket(ticketData);
        newTickets.push(createdTicket);
        completed++;
        
        toast.success(`Created ticket ${i + 1}/${config.count}: ${ticketData.title}`);
      } catch (error) {
        failed++;
        console.error(`Failed to create ticket ${i + 1}:`, error);
        toast.error(`Failed to create ticket ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Update progress
      setStats(prev => ({
        ...prev,
        completed: completed,
        failed: failed,
      }));
    }

    setStats(prev => ({
      ...prev,
      inProgress: false,
      endTime: new Date(),
    }));

    setGeneratedTickets(newTickets);
    setIsGenerating(false);

    toast.success(`Bulk generation complete! Created ${completed} tickets, ${failed} failed.`);
  };

  const resetStats = () => {
    setStats({
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: false,
    });
    setGeneratedTickets([]);
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
            <p className="text-muted-foreground">Advanced bulk ticket generation with demo data</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            <Terminal className="w-3 h-3 mr-1" />
            Pro Mode
          </Badge>
          <Badge variant="outline" className="border-theme-accent text-theme-accent">
            <Database className="w-3 h-3 mr-1" />
            Live API
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Code className="w-5 h-5 text-theme-accent" />
                Generation Configuration
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure bulk ticket generation parameters
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
                  />
                </div>
                
                <div>
                  <Label htmlFor="departments" className="text-card-foreground">Departments</Label>
                  <Select value={config.departments.join(',')} onValueChange={(value) => setConfig(prev => ({ ...prev, departments: value.split(',') }))}>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priorities" className="text-card-foreground">Priority Levels</Label>
                  <Select value={config.priorities.join(',')} onValueChange={(value) => setConfig(prev => ({ ...prev, priorities: value.split(',') }))}>
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
                
                <div>
                  <Label htmlFor="categories" className="text-card-foreground">Categories</Label>
                  <Select value={config.categories.join(',')} onValueChange={(value) => setConfig(prev => ({ ...prev, categories: value.split(',') }))}>
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
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30">
                  <div>
                    <Label htmlFor="timeSpread" className="text-card-foreground">Simulate Time Spread</Label>
                    <p className="text-xs text-muted-foreground">Add random delays between ticket creation</p>
                  </div>
                  <Switch
                    id="timeSpread"
                    checked={config.simulateTimeSpread}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, simulateTimeSpread: checked }))}
                    className="data-[state=checked]:bg-theme-accent"
                  />
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
                Generation Stats
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
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Stats
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-card-foreground">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-theme-accent" />
                <span className="text-muted-foreground">Demo Users:</span>
                <span className="text-card-foreground">{demoUsers.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4 text-theme-accent" />
                <span className="text-muted-foreground">Template Issues:</span>
                <span className="text-card-foreground">40+</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-theme-accent" />
                <span className="text-muted-foreground">Categories:</span>
                <span className="text-card-foreground">4</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Alert */}
      {stats.inProgress && (
        <Alert className="border-theme-accent/20 bg-theme-accent/5">
          <Clock className="h-4 w-4 text-theme-accent" />
          <AlertDescription className="text-foreground">
            Generating tickets... {stats.completed + stats.failed}/{stats.total} processed
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
            Bulk generation completed! Successfully created {stats.completed} tickets
            {stats.failed > 0 && `, ${stats.failed} failed`} in {calculateDuration()} seconds.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
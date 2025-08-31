// mockDataProvider.ts - Comprehensive Mock Data Generator
import { FrappeTicket } from './types';

// Helper functions for generating realistic mock data
class MockDataGenerator {
    private static readonly DEPARTMENTS = [
        'IT', 'Marketing', 'Finance', 'HR', 'Sales', 'Operations',
        'Customer Support', 'Engineering', 'Legal', 'Administration'
    ];

    private static readonly CATEGORIES = [
        'Hardware', 'Software', 'Network', 'Access Request', 'Email',
        'Database', 'Security', 'Training', 'Policy', 'Other'
    ];

    private static readonly SUBCATEGORIES = [
        'Desktop', 'Laptop', 'Server', 'Printer', 'Mobile Device',
        'Application', 'System', 'License', 'VPN', 'WiFi',
        'Email Client', 'Web Browser', 'Database Query', 'Backup',
        'Firewall', 'Antivirus', 'Password Reset', 'New Account'
    ];

    private static readonly PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

    private static readonly IMPACTS = [
        'Single User', 'Multiple Users', 'Department', 'Organization-wide'
    ];

    private static readonly STATUSES = [
        'New', 'Assigned', 'In Progress', 'Waiting for Info',
        'Waiting for Approval', 'Resolved', 'Closed', 'Cancelled'
    ];

    private static readonly ASSIGNEES = [
        'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis',
        'David Wilson', 'Lisa Anderson', 'Tom Brown', 'Anna Garcia',
        'Chris Miller', 'Jessica Taylor', null // null for unassigned
    ];

    private static readonly FIRST_NAMES = [
        'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer',
        'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara',
        'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah',
        'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
        'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra'
    ];

    private static readonly LAST_NAMES = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
        'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
        'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
        'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez',
        'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez'
    ];

    private static readonly ISSUE_TEMPLATES = [
        {
            title: 'Computer won\'t start',
            description: 'My computer won\'t turn on after the weekend. The power button doesn\'t respond.',
            category: 'Hardware',
            subcategory: 'Desktop'
        },
        {
            title: 'Email not syncing',
            description: 'My Outlook email hasn\'t been syncing since yesterday. Missing important client emails.',
            category: 'Software',
            subcategory: 'Email Client'
        },
        {
            title: 'VPN connection issues',
            description: 'Cannot connect to company VPN from home. Getting authentication errors.',
            category: 'Network',
            subcategory: 'VPN'
        },
        {
            title: 'Printer not working',
            description: 'Office printer showing paper jam error but no paper is stuck.',
            category: 'Hardware',
            subcategory: 'Printer'
        },
        {
            title: 'Software license expired',
            description: 'Adobe Creative Suite license has expired and needed for client presentations.',
            category: 'Software',
            subcategory: 'License'
        },
        {
            title: 'Password reset request',
            description: 'Unable to log into company portal. Need password reset for urgent project.',
            category: 'Access Request',
            subcategory: 'Password Reset'
        },
        {
            title: 'Network drive access denied',
            description: 'Cannot access shared network drive that was working yesterday.',
            category: 'Network',
            subcategory: 'Server'
        },
        {
            title: 'Application keeps crashing',
            description: 'CRM application crashes every time I try to generate reports.',
            category: 'Software',
            subcategory: 'Application'
        },
        {
            title: 'New employee setup',
            description: 'Need to set up accounts and equipment for new team member starting Monday.',
            category: 'Access Request',
            subcategory: 'New Account'
        },
        {
            title: 'Database connection timeout',
            description: 'Reports are timing out when trying to connect to main database.',
            category: 'Database',
            subcategory: 'Database Query'
        }
    ];

    private static randomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    private static randomDate(start: Date, end: Date): Date {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    private static generateTicketId(index: number): string {
        return `TICK-${String(index + 1).padStart(4, '0')}`;
    }

    private static generateUserName(): string {
        const firstName = this.randomElement(this.FIRST_NAMES);
        const lastName = this.randomElement(this.LAST_NAMES);
        return `${firstName} ${lastName}`;
    }

    private static generateEmail(userName: string): string {
        const name = userName.toLowerCase().replace(' ', '.');
        const domains = ['company.com', 'corp.com', 'business.org', 'enterprise.net'];
        return `${name}@${this.randomElement(domains)}`;
    }

    private static generatePhone(): string {
        const area = Math.floor(Math.random() * 900) + 100;
        const exchange = Math.floor(Math.random() * 900) + 100;
        const number = Math.floor(Math.random() * 9000) + 1000;
        return `+1-${area}-${exchange}-${number}`;
    }

    private static generateTags(category: string, priority: string): string {
        const baseTags = [category.toLowerCase(), priority.toLowerCase()];
        const additionalTags = ['urgent', 'hardware', 'software', 'network', 'user-request', 'maintenance'];
        const randomTags = additionalTags
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1);
        return [...baseTags, ...randomTags].join(',');
    }

    public static generateMockTicket(index: number): FrappeTicket {
        const now = new Date();
        const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const futureWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const template = this.randomElement(this.ISSUE_TEMPLATES);
        const userName = this.generateUserName();
        const createdDate = this.randomDate(pastMonth, now);
        const dueDate = this.randomDate(now, futureWeek);
        const priority = this.randomElement(this.PRIORITIES);
        const status = this.randomElement(this.STATUSES);
        const department = this.randomElement(this.DEPARTMENTS);
        const impact = this.randomElement(this.IMPACTS);
        const assignee = this.randomElement(this.ASSIGNEES);

        // Determine if ticket is resolved based on status
        const isResolved = ['Resolved', 'Closed'].includes(status);
        const resolutionDate = isResolved ? this.randomDate(createdDate, now) : null;

        // Generate docstatus based on status
        let docstatus = 0; // Draft
        if (['Resolved', 'Closed'].includes(status)) {
            docstatus = 1; // Submitted
        } else if (status === 'Cancelled') {
            docstatus = 2; // Cancelled
        }

        const ticket: FrappeTicket = {
            name: this.generateTicketId(index),
            ticket_id: this.generateTicketId(index),
            user_name: userName,
            department: department,
            contact_email: this.generateEmail(userName),
            contact_phone: this.generatePhone(),
            title: `${template.title} - ${department}`,
            description: template.description,
            category: template.category,
            subcategory: template.subcategory,
            priority: priority,
            impact: impact,
            status: status,
            assignee: assignee,
            created_datetime: createdDate.toISOString(),
            due_datetime: dueDate.toISOString(),
            resolution_datetime: resolutionDate?.toISOString() || null,
            resolution_summary: isResolved ? `Resolved ${template.title.toLowerCase()} issue successfully` : null,
            root_cause: isResolved ? this.randomElement([
                'Hardware failure', 'Software bug', 'Configuration error',
                'User error', 'Network issue', 'License expiration'
            ]) : null,
            requester_confirmation: isResolved ? this.randomElement(['Yes', 'No', null]) : null,
            time_spent: Math.random() > 0.3 ? Math.floor(Math.random() * 240) + 15 : null,
            attachments: Math.random() > 0.7 ? 'screenshot.png,error_log.txt' : null,
            tags: this.generateTags(template.category, priority),
            creation: createdDate.toISOString(),
            modified: new Date(createdDate.getTime() + Math.random() * (now.getTime() - createdDate.getTime())).toISOString(),
            docstatus: docstatus,
            amended_from: null
        };

        return ticket;
    }

    public static generateMockTickets(count: number): FrappeTicket[] {
        return Array.from({ length: count }, (_, index) => this.generateMockTicket(index));
    }

    // Generate tickets with specific criteria
    public static generateTicketsWithCriteria(criteria: {
        count: number;
        department?: string;
        priority?: string;
        status?: string;
        category?: string;
        dateRange?: { start: Date; end: Date };
    }): FrappeTicket[] {
        const tickets = this.generateMockTickets(criteria.count);

        return tickets.map(ticket => {
            if (criteria.department) ticket.department = criteria.department;
            if (criteria.priority) ticket.priority = criteria.priority;
            if (criteria.status) ticket.status = criteria.status;
            if (criteria.category) ticket.category = criteria.category;

            if (criteria.dateRange) {
                const createdDate = this.randomDate(criteria.dateRange.start, criteria.dateRange.end);
                ticket.created_datetime = createdDate.toISOString();
                ticket.creation = createdDate.toISOString();
            }

            return ticket;
        });
    }

    // Generate realistic statistics
    public static generateStatistics(tickets: FrappeTicket[]) {
        return {
            total: tickets.length,
            byStatus: this.groupBy(tickets, 'status'),
            byPriority: this.groupBy(tickets, 'priority'),
            byCategory: this.groupBy(tickets, 'category'),
            byDepartment: this.groupBy(tickets, 'department'),
            avgResolutionTime: this.calculateAvgResolutionTime(tickets),
            openTickets: tickets.filter(t => !['Resolved', 'Closed', 'Cancelled'].includes(t.status || '')).length,
            resolvedToday: tickets.filter(t => {
                if (!t.resolution_datetime) return false;
                const today = new Date().toDateString();
                return new Date(t.resolution_datetime).toDateString() === today;
            }).length
        };
    }

    private static groupBy(tickets: FrappeTicket[], key: keyof FrappeTicket) {
        return tickets.reduce((groups, ticket) => {
            const value = ticket[key] as string || 'Unassigned';
            groups[value] = (groups[value] || 0) + 1;
            return groups;
        }, {} as Record<string, number>);
    }

    private static calculateAvgResolutionTime(tickets: FrappeTicket[]): number {
        const resolvedTickets = tickets.filter(t =>
            t.resolution_datetime && t.created_datetime
        );

        if (resolvedTickets.length === 0) return 0;

        const totalTime = resolvedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.created_datetime!).getTime();
            const resolved = new Date(ticket.resolution_datetime!).getTime();
            return sum + (resolved - created);
        }, 0);

        return Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60)); // Convert to hours
    }
}

// Pre-generated datasets
export const generateMockTickets = (count: number = 50): FrappeTicket[] => {
    return MockDataGenerator.generateMockTickets(count);
};

export const generateTicketsWithCriteria = MockDataGenerator.generateTicketsWithCriteria.bind(MockDataGenerator);

export const generateStatistics = MockDataGenerator.generateStatistics.bind(MockDataGenerator);

// Default mock dataset
export const mockTickets: FrappeTicket[] = MockDataGenerator.generateMockTickets(100);

// Specific datasets for testing
export const highPriorityTickets: FrappeTicket[] = generateTicketsWithCriteria({
    count: 20,
    priority: 'High'
});

export const itDepartmentTickets: FrappeTicket[] = generateTicketsWithCriteria({
    count: 25,
    department: 'IT'
});

export const recentTickets: FrappeTicket[] = generateTicketsWithCriteria({
    count: 15,
    dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        end: new Date()
    }
});

// Sample ticket templates for creation
export const sampleTicketTemplates: Partial<FrappeTicket>[] = [
    {
        title: 'New laptop setup request',
        description: 'Need new laptop configured for new employee starting next week',
        category: 'Hardware',
        subcategory: 'Laptop',
        priority: 'Medium',
        department: 'IT'
    },
    {
        title: 'Software installation request',
        description: 'Need Adobe Photoshop installed on marketing team computers',
        category: 'Software',
        subcategory: 'Application',
        priority: 'Low',
        department: 'Marketing'
    },
    {
        title: 'Network connectivity issue',
        description: 'Unable to connect to shared drives from conference room',
        category: 'Network',
        subcategory: 'WiFi',
        priority: 'High',
        department: 'Administration'
    }
];

// Statistics for the mock data
export const mockStatistics = generateStatistics(mockTickets);

// Export the generator class for advanced usage
export { MockDataGenerator };

// Utility function to get a random subset
export const getRandomTickets = (count: number): FrappeTicket[] => {
    const shuffled = [...mockTickets].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Function to simulate API response delay
export const getMockTicketsAsync = async (
    limit?: number,
    offset?: number,
    delay: number = 500
): Promise<{ data: FrappeTicket[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, delay));

    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : mockTickets.length;

    return {
        data: mockTickets.slice(startIndex, endIndex),
        total: mockTickets.length
    };
};

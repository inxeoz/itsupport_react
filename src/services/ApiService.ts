// services/frappeApiService.ts
import {
    ApiConfig,
    BulkCreateBatchResult,
    BulkCreateConfig,
    BulkCreateResult,
    BulkCreateTicketResult,
    DocTypeInfo,
    FrappeDocResponse,
    FrappeListResponse,
    FrappeTicket,
    SystemInfo
} from '@/services/index.ts'

import {HttpService} from '@/services/HttpService.ts';
import {DEFAULT_BULK_CONFIG, ENDPOINTS} from '@/services/ApiConfig';

export class FrappeApiService {
    private httpService: HttpService;
    private docTypeCache: Map<string, DocTypeInfo> = new Map();
    private systemInfo: SystemInfo | null = null;

    constructor(private config: ApiConfig) {
        this.httpService = new HttpService(config);
    }

    // Update configuration
    public updateConfig(newConfig: ApiConfig): void {
        this.config = {...newConfig};
        this.httpService.updateConfig(newConfig);
        this.clearCache();
    }

    // Get current configuration
    public getConfig(): ApiConfig {
        return {...this.config};
    }

    // Test API connection
    public async testConnection(): Promise<{
        success: boolean;
        message: string;
        details?: any;
        suggestions?: string[];
        systemInfo?: SystemInfo;
    }> {
        try {
            console.log('Testing Frappe API connection...');

            try {
                const pingResult = await this.httpService.request(ENDPOINTS.PING, {method: 'GET'});
                const systemInfo = await this.getSystemInfo();

                return {
                    success: true,
                    message: 'Connection successful! Frappe API is responding.',
                    details: pingResult,
                    systemInfo,
                    suggestions: systemInfo.recommendations,
                };
            } catch (pingError) {
                console.warn('Ping failed, trying system analysis:', pingError);

                try {
                    const systemInfo = await this.getSystemInfo();
                    return {
                        success: false,
                        message: `Connection partially working but some issues detected: ${pingError instanceof Error ? pingError.message : 'Unknown error'}`,
                        details: {pingError},
                        systemInfo,
                        suggestions: [
                            ...systemInfo.recommendations,
                            'Basic connectivity may be limited but some endpoints are accessible',
                            'Check your API token permissions',
                        ],
                    };
                } catch (systemError) {
                    return {
                        success: false,
                        message: `Connection failed: ${systemError instanceof Error ? systemError.message : 'Unknown error'}`,
                        details: {pingError, systemError},
                        suggestions: [
                            'Check if your Frappe server is running and accessible',
                            'Verify your API token is correct and has proper permissions',
                            'Ensure the required DocTypes exist in your ERPNext instance',
                            'Check if CORS is properly configured for cross-origin requests',
                        ],
                    };
                }
            }
        } catch (error) {
            return {
                success: false,
                message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: error,
                suggestions: [
                    'Verify the base URL is correct',
                    'Check your network connection',
                    'Ensure API credentials are valid',
                    'Create the required DocTypes in your ERPNext instance',
                ],
            };
        }
    }

    // Get system information
    public async getSystemInfo(): Promise<SystemInfo> {
        if (this.systemInfo) {
            return this.systemInfo;
        }

        console.log('Gathering system information...');

        const requiredDocTypes = ['Ticket'];
        const fallbackDocTypes = ['Issue', 'Task'];
        const docTypes: DocTypeInfo[] = [];

        // Check required DocTypes
        for (const docType of requiredDocTypes) {
            const info = await this.checkDocType(docType, false);
            docTypes.push(info);
        }

        // Check fallback DocTypes
        for (const docType of fallbackDocTypes) {
            const info = await this.checkDocType(docType, true);
            docTypes.push(info);
        }

        const recommendations: string[] = [];
        const fallbacksAvailable: string[] = [];

        // Analyze results and provide recommendations
        const ticketDocType = docTypes.find(dt => dt.name === 'Ticket');
        if (!ticketDocType?.exists) {
            recommendations.push('The Ticket DocType does not exist. You may need to create it in your ERPNext instance.');

            const issueDocType = docTypes.find(dt => dt.name === 'Issue');
            const taskDocType = docTypes.find(dt => dt.name === 'Task');

            if (issueDocType?.exists) {
                fallbacksAvailable.push('Issue DocType can be used as an alternative to Ticket');
                recommendations.push('Consider using the Issue DocType as an alternative endpoint.');
            }

            if (taskDocType?.exists) {
                fallbacksAvailable.push('Task DocType can be used as an alternative to Ticket');
                recommendations.push('Consider using the Task DocType as an alternative endpoint.');
            }
        }

        this.systemInfo = {docTypes, recommendations, fallbacksAvailable};
        return this.systemInfo;
    }

    // Get total ticket count
    public async getTotalTicketCount(): Promise<number> {
        try {
            console.log('Fetching total ticket count from Frappe...');

            const ticketInfo = await this.checkDocType('Ticket', false);
            let docTypeName = 'Ticket';

            if (!ticketInfo.exists && this.config.fallbackMode) {
                console.warn('Ticket DocType not found, checking alternatives for count...');

                const issueInfo = await this.checkDocType('Issue', false);
                if (issueInfo.exists) {
                    console.log('Using Issue DocType as fallback for count');
                    docTypeName = 'Issue';
                } else {
                    const taskInfo = await this.checkDocType('Task', false);
                    if (taskInfo.exists) {
                        console.log('Using Task DocType as fallback for count');
                        docTypeName = 'Task';
                    }
                }
            }

            const response = await this.httpService.request<{ message: number }>(
                `${ENDPOINTS.COUNT}?doctype=${docTypeName}`
            );

            const count = response.message || 0;
            console.log(`Retrieved total count: ${count} from DocType: ${docTypeName}`);
            return count;
        } catch (error) {
            console.error('Error fetching total ticket count:', error);
            throw error;
        }
    }

    // Get tickets with pagination
    public async getTickets(limit?: number, offset?: number): Promise<FrappeTicket[]> {
        try {
            console.log(`Fetching tickets from Frappe (limit: ${limit || 'all'}, offset: ${offset || 0})...`);

            const ticketInfo = await this.checkDocType('Ticket', false);
            let endpoint = this.config.endpoint;

            if (!ticketInfo.exists && this.config.fallbackMode) {
                console.warn('Ticket DocType not found, checking alternatives...');

                const issueInfo = await this.checkDocType('Issue', false);
                if (issueInfo.exists) {
                    console.log('Using Issue DocType as fallback');
                    endpoint = ENDPOINTS.ISSUES;
                } else {
                    const taskInfo = await this.checkDocType('Task', false);
                    if (taskInfo.exists) {
                        console.log('Using Task DocType as fallback');
                        endpoint = ENDPOINTS.TASKS;
                    }
                }
            }

            const params = new URLSearchParams();

            if (this.config.fields && this.config.fields.length > 0) {
                const fieldsJson = JSON.stringify(this.config.fields);
                params.append('fields', fieldsJson);
            }

            if (limit) {
                params.append('limit_page_length', limit.toString());
            }
            if (offset) {
                params.append('limit_start', offset.toString());
            }

            params.append('order_by', 'creation desc');

            const url = `${endpoint}?${params.toString()}`;
            const response = await this.httpService.request<FrappeListResponse<FrappeTicket>>(url);

            const tickets = response.data || [];
            console.log(`Retrieved ${tickets.length} tickets`);
            return tickets;
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw error;
        }
    }

    // Create a new ticket
    public async createTicket(ticketData: Partial<FrappeTicket>): Promise<FrappeTicket> {
        try {
            console.log('Creating new ticket...');

            const response = await this.httpService.request<FrappeDocResponse<FrappeTicket>>(
                this.config.endpoint,
                {
                    method: 'POST',
                    body: JSON.stringify(ticketData),
                } as any
            );

            console.log('Ticket created successfully:', response.data.name);
            return response.data;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    }

    // Submit a ticket
    public async submitTicket(ticketName: string): Promise<FrappeTicket> {
        try {
            console.log(`Submitting ticket: ${ticketName}`);

            const response = await this.httpService.request<FrappeDocResponse<FrappeTicket>>(
                `${this.config.endpoint}/${ticketName}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({docstatus: 1}),
                } as any
            );

            console.log('Ticket submitted successfully:', ticketName);
            return response.data;
        } catch (error) {
            console.error('Error submitting ticket:', error);
            throw error;
        }
    }

    // Cancel a ticket
    public async cancelTicket(ticketName: string): Promise<FrappeTicket> {
        try {
            console.log(`Cancelling ticket: ${ticketName}`);

            const response = await this.httpService.request<FrappeDocResponse<FrappeTicket>>(
                `${this.config.endpoint}/${ticketName}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({docstatus: 2}),
                } as any
            );

            console.log('Ticket cancelled successfully:', ticketName);
            return response.data;
        } catch (error) {
            console.error('Error cancelling ticket:', error);
            throw error;
        }
    }

    // Bulk create tickets
    public async bulkCreateTickets(
        ticketsData: Partial<FrappeTicket>[],
        config?: BulkCreateConfig
    ): Promise<BulkCreateResult> {
        const finalConfig = {...DEFAULT_BULK_CONFIG, ...config};
        const startTime = new Date();
        const results: BulkCreateTicketResult[] = [];
        const batchResults: BulkCreateBatchResult[] = [];
        const errors: string[] = [];
        let completed = 0;
        let failed = 0;
        let totalRetries = 0;

        console.log(`Starting bulk creation of ${ticketsData.length} tickets...`);

        const totalBatches = Math.ceil(ticketsData.length / finalConfig.batchSize!);

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const batchStart = batchIndex * finalConfig.batchSize!;
            const batchEnd = Math.min(batchStart + finalConfig.batchSize!, ticketsData.length);
            const batchData = ticketsData.slice(batchStart, batchEnd);

            console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batchData.length} tickets)`);

            const batchResult: BulkCreateBatchResult = {
                batchIndex,
                batchStart,
                batchEnd,
                results: [],
                completed: 0,
                failed: 0,
            };

            for (let i = 0; i < batchData.length; i++) {
                const ticketIndex = batchStart + i;
                const ticketData = batchData[i];
                let attempts = 0;
                let success = false;
                let ticket: FrappeTicket | undefined;
                let error: string | undefined;

                if (finalConfig.onProgress) {
                    const estimatedTimeRemaining = completed > 0
                        ? ((Date.now() - startTime.getTime()) / completed) * (ticketsData.length - completed - 1)
                        : undefined;

                    finalConfig.onProgress({
                        total: ticketsData.length,
                        completed,
                        failed,
                        currentBatch: batchIndex + 1,
                        totalBatches,
                        currentTicketIndex: ticketIndex,
                        currentTicketTitle: ticketData.title || `Ticket ${ticketIndex + 1}`,
                        retries: totalRetries,
                        startTime,
                        estimatedTimeRemaining,
                    });
                }

                while (attempts <= finalConfig.maxRetries! && !success) {
                    attempts++;

                    try {
                        ticket = await this.createTicket(ticketData);
                        success = true;
                        completed++;
                        batchResult.completed++;
                    } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                        error = errorMessage;

                        if (attempts <= finalConfig.maxRetries!) {
                            totalRetries++;
                            console.warn(`Retry ${attempts}/${finalConfig.maxRetries!} for ticket ${ticketIndex + 1}: ${errorMessage}`);
                            await new Promise(resolve => setTimeout(resolve, finalConfig.delayBetweenRequests!));
                        } else {
                            failed++;
                            batchResult.failed++;
                            errors.push(`Ticket ${ticketIndex + 1}: ${errorMessage}`);
                            console.error(`Failed to create ticket ${ticketIndex + 1} after ${finalConfig.maxRetries!} retries: ${errorMessage}`);

                            if (finalConfig.stopOnError) {
                                console.log('Stopping bulk creation due to error');
                                break;
                            }
                        }
                    }

                    if (attempts === 1 && i < batchData.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, finalConfig.delayBetweenRequests!));
                    }
                }

                const ticketResult: BulkCreateTicketResult = {
                    index: ticketIndex,
                    success,
                    ticket,
                    error,
                    originalData: ticketData,
                    attempts,
                };

                results.push(ticketResult);
                batchResult.results.push(ticketResult);

                if (finalConfig.stopOnError && !success) {
                    break;
                }
            }

            batchResults.push(batchResult);

            if (finalConfig.onBatchComplete) {
                finalConfig.onBatchComplete(batchResult);
            }

            if (batchIndex < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, finalConfig.delayBetweenBatches!));
            }

            if (finalConfig.stopOnError && batchResult.failed > 0) {
                break;
            }
        }

        const duration = Date.now() - startTime.getTime();
        const successfulTickets = results.filter(r => r.success).map(r => r.ticket!);

        const finalResult: BulkCreateResult = {
            success: failed === 0,
            total: ticketsData.length,
            completed,
            failed,
            retries: totalRetries,
            duration,
            results,
            batchResults,
            errors,
            successfulTickets,
        };

        console.log(`Bulk creation completed: ${completed}/${ticketsData.length} successful, ${failed} failed, ${totalRetries} retries, ${duration}ms total`);
        return finalResult;
    }

    // Get HTTP service for direct access
    public getHttpService(): HttpService {
        return this.httpService;
    }

    // Clear internal cache
    private clearCache(): void {
        this.docTypeCache.clear();
        this.systemInfo = null;
    }

    // Check if DocType exists
    private async checkDocType(docTypeName: string, isOptional: boolean = false): Promise<DocTypeInfo> {
        if (this.docTypeCache.has(docTypeName)) {
            return this.docTypeCache.get(docTypeName)!;
        }

        const docTypeInfo: DocTypeInfo = {
            name: docTypeName,
            exists: false,
            accessible: false,
        };

        try {
            if (!isOptional) {
                console.log(`Checking DocType: ${docTypeName}`);
            }

            await this.httpService.request(`${ENDPOINTS.DOCTYPE}/${docTypeName}`, {method: 'GET'});
            docTypeInfo.exists = true;
            docTypeInfo.accessible = true;
        } catch (error) {
            if (!isOptional) {
                console.warn(`DocType ${docTypeName} check failed:`, error);
            }
            docTypeInfo.error = error instanceof Error ? error.message : 'Unknown error';

            // Try alternative endpoints for required DocTypes
            if (!isOptional) {
                try {
                    await this.httpService.request(`/api/resource/${docTypeName}?limit=1`, {method: 'GET'});
                    docTypeInfo.exists = true;
                    docTypeInfo.accessible = true;
                } catch (secondError) {
                    console.warn(`DocType ${docTypeName} not accessible via any method`);
                }
            }
        }

        this.docTypeCache.set(docTypeName, docTypeInfo);
        return docTypeInfo;
    }
}

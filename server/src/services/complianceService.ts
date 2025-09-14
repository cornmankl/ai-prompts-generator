import { logger } from './loggerService';
import { cacheService } from './cacheService';
import { User } from '../models/User';

export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    type: 'data_retention' | 'access_control' | 'audit_logging' | 'data_encryption' | 'gdpr' | 'ccpa' | 'sox' | 'hipaa';
    enabled: boolean;
    conditions: Array<{
        field: string;
        operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
        value: any;
    }>;
    actions: Array<{
        type: 'log' | 'alert' | 'block' | 'encrypt' | 'delete' | 'anonymize';
        parameters: Record<string, any>;
    }>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
    updatedAt: Date;
}

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    complianceFlags: string[];
    riskScore: number;
}

export interface DataRetentionPolicy {
    id: string;
    name: string;
    description: string;
    dataTypes: string[];
    retentionPeriod: number; // in days
    autoDelete: boolean;
    archiveBeforeDelete: boolean;
    conditions: Array<{
        field: string;
        operator: string;
        value: any;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ComplianceReport {
    id: string;
    type: 'gdpr' | 'ccpa' | 'sox' | 'hipaa' | 'custom';
    period: {
        start: Date;
        end: Date;
    };
    status: 'compliant' | 'non_compliant' | 'partial';
    findings: Array<{
        rule: string;
        status: 'pass' | 'fail' | 'warning';
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        recommendation: string;
    }>;
    metrics: {
        totalRules: number;
        passedRules: number;
        failedRules: number;
        warningRules: number;
        riskScore: number;
    };
    generatedAt: Date;
    generatedBy: string;
}

export interface DataSubjectRequest {
    id: string;
    type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction' | 'objection';
    subjectId: string;
    subjectEmail: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    requestedAt: Date;
    completedAt?: Date;
    data: Record<string, any>;
    notes: string;
    assignedTo: string;
}

export class ComplianceService {
    private rules: Map<string, ComplianceRule> = new Map();
    private auditLogs: AuditLog[] = [];
    private retentionPolicies: Map<string, DataRetentionPolicy> = new Map();
    private dataSubjectRequests: Map<string, DataSubjectRequest> = new Map();

    constructor() {
        this.initializeDefaultRules();
        this.initializeRetentionPolicies();
    }

    private initializeDefaultRules(): void {
        const defaultRules: ComplianceRule[] = [
            {
                id: 'gdpr-data-minimization',
                name: 'GDPR Data Minimization',
                description: 'Ensure only necessary personal data is collected and processed',
                type: 'gdpr',
                enabled: true,
                conditions: [
                    {
                        field: 'dataType',
                        operator: 'equals',
                        value: 'personal'
                    }
                ],
                actions: [
                    {
                        type: 'log',
                        parameters: {
                            level: 'info',
                            message: 'Personal data access logged for GDPR compliance'
                        }
        ],
                severity: 'high',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'data-retention-7years',
                name: '7-Year Data Retention',
                description: 'Retain financial and audit data for 7 years as per SOX requirements',
                type: 'sox',
                enabled: true,
                conditions: [
                    {
                        field: 'dataType',
                        operator: 'equals',
                        value: 'financial'
                    },
                    {
                        field: 'age',
                        operator: 'greater_than',
                        value: 2555 // 7 years in days
                    }
                ],
                actions: [
                    {
                        type: 'alert',
                        parameters: {
                            message: 'Data exceeds 7-year retention period',
                            recipients: ['compliance@company.com']
                        }
                    }
                ],
                severity: 'medium',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'hipaa-phi-protection',
                name: 'HIPAA PHI Protection',
                description: 'Protect Protected Health Information (PHI) with encryption and access controls',
                type: 'hipaa',
                enabled: true,
                conditions: [
                    {
                        field: 'dataType',
                        operator: 'equals',
                        value: 'phi'
                    }
                ],
                actions: [
                    {
                        type: 'encrypt',
                        parameters: {
                            algorithm: 'AES-256',
                            keyRotation: '90d'
                        }
                    },
                    {
                        type: 'log',
                        parameters: {
                            level: 'audit',
                            message: 'PHI access logged for HIPAA compliance'
                        }
                    }
                ],
                severity: 'critical',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'ccpa-consumer-rights',
                name: 'CCPA Consumer Rights',
                description: 'Ensure consumer rights under CCPA are respected',
                type: 'ccpa',
                enabled: true,
                conditions: [
                    {
                        field: 'dataType',
                        operator: 'equals',
                        value: 'personal'
                    },
                    {
                        field: 'jurisdiction',
                        operator: 'equals',
                        value: 'california'
                    }
                ],
                actions: [
                    {
                        type: 'log',
                        parameters: {
                            level: 'info',
                            message: 'CCPA consumer rights request processed'
                        }
                    }
                ],
                severity: 'high',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        defaultRules.forEach(rule => {
            this.rules.set(rule.id, rule);
        });
    }

    private initializeRetentionPolicies(): void {
        const defaultPolicies: DataRetentionPolicy[] = [
            {
                id: 'user-data-retention',
                name: 'User Data Retention',
                description: 'Retain user data for 3 years after account closure',
                dataTypes: ['profile', 'preferences', 'usage'],
                retentionPeriod: 1095, // 3 years
                autoDelete: true,
                archiveBeforeDelete: true,
                conditions: [
                    {
                        field: 'status',
                        operator: 'equals',
                        value: 'inactive'
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'audit-log-retention',
                name: 'Audit Log Retention',
                description: 'Retain audit logs for 7 years for compliance',
                dataTypes: ['audit', 'security', 'access'],
                retentionPeriod: 2555, // 7 years
                autoDelete: false,
                archiveBeforeDelete: true,
                conditions: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        defaultPolicies.forEach(policy => {
            this.retentionPolicies.set(policy.id, policy);
        });
    }

    async logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp' | 'complianceFlags' | 'riskScore'>): Promise<void> {
        try {
            const auditLog: AuditLog = {
                ...event,
                id: crypto.randomUUID(),
                timestamp: new Date(),
                complianceFlags: await this.checkComplianceFlags(event),
                riskScore: await this.calculateRiskScore(event)
            };

            this.auditLogs.push(auditLog);

            // Keep only last 10000 audit logs in memory
            if (this.auditLogs.length > 10000) {
                this.auditLogs = this.auditLogs.slice(-10000);
            }

            // Cache recent audit logs
            await cacheService.set(
                `audit:${auditLog.id}`,
                JSON.stringify(auditLog),
                24 * 60 * 60 // 24 hours
            );

            // Check for compliance violations
            await this.checkComplianceViolations(auditLog);

            logger.info(`Audit event logged: ${event.action} by ${event.userId}`);
        } catch (error) {
            logger.error('Error logging audit event:', error);
        }
    }

    async checkComplianceFlags(event: Omit<AuditLog, 'id' | 'timestamp' | 'complianceFlags' | 'riskScore'>): Promise<string[]> {
        const flags: string[] = [];

        for (const [ruleId, rule] of this.rules) {
            if (!rule.enabled) continue;

            const matches = rule.conditions.every(condition => {
                const value = this.getFieldValue(event, condition.field);
                return this.evaluateCondition(value, condition.operator, condition.value);
            });

            if (matches) {
                flags.push(ruleId);
            }
        }

        return flags;
    }

    async calculateRiskScore(event: Omit<AuditLog, 'id' | 'timestamp' | 'complianceFlags' | 'riskScore'>): Promise<number> {
        let score = 0;

        // Base score based on action type
        const actionScores: Record<string, number> = {
            'login': 1,
            'logout': 1,
            'data_access': 3,
            'data_modification': 5,
            'data_deletion': 7,
            'admin_action': 8,
            'system_config': 9
        };

        score += actionScores[event.action] || 2;

        // Increase score for sensitive resources
        if (event.resource.includes('personal') || event.resource.includes('financial')) {
            score += 3;
        }

        // Increase score for admin users
        if (event.userId.includes('admin')) {
            score += 2;
        }

        // Increase score for unusual hours (outside 9-5)
        const hour = new Date().getHours();
        if (hour < 9 || hour > 17) {
            score += 1;
        }

        return Math.min(score, 10); // Cap at 10
    }

    private getFieldValue(event: any, field: string): any {
        const fields = field.split('.');
        let value = event;

        for (const f of fields) {
            value = value?.[f];
        }

        return value;
    }

    private evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
        switch (operator) {
            case 'equals':
                return value === expectedValue;
            case 'contains':
                return String(value).includes(String(expectedValue));
            case 'greater_than':
                return Number(value) > Number(expectedValue);
            case 'less_than':
                return Number(value) < Number(expectedValue);
            case 'regex':
                return new RegExp(expectedValue).test(String(value));
            default:
                return false;
        }
    }

    async checkComplianceViolations(auditLog: AuditLog): Promise<void> {
        for (const flag of auditLog.complianceFlags) {
            const rule = this.rules.get(flag);
            if (!rule) continue;

            for (const action of rule.actions) {
                await this.executeComplianceAction(action, auditLog);
            }
        }
    }

    private async executeComplianceAction(action: any, auditLog: AuditLog): Promise<void> {
        switch (action.type) {
            case 'log':
                logger.info(`Compliance action: ${action.parameters.message}`, {
                    auditLogId: auditLog.id,
                    rule: action.parameters.rule
                });
                break;

            case 'alert':
                // Send alert to compliance team
                await this.sendComplianceAlert(action.parameters, auditLog);
                break;

            case 'block':
                // Block the action (would need to be implemented in the calling code)
                logger.warn(`Compliance block: ${action.parameters.message}`, {
                    auditLogId: auditLog.id
                });
                break;

            case 'encrypt':
                // Encrypt sensitive data
                await this.encryptSensitiveData(auditLog, action.parameters);
                break;

            case 'delete':
                // Delete data that violates retention policy
                await this.deleteExpiredData(auditLog, action.parameters);
                break;

            case 'anonymize':
                // Anonymize personal data
                await this.anonymizePersonalData(auditLog, action.parameters);
                break;
        }
    }

    private async sendComplianceAlert(parameters: any, auditLog: AuditLog): Promise<void> {
        // Implementation would send email/Slack notification to compliance team
        logger.warn(`Compliance alert: ${parameters.message}`, {
            auditLogId: auditLog.id,
            recipients: parameters.recipients
        });
    }

    private async encryptSensitiveData(auditLog: AuditLog, parameters: any): Promise<void> {
        // Implementation would encrypt the data
        logger.info(`Encrypting sensitive data for audit log ${auditLog.id}`, {
            algorithm: parameters.algorithm,
            keyRotation: parameters.keyRotation
        });
    }

    private async deleteExpiredData(auditLog: AuditLog, parameters: any): Promise<void> {
        // Implementation would delete expired data
        logger.info(`Deleting expired data for audit log ${auditLog.id}`, parameters);
    }

    private async anonymizePersonalData(auditLog: AuditLog, parameters: any): Promise<void> {
        // Implementation would anonymize personal data
        logger.info(`Anonymizing personal data for audit log ${auditLog.id}`, parameters);
    }

    async generateComplianceReport(type: string, period: { start: Date; end: Date }): Promise<ComplianceReport> {
        try {
            const findings = await this.analyzeCompliance(type, period);
            const metrics = this.calculateComplianceMetrics(findings);

            const report: ComplianceReport = {
                id: crypto.randomUUID(),
                type: type as any,
                period,
                status: this.determineComplianceStatus(findings),
                findings,
                metrics,
                generatedAt: new Date(),
                generatedBy: 'system'
            };

            // Cache the report
            await cacheService.set(
                `compliance_report:${report.id}`,
                JSON.stringify(report),
                7 * 24 * 60 * 60 // 7 days
            );

            logger.info(`Compliance report generated: ${type} for period ${period.start} to ${period.end}`);
            return report;
        } catch (error) {
            logger.error('Error generating compliance report:', error);
            throw error;
        }
    }

    private async analyzeCompliance(type: string, period: { start: Date; end: Date }): Promise<any[]> {
        const findings = [];
        const relevantRules = Array.from(this.rules.values()).filter(rule =>
            rule.type === type || type === 'custom'
        );

        for (const rule of relevantRules) {
            const violations = this.auditLogs.filter(log =>
                log.timestamp >= period.start &&
                log.timestamp <= period.end &&
                log.complianceFlags.includes(rule.id)
            );

            findings.push({
                rule: rule.name,
                status: violations.length === 0 ? 'pass' : 'fail',
                description: rule.description,
                severity: rule.severity,
                recommendation: violations.length > 0 ?
                    `Address ${violations.length} violations of ${rule.name}` :
                    'No violations found',
                violations: violations.length
            });
        }

        return findings;
    }

    private calculateComplianceMetrics(findings: any[]): any {
        const totalRules = findings.length;
        const passedRules = findings.filter(f => f.status === 'pass').length;
        const failedRules = findings.filter(f => f.status === 'fail').length;
        const warningRules = findings.filter(f => f.severity === 'medium').length;
        const riskScore = findings.reduce((score, finding) => {
            const severityScores = { low: 1, medium: 3, high: 5, critical: 10 };
            return score + (severityScores[finding.severity] || 0) * (finding.status === 'fail' ? 1 : 0);
        }, 0);

        return {
            totalRules,
            passedRules,
            failedRules,
            warningRules,
            riskScore: Math.min(riskScore, 100)
        };
    }

    private determineComplianceStatus(findings: any[]): 'compliant' | 'non_compliant' | 'partial' {
        const criticalFailures = findings.filter(f => f.severity === 'critical' && f.status === 'fail').length;
        const highFailures = findings.filter(f => f.severity === 'high' && f.status === 'fail').length;
        const totalFailures = findings.filter(f => f.status === 'fail').length;

        if (criticalFailures > 0) return 'non_compliant';
        if (highFailures > 0 || totalFailures > findings.length * 0.2) return 'partial';
        return 'compliant';
    }

    async createDataSubjectRequest(request: Omit<DataSubjectRequest, 'id' | 'requestedAt' | 'status'>): Promise<DataSubjectRequest> {
        const dataSubjectRequest: DataSubjectRequest = {
            ...request,
            id: crypto.randomUUID(),
            requestedAt: new Date(),
            status: 'pending'
        };

        this.dataSubjectRequests.set(dataSubjectRequest.id, dataSubjectRequest);

        // Log the request
        await this.logAuditEvent({
            userId: 'system',
            action: 'data_subject_request_created',
            resource: 'data_subject_request',
            resourceId: dataSubjectRequest.id,
            details: { type: request.type, subjectId: request.subjectId },
            ipAddress: '0.0.0.0',
            userAgent: 'system'
        });

        logger.info(`Data subject request created: ${dataSubjectRequest.id}`);
        return dataSubjectRequest;
    }

    async processDataSubjectRequest(requestId: string, action: 'approve' | 'reject', notes: string, assignedTo: string): Promise<boolean> {
        const request = this.dataSubjectRequests.get(requestId);
        if (!request) return false;

        request.status = action === 'approve' ? 'in_progress' : 'rejected';
        request.notes = notes;
        request.assignedTo = assignedTo;

        if (action === 'approve') {
            // Process the request based on type
            await this.executeDataSubjectRequest(request);
        }

        this.dataSubjectRequests.set(requestId, request);

        // Log the action
        await this.logAuditEvent({
            userId: assignedTo,
            action: `data_subject_request_${action}d`,
            resource: 'data_subject_request',
            resourceId: requestId,
            details: { action, notes },
            ipAddress: '0.0.0.0',
            userAgent: 'system'
        });

        logger.info(`Data subject request ${action}d: ${requestId}`);
        return true;
    }

    private async executeDataSubjectRequest(request: DataSubjectRequest): Promise<void> {
        switch (request.type) {
            case 'access':
                // Provide data access
                await this.provideDataAccess(request);
                break;
            case 'portability':
                // Export data in portable format
                await this.exportDataPortable(request);
                break;
            case 'rectification':
                // Correct inaccurate data
                await this.rectifyData(request);
                break;
            case 'erasure':
                // Delete personal data
                await this.erasePersonalData(request);
                break;
            case 'restriction':
                // Restrict data processing
                await this.restrictDataProcessing(request);
                break;
            case 'objection':
                // Stop processing for marketing
                await this.stopMarketingProcessing(request);
                break;
        }

        request.status = 'completed';
        request.completedAt = new Date();
    }

    private async provideDataAccess(request: DataSubjectRequest): Promise<void> {
        // Implementation would provide data access
        logger.info(`Providing data access for request ${request.id}`);
    }

    private async exportDataPortable(request: DataSubjectRequest): Promise<void> {
        // Implementation would export data in portable format
        logger.info(`Exporting portable data for request ${request.id}`);
    }

    private async rectifyData(request: DataSubjectRequest): Promise<void> {
        // Implementation would correct data
        logger.info(`Rectifying data for request ${request.id}`);
    }

    private async erasePersonalData(request: DataSubjectRequest): Promise<void> {
        // Implementation would delete personal data
        logger.info(`Erasing personal data for request ${request.id}`);
    }

    private async restrictDataProcessing(request: DataSubjectRequest): Promise<void> {
        // Implementation would restrict data processing
        logger.info(`Restricting data processing for request ${request.id}`);
    }

    private async stopMarketingProcessing(request: DataSubjectRequest): Promise<void> {
        // Implementation would stop marketing processing
        logger.info(`Stopping marketing processing for request ${request.id}`);
    }

    // Public methods for rule management
    async createRule(rule: Omit<ComplianceRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceRule> {
        const newRule: ComplianceRule = {
            ...rule,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.rules.set(newRule.id, newRule);
        logger.info(`Compliance rule created: ${newRule.id}`);
        return newRule;
    }

    async updateRule(id: string, updates: Partial<ComplianceRule>): Promise<ComplianceRule | null> {
        const rule = this.rules.get(id);
        if (!rule) return null;

        const updatedRule = {
            ...rule,
            ...updates,
            updatedAt: new Date()
        };

        this.rules.set(id, updatedRule);
        logger.info(`Compliance rule updated: ${id}`);
        return updatedRule;
    }

    async deleteRule(id: string): Promise<boolean> {
        const deleted = this.rules.delete(id);
        if (deleted) {
            logger.info(`Compliance rule deleted: ${id}`);
        }
        return deleted;
    }

    async getRules(): Promise<ComplianceRule[]> {
        return Array.from(this.rules.values());
    }

    async getAuditLogs(filters?: {
        userId?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<AuditLog[]> {
        let logs = [...this.auditLogs];

        if (filters) {
            if (filters.userId) {
                logs = logs.filter(log => log.userId === filters.userId);
            }
            if (filters.action) {
                logs = logs.filter(log => log.action === filters.action);
            }
            if (filters.startDate) {
                logs = logs.filter(log => log.timestamp >= filters.startDate!);
            }
            if (filters.endDate) {
                logs = logs.filter(log => log.timestamp <= filters.endDate!);
            }
            if (filters.limit) {
                logs = logs.slice(-filters.limit);
            }
        }

        return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    async getDataSubjectRequests(): Promise<DataSubjectRequest[]> {
        return Array.from(this.dataSubjectRequests.values());
    }

    async getRetentionPolicies(): Promise<DataRetentionPolicy[]> {
        return Array.from(this.retentionPolicies.values());
    }
}

export const complianceService = new ComplianceService();

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { cacheService } from './cacheService';
import { logger } from './loggerService';
import { User } from '../models/User';

export interface Workspace {
    id: string;
    name: string;
    description: string;
    owner: string;
    members: Array<{
        userId: string;
        role: 'owner' | 'admin' | 'member' | 'viewer';
        joinedAt: Date;
        permissions: string[];
    }>;
    settings: {
        isPublic: boolean;
        allowInvites: boolean;
        requireApproval: boolean;
        maxMembers: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface CollaborationSession {
    id: string;
    workspaceId: string;
    participants: Array<{
        userId: string;
        socketId: string;
        cursor: {
            x: number;
            y: number;
            selection?: {
                start: number;
                end: number;
            };
        };
        isActive: boolean;
        lastSeen: Date;
    }>;
    document: {
        content: string;
        version: number;
        lastModified: Date;
        lastModifiedBy: string;
    };
    changes: Array<{
        id: string;
        userId: string;
        type: 'insert' | 'delete' | 'format';
        position: number;
        content: string;
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export interface RealTimeEvent {
    type: 'cursor_move' | 'text_change' | 'user_join' | 'user_leave' | 'selection_change' | 'typing_start' | 'typing_stop';
    userId: string;
    workspaceId: string;
    sessionId: string;
    data: any;
    timestamp: Date;
}

export class CollaborationService {
    private io: SocketIOServer;
    private workspaces: Map<string, Workspace> = new Map();
    private sessions: Map<string, CollaborationSession> = new Map();
    private userSessions: Map<string, string> = new Map(); // userId -> sessionId
    private typingUsers: Map<string, Set<string>> = new Map(); // sessionId -> Set<userId>

    constructor(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });

        this.setupSocketHandlers();
        this.initializeDefaultWorkspaces();
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', (socket) => {
            logger.info(`User connected: ${socket.id}`);

            // Join workspace
            socket.on('join_workspace', async (data: { workspaceId: string; userId: string }) => {
                try {
                    await this.handleJoinWorkspace(socket, data);
                } catch (error) {
                    logger.error('Error joining workspace:', error);
                    socket.emit('error', { message: 'Failed to join workspace' });
                }
            });

            // Leave workspace
            socket.on('leave_workspace', async (data: { workspaceId: string; userId: string }) => {
                try {
                    await this.handleLeaveWorkspace(socket, data);
                } catch (error) {
                    logger.error('Error leaving workspace:', error);
                }
            });

            // Cursor movement
            socket.on('cursor_move', (data: { sessionId: string; userId: string; cursor: any }) => {
                this.handleCursorMove(socket, data);
            });

            // Text changes
            socket.on('text_change', (data: { sessionId: string; userId: string; change: any }) => {
                this.handleTextChange(socket, data);
            });

            // Selection changes
            socket.on('selection_change', (data: { sessionId: string; userId: string; selection: any }) => {
                this.handleSelectionChange(socket, data);
            });

            // Typing indicators
            socket.on('typing_start', (data: { sessionId: string; userId: string }) => {
                this.handleTypingStart(socket, data);
            });

            socket.on('typing_stop', (data: { sessionId: string; userId: string }) => {
                this.handleTypingStop(socket, data);
            });

            // Disconnect
            socket.on('disconnect', async () => {
                try {
                    await this.handleDisconnect(socket);
                } catch (error) {
                    logger.error('Error handling disconnect:', error);
                }
            });
        });
    }

    private async handleJoinWorkspace(socket: any, data: { workspaceId: string; userId: string }): Promise<void> {
        const { workspaceId, userId } = data;

        // Verify user has access to workspace
        const workspace = this.workspaces.get(workspaceId);
        if (!workspace) {
            socket.emit('error', { message: 'Workspace not found' });
            return;
        }

        const member = workspace.members.find(m => m.userId === userId);
        if (!member) {
            socket.emit('error', { message: 'Access denied' });
            return;
        }

        // Join socket room
        socket.join(workspaceId);

        // Get or create collaboration session
        let session = this.sessions.get(workspaceId);
        if (!session) {
            session = await this.createSession(workspaceId);
        }

        // Add participant to session
        const participant = session.participants.find(p => p.userId === userId);
        if (participant) {
            participant.socketId = socket.id;
            participant.isActive = true;
            participant.lastSeen = new Date();
        } else {
            session.participants.push({
                userId,
                socketId: socket.id,
                cursor: { x: 0, y: 0 },
                isActive: true,
                lastSeen: new Date()
            });
        }

        this.sessions.set(workspaceId, session);
        this.userSessions.set(userId, workspaceId);

        // Notify other participants
        socket.to(workspaceId).emit('user_joined', {
            userId,
            participant: session.participants.find(p => p.userId === userId)
        });

        // Send current session state to new participant
        socket.emit('session_state', {
            session,
            participants: session.participants.filter(p => p.isActive)
        });

        logger.info(`User ${userId} joined workspace ${workspaceId}`);
    }

    private async handleLeaveWorkspace(socket: any, data: { workspaceId: string; userId: string }): Promise<void> {
        const { workspaceId, userId } = data;

        const session = this.sessions.get(workspaceId);
        if (session) {
            const participant = session.participants.find(p => p.userId === userId);
            if (participant) {
                participant.isActive = false;
                participant.lastSeen = new Date();
            }
        }

        socket.leave(workspaceId);
        this.userSessions.delete(userId);

        // Notify other participants
        socket.to(workspaceId).emit('user_left', { userId });

        logger.info(`User ${userId} left workspace ${workspaceId}`);
    }

    private handleCursorMove(socket: any, data: { sessionId: string; userId: string; cursor: any }): void {
        const { sessionId, userId, cursor } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        const participant = session.participants.find(p => p.userId === userId);
        if (participant) {
            participant.cursor = cursor;
            participant.lastSeen = new Date();
        }

        // Broadcast cursor movement to other participants
        socket.to(sessionId).emit('cursor_move', {
            userId,
            cursor,
            timestamp: new Date()
        });
    }

    private handleTextChange(socket: any, data: { sessionId: string; userId: string; change: any }): void {
        const { sessionId, userId, change } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        // Apply change to document
        this.applyChange(session, change, userId);

        // Broadcast change to other participants
        socket.to(sessionId).emit('text_change', {
            userId,
            change,
            timestamp: new Date()
        });

        // Update cache
        this.updateSessionCache(session);
    }

    private handleSelectionChange(socket: any, data: { sessionId: string; userId: string; selection: any }): void {
        const { sessionId, userId, selection } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        const participant = session.participants.find(p => p.userId === userId);
        if (participant) {
            participant.cursor.selection = selection;
            participant.lastSeen = new Date();
        }

        // Broadcast selection change to other participants
        socket.to(sessionId).emit('selection_change', {
            userId,
            selection,
            timestamp: new Date()
        });
    }

    private handleTypingStart(socket: any, data: { sessionId: string; userId: string }): void {
        const { sessionId, userId } = data;

        if (!this.typingUsers.has(sessionId)) {
            this.typingUsers.set(sessionId, new Set());
        }

        this.typingUsers.get(sessionId)!.add(userId);

        // Broadcast typing indicator
        socket.to(sessionId).emit('typing_start', {
            userId,
            timestamp: new Date()
        });
    }

    private handleTypingStop(socket: any, data: { sessionId: string; userId: string }): void {
        const { sessionId, userId } = data;

        const typingSet = this.typingUsers.get(sessionId);
        if (typingSet) {
            typingSet.delete(userId);
        }

        // Broadcast typing stop
        socket.to(sessionId).emit('typing_stop', {
            userId,
            timestamp: new Date()
        });
    }

    private async handleDisconnect(socket: any): Promise<void> {
        const userId = this.findUserIdBySocketId(socket.id);
        if (!userId) return;

        const sessionId = this.userSessions.get(userId);
        if (!sessionId) return;

        const session = this.sessions.get(sessionId);
        if (session) {
            const participant = session.participants.find(p => p.userId === userId);
            if (participant) {
                participant.isActive = false;
                participant.lastSeen = new Date();
            }
        }

        // Notify other participants
        socket.to(sessionId).emit('user_disconnected', {
            userId,
            timestamp: new Date()
        });

        this.userSessions.delete(userId);
        logger.info(`User ${userId} disconnected`);
    }

    private applyChange(session: CollaborationSession, change: any, userId: string): void {
        const changeId = crypto.randomUUID();

        // Add change to history
        session.changes.push({
            id: changeId,
            userId,
            type: change.type,
            position: change.position,
            content: change.content,
            timestamp: new Date()
        });

        // Apply change to document content
        if (change.type === 'insert') {
            session.document.content =
                session.document.content.slice(0, change.position) +
                change.content +
                session.document.content.slice(change.position);
        } else if (change.type === 'delete') {
            session.document.content =
                session.document.content.slice(0, change.position) +
                session.document.content.slice(change.position + change.length);
        }

        // Update document metadata
        session.document.version += 1;
        session.document.lastModified = new Date();
        session.document.lastModifiedBy = userId;
        session.updatedAt = new Date();

        // Keep only last 1000 changes
        if (session.changes.length > 1000) {
            session.changes = session.changes.slice(-1000);
        }
    }

    private async updateSessionCache(session: CollaborationSession): Promise<void> {
        try {
            await cacheService.set(
                `session:${session.id}`,
                JSON.stringify(session),
                3600 // 1 hour
            );
        } catch (error) {
            logger.error('Error updating session cache:', error);
        }
    }

    private findUserIdBySocketId(socketId: string): string | null {
        for (const [userId, sessionId] of this.userSessions) {
            const session = this.sessions.get(sessionId);
            if (session?.participants.find(p => p.socketId === socketId)) {
                return userId;
            }
        }
        return null;
    }

    private async createSession(workspaceId: string): Promise<CollaborationSession> {
        const session: CollaborationSession = {
            id: workspaceId,
            workspaceId,
            participants: [],
            document: {
                content: '',
                version: 0,
                lastModified: new Date(),
                lastModifiedBy: ''
            },
            changes: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.sessions.set(workspaceId, session);
        return session;
    }

    private initializeDefaultWorkspaces(): void {
        // Create some default workspaces for demonstration
        const defaultWorkspaces: Workspace[] = [
            {
                id: 'default-workspace',
                name: 'Default Workspace',
                description: 'Default workspace for all users',
                owner: 'system',
                members: [],
                settings: {
                    isPublic: true,
                    allowInvites: true,
                    requireApproval: false,
                    maxMembers: 100
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        defaultWorkspaces.forEach(workspace => {
            this.workspaces.set(workspace.id, workspace);
        });
    }

    // Public methods for workspace management
    async createWorkspace(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace> {
        const newWorkspace: Workspace = {
            ...workspace,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.workspaces.set(newWorkspace.id, newWorkspace);

        // Cache workspace
        await cacheService.set(
            `workspace:${newWorkspace.id}`,
            JSON.stringify(newWorkspace),
            3600
        );

        logger.info(`Workspace created: ${newWorkspace.id}`);
        return newWorkspace;
    }

    async getWorkspace(id: string): Promise<Workspace | null> {
        return this.workspaces.get(id) || null;
    }

    async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace | null> {
        const workspace = this.workspaces.get(id);
        if (!workspace) return null;

        const updatedWorkspace = {
            ...workspace,
            ...updates,
            updatedAt: new Date()
        };

        this.workspaces.set(id, updatedWorkspace);

        // Update cache
        await cacheService.set(
            `workspace:${id}`,
            JSON.stringify(updatedWorkspace),
            3600
        );

        return updatedWorkspace;
    }

    async addMember(workspaceId: string, userId: string, role: 'admin' | 'member' | 'viewer'): Promise<boolean> {
        const workspace = this.workspaces.get(workspaceId);
        if (!workspace) return false;

        const member = workspace.members.find(m => m.userId === userId);
        if (member) return false; // Already a member

        workspace.members.push({
            userId,
            role,
            joinedAt: new Date(),
            permissions: this.getRolePermissions(role)
        });

        this.workspaces.set(workspaceId, workspace);

        // Update cache
        await cacheService.set(
            `workspace:${workspaceId}`,
            JSON.stringify(workspace),
            3600
        );

        logger.info(`Member added to workspace ${workspaceId}: ${userId}`);
        return true;
    }

    async removeMember(workspaceId: string, userId: string): Promise<boolean> {
        const workspace = this.workspaces.get(workspaceId);
        if (!workspace) return false;

        const memberIndex = workspace.members.findIndex(m => m.userId === userId);
        if (memberIndex === -1) return false;

        workspace.members.splice(memberIndex, 1);
        this.workspaces.set(workspaceId, workspace);

        // Update cache
        await cacheService.set(
            `workspace:${workspaceId}`,
            JSON.stringify(workspace),
            3600
        );

        logger.info(`Member removed from workspace ${workspaceId}: ${userId}`);
        return true;
    }

    async getSession(workspaceId: string): Promise<CollaborationSession | null> {
        return this.sessions.get(workspaceId) || null;
    }

    async saveSession(session: CollaborationSession): Promise<void> {
        this.sessions.set(session.id, session);
        await this.updateSessionCache(session);
    }

    async getActiveParticipants(workspaceId: string): Promise<Array<{ userId: string; isActive: boolean; lastSeen: Date }>> {
        const session = this.sessions.get(workspaceId);
        if (!session) return [];

        return session.participants.map(p => ({
            userId: p.userId,
            isActive: p.isActive,
            lastSeen: p.lastSeen
        }));
    }

    async getTypingUsers(workspaceId: string): Promise<string[]> {
        const typingSet = this.typingUsers.get(workspaceId);
        return typingSet ? Array.from(typingSet) : [];
    }

    private getRolePermissions(role: string): string[] {
        const permissions = {
            owner: ['read', 'write', 'admin', 'invite', 'remove'],
            admin: ['read', 'write', 'invite', 'remove'],
            member: ['read', 'write'],
            viewer: ['read']
        };

        return permissions[role as keyof typeof permissions] || [];
    }

    // Broadcast methods
    async broadcastToWorkspace(workspaceId: string, event: string, data: any): Promise<void> {
        this.io.to(workspaceId).emit(event, data);
    }

    async broadcastToUser(userId: string, event: string, data: any): Promise<void> {
        const sessionId = this.userSessions.get(userId);
        if (sessionId) {
            const session = this.sessions.get(sessionId);
            if (session) {
                const participant = session.participants.find(p => p.userId === userId);
                if (participant) {
                    this.io.to(participant.socketId).emit(event, data);
                }
            }
        }
    }

    // Cleanup methods
    async cleanupInactiveSessions(): Promise<void> {
        const now = new Date();
        const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

        for (const [sessionId, session] of this.sessions) {
            const inactiveParticipants = session.participants.filter(
                p => now.getTime() - p.lastSeen.getTime() > inactiveThreshold
            );

            if (inactiveParticipants.length > 0) {
                // Remove inactive participants
                session.participants = session.participants.filter(
                    p => now.getTime() - p.lastSeen.getTime() <= inactiveThreshold
                );

                // If no active participants, clean up session
                if (session.participants.length === 0) {
                    this.sessions.delete(sessionId);
                    this.typingUsers.delete(sessionId);
                } else {
                    this.sessions.set(sessionId, session);
                }
            }
        }

        logger.info('Cleaned up inactive collaboration sessions');
    }
}

export const collaborationService = new CollaborationService(require('http').createServer());

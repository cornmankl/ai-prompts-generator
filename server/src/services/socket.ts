import { Server as SocketIOServer, Socket } from 'socket.io'
import { Logger } from 'winston'
import jwt from 'jsonwebtoken'
import User from '../models/User'

interface AuthenticatedSocket extends Socket {
  userId?: string
  user?: any
}

export class SocketService {
  private io: SocketIOServer
  private logger: Logger
  private connectedUsers: Map<string, string> = new Map() // userId -> socketId
  private rooms: Map<string, Set<string>> = new Map() // roomId -> Set of socketIds

  constructor(io: SocketIOServer, logger?: Logger) {
    this.io = io
    this.logger = logger || console as any
    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        const user = await User.findById(decoded.userId)

        if (!user || user.status !== 'active') {
          return next(new Error('Authentication error: Invalid user'))
        }

        socket.userId = user._id.toString()
        socket.user = user
        next()
      } catch (error) {
        this.logger.error('Socket authentication error:', error)
        next(new Error('Authentication error'))
      }
    })
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.logger.info(`User connected: ${socket.userId} (${socket.id})`)
      
      // Store user connection
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id)
      }

      // Join user to their personal room
      socket.join(`user:${socket.userId}`)

      // Handle joining collaboration rooms
      socket.on('join-room', (roomId: string) => {
        this.joinRoom(socket, roomId)
      })

      // Handle leaving collaboration rooms
      socket.on('leave-room', (roomId: string) => {
        this.leaveRoom(socket, roomId)
      })

      // Handle real-time editing
      socket.on('edit-prompt', (data: { roomId: string, promptId: string, changes: any }) => {
        this.handlePromptEdit(socket, data)
      })

      // Handle cursor movement
      socket.on('cursor-move', (data: { roomId: string, position: any }) => {
        this.handleCursorMove(socket, data)
      })

      // Handle typing indicators
      socket.on('typing-start', (data: { roomId: string }) => {
        this.handleTypingStart(socket, data)
      })

      socket.on('typing-stop', (data: { roomId: string }) => {
        this.handleTypingStop(socket, data)
      })

      // Handle comments
      socket.on('add-comment', (data: { roomId: string, comment: any }) => {
        this.handleAddComment(socket, data)
      })

      // Handle presence updates
      socket.on('update-presence', (data: { roomId: string, status: string }) => {
        this.handlePresenceUpdate(socket, data)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket)
      })

      // Handle errors
      socket.on('error', (error) => {
        this.logger.error(`Socket error for user ${socket.userId}:`, error)
      })
    })
  }

  private joinRoom(socket: AuthenticatedSocket, roomId: string): void {
    socket.join(roomId)
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set())
    }
    this.rooms.get(roomId)!.add(socket.id)

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: socket.userId,
      user: socket.user,
      timestamp: new Date().toISOString()
    })

    // Send current room state to the new user
    const roomUsers = Array.from(this.rooms.get(roomId) || [])
      .map(socketId => this.io.sockets.sockets.get(socketId))
      .filter(s => s && s.userId)
      .map(s => ({
        userId: s.userId,
        user: s.user
      }))

    socket.emit('room-state', {
      roomId,
      users: roomUsers,
      timestamp: new Date().toISOString()
    })

    this.logger.info(`User ${socket.userId} joined room ${roomId}`)
  }

  private leaveRoom(socket: AuthenticatedSocket, roomId: string): void {
    socket.leave(roomId)
    
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId)!.delete(socket.id)
      if (this.rooms.get(roomId)!.size === 0) {
        this.rooms.delete(roomId)
      }
    }

    // Notify others in the room
    socket.to(roomId).emit('user-left', {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    })

    this.logger.info(`User ${socket.userId} left room ${roomId}`)
  }

  private handlePromptEdit(socket: AuthenticatedSocket, data: { roomId: string, promptId: string, changes: any }): void {
    // Broadcast changes to other users in the room
    socket.to(data.roomId).emit('prompt-edit', {
      promptId: data.promptId,
      changes: data.changes,
      userId: socket.userId,
      timestamp: new Date().toISOString()
    })
  }

  private handleCursorMove(socket: AuthenticatedSocket, data: { roomId: string, position: any }): void {
    // Broadcast cursor position to other users in the room
    socket.to(data.roomId).emit('cursor-move', {
      userId: socket.userId,
      position: data.position,
      timestamp: new Date().toISOString()
    })
  }

  private handleTypingStart(socket: AuthenticatedSocket, data: { roomId: string }): void {
    socket.to(data.roomId).emit('typing-start', {
      userId: socket.userId,
      user: socket.user,
      timestamp: new Date().toISOString()
    })
  }

  private handleTypingStop(socket: AuthenticatedSocket, data: { roomId: string }): void {
    socket.to(data.roomId).emit('typing-stop', {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    })
  }

  private handleAddComment(socket: AuthenticatedSocket, data: { roomId: string, comment: any }): void {
    // Broadcast comment to all users in the room
    this.io.to(data.roomId).emit('comment-added', {
      comment: data.comment,
      userId: socket.userId,
      user: socket.user,
      timestamp: new Date().toISOString()
    })
  }

  private handlePresenceUpdate(socket: AuthenticatedSocket, data: { roomId: string, status: string }): void {
    socket.to(data.roomId).emit('presence-update', {
      userId: socket.userId,
      status: data.status,
      timestamp: new Date().toISOString()
    })
  }

  private handleDisconnection(socket: AuthenticatedSocket): void {
    this.logger.info(`User disconnected: ${socket.userId} (${socket.id})`)
    
    // Remove from connected users
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId)
    }

    // Remove from all rooms
    this.rooms.forEach((socketIds, roomId) => {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id)
        if (socketIds.size === 0) {
          this.rooms.delete(roomId)
        } else {
          // Notify others in the room
          socket.to(roomId).emit('user-left', {
            userId: socket.userId,
            timestamp: new Date().toISOString()
          })
        }
      }
    })
  }

  // Public methods for external use
  public sendToUser(userId: string, event: string, data: any): void {
    const socketId = this.connectedUsers.get(userId)
    if (socketId) {
      this.io.to(socketId).emit(event, data)
    }
  }

  public sendToRoom(roomId: string, event: string, data: any): void {
    this.io.to(roomId).emit(event, data)
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys())
  }

  public getRoomUsers(roomId: string): string[] {
    const socketIds = this.rooms.get(roomId) || new Set()
    return Array.from(socketIds)
      .map(socketId => this.io.sockets.sockets.get(socketId))
      .filter(s => s && s.userId)
      .map(s => s.userId)
  }

  public getConnectionCount(): number {
    return this.connectedUsers.size
  }

  public getRoomCount(): number {
    return this.rooms.size
  }

  // Notification methods
  public sendNotification(userId: string, notification: any): void {
    this.sendToUser(userId, 'notification', notification)
  }

  public broadcastNotification(notification: any): void {
    this.io.emit('notification', notification)
  }

  // Collaboration methods
  public createCollaborationSession(sessionId: string, creatorId: string): void {
    this.io.to(`user:${creatorId}`).emit('collaboration-session-created', {
      sessionId,
      creatorId,
      timestamp: new Date().toISOString()
    })
  }

  public inviteToCollaboration(sessionId: string, userId: string, inviterId: string): void {
    this.sendToUser(userId, 'collaboration-invite', {
      sessionId,
      inviterId,
      timestamp: new Date().toISOString()
    })
  }
}
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    MessageCircle,
    Share2,
    Copy,
    Download,
    Eye,
    Edit3,
    Trash2,
    Plus,
    Send,
    Video,
    Phone,
    MoreVertical,
    Lock,
    Globe,
    UserPlus,
    Settings,
    Bell,
    CheckCircle,
    AlertCircle,
    Clock,
    Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Collaborator {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'owner' | 'editor' | 'viewer'
    isOnline: boolean
    lastSeen?: Date
    cursor?: {
        x: number
        y: number
        color: string
    }
}

interface Comment {
    id: string
    content: string
    author: Collaborator
    timestamp: Date
    resolved: boolean
    position?: {
        x: number
        y: number
    }
}

interface Version {
    id: string
    name: string
    content: string
    author: Collaborator
    timestamp: Date
    changes: string
    isAutoSave: boolean
}

interface RealTimeCollaborationProps {
    promptId: string
    initialContent: string
    onContentChange: (content: string) => void
    onSave: (content: string) => void
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
    promptId,
    initialContent,
    onContentChange,
    onSave
}) => {
    const [content, setContent] = useState(initialContent)
    const [collaborators, setCollaborators] = useState<Collaborator[]>([
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'owner',
            isOnline: true,
            cursor: { x: 100, y: 50, color: '#3B82F6' }
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'editor',
            isOnline: true,
            cursor: { x: 200, y: 100, color: '#10B981' }
        },
        {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'viewer',
            isOnline: false,
            lastSeen: new Date(Date.now() - 5 * 60 * 1000)
        }
    ])
    const [comments, setComments] = useState<Comment[]>([
        {
            id: '1',
            content: 'This section could be more specific about the expected output format.',
            author: collaborators[1],
            timestamp: new Date(Date.now() - 2 * 60 * 1000),
            resolved: false,
            position: { x: 300, y: 150 }
        }
    ])
    const [versions, setVersions] = useState<Version[]>([
        {
            id: '1',
            name: 'Initial Version',
            content: initialContent,
            author: collaborators[0],
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            changes: 'Created initial prompt',
            isAutoSave: false
        },
        {
            id: '2',
            name: 'Auto-save',
            content: content,
            author: collaborators[0],
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            changes: 'Minor improvements',
            isAutoSave: true
        }
    ])
    const [showComments, setShowComments] = useState(true)
    const [showVersions, setShowVersions] = useState(false)
    const [showCollaborators, setShowCollaborators] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [isSharing, setIsSharing] = useState(false)
    const [shareSettings, setShareSettings] = useState({
        permission: 'editor' as 'viewer' | 'editor',
        allowComments: true,
        allowCopy: true,
        expiresAt: null as Date | null
    })

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate cursor movements
            setCollaborators(prev =>
                prev.map(collaborator =>
                    collaborator.isOnline && collaborator.role !== 'viewer'
                        ? {
                            ...collaborator,
                            cursor: {
                                x: Math.random() * 400,
                                y: Math.random() * 200,
                                color: collaborator.cursor?.color || '#3B82F6'
                            }
                        }
                        : collaborator
                )
            )
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    // Auto-save functionality
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (content !== initialContent) {
                const newVersion: Version = {
                    id: Date.now().toString(),
                    name: 'Auto-save',
                    content,
                    author: collaborators[0],
                    timestamp: new Date(),
                    changes: 'Auto-saved changes',
                    isAutoSave: true
                }
                setVersions(prev => [newVersion, ...prev.slice(0, 9)])
                onSave(content)
                toast.success('Auto-saved', { duration: 1000 })
            }
        }, 30000) // Auto-save every 30 seconds

        return () => clearInterval(autoSaveInterval)
    }, [content, initialContent, collaborators, onSave])

    const handleContentChange = (newContent: string) => {
        setContent(newContent)
        onContentChange(newContent)
    }

    const handleCursorMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setCursorPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
    }

    const addComment = () => {
        if (!newComment.trim()) return

        const comment: Comment = {
            id: Date.now().toString(),
            content: newComment,
            author: collaborators[0],
            timestamp: new Date(),
            resolved: false,
            position: cursorPosition
        }

        setComments(prev => [comment, ...prev])
        setNewComment('')
        toast.success('Comment added')
    }

    const resolveComment = (commentId: string) => {
        setComments(prev =>
            prev.map(comment =>
                comment.id === commentId
                    ? { ...comment, resolved: true }
                    : comment
            )
        )
        toast.success('Comment resolved')
    }

    const deleteComment = (commentId: string) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        toast.success('Comment deleted')
    }

    const createVersion = (name: string) => {
        const version: Version = {
            id: Date.now().toString(),
            name,
            content,
            author: collaborators[0],
            timestamp: new Date(),
            changes: 'Manual save',
            isAutoSave: false
        }
        setVersions(prev => [version, ...prev])
        onSave(content)
        toast.success('Version saved')
    }

    const restoreVersion = (version: Version) => {
        setContent(version.content)
        onContentChange(version.content)
        toast.success('Version restored')
    }

    const inviteCollaborator = (email: string, role: 'editor' | 'viewer') => {
        const newCollaborator: Collaborator = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email,
            role,
            isOnline: false
        }
        setCollaborators(prev => [...prev, newCollaborator])
        toast.success(`Invitation sent to ${email}`)
    }

    const updateCollaboratorRole = (collaboratorId: string, newRole: 'editor' | 'viewer') => {
        setCollaborators(prev =>
            prev.map(collaborator =>
                collaborator.id === collaboratorId
                    ? { ...collaborator, role: newRole }
                    : collaborator
            )
        )
        toast.success('Role updated')
    }

    const removeCollaborator = (collaboratorId: string) => {
        setCollaborators(prev => prev.filter(collaborator => collaborator.id !== collaboratorId))
        toast.success('Collaborator removed')
    }

    const sharePrompt = () => {
        setIsSharing(true)
        // In a real app, this would generate a shareable link
        const shareUrl = `${window.location.origin}/shared/${promptId}`
        navigator.clipboard.writeText(shareUrl)
        toast.success('Share link copied to clipboard')
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Collaborative Editing
                        </h2>
                        <div className="flex items-center space-x-2">
                            <div className="flex -space-x-2">
                                {collaborators.slice(0, 3).map((collaborator) => (
                                    <div
                                        key={collaborator.id}
                                        className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium ${collaborator.isOnline
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                            }`}
                                        title={`${collaborator.name} (${collaborator.role})`}
                                    >
                                        {collaborator.name.charAt(0)}
                                    </div>
                                ))}
                                {collaborators.length > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                        +{collaborators.length - 3}
                                    </div>
                                )}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {collaborators.filter(c => c.isOnline).length} online
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`p-2 rounded-lg transition-colors ${showComments
                                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowVersions(!showVersions)}
                            className={`p-2 rounded-lg transition-colors ${showVersions
                                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Clock className="w-4 h-4" />
                        </button>
                        <button
                            onClick={sharePrompt}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-4">
                        <div className="relative h-full">
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => handleContentChange(e.target.value)}
                                onMouseMove={handleCursorMove}
                                className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                                placeholder="Start collaborating on your prompt..."
                            />

                            {/* Live Cursors */}
                            {collaborators
                                .filter(c => c.isOnline && c.role !== 'viewer' && c.cursor)
                                .map((collaborator) => (
                                    <div
                                        key={collaborator.id}
                                        className="absolute pointer-events-none z-10"
                                        style={{
                                            left: collaborator.cursor!.x,
                                            top: collaborator.cursor!.y,
                                        }}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                                            style={{ backgroundColor: collaborator.cursor!.color }}
                                        />
                                        <div
                                            className="text-xs font-medium text-white px-2 py-1 rounded shadow-lg"
                                            style={{ backgroundColor: collaborator.cursor!.color }}
                                        >
                                            {collaborator.name}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Comment Input */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onKeyPress={(e) => e.key === 'Enter' && addComment()}
                            />
                            <button
                                onClick={addComment}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* Comments Panel */}
                    {showComments && (
                        <div className="flex-1 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Comments ({comments.filter(c => !c.resolved).length})</span>
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {comments.map((comment) => (
                                    <motion.div
                                        key={comment.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-lg border ${comment.resolved
                                                ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                                                    {comment.author.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {comment.author.name}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {comment.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {!comment.resolved && (
                                                    <button
                                                        onClick={() => resolveComment(comment.id)}
                                                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteComment(comment.id)}
                                                    className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {comment.content}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Versions Panel */}
                    {showVersions && (
                        <div className="flex-1">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Versions ({versions.length})</span>
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {versions.map((version) => (
                                    <div
                                        key={version.id}
                                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                        onClick={() => restoreVersion(version)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {version.name}
                                            </span>
                                            {version.isAutoSave && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Auto
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            {version.changes}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>{version.author.name}</span>
                                            <span>{version.timestamp.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Collaborators Panel */}
                    {showCollaborators && (
                        <div className="border-t border-gray-200 dark:border-gray-700">
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2 mb-3">
                                    <Users className="w-4 h-4" />
                                    <span>Collaborators</span>
                                </h3>
                                <div className="space-y-2">
                                    {collaborators.map((collaborator) => (
                                        <div
                                            key={collaborator.id}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${collaborator.isOnline
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {collaborator.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {collaborator.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {collaborator.role}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {collaborator.isOnline ? (
                                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                ) : (
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RealTimeCollaboration

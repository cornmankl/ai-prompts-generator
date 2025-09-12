import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    MessageCircle,
    UserPlus,
    Settings,
    Eye,
    Edit3,
    Clock,
    CheckCircle,
    AlertCircle,
    MoreVertical,
    Send,
    Smile,
    Paperclip,
    Mic,
    Video,
    Phone,
    Plus,
    Share2,
    Star,
    Zap,
    Brain,
    Target,
    Calendar,
    Bell
} from 'lucide-react'
import RealTimeCollaboration from '../components/collaboration/RealTimeCollaboration'

const Collaboration: React.FC = () => {
    const [activeTab, setActiveTab] = useState('active')
    const [selectedPrompt, setSelectedPrompt] = useState('1')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showRealTimeEditor, setShowRealTimeEditor] = useState(false)

    const activeCollaborations = [
        {
            id: '1',
            title: 'Advanced Code Review Assistant',
            description: 'Comprehensive code analysis with security and performance review',
            participants: [
                { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', status: 'online' },
                { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'editor', status: 'online' },
                { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'viewer', status: 'away' }
            ],
            lastActivity: '2 minutes ago',
            status: 'active',
            changes: 3,
            category: 'Code Generation',
            tags: ['code-review', 'security', 'performance']
        },
        {
            id: '2',
            title: 'Creative Writing Generator',
            description: 'Generate compelling creative content across various formats',
            participants: [
                { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'owner', status: 'online' },
                { id: '5', name: 'David Brown', email: 'david@example.com', role: 'editor', status: 'offline' }
            ],
            lastActivity: '1 hour ago',
            status: 'active',
            changes: 1,
            category: 'Creative Writing',
            tags: ['creative-writing', 'content-generation']
        },
        {
            id: '3',
            title: 'Data Analysis Assistant',
            description: 'Advanced data analysis and visualization prompts',
            participants: [
                { id: '6', name: 'Lisa Chen', email: 'lisa@example.com', role: 'owner', status: 'online' },
                { id: '7', name: 'Tom Wilson', email: 'tom@example.com', role: 'editor', status: 'online' },
                { id: '8', name: 'Emma Davis', email: 'emma@example.com', role: 'editor', status: 'online' }
            ],
            lastActivity: '5 minutes ago',
            status: 'active',
            changes: 7,
            category: 'Analysis',
            tags: ['data-analysis', 'visualization', 'statistics']
        }
    ]

    const recentActivity = [
        {
            id: '1',
            type: 'comment',
            user: 'Jane Smith',
            action: 'added a comment',
            target: 'Advanced Code Review Assistant',
            time: '2 minutes ago',
            content: 'This section could be more specific about the expected output format.'
        },
        {
            id: '2',
            type: 'edit',
            user: 'John Doe',
            action: 'made changes',
            target: 'Creative Writing Generator',
            time: '15 minutes ago',
            content: 'Updated the creative writing guidelines'
        },
        {
            id: '3',
            type: 'invite',
            user: 'Sarah Wilson',
            action: 'invited',
            target: 'David Brown',
            time: '1 hour ago',
            content: 'to collaborate on Creative Writing Generator'
        },
        {
            id: '4',
            type: 'version',
            user: 'Lisa Chen',
            action: 'created version',
            target: 'Data Analysis Assistant',
            time: '2 hours ago',
            content: 'Version 2.1 - Added new visualization options'
        }
    ]

    const tabs = [
        { id: 'active', name: 'Active', count: activeCollaborations.length },
        { id: 'recent', name: 'Recent', count: 0 },
        { id: 'shared', name: 'Shared', count: 0 }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500'
            case 'away':
                return 'bg-yellow-500'
            case 'offline':
                return 'bg-gray-400'
            default:
                return 'bg-gray-400'
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'comment':
                return MessageCircle
            case 'edit':
                return Edit3
            case 'invite':
                return UserPlus
            case 'version':
                return Clock
            default:
                return CheckCircle
        }
    }

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'comment':
                return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
            case 'edit':
                return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
            case 'invite':
                return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20'
            case 'version':
                return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20'
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
        }
    }

    if (showRealTimeEditor) {
        return (
            <RealTimeCollaboration
                promptId={selectedPrompt}
                initialContent="You are an expert AI assistant specialized in prompt engineering. Help users create, optimize, and refine their AI prompts for maximum effectiveness."
                onContentChange={(content) => {
                    console.log('Content changed:', content)
                }}
                onSave={(content) => {
                    console.log('Saving content:', content)
                }}
            />
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4"
            >
                <h1 className="text-3xl font-bold gradient-text">
                    Collaboration Hub
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Work together on prompts in real-time with your team
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Tabs */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-neural">
                        <div className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-primary-500 text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <span>{tab.name}</span>
                                    {tab.count > 0 && (
                                        <span className={`px-2 py-1 text-xs rounded-full ${activeTab === tab.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-neural">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Invite Collaborators</span>
                            </button>
                            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <Share2 className="w-4 h-4" />
                                <span>Share Prompt</span>
                            </button>
                            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-neural">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {recentActivity.slice(0, 5).map((activity) => {
                                const ActivityIcon = getActivityIcon(activity.type)
                                return (
                                    <div key={activity.id} className="flex items-start space-x-3">
                                        <div className={`p-1.5 rounded-lg ${getActivityColor(activity.type)}`}>
                                            <ActivityIcon className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                                                <span className="font-medium">{activity.target}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Active Collaborations */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Active Collaborations
                            </h2>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>New Collaboration</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeCollaborations.map((collaboration) => (
                                <motion.div
                                    key={collaboration.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => {
                                        setSelectedPrompt(collaboration.id)
                                        setShowRealTimeEditor(true)
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                {collaboration.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {collaboration.description}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded-full">
                                                    {collaboration.category}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {collaboration.changes} changes
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor('active')}`} />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {collaboration.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {collaboration.participants.slice(0, 3).map((participant) => (
                                                <div
                                                    key={participant.id}
                                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 relative"
                                                    title={`${participant.name} (${participant.role})`}
                                                >
                                                    {participant.name.charAt(0)}
                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(participant.status)}`} />
                                                </div>
                                            ))}
                                            {collaboration.participants.length > 3 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    +{collaboration.participants.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {collaboration.lastActivity}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Collaboration Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                    <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {activeCollaborations.reduce((acc, collab) => acc + collab.participants.length, 0)}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Total Collaborators
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-accent-100 dark:bg-accent-900/20 rounded-lg">
                                    <Edit3 className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {activeCollaborations.reduce((acc, collab) => acc + collab.changes, 0)}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Recent Changes
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
                                    <Clock className="w-5 h-5 text-success-600 dark:text-success-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {activeCollaborations.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Active Sessions
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Invite Collaborators
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Role
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default Collaboration
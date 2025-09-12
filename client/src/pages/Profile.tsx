import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Mail,
    Calendar,
    Award,
    BarChart3,
    Star,
    Download,
    Share2,
    Edit3,
    Settings,
    Trophy,
    Target,
    Zap,
    Clock,
    Heart
} from 'lucide-react'

const Profile: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [isEditing, setIsEditing] = useState(false)

    const user = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        avatar: null,
        role: 'Premium User',
        joinDate: '2024-01-15',
        bio: 'AI enthusiast and prompt engineering expert. Passionate about creating powerful AI tools and sharing knowledge with the community.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        social: {
            twitter: '@johndoe',
            linkedin: 'linkedin.com/in/johndoe',
            github: 'github.com/johndoe'
        }
    }

    const stats = {
        totalPrompts: 45,
        totalGenerations: 1234,
        totalLikes: 89,
        totalViews: 5678,
        successRate: 94.2,
        avgRating: 4.8
    }

    const recentActivity = [
        { id: '1', type: 'prompt_created', title: 'Advanced Code Review Assistant', time: '2 hours ago', likes: 12 },
        { id: '2', type: 'prompt_shared', title: 'Creative Writing Generator', time: '1 day ago', likes: 8 },
        { id: '3', type: 'achievement', title: 'Prompt Master', time: '2 days ago', likes: 0 },
        { id: '4', type: 'generation', title: 'Data Analysis Assistant', time: '3 days ago', likes: 5 }
    ]

    const achievements = [
        { id: '1', name: 'Prompt Master', description: 'Created 25+ prompts', icon: Trophy, earned: true, date: '2024-01-20' },
        { id: '2', name: 'Community Star', description: 'Received 50+ likes', icon: Star, earned: true, date: '2024-01-18' },
        { id: '3', name: 'Power User', description: 'Generated 1000+ prompts', icon: Zap, earned: true, date: '2024-01-15' },
        { id: '4', name: 'Collaborator', description: 'Worked on 10+ shared prompts', icon: User, earned: false, progress: 7 },
        { id: '5', name: 'Analyst', description: 'Viewed 100+ analytics reports', icon: BarChart3, earned: false, progress: 45 }
    ]

    const tabs = [
        { id: 'overview', name: 'Overview' },
        { id: 'activity', name: 'Activity' },
        { id: 'achievements', name: 'Achievements' },
        { id: 'prompts', name: 'My Prompts' }
    ]

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
                    Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your profile, view achievements, and track your activity
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-1 space-y-6"
                >
                    {/* Profile Info */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                {user.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {user.name}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                @{user.username}
                            </p>
                            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm rounded-full">
                                {user.role}
                            </span>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                                <Award className="w-4 h-4" />
                                <span>{user.location}</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                {user.bio}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-center space-x-2">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                            <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Statistics
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalPrompts}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Prompts
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalGenerations}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Generations
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalLikes}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Likes
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.avgRating}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Avg Rating
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Tabs */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Recent Activity */}
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-primary-500" />
                                    <span>Recent Activity</span>
                                </h3>
                                <div className="space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                                                {activity.type === 'prompt_created' && <Edit3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                                                {activity.type === 'prompt_shared' && <Share2 className="w-5 h-5 text-accent-600 dark:text-accent-400" />}
                                                {activity.type === 'achievement' && <Trophy className="w-5 h-5 text-warning-600 dark:text-warning-400" />}
                                                {activity.type === 'generation' && <Zap className="w-5 h-5 text-success-600 dark:text-success-400" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {activity.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {activity.time}
                                                </p>
                                            </div>
                                            {activity.likes > 0 && (
                                                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{activity.likes}</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5 text-accent-500" />
                                    <span>Performance Metrics</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                            {stats.successRate}%
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Success Rate
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                            {stats.totalViews}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Total Views
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                            {stats.avgRating}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Average Rating
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Achievements Tab */}
                    {activeTab === 'achievements' && (
                        <div className="space-y-6">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                    <Trophy className="w-5 h-5 text-warning-500" />
                                    <span>Achievements</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {achievements.map((achievement, index) => (
                                        <motion.div
                                            key={achievement.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className={`p-4 rounded-lg border-2 ${achievement.earned
                                                    ? 'border-warning-500 bg-warning-50 dark:bg-warning-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${achievement.earned
                                                        ? 'bg-warning-100 dark:bg-warning-900/20'
                                                        : 'bg-gray-200 dark:bg-gray-600'
                                                    }`}>
                                                    <achievement.icon className={`w-6 h-6 ${achievement.earned
                                                            ? 'text-warning-600 dark:text-warning-400'
                                                            : 'text-gray-400'
                                                        }`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-medium ${achievement.earned
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                        }`}>
                                                        {achievement.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {achievement.description}
                                                    </p>
                                                    {achievement.earned && achievement.date && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Earned on {new Date(achievement.date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {!achievement.earned && achievement.progress && (
                                                        <div className="mt-2">
                                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                                <div
                                                                    className="bg-primary-500 h-2 rounded-full"
                                                                    style={{ width: `${(achievement.progress / 10) * 100}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {achievement.progress}/10
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My Prompts Tab */}
                    {activeTab === 'prompts' && (
                        <div className="space-y-6">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        My Prompts
                                    </h3>
                                    <div className="flex space-x-2">
                                        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                                            Create New
                                        </button>
                                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No prompts created yet</p>
                                    <p className="text-sm">Start creating your first prompt to see it here</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default Profile

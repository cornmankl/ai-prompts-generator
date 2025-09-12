import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Key,
    Database,
    Zap,
    Save,
    Eye,
    EyeOff,
    Trash2,
    Plus,
    Check
} from 'lucide-react'

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile')
    const [showApiKey, setShowApiKey] = useState(false)
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        updates: false,
        marketing: false
    })

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'appearance', name: 'Appearance', icon: Palette },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'api', name: 'API Keys', icon: Key },
        { id: 'data', name: 'Data & Privacy', icon: Database }
    ]

    const handleNotificationChange = (key: string, value: boolean) => {
        setNotifications(prev => ({ ...prev, [key]: value }))
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
                    Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your account settings, preferences, and security options
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                        <nav className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                                            ? 'bg-primary-500 text-white'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-3"
                >
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <User className="w-6 h-6 text-primary-500" />
                                    <span>Profile Information</span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="John Doe"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            defaultValue="john@example.com"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="johndoe"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Role
                                        </label>
                                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
                                        <Save className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <Bell className="w-6 h-6 text-accent-500" />
                                    <span>Notification Preferences</span>
                                </h2>

                                <div className="space-y-4">
                                    {Object.entries(notifications).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {key === 'email' && 'Receive notifications via email'}
                                                    {key === 'push' && 'Receive push notifications in browser'}
                                                    {key === 'updates' && 'Get notified about product updates'}
                                                    {key === 'marketing' && 'Receive marketing communications'}
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Appearance Settings */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <Palette className="w-6 h-6 text-warning-500" />
                                    <span>Appearance</span>
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Theme
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['light', 'dark', 'system'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-center capitalize"
                                                >
                                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-2" />
                                                    {theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Language
                                        </label>
                                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                            <option value="zh">Chinese</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Font Size
                                        </label>
                                        <input
                                            type="range"
                                            min="12"
                                            max="18"
                                            defaultValue="14"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <Shield className="w-6 h-6 text-error-500" />
                                    <span>Security</span>
                                </h2>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Change Password
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Update your password to keep your account secure
                                        </p>
                                        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                                            Change Password
                                        </button>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Two-Factor Authentication
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Add an extra layer of security to your account
                                        </p>
                                        <button className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
                                            Enable 2FA
                                        </button>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Active Sessions
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Manage your active login sessions
                                        </p>
                                        <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                            View Sessions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* API Keys Settings */}
                        {activeTab === 'api' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <Key className="w-6 h-6 text-success-500" />
                                    <span>API Keys</span>
                                </h2>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                OpenAI API Key
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setShowApiKey(!showApiKey)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                >
                                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            Used for GPT model generations
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type={showApiKey ? 'text' : 'password'}
                                                value="sk-...abc123"
                                                readOnly
                                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                                            />
                                            <button className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Anthropic API Key
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            Used for Claude model generations
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="password"
                                                placeholder="Enter your Anthropic API key"
                                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                                            />
                                            <button className="px-3 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Plus className="w-5 h-5" />
                                            <span>Add New API Key</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Data & Privacy Settings */}
                        {activeTab === 'data' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <Database className="w-6 h-6 text-info-500" />
                                    <span>Data & Privacy</span>
                                </h2>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Data Export
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Download all your data including prompts, templates, and analytics
                                        </p>
                                        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                                            Export Data
                                        </button>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Delete Account
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Permanently delete your account and all associated data
                                        </p>
                                        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            Delete Account
                                        </button>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Privacy Settings
                                        </h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center space-x-3">
                                                <input type="checkbox" defaultChecked className="rounded" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    Allow analytics collection
                                                </span>
                                            </label>
                                            <label className="flex items-center space-x-3">
                                                <input type="checkbox" defaultChecked className="rounded" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    Share usage data for product improvement
                                                </span>
                                            </label>
                                            <label className="flex items-center space-x-3">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    Allow marketing communications
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Settings

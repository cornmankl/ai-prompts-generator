import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone,
    Download,
    QrCode,
    CheckCircle,
    AlertCircle,
    Wifi,
    Battery,
    Signal,
    Settings,
    Share,
    Camera,
    Mic,
    MicOff,
    Send,
    Bot,
    User,
    Zap,
    Clock,
    DollarSign
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../hooks/useTheme';
import { useAdvancedAI } from '../../hooks/useAdvancedAI';

interface MobileAppProps {
    className?: string;
}

export const MobileApp: React.FC<MobileAppProps> = ({ className = '' }) => {
    const { theme } = useTheme();
    const {
        currentModel,
        settings,
        isLoading,
        isStreaming,
        sendMessage,
        streamMessage
    } = useAdvancedAI();

    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [batteryLevel, setBatteryLevel] = useState(100);
    const [showQRCode, setShowQRCode] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    }>>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Check if app is installed
    useEffect(() => {
        const checkInstallation = () => {
            // Check if running as PWA
            const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone ||
                document.referrer.includes('android-app://');
            setIsInstalled(isPWA);
        };

        checkInstallation();
        window.addEventListener('beforeinstallprompt', checkInstallation);
        window.addEventListener('appinstalled', checkInstallation);

        return () => {
            window.removeEventListener('beforeinstallprompt', checkInstallation);
            window.removeEventListener('appinstalled', checkInstallation);
        };
    }, []);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Monitor battery level
    useEffect(() => {
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                setBatteryLevel(Math.round(battery.level * 100));

                battery.addEventListener('levelchange', () => {
                    setBatteryLevel(Math.round(battery.level * 100));
                });
            });
        }
    }, []);

    const handleInstall = async () => {
        try {
            // Check if PWA is installable
            if ('serviceWorker' in navigator) {
                await navigator.serviceWorker.register('/sw.js');
            }

            // Show install prompt
            const deferredPrompt = (window as any).deferredPrompt;
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    setIsInstalled(true);
                }
                deferredPrompt = null;
            }
        } catch (error) {
            console.error('Error installing app:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading || isStreaming) return;

        const message = input.trim();
        setInput('');
        setIsTyping(true);

        // Add user message
        const userMessage = {
            id: crypto.randomUUID(),
            role: 'user' as const,
            content: message,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            if (settings.enableStreaming) {
                await streamMessage(message);
            } else {
                const response = await sendMessage(message);

                // Add assistant message
                const assistantMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant' as const,
                    content: response.content,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const startRecording = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setInput(transcript);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognition.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
    };

    const shareApp = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AI Prompts Generator',
                    text: 'Check out this amazing AI prompts generator app!',
                    url: window.location.href
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback to copying URL
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getBatteryColor = (level: number) => {
        if (level > 50) return 'text-green-500';
        if (level > 20) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getSignalStrength = () => {
        // Mock signal strength - in real app would use navigator.connection
        return Math.floor(Math.random() * 4) + 1;
    };

    return (
        <div className={`flex flex-col h-full bg-gray-50 dark:bg-gray-900 ${className}`}>
            {/* Mobile Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">9:41</span>
                </div>

                <div className="flex items-center space-x-1">
                    <Signal className="w-4 h-4" />
                    <Wifi className="w-4 h-4" />
                    <Battery className={`w-4 h-4 ${getBatteryColor(batteryLevel)}`} />
                    <span className="text-xs">{batteryLevel}%</span>
                </div>
            </div>

            {/* App Header */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">AI Chat</h1>
                        <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                                {currentModel}
                            </Badge>
                            {isOnline ? (
                                <Badge variant="success" className="text-xs">
                                    <Wifi className="w-3 h-3 mr-1" />
                                    Online
                                </Badge>
                            ) : (
                                <Badge variant="warning" className="text-xs">
                                    Offline
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInstallModal(true)}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={shareApp}
                    >
                        <Share className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}>
                                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                <div className={`rounded-2xl p-3 ${message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                                    }`}>
                                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                                    <div className="text-xs opacity-70 mt-1">
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="flex space-x-2 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="rounded-2xl p-3 bg-white dark:bg-gray-800 shadow-sm">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end space-x-2">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isLoading || isStreaming}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />

                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isLoading || isStreaming}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || isStreaming}
                        className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isStreaming ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Install Modal */}
            <Modal
                isOpen={showInstallModal}
                onClose={() => setShowInstallModal(false)}
                title="Install Mobile App"
                size="sm"
            >
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Smartphone className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Install AI Prompts Generator</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Install our mobile app for a better experience with offline support and push notifications.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm">Offline access to your conversations</span>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm">Push notifications for responses</span>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm">Native mobile performance</span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            onClick={handleInstall}
                            className="flex-1"
                            disabled={isInstalled}
                        >
                            {isInstalled ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Installed
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Install
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setShowQRCode(true)}
                        >
                            <QrCode className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* QR Code Modal */}
            <Modal
                isOpen={showQRCode}
                onClose={() => setShowQRCode(false)}
                title="Scan QR Code"
                size="sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
                        <QrCode className="w-24 h-24 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Scan this QR code with your mobile device to install the app
                    </p>
                </div>
            </Modal>
        </div>
    );
};

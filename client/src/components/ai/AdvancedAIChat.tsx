import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Mic,
    MicOff,
    Stop,
    Settings,
    Download,
    Share,
    Copy,
    ThumbsUp,
    ThumbsDown,
    MoreVertical,
    Bot,
    User,
    Zap,
    Clock,
    DollarSign,
    Hash
} from 'lucide-react';
import { useAdvancedAI } from '../../hooks/useAdvancedAI';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { Toggle } from '../ui/Toggle';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../hooks/useTheme';

interface AdvancedAIChatProps {
    className?: string;
}

export const AdvancedAIChat: React.FC<AdvancedAIChatProps> = ({ className = '' }) => {
    const {
        models,
        currentModel,
        setCurrentModel,
        settings,
        saveSettings,
        currentConversation,
        setCurrentConversation,
        isLoading,
        error,
        usage,
        isStreaming,
        streamingContent,
        sendMessage,
        streamMessage,
        stopStreaming,
        createConversation,
        saveConversation,
        shareConversation,
        clearError
    } = useAdvancedAI();

    const { theme } = useTheme();
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showModelComparison, setShowModelComparison] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentConversation?.messages, streamingContent]);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setInput(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading || isStreaming) return;

        const message = input.trim();
        setInput('');
        setIsTyping(true);

        try {
            if (settings.enableStreaming) {
                await streamMessage(message);
            } else {
                await sendMessage(message);
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
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleModelChange = (modelId: string) => {
        setCurrentModel(modelId);
        saveSettings({ defaultModel: modelId });
    };

    const handleSettingsChange = (newSettings: Partial<typeof settings>) => {
        saveSettings(newSettings);
    };

    const handleShare = async () => {
        if (!currentConversation) return;

        try {
            const shareId = await shareConversation(currentConversation.id);
            const url = `${window.location.origin}/shared/${shareId}`;
            setShareUrl(url);
            setShowShareModal(true);
        } catch (error) {
            console.error('Error sharing conversation:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatTokens = (tokens: number) => {
        if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
        if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
        return tokens.toString();
    };

    const formatCost = (cost: number) => {
        return `$${cost.toFixed(4)}`;
    };

    const formatTime = (ms: number) => {
        if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
        return `${ms}ms`;
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <Bot className="w-6 h-6 text-blue-500" />
                        <h2 className="text-lg font-semibold">AI Chat</h2>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {currentModel}
                    </Badge>
                </div>

                <div className="flex items-center space-x-2">
                    <Tooltip content="Model Comparison">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowModelComparison(true)}
                        >
                            <Zap className="w-4 h-4" />
                        </Button>
                    </Tooltip>

                    <Tooltip content="Settings">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSettings(true)}
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </Tooltip>

                    <Tooltip content="Share Conversation">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            disabled={!currentConversation}
                        >
                            <Share className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {currentConversation?.messages.map((message) => (
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

                                <div className={`rounded-lg p-3 ${message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                    }`}>
                                    <div className="whitespace-pre-wrap">{message.content}</div>

                                    {message.usage && (
                                        <div className="flex items-center space-x-3 mt-2 text-xs opacity-70">
                                            <div className="flex items-center space-x-1">
                                                <Hash className="w-3 h-3" />
                                                <span>{formatTokens(message.usage.totalTokens)}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <DollarSign className="w-3 h-3" />
                                                <span>{formatCost(message.usage.cost)}</span>
                                            </div>
                                            {message.metadata && (
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatTime(message.metadata.responseTime)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {message.role === 'assistant' && (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(message.content)}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {/* Handle like */ }}
                                            >
                                                <ThumbsUp className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {/* Handle dislike */ }}
                                            >
                                                <ThumbsDown className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Streaming content */}
                {isStreaming && streamingContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="flex space-x-2 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                                <div className="whitespace-pre-wrap">{streamingContent}</div>
                                <div className="flex items-center space-x-1 mt-2 text-xs opacity-70">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <span>Streaming...</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

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
                            <div className="rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error message */}
            {error && (
                <div className="mx-4 mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearError}
                        >
                            ×
                        </Button>
                    </div>
                </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end space-x-2">
                    <div className="flex-1">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            disabled={isLoading || isStreaming}
                            className="min-h-[40px] max-h-32 resize-none"
                        />
                    </div>

                    <div className="flex items-center space-x-1">
                        <Tooltip content={isRecording ? "Stop Recording" : "Start Recording"}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isLoading || isStreaming}
                            >
                                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </Button>
                        </Tooltip>

                        {isStreaming ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={stopStreaming}
                            >
                                <Stop className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading || isStreaming}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Usage stats */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                        <span>Tokens: {formatTokens(usage.totalTokens)}</span>
                        <span>Cost: {formatCost(usage.totalCost)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>Model: {currentModel}</span>
                        <span>•</span>
                        <span>Streaming: {settings.enableStreaming ? 'On' : 'Off'}</span>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            <Modal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                title="AI Settings"
                size="lg"
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Model</label>
                        <Select
                            value={currentModel}
                            onChange={handleModelChange}
                            options={models.map(model => ({
                                value: model.id,
                                label: `${model.name} (${model.provider})`,
                                description: model.description
                            }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Temperature: {settings.temperature}
                        </label>
                        <Slider
                            value={settings.temperature}
                            onChange={(value) => handleSettingsChange({ temperature: value })}
                            min={0}
                            max={2}
                            step={0.1}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Max Tokens: {settings.maxTokens}
                        </label>
                        <Slider
                            value={settings.maxTokens}
                            onChange={(value) => handleSettingsChange({ maxTokens: value })}
                            min={100}
                            max={8000}
                            step={100}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">System Prompt</label>
                        <textarea
                            value={settings.systemPrompt}
                            onChange={(e) => handleSettingsChange({ systemPrompt: e.target.value })}
                            className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none"
                            placeholder="Enter system prompt..."
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Auto Save</label>
                            <Toggle
                                checked={settings.autoSave}
                                onChange={(checked) => handleSettingsChange({ autoSave: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Show Usage</label>
                            <Toggle
                                checked={settings.showUsage}
                                onChange={(checked) => handleSettingsChange({ showUsage: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Enable Streaming</label>
                            <Toggle
                                checked={settings.enableStreaming}
                                onChange={(checked) => handleSettingsChange({ enableStreaming: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Enable Caching</label>
                            <Toggle
                                checked={settings.enableCaching}
                                onChange={(checked) => handleSettingsChange({ enableCaching: checked })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Share Modal */}
            <Modal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title="Share Conversation"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Share this conversation with others using the link below:
                    </p>
                    <div className="flex items-center space-x-2">
                        <Input
                            value={shareUrl}
                            readOnly
                            className="flex-1"
                        />
                        <Button
                            onClick={() => copyToClipboard(shareUrl)}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

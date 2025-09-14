import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './useAuth';
import { aiService } from '../services/aiService';
import { cacheService } from '../services/cacheService';

export interface AIModel {
    id: string;
    name: string;
    provider: string;
    type: 'text' | 'image' | 'code' | 'multimodal';
    capabilities: string[];
    maxTokens: number;
    costPerToken: number;
    isActive: boolean;
    description: string;
    version: string;
    contextWindow: number;
    supportedLanguages: string[];
    temperatureRange: { min: number; max: number };
    responseTime: number;
}

export interface AIRequest {
    model: string;
    prompt: string;
    options?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
        stop?: string[];
        systemPrompt?: string;
        stream?: boolean;
    };
    metadata?: {
        source: string;
        category: string;
        tags: string[];
    };
}

export interface AIResponse {
    content: string;
    model: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cost: number;
    };
    metadata: {
        responseTime: number;
        timestamp: Date;
        cached: boolean;
    };
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    model: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    category: string;
    isShared: boolean;
    shareId?: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    model?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cost: number;
    };
    metadata?: {
        responseTime: number;
        cached: boolean;
    };
}

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    category: string;
    tags: string[];
    variables: Array<{
        name: string;
        type: 'text' | 'number' | 'select' | 'boolean';
        required: boolean;
        defaultValue?: any;
        options?: string[];
        description?: string;
    }>;
    isPublic: boolean;
    author: string;
    usageCount: number;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface AISettings {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    autoSave: boolean;
    showUsage: boolean;
    enableStreaming: boolean;
    enableCaching: boolean;
    enableAnalytics: boolean;
}

export const useAdvancedAI = () => {
    const { user } = useAuth();
    const [models, setModels] = useState<AIModel[]>([]);
    const [currentModel, setCurrentModel] = useState<string>('gpt-4o-mini');
    const [settings, setSettings] = useState<AISettings>({
        defaultModel: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: 'You are a helpful AI assistant.',
        autoSave: true,
        showUsage: true,
        enableStreaming: true,
        enableCaching: true,
        enableAnalytics: true
    });
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usage, setUsage] = useState({
        totalTokens: 0,
        totalCost: 0,
        monthlyTokens: 0,
        monthlyCost: 0
    });
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState<string>('');

    const abortControllerRef = useRef<AbortController | null>(null);
    const conversationIdRef = useRef<string | null>(null);

    // Load models on mount
    useEffect(() => {
        loadModels();
        loadSettings();
        loadConversations();
        loadTemplates();
        loadUsage();
    }, []);

    // Load user settings
    useEffect(() => {
        if (user?.preferences?.ai) {
            setSettings(prev => ({
                ...prev,
                defaultModel: user.preferences.ai.defaultModel || 'gpt-4o-mini',
                temperature: user.preferences.ai.temperature || 0.7,
                maxTokens: user.preferences.ai.maxTokens || 2000,
                systemPrompt: user.preferences.ai.systemPrompt || 'You are a helpful AI assistant.'
            }));
            setCurrentModel(user.preferences.ai.defaultModel || 'gpt-4o-mini');
        }
    }, [user]);

    const loadModels = useCallback(async () => {
        try {
            const response = await aiService.getModels();
            setModels(response);
        } catch (error) {
            console.error('Error loading models:', error);
            setError('Failed to load AI models');
        }
    }, []);

    const loadSettings = useCallback(async () => {
        try {
            const savedSettings = localStorage.getItem('ai-settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }, []);

    const saveSettings = useCallback(async (newSettings: Partial<AISettings>) => {
        try {
            const updatedSettings = { ...settings, ...newSettings };
            setSettings(updatedSettings);
            localStorage.setItem('ai-settings', JSON.stringify(updatedSettings));

            // Update user preferences if logged in
            if (user) {
                await aiService.updateUserPreferences({
                    ai: {
                        defaultModel: updatedSettings.defaultModel,
                        temperature: updatedSettings.temperature,
                        maxTokens: updatedSettings.maxTokens,
                        systemPrompt: updatedSettings.systemPrompt
                    }
                });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setError('Failed to save settings');
        }
    }, [settings, user]);

    const loadConversations = useCallback(async () => {
        try {
            const response = await aiService.getConversations();
            setConversations(response);
        } catch (error) {
            console.error('Error loading conversations:', error);
            setError('Failed to load conversations');
        }
    }, []);

    const loadTemplates = useCallback(async () => {
        try {
            const response = await aiService.getTemplates();
            setTemplates(response);
        } catch (error) {
            console.error('Error loading templates:', error);
            setError('Failed to load templates');
        }
    }, []);

    const loadUsage = useCallback(async () => {
        try {
            const response = await aiService.getUsage();
            setUsage(response);
        } catch (error) {
            console.error('Error loading usage:', error);
        }
    }, []);

    const createConversation = useCallback(async (title?: string): Promise<Conversation> => {
        try {
            const conversation: Conversation = {
                id: crypto.randomUUID(),
                title: title || 'New Conversation',
                messages: [],
                model: currentModel,
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: [],
                category: 'general',
                isShared: false
            };

            setConversations(prev => [conversation, ...prev]);
            setCurrentConversation(conversation);
            conversationIdRef.current = conversation.id;

            return conversation;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }, [currentModel]);

    const sendMessage = useCallback(async (
        content: string,
        options?: {
            model?: string;
            systemPrompt?: string;
            temperature?: number;
            maxTokens?: number;
            stream?: boolean;
        }
    ): Promise<AIResponse> => {
        if (!user) throw new Error('User not authenticated');

        setIsLoading(true);
        setError(null);

        try {
            const model = options?.model || currentModel;
            const request: AIRequest = {
                model,
                prompt: content,
                options: {
                    temperature: options?.temperature ?? settings.temperature,
                    maxTokens: options?.maxTokens ?? settings.maxTokens,
                    systemPrompt: options?.systemPrompt ?? settings.systemPrompt,
                    stream: options?.stream ?? settings.enableStreaming
                },
                metadata: {
                    source: 'web',
                    category: 'general',
                    tags: []
                }
            };

            // Add user message to conversation
            if (currentConversation) {
                const userMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'user',
                    content,
                    timestamp: new Date()
                };

                setCurrentConversation(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, userMessage],
                    updatedAt: new Date()
                } : null);
            }

            // Send request
            const response = await aiService.generateResponse(request);

            // Add assistant message to conversation
            if (currentConversation) {
                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.content,
                    timestamp: new Date(),
                    model: response.model,
                    usage: response.usage,
                    metadata: response.metadata
                };

                setCurrentConversation(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, assistantMessage],
                    updatedAt: new Date()
                } : null);
            }

            // Update usage
            setUsage(prev => ({
                ...prev,
                totalTokens: prev.totalTokens + response.usage.totalTokens,
                totalCost: prev.totalCost + response.usage.cost,
                monthlyTokens: prev.monthlyTokens + response.usage.totalTokens,
                monthlyCost: prev.monthlyCost + response.usage.cost
            }));

            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error instanceof Error ? error.message : 'Failed to send message');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [user, currentModel, settings, currentConversation]);

    const streamMessage = useCallback(async (
        content: string,
        options?: {
            model?: string;
            systemPrompt?: string;
            temperature?: number;
            maxTokens?: number;
        }
    ): Promise<void> => {
        if (!user) throw new Error('User not authenticated');

        setIsStreaming(true);
        setStreamingContent('');
        setError(null);

        try {
            const model = options?.model || currentModel;
            const request: AIRequest = {
                model,
                prompt: content,
                options: {
                    temperature: options?.temperature ?? settings.temperature,
                    maxTokens: options?.maxTokens ?? settings.maxTokens,
                    systemPrompt: options?.systemPrompt ?? settings.systemPrompt,
                    stream: true
                },
                metadata: {
                    source: 'web',
                    category: 'general',
                    tags: []
                }
            };

            // Add user message to conversation
            if (currentConversation) {
                const userMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'user',
                    content,
                    timestamp: new Date()
                };

                setCurrentConversation(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, userMessage],
                    updatedAt: new Date()
                } : null);
            }

            // Create abort controller for streaming
            abortControllerRef.current = new AbortController();

            // Stream response
            await aiService.streamResponse(request, {
                onChunk: (chunk: string) => {
                    setStreamingContent(prev => prev + chunk);
                },
                onComplete: (response: AIResponse) => {
                    // Add complete assistant message to conversation
                    if (currentConversation) {
                        const assistantMessage: Message = {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: response.content,
                            timestamp: new Date(),
                            model: response.model,
                            usage: response.usage,
                            metadata: response.metadata
                        };

                        setCurrentConversation(prev => prev ? {
                            ...prev,
                            messages: [...prev.messages, assistantMessage],
                            updatedAt: new Date()
                        } : null);
                    }

                    // Update usage
                    setUsage(prev => ({
                        ...prev,
                        totalTokens: prev.totalTokens + response.usage.totalTokens,
                        totalCost: prev.totalCost + response.usage.cost,
                        monthlyTokens: prev.monthlyTokens + response.usage.totalTokens,
                        monthlyCost: prev.monthlyCost + response.usage.cost
                    }));

                    setStreamingContent('');
                },
                onError: (error: Error) => {
                    console.error('Streaming error:', error);
                    setError(error.message);
                    setStreamingContent('');
                }
            }, abortControllerRef.current.signal);
        } catch (error) {
            console.error('Error streaming message:', error);
            setError(error instanceof Error ? error.message : 'Failed to stream message');
        } finally {
            setIsStreaming(false);
        }
    }, [user, currentModel, settings, currentConversation]);

    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsStreaming(false);
            setStreamingContent('');
        }
    }, []);

    const saveConversation = useCallback(async (conversation: Conversation) => {
        try {
            await aiService.saveConversation(conversation);
            setConversations(prev =>
                prev.map(c => c.id === conversation.id ? conversation : c)
            );
        } catch (error) {
            console.error('Error saving conversation:', error);
            setError('Failed to save conversation');
        }
    }, []);

    const deleteConversation = useCallback(async (conversationId: string) => {
        try {
            await aiService.deleteConversation(conversationId);
            setConversations(prev => prev.filter(c => c.id !== conversationId));

            if (currentConversation?.id === conversationId) {
                setCurrentConversation(null);
                conversationIdRef.current = null;
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            setError('Failed to delete conversation');
        }
    }, [currentConversation]);

    const shareConversation = useCallback(async (conversationId: string): Promise<string> => {
        try {
            const shareId = await aiService.shareConversation(conversationId);
            setConversations(prev =>
                prev.map(c => c.id === conversationId ? { ...c, isShared: true, shareId } : c)
            );
            return shareId;
        } catch (error) {
            console.error('Error sharing conversation:', error);
            setError('Failed to share conversation');
            throw error;
        }
    }, []);

    const createTemplate = useCallback(async (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'usageCount' | 'rating'>) => {
        try {
            const newTemplate: PromptTemplate = {
                ...template,
                id: crypto.randomUUID(),
                author: user?.username || 'anonymous',
                usageCount: 0,
                rating: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await aiService.createTemplate(newTemplate);
            setTemplates(prev => [newTemplate, ...prev]);

            return newTemplate;
        } catch (error) {
            console.error('Error creating template:', error);
            setError('Failed to create template');
            throw error;
        }
    }, [user]);

    const useTemplate = useCallback((template: PromptTemplate, variables: Record<string, any>): string => {
        let content = template.content;

        // Replace variables in template
        template.variables.forEach(variable => {
            const value = variables[variable.name] || variable.defaultValue || '';
            const placeholder = `{{${variable.name}}}`;
            content = content.replace(new RegExp(placeholder, 'g'), value);
        });

        return content;
    }, []);

    const compareModels = useCallback(async (prompt: string, modelIds: string[]): Promise<AIResponse[]> => {
        try {
            const responses = await aiService.compareModels(prompt, modelIds);
            return responses;
        } catch (error) {
            console.error('Error comparing models:', error);
            setError('Failed to compare models');
            throw error;
        }
    }, []);

    const getModelPerformance = useCallback(async () => {
        try {
            const performance = await aiService.getModelPerformance();
            return performance;
        } catch (error) {
            console.error('Error getting model performance:', error);
            setError('Failed to get model performance');
            throw error;
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // State
        models,
        currentModel,
        setCurrentModel,
        settings,
        conversations,
        currentConversation,
        setCurrentConversation,
        isLoading,
        error,
        usage,
        templates,
        isStreaming,
        streamingContent,

        // Actions
        loadModels,
        saveSettings,
        createConversation,
        sendMessage,
        streamMessage,
        stopStreaming,
        saveConversation,
        deleteConversation,
        shareConversation,
        createTemplate,
        useTemplate,
        compareModels,
        getModelPerformance,
        clearError
    };
};

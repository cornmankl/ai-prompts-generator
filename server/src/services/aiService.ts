import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Cohere from 'cohere-ai';
import { HfInference } from '@huggingface/inference';
import Replicate from 'replicate';
import { cacheService } from './cacheService';
import { logger } from './loggerService';
import { User } from '../models/User';

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
    responseTime: number; // Average response time in ms
}

export interface AIRequest {
    model: string;
    prompt: string;
    userId: string;
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

export class AIService {
    private openai: OpenAI;
    private anthropic: Anthropic;
    private google: GoogleGenerativeAI;
    private cohere: any;
    private huggingface: HfInference;
    private replicate: Replicate;
    private models: Map<string, AIModel> = new Map();

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        this.google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

        this.cohere = new Cohere({
            apiKey: process.env.COHERE_API_KEY,
        });

        this.huggingface = new HfInference(process.env.HUGGINGFACE_API_KEY);

        this.replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        this.initializeModels();
    }

    private initializeModels(): void {
        const modelDefinitions: AIModel[] = [
            // OpenAI Models
            {
                id: 'gpt-4o',
                name: 'GPT-4o',
                provider: 'openai',
                type: 'multimodal',
                capabilities: ['text', 'image', 'code', 'reasoning'],
                maxTokens: 128000,
                costPerToken: 0.00003,
                isActive: true,
                description: 'Most advanced GPT-4 model with vision capabilities',
                version: '2024-05-13',
                contextWindow: 128000,
                supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
                temperatureRange: { min: 0, max: 2 },
                responseTime: 2000
            },
            {
                id: 'gpt-4o-mini',
                name: 'GPT-4o Mini',
                provider: 'openai',
                type: 'text',
                capabilities: ['text', 'code', 'reasoning'],
                maxTokens: 128000,
                costPerToken: 0.00000015,
                isActive: true,
                description: 'Faster and cheaper GPT-4 model',
                version: '2024-07-18',
                contextWindow: 128000,
                supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
                temperatureRange: { min: 0, max: 2 },
                responseTime: 1000
            },
            {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                provider: 'openai',
                type: 'text',
                capabilities: ['text', 'code'],
                maxTokens: 16384,
                costPerToken: 0.0000005,
                isActive: true,
                description: 'Fast and efficient text generation',
                version: '2024-02-15',
                contextWindow: 16384,
                supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
                temperatureRange: { min: 0, max: 2 },
                responseTime: 800
            },
            // Anthropic Models
            {
                id: 'claude-3-5-sonnet-20241022',
                name: 'Claude 3.5 Sonnet',
                provider: 'anthropic',
                type: 'text',
                capabilities: ['text', 'code', 'reasoning', 'analysis'],
                maxTokens: 200000,
                costPerToken: 0.000003,
                isActive: true,
                description: 'Most capable Claude model for complex tasks',
                version: '2024-10-22',
                contextWindow: 200000,
                supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
                temperatureRange: { min: 0, max: 1 },
                responseTime: 1500
            },
            {
                id: 'claude-3-5-haiku-20241022',
                name: 'Claude 3.5 Haiku',
                provider: 'anthropic',
                type: 'text',
                capabilities: ['text', 'code'],
                maxTokens: 200000,
                costPerToken: 0.00000025,
                isActive: true,
                description: 'Fast and efficient Claude model',
                version: '2024-10-22',
                contextWindow: 200000,
                supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
                temperatureRange: { min: 0, max: 1 },
                responseTime: 600
            },
            // Google Models
            {
                id: 'gemini-1.5-pro',
                name: 'Gemini 1.5 Pro',
                provider: 'google',
                type: 'multimodal',
                capabilities: ['text', 'image', 'code', 'reasoning'],
                maxTokens: 1000000,
                costPerToken: 0.00000125,
                isActive: true,
                description: 'Google\'s most advanced multimodal model',
                version: '1.5',
                contextWindow: 1000000,
                supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
                temperatureRange: { min: 0, max: 2 },
                responseTime: 1800
            },
            {
                id: 'gemini-1.5-flash',
                name: 'Gemini 1.5 Flash',
                provider: 'google',
                type: 'text',
                capabilities: ['text', 'code'],
                maxTokens: 1000000,
                costPerToken: 0.000000075,
                isActive: true,
                description: 'Fast and efficient Gemini model',
                version: '1.5',
                contextWindow: 1000000,
                supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
                temperatureRange: { min: 0, max: 2 },
                responseTime: 700
            },
            // Cohere Models
            {
                id: 'command-r-plus',
                name: 'Command R+',
                provider: 'cohere',
                type: 'text',
                capabilities: ['text', 'code', 'reasoning'],
                maxTokens: 128000,
                costPerToken: 0.000003,
                isActive: true,
                description: 'Cohere\'s most capable model for complex reasoning',
                version: '1.0',
                contextWindow: 128000,
                supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
                temperatureRange: { min: 0, max: 1 },
                responseTime: 1200
            },
            // Hugging Face Models
            {
                id: 'meta-llama/Llama-2-70b-chat-hf',
                name: 'Llama 2 70B Chat',
                provider: 'huggingface',
                type: 'text',
                capabilities: ['text', 'code'],
                maxTokens: 4096,
                costPerToken: 0.0000007,
                isActive: true,
                description: 'Open source Llama 2 model',
                version: '2.0',
                contextWindow: 4096,
                supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
                temperatureRange: { min: 0, max: 1 },
                responseTime: 3000
            }
        ];

        modelDefinitions.forEach(model => {
            this.models.set(model.id, model);
        });
    }

    async generateResponse(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();

        try {
            // Check cache first
            const cacheKey = cacheService.generateAICacheKey(
                request.model,
                request.prompt,
                request.userId
            );

            const cachedResponse = await cacheService.get(cacheKey);
            if (cachedResponse) {
                const response = JSON.parse(cachedResponse);
                response.metadata.cached = true;
                return response;
            }

            // Get model configuration
            const model = this.models.get(request.model);
            if (!model || !model.isActive) {
                throw new Error(`Model ${request.model} not available`);
            }

            // Validate request
            this.validateRequest(request, model);

            // Generate response based on provider
            let response: AIResponse;
            switch (model.provider) {
                case 'openai':
                    response = await this.generateOpenAIResponse(request, model);
                    break;
                case 'anthropic':
                    response = await this.generateAnthropicResponse(request, model);
                    break;
                case 'google':
                    response = await this.generateGoogleResponse(request, model);
                    break;
                case 'cohere':
                    response = await this.generateCohereResponse(request, model);
                    break;
                case 'huggingface':
                    response = await this.generateHuggingFaceResponse(request, model);
                    break;
                default:
                    throw new Error(`Unsupported provider: ${model.provider}`);
            }

            // Add metadata
            response.metadata = {
                responseTime: Date.now() - startTime,
                timestamp: new Date(),
                cached: false
            };

            // Cache response
            await cacheService.set(
                cacheKey,
                JSON.stringify(response),
                3600 // 1 hour
            );

            // Update user usage
            await this.updateUserUsage(request.userId, response.usage);

            // Log request
            logger.info(`AI request completed: ${request.model} for user ${request.userId}`);

            return response;
        } catch (error) {
            logger.error('AI generation error:', error);
            throw error;
        }
    }

    private async generateOpenAIResponse(request: AIRequest, model: AIModel): Promise<AIResponse> {
        const messages = [];

        if (request.options?.systemPrompt) {
            messages.push({ role: 'system', content: request.options.systemPrompt });
        }

        messages.push({ role: 'user', content: request.prompt });

        const response = await this.openai.chat.completions.create({
            model: request.model,
            messages,
            max_tokens: request.options?.maxTokens || model.maxTokens,
            temperature: request.options?.temperature || 0.7,
            top_p: request.options?.topP || 1,
            frequency_penalty: request.options?.frequencyPenalty || 0,
            presence_penalty: request.options?.presencePenalty || 0,
            stop: request.options?.stop,
            stream: request.options?.stream || false
        });

        const usage = response.usage!;
        const cost = usage.total_tokens * model.costPerToken;

        return {
            content: response.choices[0].message.content || '',
            model: request.model,
            usage: {
                promptTokens: usage.prompt_tokens,
                completionTokens: usage.completion_tokens,
                totalTokens: usage.total_tokens,
                cost
            },
            metadata: {
                responseTime: 0,
                timestamp: new Date(),
                cached: false
            }
        };
    }

    private async generateAnthropicResponse(request: AIRequest, model: AIModel): Promise<AIResponse> {
        const response = await this.anthropic.messages.create({
            model: request.model,
            max_tokens: request.options?.maxTokens || model.maxTokens,
            temperature: request.options?.temperature || 0.7,
            system: request.options?.systemPrompt || 'You are a helpful AI assistant.',
            messages: [{ role: 'user', content: request.prompt }]
        });

        const usage = response.usage;
        const cost = usage.input_tokens * model.costPerToken + usage.output_tokens * model.costPerToken;

        return {
            content: response.content[0].text,
            model: request.model,
            usage: {
                promptTokens: usage.input_tokens,
                completionTokens: usage.output_tokens,
                totalTokens: usage.input_tokens + usage.output_tokens,
                cost
            },
            metadata: {
                responseTime: 0,
                timestamp: new Date(),
                cached: false
            }
        };
    }

    private async generateGoogleResponse(request: AIRequest, model: AIModel): Promise<AIResponse> {
        const genAI = this.google.getGenerativeModel({ model: request.model });

        const generationConfig = {
            temperature: request.options?.temperature || 0.7,
            topP: request.options?.topP || 1,
            maxOutputTokens: request.options?.maxTokens || model.maxTokens,
        };

        const result = await genAI.generateContent({
            contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
            generationConfig
        });

        const response = await result.response;
        const text = response.text();

        // Estimate token usage (Google doesn't provide exact counts)
        const estimatedTokens = Math.ceil(text.length / 4);
        const cost = estimatedTokens * model.costPerToken;

        return {
            content: text,
            model: request.model,
            usage: {
                promptTokens: Math.ceil(request.prompt.length / 4),
                completionTokens: estimatedTokens,
                totalTokens: Math.ceil(request.prompt.length / 4) + estimatedTokens,
                cost
            },
            metadata: {
                responseTime: 0,
                timestamp: new Date(),
                cached: false
            }
        };
    }

    private async generateCohereResponse(request: AIRequest, model: AIModel): Promise<AIResponse> {
        const response = await this.cohere.generate({
            model: request.model,
            prompt: request.prompt,
            max_tokens: request.options?.maxTokens || model.maxTokens,
            temperature: request.options?.temperature || 0.7,
            p: request.options?.topP || 1,
            frequency_penalty: request.options?.frequencyPenalty || 0,
            presence_penalty: request.options?.presencePenalty || 0,
            stop_sequences: request.options?.stop || []
        });

        const usage = response.meta;
        const cost = usage.tokens.input_tokens * model.costPerToken + usage.tokens.output_tokens * model.costPerToken;

        return {
            content: response.generations[0].text,
            model: request.model,
            usage: {
                promptTokens: usage.tokens.input_tokens,
                completionTokens: usage.tokens.output_tokens,
                totalTokens: usage.tokens.input_tokens + usage.tokens.output_tokens,
                cost
            },
            metadata: {
                responseTime: 0,
                timestamp: new Date(),
                cached: false
            }
        };
    }

    private async generateHuggingFaceResponse(request: AIRequest, model: AIModel): Promise<AIResponse> {
        const response = await this.huggingface.textGeneration({
            model: request.model,
            inputs: request.prompt,
            parameters: {
                max_new_tokens: request.options?.maxTokens || model.maxTokens,
                temperature: request.options?.temperature || 0.7,
                top_p: request.options?.topP || 1,
                do_sample: true,
                return_full_text: false
            }
        });

        const text = response[0].generated_text;
        const estimatedTokens = Math.ceil(text.length / 4);
        const cost = estimatedTokens * model.costPerToken;

        return {
            content: text,
            model: request.model,
            usage: {
                promptTokens: Math.ceil(request.prompt.length / 4),
                completionTokens: estimatedTokens,
                totalTokens: Math.ceil(request.prompt.length / 4) + estimatedTokens,
                cost
            },
            metadata: {
                responseTime: 0,
                timestamp: new Date(),
                cached: false
            }
        };
    }

    private validateRequest(request: AIRequest, model: AIModel): void {
        if (request.prompt.length > model.contextWindow) {
            throw new Error('Prompt exceeds model context window');
        }

        if (request.options?.maxTokens && request.options.maxTokens > model.maxTokens) {
            throw new Error('Max tokens exceeds model limit');
        }

        if (request.options?.temperature) {
            const { min, max } = model.temperatureRange;
            if (request.options.temperature < min || request.options.temperature > max) {
                throw new Error(`Temperature must be between ${min} and ${max}`);
            }
        }
    }

    private async updateUserUsage(userId: string, usage: any): Promise<void> {
        try {
            const user = await User.findById(userId);
            if (user) {
                user.totalTokensUsed = (user.totalTokensUsed || 0) + usage.totalTokens;
                user.totalCost = (user.totalCost || 0) + usage.cost;
                user.lastAIActivity = new Date();
                await user.save();
            }
        } catch (error) {
            logger.error('Error updating user usage:', error);
        }
    }

    // Model management methods
    getAvailableModels(): AIModel[] {
        return Array.from(this.models.values()).filter(model => model.isActive);
    }

    getModelById(id: string): AIModel | undefined {
        return this.models.get(id);
    }

    async compareModels(prompt: string, modelIds: string[], userId: string): Promise<AIResponse[]> {
        const responses: AIResponse[] = [];

        for (const modelId of modelIds) {
            try {
                const response = await this.generateResponse({
                    model: modelId,
                    prompt,
                    userId,
                    options: { temperature: 0.7 }
                });
                responses.push(response);
            } catch (error) {
                logger.error(`Error comparing model ${modelId}:`, error);
            }
        }

        return responses;
    }

    async getModelPerformance(): Promise<Record<string, any>> {
        const performance: Record<string, any> = {};

        for (const [id, model] of this.models) {
            performance[id] = {
                name: model.name,
                provider: model.provider,
                averageResponseTime: model.responseTime,
                costPerToken: model.costPerToken,
                maxTokens: model.maxTokens,
                capabilities: model.capabilities
            };
        }

        return performance;
    }
}

export const aiService = new AIService();

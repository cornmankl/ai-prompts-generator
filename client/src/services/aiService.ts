// AI Service for handling all AI-related operations
export interface AIPromptRequest {
    prompt: string
    context?: string
    model?: string
    temperature?: number
    maxTokens?: number
    systemMessage?: string
}

export interface AIPromptResponse {
    generatedPrompt: string
    confidence: number
    suggestions: string[]
    metadata: {
        model: string
        tokensUsed: number
        processingTime: number
    }
}

export interface PromptOptimizationRequest {
    originalPrompt: string
    targetModel: string
    optimizationType: 'clarity' | 'conciseness' | 'creativity' | 'accuracy'
    context?: string
}

export interface ContextAnalysisRequest {
    prompt: string
    context: string
    domain?: string
}

export interface ContextAnalysisResponse {
    relevanceScore: number
    contextSuggestions: string[]
    missingContext: string[]
    domainSpecific: boolean
}

class AIService {
    private baseURL: string
    private apiKey: string

    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    }

    // Generate AI-optimized prompt
    async generatePrompt(request: AIPromptRequest): Promise<AIPromptResponse> {
        try {
            const response = await fetch(`${this.baseURL}/ai/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(request)
            })

            if (!response.ok) {
                throw new Error(`AI service error: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error generating prompt:', error)
            throw error
        }
    }

    // Optimize existing prompt
    async optimizePrompt(request: PromptOptimizationRequest): Promise<AIPromptResponse> {
        try {
            const response = await fetch(`${this.baseURL}/ai/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(request)
            })

            if (!response.ok) {
                throw new Error(`AI optimization error: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error optimizing prompt:', error)
            throw error
        }
    }

    // Analyze context relevance
    async analyzeContext(request: ContextAnalysisRequest): Promise<ContextAnalysisResponse> {
        try {
            const response = await fetch(`${this.baseURL}/ai/analyze-context`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(request)
            })

            if (!response.ok) {
                throw new Error(`Context analysis error: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error analyzing context:', error)
            throw error
        }
    }

    // Get available AI models
    async getAvailableModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.baseURL}/ai/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            })

            if (!response.ok) {
                throw new Error(`Models fetch error: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching models:', error)
            return ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku']
        }
    }

    // Batch process multiple prompts
    async batchProcess(requests: AIPromptRequest[]): Promise<AIPromptResponse[]> {
        try {
            const response = await fetch(`${this.baseURL}/ai/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({ requests })
            })

            if (!response.ok) {
                throw new Error(`Batch processing error: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error in batch processing:', error)
            throw error
        }
    }

    // Get prompt suggestions based on input
    async getSuggestions(input: string, type: 'completion' | 'improvement' | 'variation'): Promise<string[]> {
        try {
            const response = await fetch(`${this.baseURL}/ai/suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({ input, type })
            })

            if (!response.ok) {
                throw new Error(`Suggestions error: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error getting suggestions:', error)
            return []
        }
    }

    // Validate prompt quality
    async validatePrompt(prompt: string): Promise<{
        score: number
        issues: string[]
        suggestions: string[]
    }> {
        try {
            const response = await fetch(`${this.baseURL}/ai/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({ prompt })
            })

            if (!response.ok) {
                throw new Error(`Validation error: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error validating prompt:', error)
            return {
                score: 0,
                issues: ['Unable to validate prompt'],
                suggestions: []
            }
        }
    }
}

export const aiService = new AIService()
export default aiService

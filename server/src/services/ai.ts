import axios from 'axios'
import { Logger } from 'winston'

export interface AIModel {
  id: string
  name: string
  provider: string
  type: 'text' | 'image' | 'code'
  capabilities: string[]
  maxTokens: number
  costPerToken: number
  isFree: boolean
}

export interface AIRequest {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
  systemMessage?: string
  context?: string
  enableChainOfThought?: boolean
  enableFewShot?: boolean
}

export interface AIResponse {
  content: string
  model: string
  tokensUsed: number
  processingTime: number
  confidence?: number
  suggestions?: string[]
}

export class AIService {
  private logger: Logger
  private models: AIModel[] = []
  private apiKeys: Map<string, string> = new Map()

  constructor(logger?: Logger) {
    this.logger = logger || console as any
    this.initializeApiKeys()
    this.initializeModels()
  }

  private initializeApiKeys(): void {
    const keys = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      glm: process.env.GLM_API_KEY,
      qwen: process.env.QWEN_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      moonshot: process.env.MOONSHOT_API_KEY,
      baichuan: process.env.BAICHUAN_API_KEY,
      internlm: process.env.INTERNLM_API_KEY
    }

    Object.entries(keys).forEach(([provider, key]) => {
      if (key) {
        this.apiKeys.set(provider, key)
      }
    })
  }

  private initializeModels(): void {
    this.models = [
      // OpenAI Models
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        type: 'text',
        capabilities: ['text-generation', 'analysis', 'reasoning'],
        maxTokens: 8192,
        costPerToken: 0.00003,
        isFree: false
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        type: 'text',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 4096,
        costPerToken: 0.000002,
        isFree: false
      },
      // Anthropic Models
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        type: 'text',
        capabilities: ['text-generation', 'analysis', 'reasoning'],
        maxTokens: 8192,
        costPerToken: 0.000015,
        isFree: false
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        type: 'text',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 4096,
        costPerToken: 0.0000025,
        isFree: false
      },
      // Free Models
      {
        id: 'glm-4-5',
        name: 'GLM-4.5',
        provider: 'glm',
        type: 'text',
        capabilities: ['text-generation', 'analysis', 'reasoning'],
        maxTokens: 8192,
        costPerToken: 0,
        isFree: true
      },
      {
        id: 'qwen-2.5-72b',
        name: 'QWEN 2.5 (72B)',
        provider: 'qwen',
        type: 'text',
        capabilities: ['text-generation', 'analysis', 'reasoning'],
        maxTokens: 8192,
        costPerToken: 0,
        isFree: true
      },
      {
        id: 'qwen-2.5-32b',
        name: 'QWEN 2.5 (32B)',
        provider: 'qwen',
        type: 'text',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 4096,
        costPerToken: 0,
        isFree: true
      },
      {
        id: 'qwen-2.5-14b',
        name: 'QWEN 2.5 (14B)',
        provider: 'qwen',
        type: 'text',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 4096,
        costPerToken: 0,
        isFree: true
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        provider: 'deepseek',
        type: 'code',
        capabilities: ['code-generation', 'code-analysis', 'debugging'],
        maxTokens: 8192,
        costPerToken: 0,
        isFree: true
      },
      {
        id: 'moonshot-v1',
        name: 'Moonshot v1',
        provider: 'moonshot',
        type: 'text',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 4096,
        costPerToken: 0,
        isFree: true
      },
      {
        id: 'baichuan2-turbo',
        name: 'Baichuan2 Turbo',
        provider: 'baichuan',
        type: 'text',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 4096,
        costPerToken: 0,
        isFree: true
      },
      {
        id: 'internlm2-chat',
        name: 'InternLM2 Chat',
        provider: 'internlm',
        type: 'text',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 4096,
        costPerToken: 0,
        isFree: true
      }
    ]
  }

  async initialize(): Promise<void> {
    this.logger.info('AI Service initialized with models:', this.models.length)
  }

  getAvailableModels(): AIModel[] {
    return this.models.filter(model => this.apiKeys.has(model.provider))
  }

  getFreeModels(): AIModel[] {
    return this.models.filter(model => model.isFree && this.apiKeys.has(model.provider))
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now()
    const model = this.models.find(m => m.id === request.model) || this.models[0]
    
    if (!this.apiKeys.has(model.provider)) {
      throw new Error(`API key not configured for provider: ${model.provider}`)
    }

    try {
      let response: AIResponse

      switch (model.provider) {
        case 'openai':
          response = await this.callOpenAI(request, model)
          break
        case 'anthropic':
          response = await this.callAnthropic(request, model)
          break
        case 'glm':
          response = await this.callGLM(request, model)
          break
        case 'qwen':
          response = await this.callQWEN(request, model)
          break
        case 'deepseek':
          response = await this.callDeepSeek(request, model)
          break
        case 'moonshot':
          response = await this.callMoonshot(request, model)
          break
        case 'baichuan':
          response = await this.callBaichuan(request, model)
          break
        case 'internlm':
          response = await this.callInternLM(request, model)
          break
        default:
          throw new Error(`Unsupported provider: ${model.provider}`)
      }

      response.processingTime = Date.now() - startTime
      return response

    } catch (error) {
      this.logger.error(`Error generating text with ${model.id}:`, error)
      throw error
    }
  }

  private async callOpenAI(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const apiKey = this.apiKeys.get('openai')!
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model.id,
      messages: [
        ...(request.systemMessage ? [{ role: 'system', content: request.systemMessage }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || model.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      content: response.data.choices[0].message.content,
      model: model.id,
      tokensUsed: response.data.usage.total_tokens
    } as AIResponse
  }

  private async callAnthropic(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const apiKey = this.apiKeys.get('anthropic')!
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: model.id,
      max_tokens: request.maxTokens || model.maxTokens,
      temperature: request.temperature || 0.7,
      messages: [
        { role: 'user', content: request.prompt }
      ],
      ...(request.systemMessage && { system: request.systemMessage })
    }, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    })

    return {
      content: response.data.content[0].text,
      model: model.id,
      tokensUsed: response.data.usage.input_tokens + response.data.usage.output_tokens
    } as AIResponse
  }

  private async callGLM(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const apiKey = this.apiKeys.get('glm')!
    
    const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      model: model.id,
      messages: [
        ...(request.systemMessage ? [{ role: 'system', content: request.systemMessage }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || model.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      content: response.data.choices[0].message.content,
      model: model.id,
      tokensUsed: response.data.usage.total_tokens
    } as AIResponse
  }

  private async callQWEN(request: AIRequest, model: AIModel): Promise<AIResponse> {
    // QWEN API implementation
    const apiKey = this.apiKeys.get('qwen')!
    
    const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      model: model.id,
      input: {
        messages: [
          ...(request.systemMessage ? [{ role: 'system', content: request.systemMessage }] : []),
          { role: 'user', content: request.prompt }
        ]
      },
      parameters: {
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens
      }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      content: response.data.output.text,
      model: model.id,
      tokensUsed: response.data.usage.total_tokens
    } as AIResponse
  }

  private async callDeepSeek(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const apiKey = this.apiKeys.get('deepseek')!
    
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: model.id,
      messages: [
        ...(request.systemMessage ? [{ role: 'system', content: request.systemMessage }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || model.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      content: response.data.choices[0].message.content,
      model: model.id,
      tokensUsed: response.data.usage.total_tokens
    } as AIResponse
  }

  private async callMoonshot(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const apiKey = this.apiKeys.get('moonshot')!
    
    const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
      model: model.id,
      messages: [
        ...(request.systemMessage ? [{ role: 'system', content: request.systemMessage }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || model.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      content: response.data.choices[0].message.content,
      model: model.id,
      tokensUsed: response.data.usage.total_tokens
    } as AIResponse
  }

  private async callBaichuan(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const apiKey = this.apiKeys.get('baichuan')!
    
    const response = await axios.post('https://api.baichuan-ai.com/v1/chat/completions', {
      model: model.id,
      messages: [
        ...(request.systemMessage ? [{ role: 'system', content: request.systemMessage }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || model.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      content: response.data.choices[0].message.content,
      model: model.id,
      tokensUsed: response.data.usage.total_tokens
    } as AIResponse
  }

  private async callInternLM(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const apiKey = this.apiKeys.get('internlm')!
    
    const response = await axios.post('https://api.internlm.ai/v1/chat/completions', {
      model: model.id,
      messages: [
        ...(request.systemMessage ? [{ role: 'system', content: request.systemMessage }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || model.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      content: response.data.choices[0].message.content,
      model: model.id,
      tokensUsed: response.data.usage.total_tokens
    } as AIResponse
  }

  async optimizePrompt(prompt: string, targetModel: string, optimizationType: string): Promise<AIResponse> {
    const optimizationPrompt = this.buildOptimizationPrompt(prompt, optimizationType)
    
    return await this.generateText({
      prompt: optimizationPrompt,
      model: targetModel,
      systemMessage: 'You are an expert prompt engineer. Optimize the given prompt for better results.'
    })
  }

  private buildOptimizationPrompt(prompt: string, type: string): string {
    const optimizationInstructions = {
      clarity: 'Make this prompt clearer and more specific',
      conciseness: 'Make this prompt more concise while maintaining effectiveness',
      creativity: 'Enhance this prompt to generate more creative outputs',
      accuracy: 'Improve this prompt for more accurate and precise results'
    }

    return `${optimizationInstructions[type as keyof typeof optimizationInstructions]}: ${prompt}`
  }

  async analyzeContext(prompt: string, context: string): Promise<{
    relevanceScore: number
    contextSuggestions: string[]
    missingContext: string[]
    domainSpecific: boolean
  }> {
    const analysisPrompt = `Analyze the relevance of this context to the prompt:

Prompt: ${prompt}
Context: ${context}

Provide:
1. Relevance score (0-100)
2. Context suggestions for improvement
3. Missing context elements
4. Whether this is domain-specific

Format as JSON.`

    const response = await this.generateText({
      prompt: analysisPrompt,
      model: 'glm-4-5',
      systemMessage: 'You are an expert at analyzing context relevance. Respond with valid JSON only.'
    })

    try {
      return JSON.parse(response.content)
    } catch (error) {
      return {
        relevanceScore: 50,
        contextSuggestions: ['Improve context clarity'],
        missingContext: ['Additional domain knowledge'],
        domainSpecific: false
      }
    }
  }
}
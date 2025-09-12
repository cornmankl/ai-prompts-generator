import { useAnalytics } from '../hooks/useAnalytics'

// FREE AI Models Configuration
export interface AIModel {
  id: string
  name: string
  provider: string
  apiEndpoint: string
  apiKey?: string
  isFree: boolean
  maxTokens: number
  costPerToken: number
  capabilities: string[]
  description: string
  icon: string
  status: 'active' | 'inactive' | 'maintenance'
}

export interface AIRequest {
  prompt: string
  model: string
  temperature?: number
  maxTokens?: number
  context?: string
  systemPrompt?: string
  examples?: Array<{ input: string; output: string }>
  chainOfThought?: boolean
  fewShot?: boolean
}

export interface AIResponse {
  content: string
  model: string
  tokens: number
  cost: number
  latency: number
  timestamp: Date
  metadata?: Record<string, any>
}

// FREE AI Models Registry
export const FREE_AI_MODELS: AIModel[] = [
  {
    id: 'glm-4-5',
    name: 'GLM-4.5',
    provider: 'Zhipu AI',
    apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    isFree: true,
    maxTokens: 8192,
    costPerToken: 0,
    capabilities: ['text-generation', 'reasoning', 'code', 'creative-writing'],
    description: 'Advanced Chinese language model with strong reasoning capabilities',
    icon: '🧠',
    status: 'active'
  },
  {
    id: 'qwen-2-5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'Alibaba Cloud',
    apiEndpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    isFree: true,
    maxTokens: 8192,
    costPerToken: 0,
    capabilities: ['text-generation', 'multilingual', 'reasoning', 'code'],
    description: 'Large-scale multilingual model with excellent performance',
    icon: '🌟',
    status: 'active'
  },
  {
    id: 'qwen-2-5-32b',
    name: 'Qwen 2.5 32B',
    provider: 'Alibaba Cloud',
    apiEndpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    isFree: true,
    maxTokens: 4096,
    costPerToken: 0,
    capabilities: ['text-generation', 'multilingual', 'reasoning'],
    description: 'Balanced performance and efficiency model',
    icon: '⚡',
    status: 'active'
  },
  {
    id: 'qwen-2-5-14b',
    name: 'Qwen 2.5 14B',
    provider: 'Alibaba Cloud',
    apiEndpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    isFree: true,
    maxTokens: 2048,
    costPerToken: 0,
    capabilities: ['text-generation', 'multilingual'],
    description: 'Fast and efficient model for quick responses',
    icon: '🚀',
    status: 'active'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    isFree: true,
    maxTokens: 4096,
    costPerToken: 0,
    capabilities: ['code-generation', 'code-review', 'debugging', 'refactoring'],
    description: 'Specialized code generation and analysis model',
    icon: '💻',
    status: 'active'
  },
  {
    id: 'moonshot-v1',
    name: 'Moonshot v1',
    provider: 'Moonshot AI',
    apiEndpoint: 'https://api.moonshot.cn/v1/chat/completions',
    isFree: true,
    maxTokens: 8192,
    costPerToken: 0,
    capabilities: ['text-generation', 'reasoning', 'creative-writing'],
    description: 'Advanced reasoning and creative writing model',
    icon: '🌙',
    status: 'active'
  },
  {
    id: 'baichuan2-turbo',
    name: 'Baichuan2 Turbo',
    provider: 'Baichuan AI',
    apiEndpoint: 'https://api.baichuan-ai.com/v1/chat/completions',
    isFree: true,
    maxTokens: 4096,
    costPerToken: 0,
    capabilities: ['text-generation', 'multilingual', 'reasoning'],
    description: 'High-performance multilingual model',
    icon: '🌊',
    status: 'active'
  },
  {
    id: 'internlm2-chat',
    name: 'InternLM2 Chat',
    provider: 'Shanghai AI Laboratory',
    apiEndpoint: 'https://openxlab.org.cn/gw/llm/v1/chat/completions',
    isFree: true,
    maxTokens: 2048,
    costPerToken: 0,
    capabilities: ['text-generation', 'reasoning', 'multilingual'],
    description: 'Open-source conversational AI model',
    icon: '🔬',
    status: 'active'
  }
]

// AI Orchestration Engine
export class AIOrchestrationEngine {
  private models: Map<string, AIModel> = new Map()
  private analytics: any

  constructor() {
    // Initialize models
    FREE_AI_MODELS.forEach(model => {
      this.models.set(model.id, model)
    })
  }

  // Get available models
  getAvailableModels(): AIModel[] {
    return Array.from(this.models.values()).filter(model => model.status === 'active')
  }

  // Get model by ID
  getModel(id: string): AIModel | undefined {
    return this.models.get(id)
  }

  // Generate response using specific model
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const model = this.getModel(request.model)
    if (!model) {
      throw new Error(`Model ${request.model} not found`)
    }

    const startTime = Date.now()
    
    try {
      let response: AIResponse

      switch (model.provider) {
        case 'Zhipu AI':
          response = await this.callGLM4_5(request, model)
          break
        case 'Alibaba Cloud':
          response = await this.callQwen(request, model)
          break
        case 'DeepSeek':
          response = await this.callDeepSeek(request, model)
          break
        case 'Moonshot AI':
          response = await this.callMoonshot(request, model)
          break
        case 'Baichuan AI':
          response = await this.callBaichuan(request, model)
          break
        case 'Shanghai AI Laboratory':
          response = await this.callInternLM2(request, model)
          break
        default:
          throw new Error(`Unsupported provider: ${model.provider}`)
      }

      const latency = Date.now() - startTime
      response.latency = latency

      // Track analytics
      if (this.analytics) {
        this.analytics.trackPromptGeneration(model.name, response.tokens)
      }

      return response
    } catch (error) {
      console.error(`Error calling ${model.name}:`, error)
      throw error
    }
  }

  // Chain of Thought prompting
  async generateWithChainOfThought(request: AIRequest): Promise<AIResponse> {
    const chainPrompt = `Let's think step by step.

${request.systemPrompt || 'You are a helpful AI assistant.'}

User: ${request.prompt}

Please provide your reasoning process step by step, then give your final answer.`

    return this.generateResponse({
      ...request,
      prompt: chainPrompt
    })
  }

  // Few-shot learning
  async generateWithFewShot(request: AIRequest): Promise<AIResponse> {
    if (!request.examples || request.examples.length === 0) {
      return this.generateResponse(request)
    }

    let fewShotPrompt = `${request.systemPrompt || 'You are a helpful AI assistant.'}\n\n`
    
    request.examples.forEach((example, index) => {
      fewShotPrompt += `Example ${index + 1}:\n`
      fewShotPrompt += `Input: ${example.input}\n`
      fewShotPrompt += `Output: ${example.output}\n\n`
    })

    fewShotPrompt += `Now, please respond to this input:\n${request.prompt}`

    return this.generateResponse({
      ...request,
      prompt: fewShotPrompt
    })
  }

  // Multi-model consensus
  async generateWithConsensus(request: AIRequest, models: string[]): Promise<AIResponse[]> {
    const promises = models.map(modelId => 
      this.generateResponse({ ...request, model: modelId })
    )

    return Promise.all(promises)
  }

  // Model-specific implementations
  private async callGLM4_5(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const response = await fetch(model.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey || process.env.REACT_APP_GLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          { role: 'system', content: request.systemPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens
      })
    })

    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      model: model.name,
      tokens: data.usage?.total_tokens || 0,
      cost: 0, // Free model
      latency: 0, // Will be set by caller
      timestamp: new Date(),
      metadata: data
    }
  }

  private async callQwen(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const response = await fetch(model.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey || process.env.REACT_APP_QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: model.id,
        input: {
          messages: [
            { role: 'system', content: request.systemPrompt || 'You are a helpful AI assistant.' },
            { role: 'user', content: request.prompt }
          ]
        },
        parameters: {
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || model.maxTokens
        }
      })
    })

    const data = await response.json()
    
    return {
      content: data.output.text,
      model: model.name,
      tokens: data.usage?.total_tokens || 0,
      cost: 0, // Free model
      latency: 0,
      timestamp: new Date(),
      metadata: data
    }
  }

  private async callDeepSeek(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const response = await fetch(model.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey || process.env.REACT_APP_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-coder',
        messages: [
          { role: 'system', content: request.systemPrompt || 'You are a helpful coding assistant.' },
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens
      })
    })

    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      model: model.name,
      tokens: data.usage?.total_tokens || 0,
      cost: 0,
      latency: 0,
      timestamp: new Date(),
      metadata: data
    }
  }

  private async callMoonshot(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const response = await fetch(model.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey || process.env.REACT_APP_MOONSHOT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          { role: 'system', content: request.systemPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens
      })
    })

    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      model: model.name,
      tokens: data.usage?.total_tokens || 0,
      cost: 0,
      latency: 0,
      timestamp: new Date(),
      metadata: data
    }
  }

  private async callBaichuan(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const response = await fetch(model.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey || process.env.REACT_APP_BAICHUAN_API_KEY}`
      },
      body: JSON.stringify({
        model: 'Baichuan2-Turbo',
        messages: [
          { role: 'system', content: request.systemPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens
      })
    })

    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      model: model.name,
      tokens: data.usage?.total_tokens || 0,
      cost: 0,
      latency: 0,
      timestamp: new Date(),
      metadata: data
    }
  }

  private async callInternLM2(request: AIRequest, model: AIModel): Promise<AIResponse> {
    const response = await fetch(model.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey || process.env.REACT_APP_INTERNLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'internlm2-chat-7b',
        messages: [
          { role: 'system', content: request.systemPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens
      })
    })

    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      model: model.name,
      tokens: data.usage?.total_tokens || 0,
      cost: 0,
      latency: 0,
      timestamp: new Date(),
      metadata: data
    }
  }

  // Set analytics instance
  setAnalytics(analytics: any) {
    this.analytics = analytics
  }
}

// Export singleton instance
export const aiOrchestration = new AIOrchestrationEngine()

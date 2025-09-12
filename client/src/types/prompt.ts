export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  category: PromptCategory
  tags: string[]
  author: {
    id: string
    name: string
    avatar?: string
  }
  metadata: {
    version: string
    createdAt: Date
    updatedAt: Date
    views: number
    likes: number
    downloads: number
    rating: number
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    estimatedTime: number // in minutes
    language: string
    framework?: string
    model: string[]
  }
  context: {
    variables: PromptVariable[]
    examples: PromptExample[]
    instructions: string
    constraints: string[]
  }
  isPublic: boolean
  isTemplate: boolean
  isFavorite: boolean
  collaborators: string[]
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canShare: boolean
  }
}

export interface PromptCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  parentId?: string
  children?: PromptCategory[]
}

export interface PromptVariable {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea'
  label: string
  description: string
  required: boolean
  defaultValue?: any
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface PromptExample {
  id: string
  title: string
  input: Record<string, any>
  output: string
  description?: string
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: string
  variables: PromptVariable[]
  template: string
  examples: PromptExample[]
  isPublic: boolean
  author: string
  createdAt: Date
  updatedAt: Date
}

export interface ContextRule {
  id: string
  name: string
  description: string
  condition: string
  action: 'add' | 'modify' | 'remove'
  content: string
  priority: number
  isActive: boolean
}

export interface ContextProfile {
  id: string
  name: string
  description: string
  rules: ContextRule[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PromptGenerationRequest {
  template: string
  variables: Record<string, any>
  contextProfile?: string
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface PromptGenerationResponse {
  id: string
  content: string
  metadata: {
    model: string
    tokens: number
    time: number
    cost: number
  }
  alternatives?: string[]
  suggestions?: string[]
}

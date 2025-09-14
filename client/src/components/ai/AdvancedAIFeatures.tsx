import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain,
    Zap,
    Target,
    ArrowRight,
    ArrowDown,
    Play,
    Pause,
    RotateCcw,
    Settings,
    Save,
    Download,
    Upload,
    Copy,
    Check,
    X,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Sparkles,
    Lightbulb,
    BookOpen,
    Code,
    MessageSquare,
    BarChart3,
    TrendingUp,
    Clock,
    Cpu,
    Wifi,
    WifiOff
} from 'lucide-react'
import { aiOrchestration, AIRequest, FREE_AI_MODELS } from '../../services/aiOrchestration'
import { useToast } from '../common/EnhancedToast'
import { useAnalytics } from '../../hooks/useAnalytics'

interface ChainStep {
    id: string
    type: 'reasoning' | 'analysis' | 'synthesis' | 'conclusion'
    content: string
    confidence: number
    reasoning: string
    timestamp: Date
}

interface FewShotExample {
    id: string
    input: string
    output: string
    explanation: string
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
}

interface AIWorkflow {
    id: string
    name: string
    description: string
    steps: ChainStep[]
    examples: FewShotExample[]
    model: string
    temperature: number
    maxTokens: number
    isActive: boolean
}

const AdvancedAIFeatures: React.FC = () => {
    const [workflows, setWorkflows] = useState<AIWorkflow[]>([])
    const [activeWorkflow, setActiveWorkflow] = useState<AIWorkflow | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationProgress, setGenerationProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState<ChainStep | null>(null)
    const [selectedModel, setSelectedModel] = useState('glm-4-5')
    const [prompt, setPrompt] = useState('')
    const [response, setResponse] = useState('')
    const [showSettings, setShowSettings] = useState(false)
    const [isChainMode, setIsChainMode] = useState(true)
    const [isFewShotMode, setIsFewShotMode] = useState(false)
    const [examples, setExamples] = useState<FewShotExample[]>([])
    const [modelStatus, setModelStatus] = useState<Record<string, boolean>>({})

    const { success, error, info } = useToast()
    const { trackPromptGeneration, trackOptimization } = useAnalytics()

    // Initialize model status
    useEffect(() => {
        const status: Record<string, boolean> = {}
        FREE_AI_MODELS.forEach(model => {
            status[model.id] = model.status === 'active'
        })
        setModelStatus(status)
    }, [])

    // Create new workflow
    const createWorkflow = () => {
        const newWorkflow: AIWorkflow = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Workflow ${workflows.length + 1}`,
            description: 'Advanced AI workflow with chain of thought and few-shot learning',
            steps: [],
            examples: [],
            model: selectedModel,
            temperature: 0.7,
            maxTokens: 2000,
            isActive: false
        }

        setWorkflows([...workflows, newWorkflow])
        setActiveWorkflow(newWorkflow)
        success('Workflow Created', 'New AI workflow created successfully')
    }

    // Add chain step
    const addChainStep = (type: ChainStep['type']) => {
        if (!activeWorkflow) return

        const newStep: ChainStep = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: '',
            confidence: 0,
            reasoning: '',
            timestamp: new Date()
        }

        const updatedWorkflow = {
            ...activeWorkflow,
            steps: [...activeWorkflow.steps, newStep]
        }

        setActiveWorkflow(updatedWorkflow)
        setWorkflows(workflows.map(w => w.id === activeWorkflow.id ? updatedWorkflow : w))
    }

    // Add few-shot example
    const addExample = () => {
        const newExample: FewShotExample = {
            id: Math.random().toString(36).substr(2, 9),
            input: '',
            output: '',
            explanation: '',
            category: 'general',
            difficulty: 'medium'
        }

        setExamples([...examples, newExample])
    }

    // Update example
    const updateExample = (id: string, updates: Partial<FewShotExample>) => {
        setExamples(examples.map(ex => ex.id === id ? { ...ex, ...updates } : ex))
    }

    // Delete example
    const deleteExample = (id: string) => {
        setExamples(examples.filter(ex => ex.id !== id))
    }

    // Execute workflow
    const executeWorkflow = async () => {
        if (!activeWorkflow || !prompt) {
            error('Missing Input', 'Please select a workflow and enter a prompt')
            return
        }

        setIsGenerating(true)
        setGenerationProgress(0)
        setResponse('')

        try {
            let fullResponse = ''
            let currentStepIndex = 0

            // Execute chain of thought
            if (isChainMode && activeWorkflow.steps.length > 0) {
                for (const step of activeWorkflow.steps) {
                    setCurrentStep(step)
                    setGenerationProgress((currentStepIndex / activeWorkflow.steps.length) * 100)

                    const stepPrompt = `${step.content}\n\nUser: ${prompt}`
                    const request: AIRequest = {
                        prompt: stepPrompt,
                        model: selectedModel,
                        temperature: activeWorkflow.temperature,
                        maxTokens: Math.floor(activeWorkflow.maxTokens / activeWorkflow.steps.length),
                        systemPrompt: `You are an AI assistant specializing in ${step.type}. Provide detailed reasoning and analysis.`
                    }

                    const stepResponse = await aiOrchestration.generateWithChainOfThought(request)
                    fullResponse += `\n\n## ${step.type.toUpperCase()}\n${stepResponse.content}`

                    currentStepIndex++
                    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing time
                }
            }

            // Execute few-shot learning
            if (isFewShotMode && examples.length > 0) {
                const request: AIRequest = {
                    prompt,
                    model: selectedModel,
                    temperature: activeWorkflow.temperature,
                    maxTokens: activeWorkflow.maxTokens,
                    examples: examples.map(ex => ({ input: ex.input, output: ex.output })),
                    systemPrompt: 'You are an AI assistant. Use the provided examples to guide your response.'
                }

                const fewShotResponse = await aiOrchestration.generateWithFewShot(request)
                fullResponse += `\n\n## FEW-SHOT RESPONSE\n${fewShotResponse.content}`
            }

            // Final generation if no specific modes
            if (!isChainMode && !isFewShotMode) {
                const request: AIRequest = {
                    prompt,
                    model: selectedModel,
                    temperature: activeWorkflow.temperature,
                    maxTokens: activeWorkflow.maxTokens
                }

                const finalResponse = await aiOrchestration.generateResponse(request)
                fullResponse = finalResponse.content
            }

            setResponse(fullResponse)
            setGenerationProgress(100)

            // Track analytics
            trackPromptGeneration(selectedModel, fullResponse.length)
            trackOptimization('chain-of-thought', 95)

            success('Generation Complete', 'AI workflow executed successfully')
        } catch (err) {
            error('Generation Failed', 'Failed to execute AI workflow')
            console.error('Workflow execution error:', err)
        } finally {
            setIsGenerating(false)
            setCurrentStep(null)
        }
    }

    // Save workflow
    const saveWorkflow = () => {
        if (!activeWorkflow) return

        const updatedWorkflow = {
            ...activeWorkflow,
            examples: examples
        }

        setWorkflows(workflows.map(w => w.id === activeWorkflow.id ? updatedWorkflow : w))
        setActiveWorkflow(updatedWorkflow)
        success('Workflow Saved', 'Workflow saved successfully')
    }

    // Export workflow
    const exportWorkflow = () => {
        if (!activeWorkflow) return

        const data = {
            workflow: activeWorkflow,
            examples,
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '1.0'
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `workflow-${activeWorkflow.name}-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
        success('Workflow Exported', 'Workflow exported successfully')
    }

    // Import workflow
    const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string)
                setActiveWorkflow(data.workflow)
                setExamples(data.examples || [])
                success('Workflow Imported', 'Workflow imported successfully')
            } catch (err) {
                error('Import Failed', 'Failed to import workflow file')
            }
        }
        reader.readAsText(file)
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold gradient-text">Advanced AI Features</h1>
                        <div className="flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-sm ${isChainMode ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                Chain of Thought
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm ${isFewShotMode ? 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                Few-Shot Learning
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            onClick={saveWorkflow}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                        <button
                            onClick={exportWorkflow}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            accept=".json"
                            onChange={importWorkflow}
                            className="hidden"
                            id="import-workflow"
                        />
                        <label
                            htmlFor="import-workflow"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                        >
                            <Upload className="w-4 h-4" />
                        </label>
                        <button
                            onClick={createWorkflow}
                            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Workflow
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
                    {/* Model Selection */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">AI Models</h3>
                        <div className="space-y-2">
                            {FREE_AI_MODELS.map((model) => (
                                <div
                                    key={model.id}
                                    onClick={() => setSelectedModel(model.id)}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedModel === model.id
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{model.icon}</span>
                                            <div>
                                                <div className="font-medium text-sm">{model.name}</div>
                                                <div className="text-xs text-gray-500">{model.provider}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${modelStatus[model.id] ? 'bg-green-500' : 'bg-gray-400'
                                                }`} />
                                            <span className="text-xs text-gray-500">
                                                {model.maxTokens} tokens
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Workflow Steps */}
                    {activeWorkflow && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">Chain Steps</h3>
                                <button
                                    onClick={() => addChainStep('reasoning')}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {activeWorkflow.steps.map((step, index) => (
                                    <div key={step.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                                            <span className="text-sm font-medium capitalize">{step.type}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {step.content || 'No content'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Few-Shot Examples */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Examples</h3>
                            <button
                                onClick={addExample}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {examples.map((example) => (
                                <div key={example.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-500">{example.category}</span>
                                        <button
                                            onClick={() => deleteExample(example.id)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        <div className="font-medium">Input:</div>
                                        <div className="truncate">{example.input || 'No input'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Prompt Input */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Enter your prompt here..."
                                    className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={executeWorkflow}
                                    disabled={isGenerating || !prompt}
                                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {isGenerating ? (
                                        <RotateCcw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                                </button>
                                <div className="text-xs text-gray-500 text-center">
                                    {selectedModel}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Generation Progress */}
                    {isGenerating && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        {currentStep ? `Processing ${currentStep.type}...` : 'Generating response...'}
                                    </div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-1">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${generationProgress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                    {Math.round(generationProgress)}%
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Response */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        {response ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">AI Response</h3>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(response)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="prose dark:prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <div className="text-lg font-medium">Ready to Generate</div>
                                    <div className="text-sm">Enter a prompt and click generate to start</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdvancedAIFeatures

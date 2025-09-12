import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Trash2,
    Copy,
    Save,
    Play,
    Settings,
    Eye,
    EyeOff,
    Download,
    Upload,
    Undo,
    Redo,
    Zap,
    Brain,
    Target,
    Sparkles,
    Code,
    Image,
    FileText,
    Link,
    Hash,
    Quote,
    List,
    CheckSquare,
    ArrowRight,
    ArrowDown,
    RotateCcw
} from 'lucide-react'
import { useUndoRedo } from '../../hooks/useUndoRedo'
import { useAutoSave } from '../../hooks/useAutoSave'
import { aiOrchestration, AIRequest } from '../../services/aiOrchestration'
import { useToast } from '../common/EnhancedToast'

interface PromptComponent {
    id: string
    type: 'text' | 'variable' | 'instruction' | 'example' | 'condition' | 'loop' | 'ai-call' | 'chain'
    content: string
    position: { x: number; y: number }
    size: { width: number; height: number }
    config: Record<string, any>
    children?: string[]
    parent?: string
}

interface PromptTemplate {
    id: string
    name: string
    description: string
    components: PromptComponent[]
    variables: Record<string, string>
    metadata: Record<string, any>
}

const COMPONENT_TYPES = [
    { id: 'text', name: 'Text', icon: FileText, color: 'blue', description: 'Plain text content' },
    { id: 'variable', name: 'Variable', icon: Hash, color: 'green', description: 'Dynamic variable placeholder' },
    { id: 'instruction', name: 'Instruction', icon: Target, color: 'purple', description: 'AI instruction or command' },
    { id: 'example', name: 'Example', icon: Quote, color: 'yellow', description: 'Few-shot example' },
    { id: 'condition', name: 'Condition', icon: CheckSquare, color: 'red', description: 'Conditional logic' },
    { id: 'loop', name: 'Loop', icon: RotateCcw, color: 'indigo', description: 'Iterative processing' },
    { id: 'ai-call', name: 'AI Call', icon: Brain, color: 'pink', description: 'AI model invocation' },
    { id: 'chain', name: 'Chain', icon: ArrowRight, color: 'teal', description: 'Chain of thought' }
]

const InteractivePromptBuilder: React.FC = () => {
    const [components, setComponents] = useState<PromptComponent[]>([])
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
    const [isPreview, setIsPreview] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedPrompt, setGeneratedPrompt] = useState('')
    const [variables, setVariables] = useState<Record<string, string>>({})
    const [templates, setTemplates] = useState<PromptTemplate[]>([])
    const [showTemplates, setShowTemplates] = useState(false)

    const canvasRef = useRef<HTMLDivElement>(null)
    const { success, error, info } = useToast()

    // Undo/Redo functionality
    const { currentState, canUndo, canRedo, undo, redo, updateState } = useUndoRedo(components)

    // Auto-save functionality
    useAutoSave({
        data: { components, variables },
        onSave: (data) => {
            localStorage.setItem('prompt-builder-state', JSON.stringify(data))
        },
        storageKey: 'prompt-builder-state'
    })

    // Add new component
    const addComponent = (type: string, position: { x: number; y: number }) => {
        const newComponent: PromptComponent = {
            id: Math.random().toString(36).substr(2, 9),
            type: type as any,
            content: '',
            position,
            size: { width: 200, height: 100 },
            config: {},
            children: []
        }

        const updatedComponents = [...components, newComponent]
        setComponents(updatedComponents)
        updateState(updatedComponents)
        setSelectedComponent(newComponent.id)
        success('Component Added', `Added ${type} component`)
    }

    // Update component
    const updateComponent = (id: string, updates: Partial<PromptComponent>) => {
        const updatedComponents = components.map(comp =>
            comp.id === id ? { ...comp, ...updates } : comp
        )
        setComponents(updatedComponents)
        updateState(updatedComponents)
    }

    // Delete component
    const deleteComponent = (id: string) => {
        const updatedComponents = components.filter(comp => comp.id !== id)
        setComponents(updatedComponents)
        updateState(updatedComponents)
        setSelectedComponent(null)
        success('Component Deleted', 'Component removed successfully')
    }

    // Generate final prompt
    const generatePrompt = async () => {
        setIsGenerating(true)
        try {
            let prompt = ''

            // Process components in order
            const sortedComponents = [...components].sort((a, b) => a.position.y - b.position.y)

            for (const component of sortedComponents) {
                switch (component.type) {
                    case 'text':
                        prompt += component.content + '\n'
                        break
                    case 'variable':
                        const varValue = variables[component.content] || `{${component.content}}`
                        prompt += varValue + '\n'
                        break
                    case 'instruction':
                        prompt += `Instruction: ${component.content}\n`
                        break
                    case 'example':
                        prompt += `Example:\n${component.content}\n`
                        break
                    case 'condition':
                        prompt += `If ${component.config.condition}: ${component.content}\n`
                        break
                    case 'ai-call':
                        prompt += `[AI Call: ${component.config.model || 'default'}]\n${component.content}\n`
                        break
                    case 'chain':
                        prompt += `Let's think step by step:\n${component.content}\n`
                        break
                }
            }

            setGeneratedPrompt(prompt)
            success('Prompt Generated', 'Your prompt has been generated successfully')
        } catch (err) {
            error('Generation Failed', 'Failed to generate prompt')
        } finally {
            setIsGenerating(false)
        }
    }

    // Test prompt with AI
    const testPrompt = async () => {
        if (!generatedPrompt) {
            error('No Prompt', 'Please generate a prompt first')
            return
        }

        setIsGenerating(true)
        try {
            const request: AIRequest = {
                prompt: generatedPrompt,
                model: 'glm-4-5',
                temperature: 0.7,
                maxTokens: 1000
            }

            const response = await aiOrchestration.generateResponse(request)
            success('AI Response', 'Prompt tested successfully')
            console.log('AI Response:', response)
        } catch (err) {
            error('Test Failed', 'Failed to test prompt with AI')
        } finally {
            setIsGenerating(false)
        }
    }

    // Save as template
    const saveAsTemplate = () => {
        const template: PromptTemplate = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Template ${templates.length + 1}`,
            description: 'Custom prompt template',
            components,
            variables,
            metadata: {
                createdAt: new Date().toISOString(),
                componentCount: components.length
            }
        }

        setTemplates([...templates, template])
        success('Template Saved', 'Template saved successfully')
    }

    // Load template
    const loadTemplate = (template: PromptTemplate) => {
        setComponents(template.components)
        setVariables(template.variables)
        updateState(template.components)
        setShowTemplates(false)
        success('Template Loaded', `Loaded template: ${template.name}`)
    }

    // Export prompt
    const exportPrompt = () => {
        const data = {
            components,
            variables,
            generatedPrompt,
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '1.0'
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prompt-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
        success('Prompt Exported', 'Prompt exported successfully')
    }

    // Import prompt
    const importPrompt = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string)
                setComponents(data.components || [])
                setVariables(data.variables || {})
                updateState(data.components || [])
                success('Prompt Imported', 'Prompt imported successfully')
            } catch (err) {
                error('Import Failed', 'Failed to import prompt file')
            }
        }
        reader.readAsText(file)
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold">Interactive Prompt Builder</h1>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                            >
                                <Undo className="w-4 h-4" />
                            </button>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                            >
                                <Redo className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={generatePrompt}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50"
                        >
                            {isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Generate
                        </button>
                        <button
                            onClick={testPrompt}
                            disabled={!generatedPrompt || isGenerating}
                            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg disabled:opacity-50"
                        >
                            <Zap className="w-4 h-4" />
                            Test
                        </button>
                        <button
                            onClick={saveAsTemplate}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                        <button
                            onClick={exportPrompt}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            accept=".json"
                            onChange={importPrompt}
                            className="hidden"
                            id="import-prompt"
                        />
                        <label
                            htmlFor="import-prompt"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                        >
                            <Upload className="w-4 h-4" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Component Palette */}
                <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="font-semibold mb-4">Components</h3>
                    <div className="space-y-2">
                        {COMPONENT_TYPES.map((type) => (
                            <motion.div
                                key={type.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addComponent(type.id, { x: 100, y: 100 })}
                                className={`p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-${type.color}-500 cursor-pointer transition-colors`}
                            >
                                <div className="flex items-center space-x-2">
                                    <type.icon className={`w-5 h-5 text-${type.color}-500`} />
                                    <div>
                                        <div className="font-medium">{type.name}</div>
                                        <div className="text-xs text-gray-500">{type.description}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Variables */}
                    <div className="mt-6">
                        <h3 className="font-semibold mb-4">Variables</h3>
                        <div className="space-y-2">
                            {Object.entries(variables).map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={key}
                                        onChange={(e) => {
                                            const newVariables = { ...variables }
                                            delete newVariables[key]
                                            newVariables[e.target.value] = value
                                            setVariables(newVariables)
                                        }}
                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                                    />
                                    <button
                                        onClick={() => {
                                            const newVariables = { ...variables }
                                            delete newVariables[key]
                                            setVariables(newVariables)
                                        }}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setVariables({ ...variables, [`var${Object.keys(variables).length + 1}`]: '' })}
                                className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 transition-colors"
                            >
                                <Plus className="w-4 h-4 mx-auto" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative">
                    <div
                        ref={canvasRef}
                        className="w-full h-full bg-gray-50 dark:bg-gray-900 relative overflow-auto"
                    >
                        {components.map((component) => (
                            <ComponentRenderer
                                key={component.id}
                                component={component}
                                isSelected={selectedComponent === component.id}
                                onSelect={() => setSelectedComponent(component.id)}
                                onUpdate={(updates) => updateComponent(component.id, updates)}
                                onDelete={() => deleteComponent(component.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Preview Panel */}
                {isPreview && (
                    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="font-semibold mb-4">Preview</h3>
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm">{generatedPrompt || 'Generate a prompt to see preview...'}</pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Templates Modal */}
            <AnimatePresence>
                {showTemplates && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Templates</h3>
                                <button
                                    onClick={() => setShowTemplates(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        onClick={() => loadTemplate(template)}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                                    >
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-sm text-gray-500">{template.description}</div>
                                        <div className="text-xs text-gray-400">{template.components.length} components</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Component Renderer
const ComponentRenderer: React.FC<{
    component: PromptComponent
    isSelected: boolean
    onSelect: () => void
    onUpdate: (updates: Partial<PromptComponent>) => void
    onDelete: () => void
}> = ({ component, isSelected, onSelect, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [content, setContent] = useState(component.content)

    const handleSave = () => {
        onUpdate({ content })
        setIsEditing(false)
    }

    const componentType = COMPONENT_TYPES.find(t => t.id === component.type)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute border-2 rounded-lg p-3 cursor-pointer ${isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
            style={{
                left: component.position.x,
                top: component.position.y,
                width: component.size.width,
                height: component.size.height
            }}
            onClick={onSelect}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    {componentType && <componentType.icon className={`w-4 h-4 text-${componentType.color}-500`} />}
                    <span className="text-sm font-medium">{componentType?.name}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            {isEditing ? (
                <div className="space-y-2">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-20 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded resize-none"
                        autoFocus
                    />
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSave}
                            className="px-2 py-1 bg-primary-500 text-white text-xs rounded"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setContent(component.content)
                                setIsEditing(false)
                            }}
                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-gray-600 dark:text-gray-400 min-h-[60px]"
                >
                    {component.content || `Click to edit ${componentType?.name.toLowerCase()}...`}
                </div>
            )}
        </motion.div>
    )
}

export default InteractivePromptBuilder

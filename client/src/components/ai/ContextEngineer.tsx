import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain,
    Target,
    Layers,
    Zap,
    CheckCircle,
    AlertCircle,
    Plus,
    Trash2,
    Edit3,
    Save,
    RefreshCw,
    Lightbulb,
    TrendingUp,
    BarChart3
} from 'lucide-react'
import { useAI } from '../../hooks/useAI'
import toast from 'react-hot-toast'

interface ContextLayer {
    id: string
    name: string
    content: string
    weight: number
    type: 'background' | 'constraints' | 'examples' | 'format' | 'tone'
    isActive: boolean
}

interface ContextEngineerProps {
    prompt: string
    onContextUpdate?: (context: string) => void
}

const ContextEngineer: React.FC<ContextEngineerProps> = ({
    prompt,
    onContextUpdate
}) => {
    const { analyzeContext, getSuggestions, isLoading } = useAI()
    const [contextLayers, setContextLayers] = useState<ContextLayer[]>([
        {
            id: '1',
            name: 'Background',
            content: '',
            weight: 1.0,
            type: 'background',
            isActive: true
        }
    ])
    const [analysis, setAnalysis] = useState<any>(null)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [editingLayer, setEditingLayer] = useState<string | null>(null)

    const layerTypes = [
        { id: 'background', name: 'Background', description: 'Provide context and background information', icon: Brain },
        { id: 'constraints', name: 'Constraints', description: 'Define limitations and boundaries', icon: Target },
        { id: 'examples', name: 'Examples', description: 'Include relevant examples', icon: Layers },
        { id: 'format', name: 'Format', description: 'Specify output format requirements', icon: Edit3 },
        { id: 'tone', name: 'Tone', description: 'Set the desired tone and style', icon: Zap }
    ]

    useEffect(() => {
        if (prompt && contextLayers.some(layer => layer.content.trim())) {
            analyzeContextRelevance()
        }
    }, [prompt, contextLayers])

    const analyzeContextRelevance = async () => {
        const activeLayers = contextLayers.filter(layer => layer.isActive && layer.content.trim())
        if (activeLayers.length === 0) return

        const context = activeLayers.map(layer => `${layer.name}: ${layer.content}`).join('\n\n')

        try {
            const result = await analyzeContext({
                prompt,
                context,
                domain: 'general'
            })
            setAnalysis(result)
        } catch (error) {
            console.error('Context analysis error:', error)
        }
    }

    const addContextLayer = () => {
        const newLayer: ContextLayer = {
            id: Date.now().toString(),
            name: 'New Layer',
            content: '',
            weight: 1.0,
            type: 'background',
            isActive: true
        }
        setContextLayers([...contextLayers, newLayer])
        setEditingLayer(newLayer.id)
    }

    const updateContextLayer = (id: string, updates: Partial<ContextLayer>) => {
        setContextLayers(prev =>
            prev.map(layer =>
                layer.id === id ? { ...layer, ...updates } : layer
            )
        )
    }

    const removeContextLayer = (id: string) => {
        setContextLayers(prev => prev.filter(layer => layer.id !== id))
    }

    const toggleLayerActive = (id: string) => {
        updateContextLayer(id, { isActive: !contextLayers.find(l => l.id === id)?.isActive })
    }

    const generateSuggestions = async (layerType: string) => {
        try {
            const suggestions = await getSuggestions(
                `Generate context suggestions for ${layerType} in prompt engineering`,
                'completion'
            )
            setSuggestions(suggestions)
            setShowSuggestions(true)
        } catch (error) {
            console.error('Suggestion generation error:', error)
        }
    }

    const getCombinedContext = () => {
        return contextLayers
            .filter(layer => layer.isActive && layer.content.trim())
            .map(layer => `${layer.name}: ${layer.content}`)
            .join('\n\n')
    }

    const getContextScore = () => {
        if (!analysis) return 0
        return Math.round(analysis.relevanceScore * 100)
    }

    const getContextColor = (score: number) => {
        if (score >= 80) return 'text-success-600 dark:text-success-400'
        if (score >= 60) return 'text-warning-600 dark:text-warning-400'
        return 'text-red-600 dark:text-red-400'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center space-x-2">
                    <Brain className="w-6 h-6 text-primary-500" />
                    <span>Context Engineer</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Build sophisticated context layers for enhanced prompt performance
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Context Layers */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Context Layers
                        </h3>
                        <motion.button
                            onClick={addContextLayer}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Layer</span>
                        </motion.button>
                    </div>

                    <div className="space-y-3">
                        {contextLayers.map((layer, index) => (
                            <motion.div
                                key={layer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`p-4 rounded-lg border-2 transition-all ${layer.isActive
                                        ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => toggleLayerActive(layer.id)}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${layer.isActive
                                                    ? 'border-primary-500 bg-primary-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                        >
                                            {layer.isActive && <CheckCircle className="w-3 h-3 text-white" />}
                                        </button>
                                        <div className="flex items-center space-x-2">
                                            <select
                                                value={layer.type}
                                                onChange={(e) => updateContextLayer(layer.id, {
                                                    type: e.target.value as any,
                                                    name: layerTypes.find(t => t.id === e.target.value)?.name || layer.name
                                                })}
                                                className="text-sm font-medium bg-transparent border-none focus:outline-none"
                                            >
                                                {layerTypes.map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Weight: {layer.weight}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => generateSuggestions(layer.type)}
                                            className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            <Lightbulb className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingLayer(editingLayer === layer.id ? null : layer.id)}
                                            className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeContextLayer(layer.id)}
                                            className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={layer.name}
                                        onChange={(e) => updateContextLayer(layer.id, { name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Layer name"
                                    />

                                    <textarea
                                        value={layer.content}
                                        onChange={(e) => updateContextLayer(layer.id, { content: e.target.value })}
                                        placeholder={`Enter ${layer.type} context...`}
                                        className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                    />

                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm text-gray-600 dark:text-gray-400">Weight:</label>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="2.0"
                                                step="0.1"
                                                value={layer.weight}
                                                onChange={(e) => updateContextLayer(layer.id, { weight: parseFloat(e.target.value) })}
                                                className="w-20"
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{layer.weight}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Analysis Panel */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Context Analysis
                    </h3>

                    {/* Relevance Score */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Relevance Score
                            </span>
                            <span className={`text-lg font-bold ${getContextColor(getContextScore())}`}>
                                {getContextScore()}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getContextScore()}%` }}
                            />
                        </div>
                    </div>

                    {/* Analysis Details */}
                    {analysis && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Analysis Results
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Domain Specific:</span>
                                        <span className={analysis.domainSpecific ? 'text-success-600 dark:text-success-400' : 'text-gray-600 dark:text-gray-400'}>
                                            {analysis.domainSpecific ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Context Suggestions:</span>
                                        <span className="text-gray-900 dark:text-white">{analysis.contextSuggestions?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Missing Context:</span>
                                        <span className="text-gray-900 dark:text-white">{analysis.missingContext?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Context Suggestions */}
                            {analysis.contextSuggestions && analysis.contextSuggestions.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Suggested Improvements
                                    </h4>
                                    <ul className="space-y-1">
                                        {analysis.contextSuggestions.map((suggestion: string, index: number) => (
                                            <li key={index} className="text-sm text-blue-600 dark:text-blue-400 flex items-start space-x-2">
                                                <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                <span>{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Missing Context */}
                            {analysis.missingContext && analysis.missingContext.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Missing Context
                                    </h4>
                                    <ul className="space-y-1">
                                        {analysis.missingContext.map((missing: string, index: number) => (
                                            <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-start space-x-2">
                                                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                <span>{missing}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Combined Context Preview */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Combined Context
                        </h4>
                        <div className="max-h-40 overflow-y-auto">
                            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {getCombinedContext() || 'No active context layers'}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggestions Modal */}
            <AnimatePresence>
                {showSuggestions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowSuggestions(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Context Suggestions
                            </h3>
                            <div className="space-y-2">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        onClick={() => {
                                            // Add suggestion to the first available layer
                                            const firstLayer = contextLayers[0]
                                            if (firstLayer) {
                                                updateContextLayer(firstLayer.id, {
                                                    content: firstLayer.content + (firstLayer.content ? '\n\n' : '') + suggestion
                                                })
                                            }
                                            setShowSuggestions(false)
                                        }}
                                    >
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowSuggestions(false)}
                                className="mt-4 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ContextEngineer

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    Zap,
    Target,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    RefreshCw,
    Copy,
    Download,
    Star,
    TrendingUp
} from 'lucide-react'
import { useAI } from '../../hooks/useAI'
import toast from 'react-hot-toast'

interface PromptOptimizerProps {
    initialPrompt?: string
    onOptimized?: (optimizedPrompt: string) => void
}

const PromptOptimizer: React.FC<PromptOptimizerProps> = ({
    initialPrompt = '',
    onOptimized
}) => {
    const { generatePrompt, optimizePrompt, validatePrompt, isLoading, error } = useAI()
    const [prompt, setPrompt] = useState(initialPrompt)
    const [optimizedPrompt, setOptimizedPrompt] = useState('')
    const [optimizationType, setOptimizationType] = useState<'clarity' | 'conciseness' | 'creativity' | 'accuracy'>('clarity')
    const [targetModel, setTargetModel] = useState('gpt-4')
    const [context, setContext] = useState('')
    const [validation, setValidation] = useState<any>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])

    const optimizationTypes = [
        { id: 'clarity', name: 'Clarity', description: 'Make the prompt clearer and more understandable', icon: Target },
        { id: 'conciseness', name: 'Conciseness', description: 'Make the prompt more concise and focused', icon: Zap },
        { id: 'creativity', name: 'Creativity', description: 'Add creative elements and variations', icon: Sparkles },
        { id: 'accuracy', name: 'Accuracy', description: 'Improve precision and specificity', icon: CheckCircle }
    ]

    const models = [
        'gpt-4',
        'gpt-3.5-turbo',
        'claude-3-sonnet',
        'claude-3-haiku',
        'gemini-pro',
        'llama-2-70b'
    ]

    useEffect(() => {
        if (prompt) {
            validateCurrentPrompt()
        }
    }, [prompt])

    const validateCurrentPrompt = async () => {
        if (!prompt.trim()) return

        try {
            const result = await validatePrompt(prompt)
            setValidation(result)
        } catch (error) {
            console.error('Validation error:', error)
        }
    }

    const handleOptimize = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt to optimize')
            return
        }

        try {
            const result = await optimizePrompt({
                originalPrompt: prompt,
                targetModel,
                optimizationType,
                context: context || undefined
            })

            setOptimizedPrompt(result.generatedPrompt)
            onOptimized?.(result.generatedPrompt)
            toast.success('Prompt optimized successfully!')
        } catch (error) {
            console.error('Optimization error:', error)
        }
    }

    const handleGenerateVariations = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt to generate variations')
            return
        }

        try {
            const result = await generatePrompt({
                prompt: `Generate 3 variations of this prompt: "${prompt}"`,
                context: context || undefined,
                model: targetModel,
                temperature: 0.8
            })

            setSuggestions(result.suggestions || [])
            setShowSuggestions(true)
        } catch (error) {
            console.error('Variation generation error:', error)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
    }

    const downloadPrompt = (text: string, filename: string) => {
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Prompt downloaded!')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center space-x-2">
                    <Sparkles className="w-6 h-6 text-primary-500" />
                    <span>AI Prompt Optimizer</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Enhance your prompts with advanced AI optimization
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Original Prompt
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter your prompt here..."
                            className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Context (Optional)
                        </label>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Provide additional context for better optimization..."
                            className="w-full h-20 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Optimization Settings */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Optimization Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {optimizationTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setOptimizationType(type.id as any)}
                                        className={`p-3 rounded-lg border-2 text-left transition-colors ${optimizationType === type.id
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <type.icon className="w-4 h-4 mb-1" />
                                        <div className="text-sm font-medium">{type.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {type.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Target Model
                            </label>
                            <select
                                value={targetModel}
                                onChange={(e) => setTargetModel(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                {models.map((model) => (
                                    <option key={model} value={model}>
                                        {model}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <motion.button
                            onClick={handleOptimize}
                            disabled={isLoading || !prompt.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Optimize Prompt
                                </>
                            )}
                        </motion.button>

                        <motion.button
                            onClick={handleGenerateVariations}
                            disabled={isLoading || !prompt.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Optimized Prompt
                        </label>
                        {optimizedPrompt && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => copyToClipboard(optimizedPrompt)}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => downloadPrompt(optimizedPrompt, 'optimized-prompt.txt')}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <textarea
                            value={optimizedPrompt}
                            readOnly
                            placeholder="Optimized prompt will appear here..."
                            className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                        />
                        {optimizedPrompt && (
                            <div className="absolute top-2 right-2 flex space-x-1">
                                <div className="flex items-center space-x-1 px-2 py-1 bg-success-100 dark:bg-success-900/20 text-success-600 dark:text-success-400 text-xs rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Optimized</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Validation Results */}
                    {validation && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4" />
                                <span>Quality Score: {validation.score}/100</span>
                            </h4>

                            {validation.issues.length > 0 && (
                                <div className="mb-3">
                                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Issues:</h5>
                                    <ul className="space-y-1">
                                        {validation.issues.map((issue: string, index: number) => (
                                            <li key={index} className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {validation.suggestions.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Suggestions:</h5>
                                    <ul className="space-y-1">
                                        {validation.suggestions.map((suggestion: string, index: number) => (
                                            <li key={index} className="text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                                                <Star className="w-3 h-3" />
                                                <span>{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Suggestions */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                            >
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Variations
                                </h4>
                                <div className="space-y-2">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                            onClick={() => {
                                                setOptimizedPrompt(suggestion)
                                                setShowSuggestions(false)
                                            }}
                                        >
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowSuggestions(false)}
                                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Close
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                >
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="text-red-800 dark:text-red-200">{error}</span>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

export default PromptOptimizer

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Settings,
  Play,
  Save,
  Copy,
  Download,
  Share2,
  Wand2,
  Brain,
  Zap,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import PromptOptimizer from '../components/ai/PromptOptimizer'
import ContextEngineer from '../components/ai/ContextEngineer'

const PromptGenerator: React.FC = () => {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [contextProfile, setContextProfile] = useState('default')
  const [model, setModel] = useState('gpt-4')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'generator' | 'optimizer' | 'context'>('generator')

  const templates = [
    {
      id: 'code-review',
      name: 'Code Review Assistant',
      description: 'Comprehensive code analysis and review',
      template: 'You are an expert code reviewer. Analyze the following code for:\n- Security vulnerabilities\n- Performance issues\n- Best practices\n- Code quality\n\nCode: {code}\n\nProvide detailed feedback with specific recommendations.',
      variables: [
        { name: 'code', label: 'Code to Review', type: 'textarea', required: true }
      ]
    },
    {
      id: 'creative-writing',
      name: 'Creative Writing Generator',
      description: 'Generate compelling creative content',
      template: 'You are a creative writing expert. Create a {type} about {topic} with the following requirements:\n- Tone: {tone}\n- Length: {length}\n- Style: {style}\n\nMake it engaging and original.',
      variables: [
        { name: 'type', label: 'Content Type', type: 'select', options: ['story', 'poem', 'article', 'script'], required: true },
        { name: 'topic', label: 'Topic', type: 'text', required: true },
        { name: 'tone', label: 'Tone', type: 'select', options: ['formal', 'casual', 'humorous', 'dramatic'], required: true },
        { name: 'length', label: 'Length', type: 'select', options: ['short', 'medium', 'long'], required: true },
        { name: 'style', label: 'Style', type: 'text', required: false }
      ]
    },
    {
      id: 'data-analysis',
      name: 'Data Analysis Assistant',
      description: 'Advanced data analysis and insights',
      template: 'You are a data analyst. Analyze the following data and provide insights:\n\nData: {data}\nContext: {context}\n\nProvide:\n- Key findings\n- Trends and patterns\n- Recommendations\n- Visualizations suggestions',
      variables: [
        { name: 'data', label: 'Data', type: 'textarea', required: true },
        { name: 'context', label: 'Context', type: 'text', required: false }
      ]
    }
  ]

  const contextProfiles = [
    { id: 'default', name: 'Default', description: 'Balanced approach for general use' },
    { id: 'technical', name: 'Technical', description: 'Optimized for technical content' },
    { id: 'creative', name: 'Creative', description: 'Enhanced for creative writing' },
    { id: 'analytical', name: 'Analytical', description: 'Focused on data analysis' },
    { id: 'educational', name: 'Educational', description: 'Structured for learning content' }
  ]

  const models = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic\'s most powerful' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s advanced model' }
  ]

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setPrompt(template.template)
      setVariables({})
    }
  }

  const handleVariableChange = (name: string, value: string) => {
    setVariables(prev => ({ ...prev, [name]: value }))
  }

  const generatePrompt = async () => {
    setIsGenerating(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      let processedPrompt = prompt
      Object.entries(variables).forEach(([key, value]) => {
        processedPrompt = processedPrompt.replace(new RegExp(`{${key}}`, 'g'), value)
      })

      setGeneratedPrompt(processedPrompt)
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const optimizePrompt = async () => {
    setIsOptimizing(true)
    try {
      // Simulate optimization API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setOptimizationSuggestions([
        'Add more specific instructions for better results',
        'Include examples to improve context understanding',
        'Specify the desired output format',
        'Add constraints to prevent unwanted responses'
      ])
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Show success toast
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const downloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated-prompt.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold gradient-text">
          AI Prompt Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create, optimize, and generate powerful AI prompts with advanced context engineering
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-neural">
          <div className="flex space-x-1">
            {[
              { id: 'generator', name: 'Generator', icon: Sparkles },
              { id: 'optimizer', name: 'Optimizer', icon: Zap },
              { id: 'context', name: 'Context', icon: Brain }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'generator' && (
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Template Selection */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Choose Template
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${selectedTemplate === template.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                          }`}
                      >
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Variables */}
                {selectedTemplate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Fill Variables
                    </h2>
                    <div className="space-y-4">
                      {templates.find(t => t.id === selectedTemplate)?.variables.map((variable) => (
                        <div key={variable.name}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {variable.label} {variable.required && <span className="text-red-500">*</span>}
                          </label>
                          {variable.type === 'textarea' ? (
                            <textarea
                              value={variables[variable.name] || ''}
                              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows={4}
                              placeholder={`Enter ${variable.label.toLowerCase()}...`}
                            />
                          ) : variable.type === 'select' ? (
                            <select
                              value={variables[variable.name] || ''}
                              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="">Select {variable.label}</option>
                              {variable.options?.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={variables[variable.name] || ''}
                              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder={`Enter ${variable.label.toLowerCase()}...`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Prompt Editor */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Prompt Template
                    </h2>
                    <button
                      onClick={optimizePrompt}
                      disabled={isOptimizing}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-accent-100 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/30 transition-colors disabled:opacity-50"
                    >
                      {isOptimizing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
                    </button>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
                    placeholder="Enter your prompt template here..."
                  />
                </div>

                {/* Advanced Settings */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-neural">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-xl"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Advanced Settings
                    </h2>
                    {showAdvanced ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700"
                      >
                        {/* Model Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            AI Model
                          </label>
                          <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {models.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Context Profile */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Context Profile
                          </label>
                          <select
                            value={contextProfile}
                            onChange={(e) => setContextProfile(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {contextProfiles.map((profile) => (
                              <option key={profile.id} value={profile.id}>{profile.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Temperature */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Temperature: {temperature}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {/* Max Tokens */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Max Tokens
                          </label>
                          <input
                            type="number"
                            min="100"
                            max="4000"
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generatePrompt}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Prompt</span>
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Output Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Generated Prompt */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Generated Prompt
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(generatedPrompt)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={downloadPrompt}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Download prompt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { }}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Share prompt"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[200px]">
                    {generatedPrompt ? (
                      <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
                        {generatedPrompt}
                      </pre>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        Generated prompt will appear here...
                      </p>
                    )}
                  </div>
                </div>

                {/* Optimization Suggestions */}
                {optimizationSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-accent-500" />
                      <span>Optimization Suggestions</span>
                    </h2>
                    <div className="space-y-3">
                      {optimizationSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start space-x-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {suggestion}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Quick Actions */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                      <Save className="w-4 h-4" />
                      <span className="text-sm font-medium">Save Prompt</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 p-3 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Test Prompt</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'optimizer' && (
          <motion.div
            key="optimizer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PromptOptimizer
              initialPrompt={prompt}
              onOptimized={(optimizedPrompt) => {
                setPrompt(optimizedPrompt)
                setActiveTab('generator')
              }}
            />
          </motion.div>
        )}

        {activeTab === 'context' && (
          <motion.div
            key="context"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ContextEngineer
              prompt={prompt}
              onContextUpdate={(context) => {
                // Handle context updates
                console.log('Context updated:', context)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PromptGenerator

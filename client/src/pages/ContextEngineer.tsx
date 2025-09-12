import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Settings, 
  Play, 
  Save, 
  Plus, 
  Trash2, 
  Edit3,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Layers
} from 'lucide-react'

const ContextEngineer: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState('default')
  const [prompt, setPrompt] = useState('')
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [newRule, setNewRule] = useState({ name: '', condition: '', action: 'add', content: '' })

  const contextProfiles = [
    {
      id: 'default',
      name: 'Default',
      description: 'Balanced approach for general use',
      rules: [
        { id: '1', name: 'Add clarity instructions', condition: 'prompt_length < 100', action: 'add', content: 'Please provide clear, specific, and detailed responses.', priority: 1, isActive: true },
        { id: '2', name: 'Add example request', condition: 'prompt_complexity > 0.7', action: 'add', content: 'Include relevant examples to illustrate your points.', priority: 2, isActive: true }
      ],
      isDefault: true
    },
    {
      id: 'technical',
      name: 'Technical',
      description: 'Optimized for technical content',
      rules: [
        { id: '3', name: 'Add technical context', condition: 'always', action: 'add', content: 'Provide technical details, code examples, and implementation guidance.', priority: 1, isActive: true },
        { id: '4', name: 'Add security considerations', condition: 'contains_code', action: 'add', content: 'Consider security implications and best practices.', priority: 2, isActive: true },
        { id: '5', name: 'Add performance notes', condition: 'contains_algorithm', action: 'add', content: 'Include performance analysis and optimization suggestions.', priority: 3, isActive: true }
      ],
      isDefault: false
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Enhanced for creative writing',
      rules: [
        { id: '6', name: 'Add creative context', condition: 'always', action: 'add', content: 'Focus on creativity, originality, and engaging storytelling.', priority: 1, isActive: true },
        { id: '7', name: 'Add sensory details', condition: 'is_creative_writing', action: 'add', content: 'Include vivid sensory details and descriptive language.', priority: 2, isActive: true },
        { id: '8', name: 'Add emotional resonance', condition: 'is_creative_writing', action: 'add', content: 'Create emotional resonance and character development.', priority: 3, isActive: true }
      ],
      isDefault: false
    },
    {
      id: 'analytical',
      name: 'Analytical',
      description: 'Focused on data analysis',
      rules: [
        { id: '9', name: 'Add analytical framework', condition: 'always', action: 'add', content: 'Provide data-driven insights with statistical analysis and evidence.', priority: 1, isActive: true },
        { id: '10', name: 'Add visualization suggestions', condition: 'contains_data', action: 'add', content: 'Suggest appropriate charts, graphs, and visualizations.', priority: 2, isActive: true },
        { id: '11', name: 'Add methodology notes', condition: 'is_analysis', action: 'add', content: 'Explain your analytical approach and methodology.', priority: 3, isActive: true }
      ],
      isDefault: false
    }
  ]

  const conditions = [
    { value: 'always', label: 'Always apply' },
    { value: 'prompt_length < 100', label: 'When prompt is short' },
    { value: 'prompt_complexity > 0.7', label: 'When prompt is complex' },
    { value: 'contains_code', label: 'When prompt contains code' },
    { value: 'contains_algorithm', label: 'When prompt contains algorithms' },
    { value: 'is_creative_writing', label: 'When prompt is creative writing' },
    { value: 'contains_data', label: 'When prompt contains data' },
    { value: 'is_analysis', label: 'When prompt is analytical' }
  ]

  const actions = [
    { value: 'add', label: 'Add content' },
    { value: 'modify', label: 'Modify existing' },
    { value: 'remove', label: 'Remove content' }
  ]

  const currentProfile = contextProfiles.find(p => p.id === activeProfile)

  const optimizePrompt = async () => {
    setIsOptimizing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let optimized = prompt
      const activeRules = currentProfile?.rules.filter(rule => rule.isActive) || []
      
      for (const rule of activeRules) {
        if (evaluateCondition(rule.condition, prompt)) {
          optimized = applyRule(optimized, rule)
        }
      }
      
      setOptimizedPrompt(optimized)
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const evaluateCondition = (condition: string, prompt: string) => {
    switch (condition) {
      case 'always': return true
      case 'prompt_length < 100': return prompt.length < 100
      case 'prompt_complexity > 0.7': return calculateComplexity(prompt) > 0.7
      case 'contains_code': return /```|function|class|def|var|let|const/.test(prompt)
      case 'contains_algorithm': return /algorithm|sort|search|tree|graph/.test(prompt)
      case 'is_creative_writing': return /story|poem|creative|write|narrative/.test(prompt)
      case 'contains_data': return /data|chart|graph|statistics|analysis/.test(prompt)
      case 'is_analysis': return /analyze|analysis|insights|trends/.test(prompt)
      default: return false
    }
  }

  const applyRule = (prompt: string, rule: any) => {
    switch (rule.action) {
      case 'add': return prompt + '\n\n' + rule.content
      case 'modify': return prompt.replace(rule.condition, rule.content)
      case 'remove': return prompt
      default: return prompt
    }
  }

  const calculateComplexity = (prompt: string) => {
    let complexity = 0
    if (prompt.length > 200) complexity += 0.3
    if (prompt.includes('?')) complexity += 0.2
    if (prompt.includes('```')) complexity += 0.2
    if (prompt.split('\n').length > 5) complexity += 0.2
    if (prompt.includes('example') || prompt.includes('specific')) complexity += 0.1
    return Math.min(1, complexity)
  }

  const addRule = () => {
    if (newRule.name && newRule.condition && newRule.content) {
      // In a real app, this would update the profile
      console.log('Adding rule:', newRule)
      setNewRule({ name: '', condition: '', action: 'add', content: '' })
    }
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
          Context Engineer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Optimize your prompts with intelligent context engineering and rule-based enhancements
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Context Profiles */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary-500" />
              <span>Context Profiles</span>
            </h2>
            <div className="space-y-3">
              {contextProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setActiveProfile(profile.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    activeProfile === profile.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {profile.name}
                    </h3>
                    {profile.isDefault && (
                      <span className="px-2 py-1 text-xs bg-accent-100 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profile.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {profile.rules.length} rules
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rules Management */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-accent-500" />
                <span>Rules</span>
              </h2>
              <button
                onClick={() => setShowRules(!showRules)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showRules && (
              <div className="space-y-4">
                {currentProfile?.rules.map((rule, index) => (
                  <div key={rule.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {rule.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Priority {rule.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Condition:</strong> {rule.condition}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Action:</strong> {rule.action} - {rule.content}
                    </p>
                  </div>
                ))}

                {/* Add New Rule */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Add New Rule</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Rule name"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <select
                      value={newRule.condition}
                      onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select condition</option>
                      {conditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newRule.action}
                      onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {actions.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Rule content"
                      value={newRule.content}
                      onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      rows={3}
                    />
                    <button
                      onClick={addRule}
                      className="w-full px-4 py-2 bg-accent-500 text-white text-sm rounded-lg hover:bg-accent-600 transition-colors"
                    >
                      Add Rule
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Prompt Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Input Prompt */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-primary-500" />
              <span>Input Prompt</span>
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
              placeholder="Enter your prompt here..."
            />
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{prompt.length} characters</span>
              <span>Complexity: {Math.round(calculateComplexity(prompt) * 100)}%</span>
            </div>
          </div>

          {/* Optimize Button */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={optimizePrompt}
              disabled={isOptimizing || !prompt.trim()}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
            >
              {isOptimizing ? (
                <>
                  <Zap className="w-5 h-5 animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Optimize Prompt</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Optimized Prompt */}
          {optimizedPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Target className="w-5 h-5 text-accent-500" />
                  <span>Optimized Prompt</span>
                </h2>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
                  {optimizedPrompt}
                </pre>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{optimizedPrompt.length} characters</span>
                <span>Improvement: +{optimizedPrompt.length - prompt.length} characters</span>
              </div>
            </motion.div>
          )}

          {/* Applied Rules */}
          {optimizedPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-success-500" />
                <span>Applied Rules</span>
              </h2>
              <div className="space-y-2">
                {currentProfile?.rules.filter(rule => rule.isActive && evaluateCondition(rule.condition, prompt)).map((rule) => (
                  <div key={rule.id} className="flex items-center space-x-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-success-500 rounded-full" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {rule.name} - {rule.content}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ContextEngineer

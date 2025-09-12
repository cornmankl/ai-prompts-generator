const express = require('express')
const { v4: uuidv4 } = require('uuid')
const router = express.Router()

// Mock context profiles database
const contextProfiles = [
  {
    id: 'default',
    name: 'Default',
    description: 'Balanced approach for general use',
    rules: [
      {
        id: '1',
        name: 'Add clarity instructions',
        description: 'Add instructions for clear, specific responses',
        condition: 'prompt_length < 100',
        action: 'add',
        content: 'Please provide clear, specific, and detailed responses.',
        priority: 1,
        isActive: true
      },
      {
        id: '2',
        name: 'Add example request',
        description: 'Request examples when appropriate',
        condition: 'prompt_complexity > 0.7',
        action: 'add',
        content: 'Include relevant examples to illustrate your points.',
        priority: 2,
        isActive: true
      }
    ],
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Optimized for technical content',
    rules: [
      {
        id: '3',
        name: 'Add technical context',
        description: 'Add technical context and terminology',
        condition: 'always',
        action: 'add',
        content: 'Provide technical details, code examples, and implementation guidance.',
        priority: 1,
        isActive: true
      },
      {
        id: '4',
        name: 'Add security considerations',
        description: 'Include security best practices',
        condition: 'contains_code',
        action: 'add',
        content: 'Consider security implications and best practices.',
        priority: 2,
        isActive: true
      },
      {
        id: '5',
        name: 'Add performance notes',
        description: 'Include performance considerations',
        condition: 'contains_algorithm',
        action: 'add',
        content: 'Include performance analysis and optimization suggestions.',
        priority: 3,
        isActive: true
      }
    ],
    isDefault: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Enhanced for creative writing',
    rules: [
      {
        id: '6',
        name: 'Add creative context',
        description: 'Add creative writing context',
        condition: 'always',
        action: 'add',
        content: 'Focus on creativity, originality, and engaging storytelling.',
        priority: 1,
        isActive: true
      },
      {
        id: '7',
        name: 'Add sensory details',
        description: 'Encourage sensory descriptions',
        condition: 'is_creative_writing',
        action: 'add',
        content: 'Include vivid sensory details and descriptive language.',
        priority: 2,
        isActive: true
      },
      {
        id: '8',
        name: 'Add emotional resonance',
        description: 'Encourage emotional depth',
        condition: 'is_creative_writing',
        action: 'add',
        content: 'Create emotional resonance and character development.',
        priority: 3,
        isActive: true
      }
    ],
    isDefault: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: 'analytical',
    name: 'Analytical',
    description: 'Focused on data analysis',
    rules: [
      {
        id: '9',
        name: 'Add analytical framework',
        description: 'Add analytical thinking framework',
        condition: 'always',
        action: 'add',
        content: 'Provide data-driven insights with statistical analysis and evidence.',
        priority: 1,
        isActive: true
      },
      {
        id: '10',
        name: 'Add visualization suggestions',
        description: 'Include data visualization recommendations',
        condition: 'contains_data',
        action: 'add',
        content: 'Suggest appropriate charts, graphs, and visualizations.',
        priority: 2,
        isActive: true
      },
      {
        id: '11',
        name: 'Add methodology notes',
        description: 'Include analytical methodology',
        condition: 'is_analysis',
        action: 'add',
        content: 'Explain your analytical approach and methodology.',
        priority: 3,
        isActive: true
      }
    ],
    isDefault: false,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04')
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Structured for learning content',
    rules: [
      {
        id: '12',
        name: 'Add learning objectives',
        description: 'Include clear learning objectives',
        condition: 'always',
        action: 'add',
        content: 'Structure content for learning with clear objectives and explanations.',
        priority: 1,
        isActive: true
      },
      {
        id: '13',
        name: 'Add examples and exercises',
        description: 'Include practical examples and exercises',
        condition: 'is_educational',
        action: 'add',
        content: 'Provide practical examples and exercises for hands-on learning.',
        priority: 2,
        isActive: true
      },
      {
        id: '14',
        name: 'Add assessment criteria',
        description: 'Include assessment and evaluation criteria',
        condition: 'is_educational',
        action: 'add',
        content: 'Include ways to assess understanding and progress.',
        priority: 3,
        isActive: true
      }
    ],
    isDefault: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
]

// Get all context profiles
router.get('/', (req, res) => {
  const { search, isDefault } = req.query
  
  let filteredProfiles = [...contextProfiles]
  
  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase()
    filteredProfiles = filteredProfiles.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    )
  }
  
  // Filter by default status
  if (isDefault !== undefined) {
    const isDefaultBool = isDefault === 'true'
    filteredProfiles = filteredProfiles.filter(p => p.isDefault === isDefaultBool)
  }
  
  res.json(filteredProfiles)
})

// Get context profile by ID
router.get('/:id', (req, res) => {
  const profile = contextProfiles.find(p => p.id === req.params.id)
  if (!profile) {
    return res.status(404).json({ error: 'Context profile not found' })
  }
  
  res.json(profile)
})

// Create new context profile
router.post('/', (req, res) => {
  try {
    const { name, description, rules, isDefault = false } = req.body
    
    const newProfile = {
      id: uuidv4(),
      name,
      description,
      rules: rules || [],
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    contextProfiles.push(newProfile)
    res.status(201).json(newProfile)
  } catch (error) {
    console.error('Create context profile error:', error)
    res.status(500).json({ error: 'Failed to create context profile' })
  }
})

// Update context profile
router.put('/:id', (req, res) => {
  try {
    const profileIndex = contextProfiles.findIndex(p => p.id === req.params.id)
    if (profileIndex === -1) {
      return res.status(404).json({ error: 'Context profile not found' })
    }
    
    const { name, description, rules, isDefault } = req.body
    const profile = contextProfiles[profileIndex]
    
    if (name) profile.name = name
    if (description) profile.description = description
    if (rules) profile.rules = rules
    if (typeof isDefault === 'boolean') profile.isDefault = isDefault
    
    profile.updatedAt = new Date()
    
    res.json(profile)
  } catch (error) {
    console.error('Update context profile error:', error)
    res.status(500).json({ error: 'Failed to update context profile' })
  }
})

// Delete context profile
router.delete('/:id', (req, res) => {
  const profileIndex = contextProfiles.findIndex(p => p.id === req.params.id)
  if (profileIndex === -1) {
    return res.status(404).json({ error: 'Context profile not found' })
  }
  
  const profile = contextProfiles[profileIndex]
  if (profile.isDefault) {
    return res.status(400).json({ error: 'Cannot delete default context profile' })
  }
  
  contextProfiles.splice(profileIndex, 1)
  res.json({ message: 'Context profile deleted successfully' })
})

// Apply context profile to prompt
router.post('/:id/apply', (req, res) => {
  try {
    const profile = contextProfiles.find(p => p.id === req.params.id)
    if (!profile) {
      return res.status(404).json({ error: 'Context profile not found' })
    }
    
    const { prompt } = req.body
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }
    
    let optimizedPrompt = prompt
    
    // Apply rules in priority order
    const activeRules = profile.rules
      .filter(rule => rule.isActive)
      .sort((a, b) => a.priority - b.priority)
    
    for (const rule of activeRules) {
      if (evaluateCondition(rule.condition, prompt)) {
        optimizedPrompt = applyRule(optimizedPrompt, rule)
      }
    }
    
    res.json({
      originalPrompt: prompt,
      optimizedPrompt,
      appliedRules: activeRules.filter(rule => evaluateCondition(rule.condition, prompt))
    })
  } catch (error) {
    console.error('Apply context profile error:', error)
    res.status(500).json({ error: 'Failed to apply context profile' })
  }
})

// Helper functions
function evaluateCondition(condition, prompt) {
  // Simple condition evaluation (in real app, use a proper expression evaluator)
  const promptLength = prompt.length
  const promptComplexity = calculateComplexity(prompt)
  const containsCode = /```|function|class|def|var|let|const/.test(prompt)
  const containsAlgorithm = /algorithm|sort|search|tree|graph/.test(prompt)
  const isCreativeWriting = /story|poem|creative|write|narrative/.test(prompt)
  const containsData = /data|chart|graph|statistics|analysis/.test(prompt)
  const isAnalysis = /analyze|analysis|insights|trends/.test(prompt)
  const isEducational = /learn|teach|education|tutorial|course/.test(prompt)
  
  switch (condition) {
    case 'always':
      return true
    case 'prompt_length < 100':
      return promptLength < 100
    case 'prompt_complexity > 0.7':
      return promptComplexity > 0.7
    case 'contains_code':
      return containsCode
    case 'contains_algorithm':
      return containsAlgorithm
    case 'is_creative_writing':
      return isCreativeWriting
    case 'contains_data':
      return containsData
    case 'is_analysis':
      return isAnalysis
    case 'is_educational':
      return isEducational
    default:
      return false
  }
}

function applyRule(prompt, rule) {
  switch (rule.action) {
    case 'add':
      return prompt + '\n\n' + rule.content
    case 'modify':
      // In a real app, implement more sophisticated modification logic
      return prompt.replace(rule.condition, rule.content)
    case 'remove':
      // In a real app, implement removal logic
      return prompt
    default:
      return prompt
  }
}

function calculateComplexity(prompt) {
  // Simple complexity calculation based on prompt characteristics
  let complexity = 0
  
  if (prompt.length > 200) complexity += 0.3
  if (prompt.includes('?')) complexity += 0.2
  if (prompt.includes('```')) complexity += 0.2
  if (prompt.split('\n').length > 5) complexity += 0.2
  if (prompt.includes('example') || prompt.includes('specific')) complexity += 0.1
  
  return Math.min(1, complexity)
}

module.exports = router

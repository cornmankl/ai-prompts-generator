const express = require('express')
const { v4: uuidv4 } = require('uuid')
const router = express.Router()

// Mock prompts database
const prompts = [
  {
    id: '1',
    title: 'Advanced Code Review Assistant',
    description: 'Comprehensive code analysis with security, performance, and best practices review',
    content: `You are an expert code reviewer with 10+ years of experience. Analyze the following code for:

1. **Security Vulnerabilities**
   - SQL injection risks
   - XSS vulnerabilities
   - Authentication bypasses
   - Data exposure issues

2. **Performance Issues**
   - Algorithmic complexity
   - Memory leaks
   - Inefficient database queries
   - Resource utilization

3. **Code Quality**
   - Readability and maintainability
   - Code duplication
   - Naming conventions
   - Documentation quality

4. **Best Practices**
   - Design patterns usage
   - Error handling
   - Testing coverage
   - Code organization

Provide specific recommendations with code examples for improvements.

Code to review:
{code}`,
    category: {
      id: 'development',
      name: 'Development',
      description: 'Software development and programming prompts',
      icon: 'code',
      color: '#3b82f6'
    },
    tags: ['code', 'review', 'security', 'performance', 'best-practices'],
    author: {
      id: '1',
      name: 'Demo User',
      avatar: null
    },
    metadata: {
      version: '1.0.0',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      views: 1234,
      likes: 89,
      downloads: 234,
      rating: 4.9,
      difficulty: 'advanced',
      estimatedTime: 15,
      language: 'en',
      framework: 'general',
      model: ['gpt-4', 'claude-3-opus']
    },
    context: {
      variables: [
        {
          id: 'code',
          name: 'code',
          type: 'textarea',
          label: 'Code to Review',
          description: 'The code you want to review',
          required: true,
          validation: {
            min: 10,
            message: 'Code must be at least 10 characters long'
          }
        }
      ],
      examples: [
        {
          id: '1',
          title: 'Python Function Review',
          input: { code: 'def calculate_total(items):\n    total = 0\n    for item in items:\n        total += item.price\n    return total' },
          output: 'The function has a potential issue with error handling...',
          description: 'Example of reviewing a simple Python function'
        }
      ],
      instructions: 'Focus on providing actionable feedback with specific code examples',
      constraints: ['Be constructive', 'Provide code examples', 'Focus on security and performance']
    },
    isPublic: true,
    isTemplate: true,
    isFavorite: false,
    collaborators: [],
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true
    }
  },
  {
    id: '2',
    title: 'Creative Writing Generator',
    description: 'Generate compelling stories, articles, and creative content',
    content: `You are a creative writing expert. Create a {type} about {topic} with the following requirements:

**Tone:** {tone}
**Length:** {length}
**Style:** {style}
**Target Audience:** {audience}

**Structure:**
1. Engaging opening hook
2. Well-developed characters (if applicable)
3. Compelling plot progression
4. Satisfying conclusion
5. Clear theme or message

**Writing Guidelines:**
- Use vivid, descriptive language
- Show, don't tell
- Create emotional resonance
- Maintain consistent voice
- Include sensory details

**Output Format:**
- Title
- Content
- Brief analysis of key elements used

Make it engaging, original, and memorable.`,
    category: {
      id: 'writing',
      name: 'Writing',
      description: 'Creative and professional writing prompts',
      icon: 'pen',
      color: '#10b981'
    },
    tags: ['writing', 'creative', 'story', 'content', 'narrative'],
    author: {
      id: '1',
      name: 'Demo User',
      avatar: null
    },
    metadata: {
      version: '1.0.0',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      views: 987,
      likes: 67,
      downloads: 156,
      rating: 4.8,
      difficulty: 'intermediate',
      estimatedTime: 10,
      language: 'en',
      model: ['gpt-4', 'claude-3-sonnet']
    },
    context: {
      variables: [
        {
          id: 'type',
          name: 'type',
          type: 'select',
          label: 'Content Type',
          description: 'Type of creative content to generate',
          required: true,
          options: ['story', 'poem', 'article', 'script', 'essay']
        },
        {
          id: 'topic',
          name: 'topic',
          type: 'text',
          label: 'Topic',
          description: 'Main subject or theme',
          required: true
        },
        {
          id: 'tone',
          name: 'tone',
          type: 'select',
          label: 'Tone',
          description: 'Overall mood or feeling',
          required: true,
          options: ['formal', 'casual', 'humorous', 'dramatic', 'mysterious', 'romantic']
        },
        {
          id: 'length',
          name: 'length',
          type: 'select',
          label: 'Length',
          description: 'Desired length of content',
          required: true,
          options: ['short', 'medium', 'long']
        },
        {
          id: 'style',
          name: 'style',
          type: 'text',
          label: 'Style',
          description: 'Writing style or approach',
          required: false
        },
        {
          id: 'audience',
          name: 'audience',
          type: 'text',
          label: 'Target Audience',
          description: 'Who this content is for',
          required: false
        }
      ],
      examples: [
        {
          id: '1',
          title: 'Short Story Example',
          input: {
            type: 'story',
            topic: 'time travel',
            tone: 'mysterious',
            length: 'short',
            style: 'science fiction',
            audience: 'young adults'
          },
          output: 'The Clock Tower...',
          description: 'Example of a short sci-fi story about time travel'
        }
      ],
      instructions: 'Create engaging, original content that follows the specified requirements',
      constraints: ['Be original', 'Follow the specified tone', 'Maintain appropriate length']
    },
    isPublic: true,
    isTemplate: true,
    isFavorite: true,
    collaborators: [],
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true
    }
  }
]

// Get all prompts
router.get('/', (req, res) => {
  const { category, search, tags, difficulty, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = req.query
  
  let filteredPrompts = [...prompts]
  
  // Filter by category
  if (category) {
    filteredPrompts = filteredPrompts.filter(p => p.category.id === category)
  }
  
  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase()
    filteredPrompts = filteredPrompts.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }
  
  // Filter by tags
  if (tags) {
    const tagArray = tags.split(',')
    filteredPrompts = filteredPrompts.filter(p => 
      tagArray.some(tag => p.tags.includes(tag))
    )
  }
  
  // Filter by difficulty
  if (difficulty) {
    filteredPrompts = filteredPrompts.filter(p => p.metadata.difficulty === difficulty)
  }
  
  // Sort
  filteredPrompts.sort((a, b) => {
    const aValue = a.metadata[sortBy] || a[sortBy]
    const bValue = b.metadata[sortBy] || b[sortBy]
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + parseInt(limit)
  const paginatedPrompts = filteredPrompts.slice(startIndex, endIndex)
  
  res.json({
    prompts: paginatedPrompts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredPrompts.length,
      pages: Math.ceil(filteredPrompts.length / limit)
    }
  })
})

// Get prompt by ID
router.get('/:id', (req, res) => {
  const prompt = prompts.find(p => p.id === req.params.id)
  if (!prompt) {
    return res.status(404).json({ error: 'Prompt not found' })
  }
  
  // Increment view count
  prompt.metadata.views++
  
  res.json(prompt)
})

// Create new prompt
router.post('/', (req, res) => {
  try {
    const { title, description, content, category, tags, context, isPublic = false } = req.body
    
    const newPrompt = {
      id: uuidv4(),
      title,
      description,
      content,
      category: category || { id: 'general', name: 'General', description: 'General purpose prompts', icon: 'star', color: '#6b7280' },
      tags: tags || [],
      author: {
        id: '1', // In real app, get from auth
        name: 'Demo User',
        avatar: null
      },
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        likes: 0,
        downloads: 0,
        rating: 0,
        difficulty: 'beginner',
        estimatedTime: 5,
        language: 'en',
        model: ['gpt-4']
      },
      context: context || {
        variables: [],
        examples: [],
        instructions: '',
        constraints: []
      },
      isPublic,
      isTemplate: false,
      isFavorite: false,
      collaborators: [],
      permissions: {
        canEdit: true,
        canDelete: true,
        canShare: true
      }
    }
    
    prompts.push(newPrompt)
    res.status(201).json(newPrompt)
  } catch (error) {
    console.error('Create prompt error:', error)
    res.status(500).json({ error: 'Failed to create prompt' })
  }
})

// Update prompt
router.put('/:id', (req, res) => {
  try {
    const promptIndex = prompts.findIndex(p => p.id === req.params.id)
    if (promptIndex === -1) {
      return res.status(404).json({ error: 'Prompt not found' })
    }
    
    const { title, description, content, category, tags, context, isPublic } = req.body
    const prompt = prompts[promptIndex]
    
    if (title) prompt.title = title
    if (description) prompt.description = description
    if (content) prompt.content = content
    if (category) prompt.category = category
    if (tags) prompt.tags = tags
    if (context) prompt.context = context
    if (typeof isPublic === 'boolean') prompt.isPublic = isPublic
    
    prompt.metadata.updatedAt = new Date()
    
    res.json(prompt)
  } catch (error) {
    console.error('Update prompt error:', error)
    res.status(500).json({ error: 'Failed to update prompt' })
  }
})

// Delete prompt
router.delete('/:id', (req, res) => {
  const promptIndex = prompts.findIndex(p => p.id === req.params.id)
  if (promptIndex === -1) {
    return res.status(404).json({ error: 'Prompt not found' })
  }
  
  prompts.splice(promptIndex, 1)
  res.json({ message: 'Prompt deleted successfully' })
})

// Like/Unlike prompt
router.post('/:id/like', (req, res) => {
  const prompt = prompts.find(p => p.id === req.params.id)
  if (!prompt) {
    return res.status(404).json({ error: 'Prompt not found' })
  }
  
  const { action } = req.body // 'like' or 'unlike'
  
  if (action === 'like') {
    prompt.metadata.likes++
  } else if (action === 'unlike') {
    prompt.metadata.likes = Math.max(0, prompt.metadata.likes - 1)
  }
  
  res.json({ likes: prompt.metadata.likes })
})

// Download prompt
router.post('/:id/download', (req, res) => {
  const prompt = prompts.find(p => p.id === req.params.id)
  if (!prompt) {
    return res.status(404).json({ error: 'Prompt not found' })
  }
  
  prompt.metadata.downloads++
  
  res.json({ 
    message: 'Download recorded',
    downloads: prompt.metadata.downloads
  })
})

// Get prompt categories
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'development', name: 'Development', description: 'Software development and programming', icon: 'code', color: '#3b82f6' },
    { id: 'writing', name: 'Writing', description: 'Creative and professional writing', icon: 'pen', color: '#10b981' },
    { id: 'analytics', name: 'Analytics', description: 'Data analysis and insights', icon: 'chart', color: '#f59e0b' },
    { id: 'marketing', name: 'Marketing', description: 'Marketing and sales content', icon: 'megaphone', color: '#ef4444' },
    { id: 'education', name: 'Education', description: 'Educational content and learning', icon: 'book', color: '#8b5cf6' },
    { id: 'business', name: 'Business', description: 'Business and strategy', icon: 'briefcase', color: '#06b6d4' }
  ]
  
  res.json(categories)
})

module.exports = router

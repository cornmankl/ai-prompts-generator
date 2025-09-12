const express = require('express')
const { v4: uuidv4 } = require('uuid')
const router = express.Router()

// Mock templates database
const templates = [
  {
    id: 'code-review',
    name: 'Code Review Assistant',
    description: 'Comprehensive code analysis and review',
    category: 'development',
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
    template: `You are an expert code reviewer with 10+ years of experience. Analyze the following code for:

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
    examples: [
      {
        id: '1',
        title: 'Python Function Review',
        input: { code: 'def calculate_total(items):\n    total = 0\n    for item in items:\n        total += item.price\n    return total' },
        output: 'The function has a potential issue with error handling...',
        description: 'Example of reviewing a simple Python function'
      }
    ],
    isPublic: true,
    author: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing Generator',
    description: 'Generate compelling creative content',
    category: 'writing',
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
      }
    ],
    template: `You are a creative writing expert. Create a {type} about {topic} with the following requirements:

**Tone:** {tone}
**Length:** {length}
**Style:** {style}

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
    examples: [
      {
        id: '1',
        title: 'Short Story Example',
        input: {
          type: 'story',
          topic: 'time travel',
          tone: 'mysterious',
          length: 'short',
          style: 'science fiction'
        },
        output: 'The Clock Tower...',
        description: 'Example of a short sci-fi story about time travel'
      }
    ],
    isPublic: true,
    author: '1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Assistant',
    description: 'Advanced data analysis and insights',
    category: 'analytics',
    variables: [
      {
        id: 'data',
        name: 'data',
        type: 'textarea',
        label: 'Data',
        description: 'The data to analyze',
        required: true
      },
      {
        id: 'context',
        name: 'context',
        type: 'text',
        label: 'Context',
        description: 'Additional context about the data',
        required: false
      },
      {
        id: 'goals',
        name: 'goals',
        type: 'textarea',
        label: 'Analysis Goals',
        description: 'What you want to discover or understand',
        required: false
      }
    ],
    template: `You are a data analyst with expertise in statistical analysis and data visualization. Analyze the following data and provide insights:

**Data:**
{data}

**Context:**
{context}

**Analysis Goals:**
{goals}

**Provide:**
1. **Data Overview**
   - Data type and structure
   - Key statistics and summary
   - Data quality assessment

2. **Key Findings**
   - Significant patterns and trends
   - Correlations and relationships
   - Outliers and anomalies

3. **Insights and Recommendations**
   - Actionable insights
   - Business implications
   - Next steps for further analysis

4. **Visualization Suggestions**
   - Recommended charts and graphs
   - Data presentation strategies
   - Interactive elements

5. **Limitations and Considerations**
   - Data limitations
   - Assumptions made
   - Potential biases

Focus on providing clear, actionable insights that can drive decision-making.`,
    examples: [
      {
        id: '1',
        title: 'Sales Data Analysis',
        input: {
          data: 'Month,Revenue,Units\nJan,10000,100\nFeb,12000,120\nMar,11000,110',
          context: 'Q1 sales data for a retail company',
          goals: 'Identify trends and growth opportunities'
        },
        output: 'The data shows a 20% increase in revenue from Jan to Feb...',
        description: 'Example of analyzing quarterly sales data'
      }
    ],
    isPublic: true,
    author: '1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
]

// Get all templates
router.get('/', (req, res) => {
  const { category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query
  
  let filteredTemplates = [...templates]
  
  // Filter by category
  if (category) {
    filteredTemplates = filteredTemplates.filter(t => t.category === category)
  }
  
  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase()
    filteredTemplates = filteredTemplates.filter(t => 
      t.name.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower)
    )
  }
  
  // Sort
  filteredTemplates.sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  res.json(filteredTemplates)
})

// Get template by ID
router.get('/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id)
  if (!template) {
    return res.status(404).json({ error: 'Template not found' })
  }
  
  res.json(template)
})

// Create new template
router.post('/', (req, res) => {
  try {
    const { name, description, category, variables, template, examples, isPublic = false } = req.body
    
    const newTemplate = {
      id: uuidv4(),
      name,
      description,
      category,
      variables: variables || [],
      template,
      examples: examples || [],
      isPublic,
      author: '1', // In real app, get from auth
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    templates.push(newTemplate)
    res.status(201).json(newTemplate)
  } catch (error) {
    console.error('Create template error:', error)
    res.status(500).json({ error: 'Failed to create template' })
  }
})

// Update template
router.put('/:id', (req, res) => {
  try {
    const templateIndex = templates.findIndex(t => t.id === req.params.id)
    if (templateIndex === -1) {
      return res.status(404).json({ error: 'Template not found' })
    }
    
    const { name, description, category, variables, template, examples, isPublic } = req.body
    const templateObj = templates[templateIndex]
    
    if (name) templateObj.name = name
    if (description) templateObj.description = description
    if (category) templateObj.category = category
    if (variables) templateObj.variables = variables
    if (template) templateObj.template = template
    if (examples) templateObj.examples = examples
    if (typeof isPublic === 'boolean') templateObj.isPublic = isPublic
    
    templateObj.updatedAt = new Date()
    
    res.json(templateObj)
  } catch (error) {
    console.error('Update template error:', error)
    res.status(500).json({ error: 'Failed to update template' })
  }
})

// Delete template
router.delete('/:id', (req, res) => {
  const templateIndex = templates.findIndex(t => t.id === req.params.id)
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' })
  }
  
  templates.splice(templateIndex, 1)
  res.json({ message: 'Template deleted successfully' })
})

// Get template categories
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'development', name: 'Development', description: 'Software development and programming' },
    { id: 'writing', name: 'Writing', description: 'Creative and professional writing' },
    { id: 'analytics', name: 'Analytics', description: 'Data analysis and insights' },
    { id: 'marketing', name: 'Marketing', description: 'Marketing and sales content' },
    { id: 'education', name: 'Education', description: 'Educational content and learning' },
    { id: 'business', name: 'Business', description: 'Business and strategy' }
  ]
  
  res.json(categories)
})

module.exports = router

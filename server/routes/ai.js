const express = require('express')
const { OpenAI } = require('openai')
const Anthropic = require('@anthropic-ai/sdk')
const router = express.Router()

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-key'
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'your-anthropic-key'
})

// Generate prompt
router.post('/generate', async (req, res) => {
  try {
    const { template, variables, model, temperature, maxTokens, contextProfile } = req.body

    // Process template with variables
    let processedPrompt = template
    Object.entries(variables || {}).forEach(([key, value]) => {
      processedPrompt = processedPrompt.replace(new RegExp(`{${key}}`, 'g'), value)
    })

    // Apply context profile optimizations
    const optimizedPrompt = await applyContextProfile(processedPrompt, contextProfile)

    let response
    const startTime = Date.now()

    try {
      if (model.startsWith('gpt')) {
        response = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert prompt engineer. Generate high-quality, optimized prompts based on the given template and context.'
            },
            {
              role: 'user',
              content: optimizedPrompt
            }
          ],
          temperature: temperature || 0.7,
          max_tokens: maxTokens || 2000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })

        const generatedContent = response.choices[0].message.content
        const tokens = response.usage.total_tokens
        const cost = calculateCost(model, tokens)

        res.json({
          id: generateId(),
          content: generatedContent,
          metadata: {
            model,
            tokens,
            time: Date.now() - startTime,
            cost
          },
          alternatives: await generateAlternatives(optimizedPrompt, model),
          suggestions: await generateSuggestions(optimizedPrompt)
        })
      } else if (model.startsWith('claude')) {
        response = await anthropic.messages.create({
          model: model,
          max_tokens: maxTokens || 2000,
          temperature: temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: optimizedPrompt
            }
          ]
        })

        const generatedContent = response.content[0].text
        const tokens = response.usage.input_tokens + response.usage.output_tokens
        const cost = calculateCost(model, tokens)

        res.json({
          id: generateId(),
          content: generatedContent,
          metadata: {
            model,
            tokens,
            time: Date.now() - startTime,
            cost
          },
          alternatives: await generateAlternatives(optimizedPrompt, model),
          suggestions: await generateSuggestions(optimizedPrompt)
        })
      } else {
        throw new Error('Unsupported model')
      }
    } catch (apiError) {
      console.error('AI API error:', apiError)
      
      // Fallback to mock response for demo
      const mockResponse = generateMockResponse(optimizedPrompt)
      res.json({
        id: generateId(),
        content: mockResponse,
        metadata: {
          model,
          tokens: 150,
          time: Date.now() - startTime,
          cost: 0.001
        },
        alternatives: [
          'Alternative version 1: ' + mockResponse.substring(0, 100) + '...',
          'Alternative version 2: ' + mockResponse.substring(50, 150) + '...'
        ],
        suggestions: [
          'Add more specific instructions for better results',
          'Include examples to improve context understanding',
          'Specify the desired output format',
          'Add constraints to prevent unwanted responses'
        ]
      })
    }
  } catch (error) {
    console.error('Generation error:', error)
    res.status(500).json({ error: 'Prompt generation failed' })
  }
})

// Optimize prompt
router.post('/optimize', async (req, res) => {
  try {
    const { prompt, contextProfile } = req.body

    // Apply context profile optimizations
    const optimizedPrompt = await applyContextProfile(prompt, contextProfile)

    // Generate optimization suggestions
    const suggestions = await generateOptimizationSuggestions(prompt)

    res.json({
      optimizedPrompt,
      suggestions,
      improvements: {
        clarity: calculateClarityScore(optimizedPrompt),
        specificity: calculateSpecificityScore(optimizedPrompt),
        completeness: calculateCompletenessScore(optimizedPrompt)
      }
    })
  } catch (error) {
    console.error('Optimization error:', error)
    res.status(500).json({ error: 'Prompt optimization failed' })
  }
})

// Analyze prompt
router.post('/analyze', async (req, res) => {
  try {
    const { prompt } = req.body

    const analysis = {
      wordCount: prompt.split(' ').length,
      characterCount: prompt.length,
      readability: calculateReadabilityScore(prompt),
      clarity: calculateClarityScore(prompt),
      specificity: calculateSpecificityScore(prompt),
      completeness: calculateCompletenessScore(prompt),
      estimatedTokens: Math.ceil(prompt.length / 4), // Rough estimation
      suggestions: await generateAnalysisSuggestions(prompt)
    }

    res.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ error: 'Prompt analysis failed' })
  }
})

// Helper functions
async function applyContextProfile(prompt, profileId) {
  const profiles = {
    default: (p) => p,
    technical: (p) => `[Technical Context] ${p}\n\nProvide detailed technical analysis and implementation guidance.`,
    creative: (p) => `[Creative Context] ${p}\n\nFocus on creativity, originality, and engaging content.`,
    analytical: (p) => `[Analytical Context] ${p}\n\nProvide data-driven insights and evidence-based recommendations.`,
    educational: (p) => `[Educational Context] ${p}\n\nStructure the response for learning with clear explanations and examples.`
  }

  return profiles[profileId] ? profiles[profileId](prompt) : prompt
}

async function generateAlternatives(prompt, model) {
  // In a real implementation, this would generate actual alternatives
  return [
    'Alternative 1: ' + prompt.substring(0, 100) + '...',
    'Alternative 2: ' + prompt.substring(50, 150) + '...'
  ]
}

async function generateSuggestions(prompt) {
  return [
    'Add more specific instructions for better results',
    'Include examples to improve context understanding',
    'Specify the desired output format',
    'Add constraints to prevent unwanted responses'
  ]
}

async function generateOptimizationSuggestions(prompt) {
  const suggestions = []
  
  if (prompt.length < 50) {
    suggestions.push('Consider adding more detail to improve clarity')
  }
  
  if (!prompt.includes('specific') && !prompt.includes('detailed')) {
    suggestions.push('Add specific requirements for better results')
  }
  
  if (!prompt.includes('example') && !prompt.includes('format')) {
    suggestions.push('Include examples or specify output format')
  }
  
  if (!prompt.includes('constraint') && !prompt.includes('avoid')) {
    suggestions.push('Add constraints to prevent unwanted responses')
  }

  return suggestions
}

async function generateAnalysisSuggestions(prompt) {
  const suggestions = []
  
  if (prompt.length < 100) {
    suggestions.push('Consider expanding the prompt for better context')
  }
  
  if (prompt.split(' ').length < 20) {
    suggestions.push('Add more descriptive words for clarity')
  }
  
  if (!prompt.includes('?')) {
    suggestions.push('Consider adding questions to guide the response')
  }

  return suggestions
}

function calculateClarityScore(prompt) {
  // Simple clarity scoring based on prompt structure
  let score = 0.5
  
  if (prompt.includes('specific')) score += 0.1
  if (prompt.includes('detailed')) score += 0.1
  if (prompt.includes('example')) score += 0.1
  if (prompt.includes('format')) score += 0.1
  if (prompt.includes('step')) score += 0.1
  
  return Math.min(1, score)
}

function calculateSpecificityScore(prompt) {
  // Calculate specificity based on concrete terms
  const concreteTerms = ['specific', 'exact', 'precise', 'detailed', 'particular']
  const matches = concreteTerms.filter(term => prompt.toLowerCase().includes(term)).length
  return Math.min(1, matches / 3)
}

function calculateCompletenessScore(prompt) {
  // Calculate completeness based on prompt elements
  let score = 0.2
  
  if (prompt.includes('context')) score += 0.2
  if (prompt.includes('goal') || prompt.includes('objective')) score += 0.2
  if (prompt.includes('format') || prompt.includes('structure')) score += 0.2
  if (prompt.includes('example')) score += 0.2
  
  return Math.min(1, score)
}

function calculateReadabilityScore(prompt) {
  // Simple readability score based on sentence length and complexity
  const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgWordsPerSentence = prompt.split(' ').length / sentences.length
  
  if (avgWordsPerSentence < 15) return 0.9
  if (avgWordsPerSentence < 25) return 0.7
  if (avgWordsPerSentence < 35) return 0.5
  return 0.3
}

function calculateCost(model, tokens) {
  const pricing = {
    'gpt-4': 0.03 / 1000,
    'gpt-3.5-turbo': 0.002 / 1000,
    'claude-3-opus': 0.015 / 1000,
    'claude-3-sonnet': 0.003 / 1000
  }
  
  return (pricing[model] || 0.001) * tokens
}

function generateMockResponse(prompt) {
  return `Here's an optimized version of your prompt:

${prompt}

This enhanced version includes:
- Clear instructions and context
- Specific requirements for the desired output
- Examples to guide the AI's response
- Constraints to ensure quality results

The prompt is now more likely to generate accurate, relevant, and useful responses from AI models.`
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

module.exports = router

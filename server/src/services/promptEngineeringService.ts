import { cacheService } from './cacheService';
import { logger } from './loggerService';
import { aiService } from './aiService';

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    category: string;
    tags: string[];
    variables: Array<{
        name: string;
        type: 'text' | 'number' | 'select' | 'boolean' | 'multiselect';
        required: boolean;
        defaultValue?: any;
        options?: string[];
        description?: string;
        validation?: {
            min?: number;
            max?: number;
            pattern?: string;
            custom?: string;
        };
    }>;
    isPublic: boolean;
    author: string;
    usageCount: number;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTokens: number;
    expectedOutput: string;
    examples: Array<{
        input: Record<string, any>;
        output: string;
        explanation: string;
    }>;
}

export interface PromptOptimization {
    originalPrompt: string;
    optimizedPrompt: string;
    improvements: Array<{
        type: 'clarity' | 'structure' | 'specificity' | 'context' | 'examples';
        description: string;
        impact: 'low' | 'medium' | 'high';
        suggestion: string;
    }>;
    estimatedImprovement: number;
    confidence: number;
}

export interface PromptAnalysis {
    prompt: string;
    analysis: {
        length: number;
        complexity: number;
        clarity: number;
        specificity: number;
        structure: number;
        overall: number;
    };
    suggestions: Array<{
        type: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        example: string;
    }>;
    estimatedTokens: number;
    expectedResponseTime: number;
    recommendedModels: string[];
}

export interface PromptChain {
    id: string;
    name: string;
    description: string;
    steps: Array<{
        id: string;
        name: string;
        prompt: string;
        model: string;
        outputVariable: string;
        conditions?: Array<{
            variable: string;
            operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists';
            value: any;
        }>;
        retryCount: number;
        timeout: number;
    }>;
    variables: Record<string, any>;
    isPublic: boolean;
    author: string;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PromptLibrary {
    categories: Array<{
        name: string;
        description: string;
        templates: PromptTemplate[];
        subcategories: Array<{
            name: string;
            description: string;
            templates: PromptTemplate[];
        }>;
    }>;
    featured: PromptTemplate[];
    trending: PromptTemplate[];
    recent: PromptTemplate[];
    userFavorites: PromptTemplate[];
}

export class PromptEngineeringService {
    private templates: Map<string, PromptTemplate> = new Map();
    private chains: Map<string, PromptChain> = new Map();

    constructor() {
        this.initializeDefaultTemplates();
    }

    private initializeDefaultTemplates(): void {
        const defaultTemplates: PromptTemplate[] = [
            {
                id: 'code-review',
                name: 'Code Review Assistant',
                description: 'Comprehensive code review with security, performance, and best practices analysis',
                content: `Please review the following code and provide a comprehensive analysis:

**Code:**
\`\`\`{language}
{code}
\`\`\`

**Review Criteria:**
1. **Security**: Check for vulnerabilities, input validation, authentication issues
2. **Performance**: Identify bottlenecks, optimization opportunities, memory usage
3. **Best Practices**: Code style, naming conventions, documentation, error handling
4. **Maintainability**: Code structure, modularity, testability
5. **Accessibility**: If applicable, check for accessibility compliance

**Output Format:**
- **Critical Issues** (High Priority)
- **Improvements** (Medium Priority)  
- **Suggestions** (Low Priority)
- **Overall Rating**: X/10
- **Summary**: Brief overview of code quality

Please be specific and provide code examples for improvements.`,
                category: 'development',
                tags: ['code', 'review', 'security', 'performance', 'best-practices'],
                variables: [
                    {
                        name: 'language',
                        type: 'select',
                        required: true,
                        options: ['javascript', 'python', 'java', 'csharp', 'go', 'rust', 'php', 'ruby'],
                        description: 'Programming language of the code'
                    },
                    {
                        name: 'code',
                        type: 'text',
                        required: true,
                        description: 'The code to review'
                    }
                ],
                isPublic: true,
                author: 'system',
                usageCount: 0,
                rating: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0.0',
                difficulty: 'intermediate',
                estimatedTokens: 2000,
                expectedOutput: 'Structured code review with security, performance, and best practices analysis',
                examples: [
                    {
                        input: { language: 'javascript', code: 'function add(a, b) { return a + b; }' },
                        output: 'Code review analysis...',
                        explanation: 'This template analyzes JavaScript code for various quality aspects'
                    }
                ]
            },
            {
                id: 'creative-writing',
                name: 'Creative Writing Assistant',
                description: 'AI-powered creative writing with genre-specific guidance and style suggestions',
                content: `Write a {genre} story with the following elements:

**Genre**: {genre}
**Theme**: {theme}
**Characters**: {characters}
**Setting**: {setting}
**Plot Points**: {plot_points}
**Tone**: {tone}
**Length**: {length}

**Writing Guidelines:**
- Use vivid, descriptive language
- Show, don't tell
- Create compelling dialogue
- Build tension and conflict
- Develop characters with depth
- Use appropriate pacing for the genre

**Structure:**
1. **Opening**: Hook the reader immediately
2. **Development**: Build characters and world
3. **Climax**: Peak tension and conflict
4. **Resolution**: Satisfying conclusion

Please write the story following these guidelines.`,
                category: 'creative',
                tags: ['writing', 'story', 'creative', 'fiction', 'narrative'],
                variables: [
                    {
                        name: 'genre',
                        type: 'select',
                        required: true,
                        options: ['fantasy', 'sci-fi', 'mystery', 'romance', 'thriller', 'horror', 'drama', 'comedy'],
                        description: 'Genre of the story'
                    },
                    {
                        name: 'theme',
                        type: 'text',
                        required: true,
                        description: 'Main theme or message of the story'
                    },
                    {
                        name: 'characters',
                        type: 'text',
                        required: true,
                        description: 'Main characters and their descriptions'
                    },
                    {
                        name: 'setting',
                        type: 'text',
                        required: true,
                        description: 'Time and place where the story takes place'
                    },
                    {
                        name: 'plot_points',
                        type: 'text',
                        required: true,
                        description: 'Key plot points or events'
                    },
                    {
                        name: 'tone',
                        type: 'select',
                        required: true,
                        options: ['serious', 'humorous', 'dark', 'light', 'mysterious', 'romantic', 'dramatic'],
                        description: 'Overall tone of the story'
                    },
                    {
                        name: 'length',
                        type: 'select',
                        required: true,
                        options: ['short', 'medium', 'long'],
                        description: 'Desired length of the story'
                    }
                ],
                isPublic: true,
                author: 'system',
                usageCount: 0,
                rating: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0.0',
                difficulty: 'beginner',
                estimatedTokens: 3000,
                expectedOutput: 'Complete creative story following the specified guidelines',
                examples: [
                    {
                        input: {
                            genre: 'fantasy',
                            theme: 'good vs evil',
                            characters: 'A young wizard and a dark sorcerer',
                            setting: 'Medieval magical kingdom',
                            plot_points: 'Discovery of magical powers, epic battle',
                            tone: 'dramatic',
                            length: 'medium'
                        },
                        output: 'Fantasy story about a young wizard...',
                        explanation: 'This template helps create structured creative writing'
                    }
                ]
            },
            {
                id: 'business-analysis',
                name: 'Business Analysis Assistant',
                description: 'Comprehensive business analysis with market research, SWOT analysis, and strategic recommendations',
                content: `Conduct a comprehensive business analysis for the following:

**Company/Product**: {company_name}
**Industry**: {industry}
**Business Model**: {business_model}
**Target Market**: {target_market}
**Key Metrics**: {key_metrics}
**Challenges**: {challenges}

**Analysis Framework:**
1. **Market Analysis**
   - Market size and growth potential
   - Competitive landscape
   - Market trends and opportunities
   - Customer segments and needs

2. **SWOT Analysis**
   - Strengths: Internal advantages
   - Weaknesses: Internal limitations
   - Opportunities: External possibilities
   - Threats: External challenges

3. **Financial Analysis**
   - Revenue streams and projections
   - Cost structure and profitability
   - Investment requirements
   - ROI and payback period

4. **Strategic Recommendations**
   - Short-term actions (0-6 months)
   - Medium-term goals (6-18 months)
   - Long-term vision (18+ months)
   - Risk mitigation strategies

**Output Format:**
- Executive Summary
- Detailed Analysis by Section
- Key Insights and Findings
- Strategic Recommendations
- Implementation Roadmap
- Risk Assessment

Please provide actionable insights and specific recommendations.`,
                category: 'business',
                tags: ['business', 'analysis', 'strategy', 'market-research', 'swot'],
                variables: [
                    {
                        name: 'company_name',
                        type: 'text',
                        required: true,
                        description: 'Name of the company or product'
                    },
                    {
                        name: 'industry',
                        type: 'text',
                        required: true,
                        description: 'Industry or sector'
                    },
                    {
                        name: 'business_model',
                        type: 'text',
                        required: true,
                        description: 'How the business makes money'
                    },
                    {
                        name: 'target_market',
                        type: 'text',
                        required: true,
                        description: 'Primary target customers'
                    },
                    {
                        name: 'key_metrics',
                        type: 'text',
                        required: false,
                        description: 'Important business metrics to analyze'
                    },
                    {
                        name: 'challenges',
                        type: 'text',
                        required: false,
                        description: 'Current challenges or pain points'
                    }
                ],
                isPublic: true,
                author: 'system',
                usageCount: 0,
                rating: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0.0',
                difficulty: 'advanced',
                estimatedTokens: 4000,
                expectedOutput: 'Comprehensive business analysis with strategic recommendations',
                examples: [
                    {
                        input: {
                            company_name: 'TechStart Inc',
                            industry: 'SaaS',
                            business_model: 'Subscription-based software',
                            target_market: 'Small to medium businesses',
                            key_metrics: 'MRR, CAC, LTV',
                            challenges: 'Customer acquisition, competition'
                        },
                        output: 'Business analysis for TechStart Inc...',
                        explanation: 'This template provides structured business analysis'
                    }
                ]
            }
        ];

        defaultTemplates.forEach(template => {
            this.templates.set(template.id, template);
        });
    }

    async getTemplates(category?: string, search?: string, tags?: string[]): Promise<PromptTemplate[]> {
        try {
            let templates = Array.from(this.templates.values());

            // Filter by category
            if (category) {
                templates = templates.filter(t => t.category === category);
            }

            // Filter by search term
            if (search) {
                const searchLower = search.toLowerCase();
                templates = templates.filter(t =>
                    t.name.toLowerCase().includes(searchLower) ||
                    t.description.toLowerCase().includes(searchLower) ||
                    t.tags.some(tag => tag.toLowerCase().includes(searchLower))
                );
            }

            // Filter by tags
            if (tags && tags.length > 0) {
                templates = templates.filter(t =>
                    tags.some(tag => t.tags.includes(tag))
                );
            }

            // Sort by usage count and rating
            templates.sort((a, b) => {
                const scoreA = a.usageCount * 0.7 + a.rating * 0.3;
                const scoreB = b.usageCount * 0.7 + b.rating * 0.3;
                return scoreB - scoreA;
            });

            return templates;
        } catch (error) {
            logger.error('Error getting templates:', error);
            throw error;
        }
    }

    async getTemplate(id: string): Promise<PromptTemplate | null> {
        try {
            return this.templates.get(id) || null;
        } catch (error) {
            logger.error('Error getting template:', error);
            throw error;
        }
    }

    async createTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating'>): Promise<PromptTemplate> {
        try {
            const newTemplate: PromptTemplate = {
                ...template,
                id: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
                usageCount: 0,
                rating: 0
            };

            this.templates.set(newTemplate.id, newTemplate);

            // Cache the template
            await cacheService.set(
                `template:${newTemplate.id}`,
                JSON.stringify(newTemplate),
                3600
            );

            logger.info(`Template created: ${newTemplate.id}`);
            return newTemplate;
        } catch (error) {
            logger.error('Error creating template:', error);
            throw error;
        }
    }

    async updateTemplate(id: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate | null> {
        try {
            const template = this.templates.get(id);
            if (!template) return null;

            const updatedTemplate = {
                ...template,
                ...updates,
                updatedAt: new Date()
            };

            this.templates.set(id, updatedTemplate);

            // Update cache
            await cacheService.set(
                `template:${id}`,
                JSON.stringify(updatedTemplate),
                3600
            );

            logger.info(`Template updated: ${id}`);
            return updatedTemplate;
        } catch (error) {
            logger.error('Error updating template:', error);
            throw error;
        }
    }

    async deleteTemplate(id: string): Promise<boolean> {
        try {
            const deleted = this.templates.delete(id);
            if (deleted) {
                await cacheService.del(`template:${id}`);
                logger.info(`Template deleted: ${id}`);
            }
            return deleted;
        } catch (error) {
            logger.error('Error deleting template:', error);
            throw error;
        }
    }

    async useTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error('Template not found');
            }

            // Validate required variables
            const missingVariables = template.variables
                .filter(v => v.required && !(v.name in variables))
                .map(v => v.name);

            if (missingVariables.length > 0) {
                throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
            }

            // Replace variables in template
            let content = template.content;
            for (const variable of template.variables) {
                const value = variables[variable.name] || variable.defaultValue || '';
                const placeholder = `{${variable.name}}`;
                content = content.replace(new RegExp(placeholder, 'g'), value);
            }

            // Increment usage count
            template.usageCount += 1;
            this.templates.set(templateId, template);

            logger.info(`Template used: ${templateId}`);
            return content;
        } catch (error) {
            logger.error('Error using template:', error);
            throw error;
        }
    }

    async optimizePrompt(prompt: string): Promise<PromptOptimization> {
        try {
            // Use AI to analyze and optimize the prompt
            const analysisPrompt = `Analyze and optimize the following prompt for better results:

**Original Prompt:**
${prompt}

**Optimization Criteria:**
1. **Clarity**: Is the prompt clear and unambiguous?
2. **Structure**: Is the prompt well-structured and organized?
3. **Specificity**: Are the requirements specific enough?
4. **Context**: Is sufficient context provided?
5. **Examples**: Would examples help clarify the request?

**Please provide:**
1. An optimized version of the prompt
2. Specific improvements made
3. Estimated improvement percentage
4. Confidence level (0-100%)

Format your response as JSON with the following structure:
{
  "optimizedPrompt": "...",
  "improvements": [
    {
      "type": "clarity|structure|specificity|context|examples",
      "description": "...",
      "impact": "low|medium|high",
      "suggestion": "..."
    }
  ],
  "estimatedImprovement": 0.0,
  "confidence": 0.0
}`;

            const response = await aiService.generateResponse({
                model: 'gpt-4o',
                prompt: analysisPrompt,
                userId: 'system',
                options: {
                    temperature: 0.3,
                    maxTokens: 2000
                }
            });

            const optimization = JSON.parse(response.content);

            return {
                originalPrompt: prompt,
                optimizedPrompt: optimization.optimizedPrompt,
                improvements: optimization.improvements,
                estimatedImprovement: optimization.estimatedImprovement,
                confidence: optimization.confidence
            };
        } catch (error) {
            logger.error('Error optimizing prompt:', error);
            throw error;
        }
    }

    async analyzePrompt(prompt: string): Promise<PromptAnalysis> {
        try {
            const analysisPrompt = `Analyze the following prompt and provide detailed feedback:

**Prompt:**
${prompt}

**Analysis Criteria:**
1. **Length**: Appropriate length for the task
2. **Complexity**: Level of complexity and difficulty
3. **Clarity**: How clear and understandable the prompt is
4. **Specificity**: How specific and detailed the requirements are
5. **Structure**: How well-organized and structured the prompt is

**Please provide:**
1. Numerical scores (0-10) for each criterion
2. Overall score (0-10)
3. Specific suggestions for improvement
4. Estimated token count
5. Expected response time
6. Recommended AI models

Format your response as JSON with the following structure:
{
  "analysis": {
    "length": 0.0,
    "complexity": 0.0,
    "clarity": 0.0,
    "specificity": 0.0,
    "structure": 0.0,
    "overall": 0.0
  },
  "suggestions": [
    {
      "type": "...",
      "description": "...",
      "priority": "low|medium|high",
      "example": "..."
    }
  ],
  "estimatedTokens": 0,
  "expectedResponseTime": 0,
  "recommendedModels": ["..."]
}`;

            const response = await aiService.generateResponse({
                model: 'gpt-4o',
                prompt: analysisPrompt,
                userId: 'system',
                options: {
                    temperature: 0.3,
                    maxTokens: 1500
                }
            });

            const analysis = JSON.parse(response.content);

            return {
                prompt,
                analysis: analysis.analysis,
                suggestions: analysis.suggestions,
                estimatedTokens: analysis.estimatedTokens,
                expectedResponseTime: analysis.expectedResponseTime,
                recommendedModels: analysis.recommendedModels
            };
        } catch (error) {
            logger.error('Error analyzing prompt:', error);
            throw error;
        }
    }

    async createPromptChain(chain: Omit<PromptChain, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<PromptChain> {
        try {
            const newChain: PromptChain = {
                ...chain,
                id: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
                usageCount: 0
            };

            this.chains.set(newChain.id, newChain);

            // Cache the chain
            await cacheService.set(
                `chain:${newChain.id}`,
                JSON.stringify(newChain),
                3600
            );

            logger.info(`Prompt chain created: ${newChain.id}`);
            return newChain;
        } catch (error) {
            logger.error('Error creating prompt chain:', error);
            throw error;
        }
    }

    async executePromptChain(chainId: string, initialVariables: Record<string, any>): Promise<Record<string, any>> {
        try {
            const chain = this.chains.get(chainId);
            if (!chain) {
                throw new Error('Prompt chain not found');
            }

            const results: Record<string, any> = { ...initialVariables };

            for (const step of chain.steps) {
                try {
                    // Check conditions if any
                    if (step.conditions) {
                        const shouldExecute = step.conditions.every(condition => {
                            const value = results[condition.variable];
                            switch (condition.operator) {
                                case 'equals':
                                    return value === condition.value;
                                case 'contains':
                                    return String(value).includes(String(condition.value));
                                case 'greater':
                                    return Number(value) > Number(condition.value);
                                case 'less':
                                    return Number(value) < Number(condition.value);
                                case 'exists':
                                    return value !== undefined && value !== null;
                                default:
                                    return true;
                            }
                        });

                        if (!shouldExecute) {
                            continue;
                        }
                    }

                    // Execute the step
                    const response = await aiService.generateResponse({
                        model: step.model,
                        prompt: step.prompt,
                        userId: 'system',
                        options: {
                            temperature: 0.7,
                            maxTokens: 2000
                        }
                    });

                    results[step.outputVariable] = response.content;

                    // Increment usage count
                    chain.usageCount += 1;
                    this.chains.set(chainId, chain);

                } catch (error) {
                    logger.error(`Error executing step ${step.id}:`, error);
                    if (step.retryCount > 0) {
                        step.retryCount -= 1;
                        // Retry logic could be implemented here
                    } else {
                        throw error;
                    }
                }
            }

            logger.info(`Prompt chain executed: ${chainId}`);
            return results;
        } catch (error) {
            logger.error('Error executing prompt chain:', error);
            throw error;
        }
    }

    async getPromptLibrary(userId?: string): Promise<PromptLibrary> {
        try {
            const templates = Array.from(this.templates.values());

            // Group by category
            const categories = templates.reduce((acc, template) => {
                if (!acc[template.category]) {
                    acc[template.category] = [];
                }
                acc[template.category].push(template);
                return acc;
            }, {} as Record<string, PromptTemplate[]>);

            const library: PromptLibrary = {
                categories: Object.entries(categories).map(([name, templates]) => ({
                    name,
                    description: `Templates for ${name}`,
                    templates: templates.slice(0, 10), // Limit to 10 per category
                    subcategories: [] // Could be implemented for more granular organization
                })),
                featured: templates
                    .filter(t => t.rating >= 4.5)
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .slice(0, 5),
                trending: templates
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .slice(0, 10),
                recent: templates
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .slice(0, 10),
                userFavorites: [] // Would be populated with user-specific favorites
            };

            return library;
        } catch (error) {
            logger.error('Error getting prompt library:', error);
            throw error;
        }
    }

    async rateTemplate(templateId: string, rating: number, userId: string): Promise<boolean> {
        try {
            const template = this.templates.get(templateId);
            if (!template) return false;

            // Update rating (simple average for now)
            const currentRating = template.rating;
            const currentCount = template.usageCount;
            const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);

            template.rating = newRating;
            this.templates.set(templateId, template);

            // Update cache
            await cacheService.set(
                `template:${templateId}`,
                JSON.stringify(template),
                3600
            );

            logger.info(`Template rated: ${templateId} with rating ${rating}`);
            return true;
        } catch (error) {
            logger.error('Error rating template:', error);
            throw error;
        }
    }
}

export const promptEngineeringService = new PromptEngineeringService();

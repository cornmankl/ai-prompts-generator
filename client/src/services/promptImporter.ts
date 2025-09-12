// Service for importing and categorizing existing prompts from the workspace
export interface ImportedPrompt {
    id: string
    title: string
    content: string
    category: string
    subcategory?: string
    source: string
    tags: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    description: string
    variables?: Array<{
        name: string
        label: string
        type: 'text' | 'textarea' | 'select'
        required: boolean
        options?: string[]
    }>
    metadata: {
        originalFile: string
        lastModified: string
        wordCount: number
        estimatedTokens: number
    }
}

export interface PromptCategory {
    id: string
    name: string
    description: string
    icon: string
    color: string
    count: number
    subcategories: string[]
}

class PromptImporter {
    private categories: PromptCategory[] = [
        {
            id: 'ai-assistants',
            name: 'AI Assistants',
            description: 'System prompts for various AI assistants and models',
            icon: 'Brain',
            color: 'primary',
            count: 0,
            subcategories: ['claude', 'gpt', 'gemini', 'cursor', 'vscode']
        },
        {
            id: 'code-generation',
            name: 'Code Generation',
            description: 'Prompts for generating and improving code',
            icon: 'Code',
            color: 'accent',
            count: 0,
            subcategories: ['review', 'debugging', 'optimization', 'documentation']
        },
        {
            id: 'creative-writing',
            name: 'Creative Writing',
            description: 'Prompts for creative content generation',
            icon: 'PenTool',
            color: 'warning',
            count: 0,
            subcategories: ['stories', 'poetry', 'marketing', 'copywriting']
        },
        {
            id: 'analysis',
            name: 'Analysis & Research',
            description: 'Prompts for data analysis and research tasks',
            icon: 'BarChart3',
            color: 'success',
            count: 0,
            subcategories: ['data-analysis', 'research', 'summarization', 'comparison']
        },
        {
            id: 'collaboration',
            name: 'Collaboration',
            description: 'Prompts for team collaboration and communication',
            icon: 'Users',
            color: 'info',
            count: 0,
            subcategories: ['meetings', 'reviews', 'planning', 'communication']
        },
        {
            id: 'specialized',
            name: 'Specialized Tools',
            description: 'Prompts for specific tools and platforms',
            icon: 'Wrench',
            color: 'purple',
            count: 0,
            subcategories: ['devtools', 'platforms', 'frameworks', 'libraries']
        }
    ]

    // Import prompts from the workspace
    async importPrompts(): Promise<ImportedPrompt[]> {
        const importedPrompts: ImportedPrompt[] = []

        try {
            // This would typically make API calls to fetch prompts from the backend
            // For now, we'll simulate importing prompts from the workspace structure
            const mockPrompts = await this.generateMockPrompts()
            importedPrompts.push(...mockPrompts)

            // Update category counts
            this.updateCategoryCounts(importedPrompts)

            return importedPrompts
        } catch (error) {
            console.error('Error importing prompts:', error)
            return []
        }
    }

    // Generate mock prompts based on the workspace structure
    private async generateMockPrompts(): Promise<ImportedPrompt[]> {
        return [
            // Claude Prompts
            {
                id: 'claude-code-review',
                title: 'Claude Code Review Assistant',
                content: 'You are an expert code reviewer with deep knowledge of software engineering best practices. Analyze the provided code for:\n\n1. **Security vulnerabilities** - Look for common security issues like SQL injection, XSS, CSRF, etc.\n2. **Performance issues** - Identify bottlenecks, inefficient algorithms, memory leaks\n3. **Code quality** - Check for readability, maintainability, and adherence to coding standards\n4. **Best practices** - Ensure proper error handling, logging, documentation\n\nProvide specific, actionable feedback with code examples where appropriate.',
                category: 'ai-assistants',
                subcategory: 'claude',
                source: 'Claude Code',
                tags: ['code-review', 'security', 'performance', 'best-practices'],
                difficulty: 'advanced',
                description: 'Comprehensive code review prompt for Claude with focus on security and performance',
                variables: [
                    { name: 'code', label: 'Code to Review', type: 'textarea', required: true },
                    { name: 'language', label: 'Programming Language', type: 'select', required: false, options: ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'] }
                ],
                metadata: {
                    originalFile: 'Claude Code/claude-code-system-prompt.txt',
                    lastModified: '2024-01-15',
                    wordCount: 150,
                    estimatedTokens: 200
                }
            },
            {
                id: 'claude-creative-writing',
                title: 'Claude Creative Writing Generator',
                content: 'You are a master storyteller and creative writer. Help users create compelling, engaging content across various formats:\n\n**Your capabilities:**\n- Generate original stories, articles, and creative pieces\n- Adapt writing style to match specific tones and audiences\n- Provide detailed character development and world-building\n- Create dialogue that feels natural and authentic\n- Structure narratives with proper pacing and flow\n\n**Guidelines:**\n- Always ask clarifying questions about genre, tone, length, and target audience\n- Provide multiple options or variations when appropriate\n- Include specific details and vivid descriptions\n- Ensure content is original and engaging',
                category: 'creative-writing',
                subcategory: 'stories',
                source: 'Claude Code',
                tags: ['creative-writing', 'storytelling', 'content-generation'],
                difficulty: 'intermediate',
                description: 'Versatile creative writing assistant for various content types',
                variables: [
                    { name: 'genre', label: 'Genre', type: 'select', required: true, options: ['Fiction', 'Non-fiction', 'Poetry', 'Script', 'Article'] },
                    { name: 'tone', label: 'Tone', type: 'select', required: false, options: ['Professional', 'Casual', 'Humorous', 'Dramatic', 'Inspirational'] },
                    { name: 'length', label: 'Length', type: 'select', required: false, options: ['Short', 'Medium', 'Long'] }
                ],
                metadata: {
                    originalFile: 'Claude Code/claude-code-system-prompt.txt',
                    lastModified: '2024-01-15',
                    wordCount: 200,
                    estimatedTokens: 250
                }
            },
            // Cursor Prompts
            {
                id: 'cursor-agent-prompt',
                title: 'Cursor Agent System Prompt',
                content: 'You are an expert AI coding assistant integrated into Cursor IDE. Your role is to help developers write, debug, and optimize code efficiently.\n\n**Core Responsibilities:**\n- Provide accurate, context-aware code suggestions\n- Help debug issues with detailed explanations\n- Suggest code improvements and optimizations\n- Answer questions about programming concepts and best practices\n- Assist with code refactoring and architecture decisions\n\n**Guidelines:**\n- Always consider the full context of the codebase\n- Provide working, tested code examples\n- Explain complex concepts clearly\n- Follow the user\'s coding style and preferences\n- Be proactive in suggesting improvements',
                category: 'ai-assistants',
                subcategory: 'cursor',
                source: 'Cursor Prompts',
                tags: ['ide', 'coding-assistant', 'debugging', 'optimization'],
                difficulty: 'advanced',
                description: 'System prompt for Cursor IDE AI assistant',
                variables: [
                    { name: 'language', label: 'Programming Language', type: 'select', required: true, options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby'] },
                    { name: 'task', label: 'Task Type', type: 'select', required: false, options: ['Debug', 'Optimize', 'Refactor', 'Explain', 'Generate'] }
                ],
                metadata: {
                    originalFile: 'Cursor Prompts/Agent Prompt v1.2.txt',
                    lastModified: '2024-01-20',
                    wordCount: 180,
                    estimatedTokens: 220
                }
            },
            // GPT Prompts
            {
                id: 'gpt-code-analysis',
                title: 'GPT Code Analysis Assistant',
                content: 'You are a senior software engineer with expertise in multiple programming languages and frameworks. Analyze the provided code and provide comprehensive feedback.\n\n**Analysis Areas:**\n1. **Functionality** - Does the code work as intended?\n2. **Efficiency** - Are there performance optimizations available?\n3. **Maintainability** - Is the code easy to understand and modify?\n4. **Security** - Are there any security vulnerabilities?\n5. **Best Practices** - Does it follow industry standards?\n\nProvide specific recommendations with code examples for improvements.',
                category: 'code-generation',
                subcategory: 'review',
                source: 'VSCode Agent',
                tags: ['code-analysis', 'gpt', 'optimization', 'best-practices'],
                difficulty: 'advanced',
                description: 'Comprehensive code analysis using GPT models',
                variables: [
                    { name: 'code', label: 'Code to Analyze', type: 'textarea', required: true },
                    { name: 'framework', label: 'Framework', type: 'select', required: false, options: ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask'] }
                ],
                metadata: {
                    originalFile: 'VSCode Agent/gpt-4o.txt',
                    lastModified: '2024-01-18',
                    wordCount: 160,
                    estimatedTokens: 200
                }
            },
            // Replit Prompts
            {
                id: 'replit-coding-assistant',
                title: 'Replit Coding Assistant',
                content: 'You are a coding mentor and assistant designed to help developers learn and build projects in Replit. Provide guidance on:\n\n**Learning Support:**\n- Explain programming concepts clearly\n- Provide step-by-step tutorials\n- Help debug code issues\n- Suggest learning resources\n\n**Project Assistance:**\n- Help plan project architecture\n- Provide code templates and examples\n- Assist with deployment and configuration\n- Guide through best practices\n\nAlways encourage learning and provide constructive feedback.',
                category: 'specialized',
                subcategory: 'platforms',
                source: 'Replit',
                tags: ['replit', 'learning', 'mentoring', 'tutorials'],
                difficulty: 'beginner',
                description: 'Coding mentor for Replit platform',
                variables: [
                    { name: 'skill_level', label: 'Skill Level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
                    { name: 'project_type', label: 'Project Type', type: 'select', required: false, options: ['Web App', 'Mobile App', 'Desktop App', 'Game', 'API', 'Script'] }
                ],
                metadata: {
                    originalFile: 'Replit/Prompt.txt',
                    lastModified: '2024-01-12',
                    wordCount: 140,
                    estimatedTokens: 180
                }
            },
            // Lovable Prompts
            {
                id: 'lovable-app-builder',
                title: 'Lovable App Builder',
                content: 'You are an expert full-stack developer specializing in building modern web applications. Help users create:\n\n**Frontend Development:**\n- React/Next.js applications with modern UI/UX\n- Responsive designs with Tailwind CSS\n- Interactive components and animations\n- State management and routing\n\n**Backend Development:**\n- Node.js/Express APIs\n- Database design and integration\n- Authentication and authorization\n- Real-time features with WebSockets\n\n**Best Practices:**\n- Clean, maintainable code architecture\n- Security best practices\n- Performance optimization\n- Testing strategies\n\nProvide complete, production-ready solutions.',
                category: 'code-generation',
                subcategory: 'frameworks',
                source: 'Lovable',
                tags: ['full-stack', 'react', 'nodejs', 'web-development'],
                difficulty: 'advanced',
                description: 'Full-stack web application development assistant',
                variables: [
                    { name: 'app_type', label: 'Application Type', type: 'select', required: true, options: ['SaaS', 'E-commerce', 'Blog', 'Dashboard', 'Portfolio', 'Social Media'] },
                    { name: 'tech_stack', label: 'Tech Stack', type: 'select', required: false, options: ['React + Node.js', 'Next.js', 'Vue + Express', 'Angular + NestJS'] }
                ],
                metadata: {
                    originalFile: 'Lovable/Agent Prompt.txt',
                    lastModified: '2024-01-10',
                    wordCount: 220,
                    estimatedTokens: 280
                }
            }
        ]
    }

    // Update category counts based on imported prompts
    private updateCategoryCounts(prompts: ImportedPrompt[]): void {
        this.categories.forEach(category => {
            category.count = prompts.filter(prompt => prompt.category === category.id).length
        })
    }

    // Get all categories
    getCategories(): PromptCategory[] {
        return this.categories
    }

    // Search prompts by query
    searchPrompts(prompts: ImportedPrompt[], query: string): ImportedPrompt[] {
        const lowercaseQuery = query.toLowerCase()
        return prompts.filter(prompt =>
            prompt.title.toLowerCase().includes(lowercaseQuery) ||
            prompt.content.toLowerCase().includes(lowercaseQuery) ||
            prompt.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
            prompt.description.toLowerCase().includes(lowercaseQuery)
        )
    }

    // Filter prompts by category
    filterByCategory(prompts: ImportedPrompt[], categoryId: string): ImportedPrompt[] {
        return prompts.filter(prompt => prompt.category === categoryId)
    }

    // Filter prompts by difficulty
    filterByDifficulty(prompts: ImportedPrompt[], difficulty: string): ImportedPrompt[] {
        return prompts.filter(prompt => prompt.difficulty === difficulty)
    }

    // Get prompts by source
    getPromptsBySource(prompts: ImportedPrompt[], source: string): ImportedPrompt[] {
        return prompts.filter(prompt => prompt.source === source)
    }

    // Get popular tags
    getPopularTags(prompts: ImportedPrompt[], limit: number = 20): Array<{ tag: string; count: number }> {
        const tagCounts: Record<string, number> = {}

        prompts.forEach(prompt => {
            prompt.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1
            })
        })

        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
    }

    // Export prompts to JSON
    exportPrompts(prompts: ImportedPrompt[]): string {
        return JSON.stringify(prompts, null, 2)
    }

    // Import prompts from JSON
    importFromJSON(jsonString: string): ImportedPrompt[] {
        try {
            return JSON.parse(jsonString)
        } catch (error) {
            console.error('Error parsing JSON:', error)
            return []
        }
    }
}

export const promptImporter = new PromptImporter()
export default promptImporter

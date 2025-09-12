import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Filter,
    Grid,
    List,
    Star,
    Download,
    Share2,
    Plus,
    BookOpen,
    Tag,
    Calendar,
    User,
    Eye,
    Heart,
    Copy,
    Edit3,
    Trash2,
    RefreshCw,
    TrendingUp,
    Zap,
    Brain,
    Code,
    PenTool,
    BarChart3,
    Users,
    Wrench,
    X,
    ChevronDown
} from 'lucide-react'
import { usePrompts } from '../hooks/usePrompts'
import { ImportedPrompt } from '../services/promptImporter'
import toast from 'react-hot-toast'

const PromptLibrary: React.FC = () => {
    const {
        prompts,
        categories,
        isLoading,
        error,
        searchQuery,
        selectedCategory,
        selectedDifficulty,
        selectedSource,
        filteredPrompts,
        popularTags,
        searchPrompts,
        filterByCategory,
        filterByDifficulty,
        filterBySource,
        clearFilters,
        exportPrompts,
        refreshPrompts
    } = usePrompts()

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [sortBy, setSortBy] = useState('popular')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    const categoryIcons: Record<string, any> = {
        'ai-assistants': Brain,
        'code-generation': Code,
        'creative-writing': PenTool,
        'analysis': BarChart3,
        'collaboration': Users,
        'specialized': Wrench
    }

    const difficultyColors: Record<string, string> = {
        'beginner': 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
        'intermediate': 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20',
        'advanced': 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
    }

    const handleSearch = (query: string) => {
        searchPrompts(query)
    }

    const handleCategoryFilter = (categoryId: string | null) => {
        filterByCategory(categoryId)
    }

    const handleDifficultyFilter = (difficulty: string | null) => {
        filterByDifficulty(difficulty)
    }

    const handleSourceFilter = (source: string | null) => {
        filterBySource(source)
    }

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    const copyPrompt = (prompt: ImportedPrompt) => {
        navigator.clipboard.writeText(prompt.content)
        toast.success('Prompt copied to clipboard!')
    }

    const downloadPrompt = (prompt: ImportedPrompt) => {
        const blob = new Blob([prompt.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Prompt downloaded!')
    }

    const getSortedPrompts = () => {
        let sorted = [...filteredPrompts]

        // Filter by selected tags
        if (selectedTags.length > 0) {
            sorted = sorted.filter(prompt =>
                selectedTags.some(tag => prompt.tags.includes(tag))
            )
        }

        switch (sortBy) {
            case 'popular':
                return sorted.sort((a, b) => b.metadata.estimatedTokens - a.metadata.estimatedTokens)
            case 'newest':
                return sorted.sort((a, b) => new Date(b.metadata.lastModified).getTime() - new Date(a.metadata.lastModified).getTime())
            case 'alphabetical':
                return sorted.sort((a, b) => a.title.localeCompare(b.title))
            case 'difficulty':
                const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 }
                return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
            default:
                return sorted
        }
    }

    const PromptCard: React.FC<{ prompt: ImportedPrompt; index: number }> = ({ prompt, index }) => {
        const CategoryIcon = categoryIcons[prompt.category] || BookOpen

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-neural hover:shadow-lg transition-all duration-300 group"
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                <CategoryIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {prompt.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {prompt.source}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[prompt.difficulty]}`}>
                                {prompt.difficulty}
                            </span>
                            <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {prompt.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {prompt.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                        {prompt.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                +{prompt.tags.length - 3}
                            </span>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(prompt.metadata.lastModified).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{prompt.metadata.estimatedTokens} tokens</span>
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => copyPrompt(prompt)}
                                className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => downloadPrompt(prompt)}
                                className="p-2 text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-warning-600 dark:hover:text-warning-400 transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                        <button className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors">
                            Use Prompt
                        </button>
                    </div>
                </div>
            </motion.div>
        )
    }

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-96">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading prompts...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Error Loading Prompts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={refreshPrompts}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
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
                    Prompt Library
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Discover and use {prompts.length} expertly crafted AI prompts from the community
                </p>
            </motion.div>

            {/* Search and Filters */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search prompts by title, description, or tags..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest</option>
                            <option value="alphabetical">Alphabetical</option>
                            <option value="difficulty">Difficulty</option>
                        </select>

                        <button
                            onClick={exportPrompts}
                            className="flex items-center space-x-2 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory || ''}
                                        onChange={(e) => handleCategoryFilter(e.target.value || null)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name} ({category.count})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Difficulty Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        value={selectedDifficulty || ''}
                                        onChange={(e) => handleDifficultyFilter(e.target.value || null)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">All Difficulties</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                {/* Source Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Source
                                    </label>
                                    <select
                                        value={selectedSource || ''}
                                        onChange={(e) => handleSourceFilter(e.target.value || null)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">All Sources</option>
                                        {Array.from(new Set(prompts.map(p => p.source))).map((source) => (
                                            <option key={source} value={source}>
                                                {source}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Popular Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Popular Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {popularTags.slice(0, 10).map(({ tag, count }) => (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagToggle(tag)}
                                            className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedTags.includes(tag)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {tag} ({count})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        clearFilters()
                                        setSelectedTags([])
                                    }}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-gray-600 dark:text-gray-400">
                        Showing {getSortedPrompts().length} of {prompts.length} prompts
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={refreshPrompts}
                            className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Prompts Grid/List */}
                {getSortedPrompts().length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No prompts found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Try adjusting your search or filters
                        </p>
                        <button
                            onClick={() => {
                                clearFilters()
                                setSelectedTags([])
                            }}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }>
                        {getSortedPrompts().map((prompt, index) => (
                            <PromptCard key={prompt.id} prompt={prompt} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PromptLibrary

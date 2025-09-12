import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, Star, Tag, Filter } from 'lucide-react'
import { usePrompts } from '../../hooks/usePrompts'

interface SearchResult {
    id: string
    title: string
    content: string
    category: string
    type: 'prompt' | 'template' | 'category'
    rating?: number
    lastUsed?: Date
}

const GlobalSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [filters, setFilters] = useState({
        category: 'all',
        type: 'all',
        rating: 0
    })
    const searchRef = useRef<HTMLDivElement>(null)
    const { prompts, templates } = usePrompts()

    // Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Search functionality
    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        setIsLoading(true)
        const searchResults: SearchResult[] = []

        // Search prompts
        prompts.forEach(prompt => {
            if (
                prompt.title.toLowerCase().includes(query.toLowerCase()) ||
                prompt.content.toLowerCase().includes(query.toLowerCase()) ||
                prompt.category.toLowerCase().includes(query.toLowerCase())
            ) {
                searchResults.push({
                    id: prompt.id,
                    title: prompt.title,
                    content: prompt.content,
                    category: prompt.category,
                    type: 'prompt',
                    rating: prompt.rating,
                    lastUsed: prompt.lastUsed
                })
            }
        })

        // Search templates
        templates.forEach(template => {
            if (
                template.name.toLowerCase().includes(query.toLowerCase()) ||
                template.description.toLowerCase().includes(query.toLowerCase())
            ) {
                searchResults.push({
                    id: template.id,
                    title: template.name,
                    content: template.description,
                    category: template.category,
                    type: 'template'
                })
            }
        })

        // Apply filters
        let filteredResults = searchResults
        if (filters.category !== 'all') {
            filteredResults = filteredResults.filter(r => r.category === filters.category)
        }
        if (filters.type !== 'all') {
            filteredResults = filteredResults.filter(r => r.type === filters.type)
        }
        if (filters.rating > 0) {
            filteredResults = filteredResults.filter(r => (r.rating || 0) >= filters.rating)
        }

        setResults(filteredResults)
        setIsLoading(false)
    }, [query, filters, prompts, templates])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const clearSearch = () => {
        setQuery('')
        setResults([])
    }

    return (
        <div ref={searchRef} className="relative">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search prompts, templates, categories..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-10 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Search Results */}
            <AnimatePresence>
                {isOpen && (query.length >= 2 || results.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
                    >
                        {/* Filters */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-2">
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border-0"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="development">Development</option>
                                    <option value="writing">Writing</option>
                                    <option value="analysis">Analysis</option>
                                    <option value="creative">Creative</option>
                                </select>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border-0"
                                >
                                    <option value="all">All Types</option>
                                    <option value="prompt">Prompts</option>
                                    <option value="template">Templates</option>
                                </select>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="py-2">
                            {isLoading ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    Searching...
                                </div>
                            ) : results.length > 0 ? (
                                results.map((result) => (
                                    <motion.div
                                        key={result.id}
                                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                        className="px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {result.type === 'prompt' ? (
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                ) : (
                                                    <Tag className="w-4 h-4 text-blue-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {result.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {result.content}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                        {result.category}
                                                    </span>
                                                    {result.rating && (
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                            <span className="text-xs text-gray-500">{result.rating}</span>
                                                        </div>
                                                    )}
                                                    {result.lastUsed && (
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(result.lastUsed).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : query.length >= 2 ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    No results found for "{query}"
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default GlobalSearch

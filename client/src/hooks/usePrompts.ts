import { useState, useEffect, useCallback } from 'react'
import { promptImporter, ImportedPrompt, PromptCategory } from '../services/promptImporter'
import toast from 'react-hot-toast'

export interface UsePromptsState {
    prompts: ImportedPrompt[]
    categories: PromptCategory[]
    isLoading: boolean
    error: string | null
    searchQuery: string
    selectedCategory: string | null
    selectedDifficulty: string | null
    selectedSource: string | null
    filteredPrompts: ImportedPrompt[]
    popularTags: Array<{ tag: string; count: number }>
}

export interface UsePromptsActions {
    importPrompts: () => Promise<void>
    searchPrompts: (query: string) => void
    filterByCategory: (categoryId: string | null) => void
    filterByDifficulty: (difficulty: string | null) => void
    filterBySource: (source: string | null) => void
    clearFilters: () => void
    getPromptById: (id: string) => ImportedPrompt | undefined
    getPromptsByTag: (tag: string) => ImportedPrompt[]
    exportPrompts: () => void
    refreshPrompts: () => Promise<void>
}

export const usePrompts = (): UsePromptsState & UsePromptsActions => {
    const [prompts, setPrompts] = useState<ImportedPrompt[]>([])
    const [categories, setCategories] = useState<PromptCategory[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
    const [selectedSource, setSelectedSource] = useState<string | null>(null)
    const [filteredPrompts, setFilteredPrompts] = useState<ImportedPrompt[]>([])
    const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])

    // Import prompts on mount
    useEffect(() => {
        importPrompts()
    }, [])

    // Update filtered prompts when filters change
    useEffect(() => {
        applyFilters()
    }, [prompts, searchQuery, selectedCategory, selectedDifficulty, selectedSource])

    // Update popular tags when prompts change
    useEffect(() => {
        if (prompts.length > 0) {
            setPopularTags(promptImporter.getPopularTags(prompts))
        }
    }, [prompts])

    const importPrompts = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const importedPrompts = await promptImporter.importPrompts()
            const categories = promptImporter.getCategories()

            setPrompts(importedPrompts)
            setCategories(categories)
            toast.success(`Imported ${importedPrompts.length} prompts successfully!`)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to import prompts'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const applyFilters = useCallback(() => {
        let filtered = [...prompts]

        // Apply search query
        if (searchQuery.trim()) {
            filtered = promptImporter.searchPrompts(filtered, searchQuery)
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = promptImporter.filterByCategory(filtered, selectedCategory)
        }

        // Apply difficulty filter
        if (selectedDifficulty) {
            filtered = promptImporter.filterByDifficulty(filtered, selectedDifficulty)
        }

        // Apply source filter
        if (selectedSource) {
            filtered = promptImporter.getPromptsBySource(filtered, selectedSource)
        }

        setFilteredPrompts(filtered)
    }, [prompts, searchQuery, selectedCategory, selectedDifficulty, selectedSource])

    const searchPrompts = useCallback((query: string) => {
        setSearchQuery(query)
    }, [])

    const filterByCategory = useCallback((categoryId: string | null) => {
        setSelectedCategory(categoryId)
    }, [])

    const filterByDifficulty = useCallback((difficulty: string | null) => {
        setSelectedDifficulty(difficulty)
    }, [])

    const filterBySource = useCallback((source: string | null) => {
        setSelectedSource(source)
    }, [])

    const clearFilters = useCallback(() => {
        setSearchQuery('')
        setSelectedCategory(null)
        setSelectedDifficulty(null)
        setSelectedSource(null)
    }, [])

    const getPromptById = useCallback((id: string): ImportedPrompt | undefined => {
        return prompts.find(prompt => prompt.id === id)
    }, [prompts])

    const getPromptsByTag = useCallback((tag: string): ImportedPrompt[] => {
        return prompts.filter(prompt => prompt.tags.includes(tag))
    }, [prompts])

    const exportPrompts = useCallback(() => {
        try {
            const jsonString = promptImporter.exportPrompts(filteredPrompts)
            const blob = new Blob([jsonString], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `prompts-export-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('Prompts exported successfully!')
        } catch (error) {
            toast.error('Failed to export prompts')
        }
    }, [filteredPrompts])

    const refreshPrompts = useCallback(async () => {
        await importPrompts()
    }, [importPrompts])

    return {
        // State
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

        // Actions
        importPrompts,
        searchPrompts,
        filterByCategory,
        filterByDifficulty,
        filterBySource,
        clearFilters,
        getPromptById,
        getPromptsByTag,
        exportPrompts,
        refreshPrompts
    }
}

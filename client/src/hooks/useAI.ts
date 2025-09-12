import { useState, useCallback } from 'react'
import { aiService, AIPromptRequest, PromptOptimizationRequest, ContextAnalysisRequest } from '../services/aiService'
import toast from 'react-hot-toast'

export interface UseAIState {
    isLoading: boolean
    error: string | null
    lastResponse: any
}

export interface UseAIActions {
    generatePrompt: (request: AIPromptRequest) => Promise<any>
    optimizePrompt: (request: PromptOptimizationRequest) => Promise<any>
    analyzeContext: (request: ContextAnalysisRequest) => Promise<any>
    getSuggestions: (input: string, type: 'completion' | 'improvement' | 'variation') => Promise<string[]>
    validatePrompt: (prompt: string) => Promise<any>
    clearError: () => void
}

export const useAI = (): UseAIState & UseAIActions => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastResponse, setLastResponse] = useState<any>(null)

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const generatePrompt = useCallback(async (request: AIPromptRequest) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await aiService.generatePrompt(request)
            setLastResponse(response)
            toast.success('Prompt generated successfully!')
            return response
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate prompt'
            setError(errorMessage)
            toast.error(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const optimizePrompt = useCallback(async (request: PromptOptimizationRequest) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await aiService.optimizePrompt(request)
            setLastResponse(response)
            toast.success('Prompt optimized successfully!')
            return response
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to optimize prompt'
            setError(errorMessage)
            toast.error(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const analyzeContext = useCallback(async (request: ContextAnalysisRequest) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await aiService.analyzeContext(request)
            setLastResponse(response)
            toast.success('Context analyzed successfully!')
            return response
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to analyze context'
            setError(errorMessage)
            toast.error(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getSuggestions = useCallback(async (input: string, type: 'completion' | 'improvement' | 'variation') => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await aiService.getSuggestions(input, type)
            return response
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get suggestions'
            setError(errorMessage)
            toast.error(errorMessage)
            return []
        } finally {
            setIsLoading(false)
        }
    }, [])

    const validatePrompt = useCallback(async (prompt: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await aiService.validatePrompt(prompt)
            setLastResponse(response)
            return response
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to validate prompt'
            setError(errorMessage)
            toast.error(errorMessage)
            return {
                score: 0,
                issues: ['Unable to validate prompt'],
                suggestions: []
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        isLoading,
        error,
        lastResponse,
        generatePrompt,
        optimizePrompt,
        analyzeContext,
        getSuggestions,
        validatePrompt,
        clearError
    }
}

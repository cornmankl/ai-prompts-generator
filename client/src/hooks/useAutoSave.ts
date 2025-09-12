import { useEffect, useRef, useCallback } from 'react'
import { debounce } from 'lodash'

interface UseAutoSaveOptions {
    data: any
    onSave: (data: any) => Promise<void> | void
    delay?: number
    enabled?: boolean
    storageKey?: string
}

export const useAutoSave = ({
    data,
    onSave,
    delay = 1000,
    enabled = true,
    storageKey
}: UseAutoSaveOptions) => {
    const previousDataRef = useRef(data)
    const isFirstRender = useRef(true)

    // Debounced save function
    const debouncedSave = useCallback(
        debounce(async (currentData: any) => {
            try {
                await onSave(currentData)

                // Save to localStorage if storageKey provided
                if (storageKey) {
                    localStorage.setItem(storageKey, JSON.stringify(currentData))
                }
            } catch (error) {
                console.error('Auto-save failed:', error)
            }
        }, delay),
        [onSave, delay, storageKey]
    )

    // Check if data has changed
    const hasDataChanged = useCallback((prev: any, current: any) => {
        return JSON.stringify(prev) !== JSON.stringify(current)
    }, [])

    // Auto-save effect
    useEffect(() => {
        if (!enabled || isFirstRender.current) {
            isFirstRender.current = false
            previousDataRef.current = data
            return
        }

        if (hasDataChanged(previousDataRef.current, data)) {
            previousDataRef.current = data
            debouncedSave(data)
        }
    }, [data, enabled, hasDataChanged, debouncedSave])

    // Load from localStorage on mount
    useEffect(() => {
        if (storageKey && enabled) {
            try {
                const savedData = localStorage.getItem(storageKey)
                if (savedData) {
                    const parsedData = JSON.parse(savedData)
                    // Only load if current data is empty or default
                    if (!data || Object.keys(data).length === 0) {
                        onSave(parsedData)
                    }
                }
            } catch (error) {
                console.error('Failed to load saved data:', error)
            }
        }
    }, [storageKey, enabled, data, onSave])

    // Cleanup debounced function
    useEffect(() => {
        return () => {
            debouncedSave.cancel()
        }
    }, [debouncedSave])

    return {
        save: debouncedSave,
        isSaving: false // You can implement a loading state if needed
    }
}

export default useAutoSave

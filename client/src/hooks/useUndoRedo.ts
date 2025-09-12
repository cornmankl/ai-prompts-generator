import { useState, useCallback, useRef } from 'react'

interface UndoRedoState<T> {
    history: T[]
    currentIndex: number
    canUndo: boolean
    canRedo: boolean
}

export const useUndoRedo = <T>(initialState: T, maxHistorySize: number = 50) => {
    const [state, setState] = useState<UndoRedoState<T>>({
        history: [initialState],
        currentIndex: 0,
        canUndo: false,
        canRedo: false
    })

    const isUpdatingRef = useRef(false)

    const updateCanUndoRedo = useCallback((newIndex: number, historyLength: number) => {
        setState(prev => ({
            ...prev,
            currentIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: newIndex < historyLength - 1
        }))
    }, [])

    const addToHistory = useCallback((newState: T) => {
        if (isUpdatingRef.current) return

        setState(prev => {
            const newHistory = prev.history.slice(0, prev.currentIndex + 1)
            newHistory.push(newState)

            // Limit history size
            if (newHistory.length > maxHistorySize) {
                newHistory.shift()
                const newIndex = newHistory.length - 1
                updateCanUndoRedo(newIndex, newHistory.length)
                return {
                    history: newHistory,
                    currentIndex: newIndex,
                    canUndo: newIndex > 0,
                    canRedo: false
                }
            }

            const newIndex = newHistory.length - 1
            updateCanUndoRedo(newIndex, newHistory.length)
            return {
                history: newHistory,
                currentIndex: newIndex,
                canUndo: newIndex > 0,
                canRedo: false
            }
        })
    }, [maxHistorySize, updateCanUndoRedo])

    const undo = useCallback(() => {
        if (!state.canUndo) return

        setState(prev => {
            const newIndex = prev.currentIndex - 1
            updateCanUndoRedo(newIndex, prev.history.length)
            return {
                ...prev,
                currentIndex: newIndex
            }
        })
    }, [state.canUndo, updateCanUndoRedo])

    const redo = useCallback(() => {
        if (!state.canRedo) return

        setState(prev => {
            const newIndex = prev.currentIndex + 1
            updateCanUndoRedo(newIndex, prev.history.length)
            return {
                ...prev,
                currentIndex: newIndex
            }
        })
    }, [state.canRedo, updateCanUndoRedo])

    const reset = useCallback((newInitialState: T) => {
        setState({
            history: [newInitialState],
            currentIndex: 0,
            canUndo: false,
            canRedo: false
        })
    }, [])

    const getCurrentState = useCallback(() => {
        return state.history[state.currentIndex]
    }, [state.history, state.currentIndex])

    const updateState = useCallback((newState: T) => {
        isUpdatingRef.current = true
        addToHistory(newState)
        isUpdatingRef.current = false
    }, [addToHistory])

    return {
        currentState: getCurrentState(),
        canUndo: state.canUndo,
        canRedo: state.canRedo,
        undo,
        redo,
        updateState,
        reset,
        historySize: state.history.length,
        currentIndex: state.currentIndex
    }
}

export default useUndoRedo

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Code,
    Link,
    Image,
    Eye,
    Edit3,
    Save,
    Undo,
    Redo
} from 'lucide-react'
import { useUndoRedo } from '../../hooks/useUndoRedo'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    showPreview?: boolean
    autoSave?: boolean
    onSave?: (content: string) => void
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder = 'Start writing your prompt...',
    className = '',
    showPreview = true,
    autoSave = false,
    onSave
}) => {
    const [isPreview, setIsPreview] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { currentState, canUndo, canRedo, undo, redo, updateState } = useUndoRedo(value)

    // Update undo/redo when value changes
    useEffect(() => {
        if (value !== currentState) {
            updateState(value)
        }
    }, [value, currentState, updateState])

    const handleChange = (newValue: string) => {
        onChange(newValue)
        if (autoSave && onSave) {
            onSave(newValue)
        }
    }

    const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const replacement = before + (selectedText || placeholder) + after

        const newValue = value.substring(0, start) + replacement + value.substring(end)
        handleChange(newValue)

        // Set cursor position
        setTimeout(() => {
            const newCursorPos = start + before.length + (selectedText || placeholder).length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
            textarea.focus()
        }, 0)
    }

    const toolbarButtons = [
        {
            icon: Bold,
            action: () => insertMarkdown('**', '**', 'bold text'),
            title: 'Bold'
        },
        {
            icon: Italic,
            action: () => insertMarkdown('*', '*', 'italic text'),
            title: 'Italic'
        },
        {
            icon: List,
            action: () => insertMarkdown('- ', '', 'list item'),
            title: 'Bullet List'
        },
        {
            icon: ListOrdered,
            action: () => insertMarkdown('1. ', '', 'numbered item'),
            title: 'Numbered List'
        },
        {
            icon: Quote,
            action: () => insertMarkdown('> ', '', 'quote'),
            title: 'Quote'
        },
        {
            icon: Code,
            action: () => insertMarkdown('`', '`', 'code'),
            title: 'Inline Code'
        },
        {
            icon: Link,
            action: () => insertMarkdown('[', '](url)', 'link text'),
            title: 'Link'
        },
        {
            icon: Image,
            action: () => insertMarkdown('![', '](url)', 'alt text'),
            title: 'Image'
        }
    ]

    const renderMarkdown = (text: string) => {
        // Simple markdown rendering (you can use a library like react-markdown for full support)
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>')
            .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
            .replace(/\n/g, '<br>')
    }

    return (
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''} ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                <div className="flex items-center space-x-1">
                    {toolbarButtons.map((button, index) => (
                        <button
                            key={index}
                            onClick={button.action}
                            title={button.title}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                            <button.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-1">
                    {/* Undo/Redo */}
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </button>

                    {/* Preview Toggle */}
                    {showPreview && (
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title={isPreview ? 'Edit' : 'Preview'}
                        >
                            {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}

                    {/* Fullscreen */}
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        <Save className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Editor/Preview */}
            <div className="flex h-96">
                {!isPreview ? (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 p-4 border-0 resize-none focus:ring-0 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                    />
                ) : (
                    <div
                        className="flex-1 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                    />
                )}

                {showPreview && !isPreview && (
                    <div className="w-px bg-gray-200 dark:bg-gray-700" />
                )}

                {showPreview && !isPreview && (
                    <div
                        className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                    />
                )}
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg text-sm text-gray-500">
                <span>Characters: {value.length}</span>
                <span>Words: {value.split(/\s+/).filter(word => word.length > 0).length}</span>
            </div>
        </div>
    )
}

export default MarkdownEditor

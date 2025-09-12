import React from 'react'
import { useToast, ToastContainer } from './common/EnhancedToast'

const AppWithToast: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toasts, removeToast } = useToast()

    return (
        <>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    )
}

export default AppWithToast

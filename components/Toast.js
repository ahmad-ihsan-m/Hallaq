'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 5V7.5M7 9.5V10M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const STYLE_MAP = {
  success: { dot: 'bg-green-400', icon: 'bg-green-500/20 text-green-400' },
  error:   { dot: 'bg-red-400',   icon: 'bg-red-500/20 text-red-400'   },
  warning: { dot: 'bg-yellow-400',icon: 'bg-yellow-500/20 text-yellow-400' },
}

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const s = STYLE_MAP[toast.type] || STYLE_MAP.success

  return (
    <div
      className={`flex items-center gap-3 bg-slate-900 border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-black/40 pointer-events-auto min-w-[260px] max-w-xs transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <span className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${s.icon}`}>
        {ICONS[toast.type]}
      </span>
      <span className="text-sm font-medium flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}
        className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 text-xs"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const AuthModalContext = createContext(null)

export function AuthModalProvider({ children }) {
  const router = useRouter()
  const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'success', redirect: null })

  const showAuthModal = useCallback(({ title, message, type = 'success', redirect = null }) => {
    setModal({ open: true, title, message, type, redirect })
  }, [])

  const closeModal = useCallback(() => {
    const { redirect } = modal
    setModal((prev) => ({ ...prev, open: false }))
    if (redirect) {
      setTimeout(() => {
        router.push(redirect)
        router.refresh()
      }, 300)
    }
  }, [modal, router])

  // Auto close
  useEffect(() => {
    if (modal.open) {
      const timer = setTimeout(() => {
        closeModal()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [modal.open, closeModal])

  return (
    <AuthModalContext.Provider value={showAuthModal}>
      {children}

      {/* Auth Modal UI */}
      {modal.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/50 animate-slide-up text-center overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>

            <div className="relative">
              {modal.type === 'success' ? (
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-500/30">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              ) : (
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              )}

              <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                {modal.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                {modal.message}
              </p>

              <button
                onClick={closeModal}
                className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  return useContext(AuthModalContext)
}

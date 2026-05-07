'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from '@/services/authService'
import { useToast } from '@/components/Toast'
import { useAuthModal } from '@/components/AuthModal'

export default function LoginPage() {
  const router = useRouter()
  const toast = useToast()
  const showAuthModal = useAuthModal()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      showAuthModal({ 
        title: 'Login Berhasil!', 
        message: 'Selamat datang kembali di Hallaq 🎉', 
        type: 'success',
        redirect: '/'
      })
    } catch {
      showAuthModal({ 
        title: 'Login Gagal', 
        message: 'Email atau password salah. Silakan coba lagi.', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-72 h-72 bg-brand-500 rounded-full opacity-10 blur-3xl -ml-24 -mt-24" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-purple-500 rounded-full opacity-10 blur-3xl -mr-16 -mb-16" />
        <div className="relative z-10 text-white max-w-sm">
          <div className="text-5xl mb-6">✂️</div>
          <h2 className="text-4xl font-black tracking-tight mb-3">Hallaq</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Platform booking barbershop premium untuk gaya hidupmu.
          </p>
          <ul className="space-y-3">
            {[
              'Booking jadwal tanpa antri',
              'Pilih barber favoritmu',
              'AI rekomendasi gaya rambut',
              'Konfirmasi instan',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L3.5 7.5L8.5 2.5" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-brand-500 text-3xl">✂</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Hallaq</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Masuk ke akun</h1>
              <p className="text-slate-500 text-sm mt-1">Selamat datang kembali 👋</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  required
                  autoComplete="email"
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    required
                    minLength={6}
                    autoComplete="current-password"
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    Masuk...
                  </>
                ) : 'Masuk'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Belum punya akun?{' '}
            <Link href="/auth/signup" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

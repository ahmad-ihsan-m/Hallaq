'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp } from '@/services/authService'
import { useToast } from '@/components/Toast'

export default function SignupPage() {
  const router = useRouter()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(form.name, form.email, form.password, form.role)
      toast?.('Akun berhasil dibuat! Cek emailmu 📧', 'success')
      setSuccess(true)
    } catch (err) {
      toast?.(err.message || 'Gagal mendaftar. Coba lagi.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-10 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-card border border-slate-100 p-10 text-center animate-slide-up">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 16L12 22L26 8" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Cek Email Kamu!</h2>
          <p className="text-slate-500 mb-2 text-sm leading-relaxed">
            Kami mengirim link konfirmasi ke
          </p>
          <p className="font-semibold text-slate-900 mb-6">{form.email}</p>
          <p className="text-slate-400 text-xs mb-8">
            Silakan verifikasi emailmu sebelum login. Cek folder spam jika tidak muncul.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-md"
          >
            Ke Halaman Login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-10 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-brand-500 text-3xl">✂</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Buat Akun Hallaq</h1>
          <p className="text-slate-500 text-sm mt-1">Mulai booking barbershop favoritmu</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-8 sm:p-10">
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">Daftar sebagai</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'customer', label: 'Pelanggan', icon: '👤', desc: 'Booking layanan' },
                { value: 'owner', label: 'Pemilik', icon: '🏪', desc: 'Kelola barbershop' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                  className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all text-center ${
                    form.role === r.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span className={`text-sm font-bold ${form.role === r.value ? 'text-brand-700' : 'text-slate-700'}`}>{r.label}</span>
                  <span className="text-xs text-slate-400">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ahmad Rizky"
                required
                autoComplete="name"
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

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
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  autoComplete="new-password"
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
              <p className="text-xs text-slate-400 mt-1.5">Minimal 6 karakter</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Mendaftar...
                </>
              ) : 'Daftar Sekarang'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}

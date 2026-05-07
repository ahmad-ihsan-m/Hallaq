'use client'

import { useEffect, useState } from 'react'
import BarbershopCard from '@/components/BarbershopCard'
import Link from 'next/link'
import { getAllBarbershops, getHomepageStats } from '@/services/barbershopService'

/* ─── Dynamic AI showcase data ─── */
const AI_MOCKS = [
  { face: 'Oval', confidence: 98, styles: ['Textured Crop', 'Side Part', 'Quiff Modern'] },
  { face: 'Square', confidence: 95, styles: ['Buzz Cut', 'Faux Hawk', 'Crew Cut'] },
  { face: 'Round', confidence: 96, styles: ['Pompadour', 'Fringe', 'Undercut'] },
]

function AIShowcaseCard() {
  const [index, setIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % AI_MOCKS.length)
        setAnimating(false)
      }, 300)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const currentMock = AI_MOCKS[index]

  return (
    <div className="relative select-none">
      {/* Glow behind the card */}
      <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-4xl scale-90 translate-y-4" />

      {/* Main card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-base">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold leading-tight">AI Hair Analysis</p>
            <p className="text-slate-400 text-xs">Powered by Gemini Vision</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            <span className="text-green-400 text-xs font-semibold">Live</span>
          </div>
        </div>

        <div className={`p-5 space-y-4 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {/* Face detection result */}
          <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-orange-50 border border-brand-100 flex items-center justify-center text-2xl flex-shrink-0">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Bentuk Wajah</p>
              <p className="text-xl font-black text-slate-900">{currentMock.face}</p>
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full flex-1 ${i <= 4 ? 'bg-brand-500' : 'bg-brand-200'}`} />
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-slate-900">{currentMock.confidence}%</p>
              <p className="text-[11px] text-slate-400">akurasi</p>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">Rekomendasi Gaya</p>
            <div className="space-y-2">
              {currentMock.styles.map((style, i) => (
                <div
                  key={style}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${i === 0 ? 'bg-brand-50 border border-brand-100' : 'bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {i + 1}
                    </span>
                    <span className={`text-sm font-semibold ${i === 0 ? 'text-brand-800' : 'text-slate-700'}`}>{style}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${i === 0 ? 'bg-brand-500 text-white' : 'bg-green-50 text-green-600'}`}>
                    {i === 0 ? '★ Terbaik' : '✓ Cocok'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating accent badge */}
      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-brand-500 to-orange-400 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-brand-500/30">
        ✨ AI Powered
      </div>

      {/* Floating stats card */}
      <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100">
        <p className="text-[11px] text-slate-400 font-medium mb-0.5">Pelanggan Puas</p>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-black text-slate-900">1.2K</p>
          <span className="text-green-500 text-sm font-bold">↑ 32%</span>
        </div>
      </div>
    </div>
  )
}

function FeatureChip({ icon, text }) {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-full px-3.5 py-2 shadow-sm">
      <span className="text-base leading-none">{icon}</span>
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  )
}

function StatItem({ value, label }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function HomePage() {
  const [barbershops, setBarbershops] = useState([])
  const [stats, setStats] = useState({ barbershops: 50, customers: 1200, rating: 4.9, bookings: 320 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const [shopsData, statsData] = await Promise.all([
        getAllBarbershops(),
        getHomepageStats()
      ])
      setBarbershops(shopsData)
      setStats(statsData)
      setLoading(false)
    }
    init()
  }, [])

  return (
    <div>
      {/* ══════════════════════════════════════════════════
          HERO — 2-column AI-first layout
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-16 pb-24 sm:pt-24 sm:pb-32 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-brand-100/60 to-transparent rounded-full blur-3xl -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-100/40 to-transparent rounded-full blur-3xl -ml-32 -mb-32" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text content */}
            <div className="text-center lg:text-left">
              {/* AI Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-50 to-orange-50 border border-brand-200/60 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse inline-block" />
                AI-powered · Barbershop Booking
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-5">
                Temukan Gaya<br/>
                Rambut Terbaik<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-orange-400 to-brand-600">
                  dengan AI.
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                Upload foto wajahmu dan dapatkan rekomendasi hairstyle terbaik dari AI,
                lalu booking barber favoritmu — tanpa antri.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Link
                  href="/#ai"
                  className="group inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-7 py-4 rounded-2xl text-base transition-all hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span className="text-lg">✨</span>
                  Coba AI Sekarang
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/#explore"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-7 py-4 rounded-2xl text-base transition-all hover:shadow-md active:scale-[0.98]"
                >
                  💈 Booking Barber
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8 border-t border-slate-100">
                {loading ? (
                  <div className="flex gap-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse space-y-2">
                        <div className="h-8 w-16 bg-slate-100 rounded-lg" />
                        <div className="h-4 w-20 bg-slate-50 rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <StatItem value={stats.customers >= 1000 ? `${(stats.customers/1000).toFixed(1)}K+` : stats.customers} label="Pelanggan" />
                    <div className="hidden sm:block w-px h-10 bg-slate-200" />
                    <StatItem value={`${stats.barbershops}+`} label="Barbershop" />
                    <div className="hidden sm:block w-px h-10 bg-slate-200" />
                    <StatItem value={`${stats.rating}★`} label="Rating" />
                  </>
                )}
              </div>
            </div>

            {/* Right — AI Showcase */}
            <div className="hidden lg:flex items-center justify-center py-8 pr-6">
              <AIShowcaseCard />
            </div>
          </div>

          {/* Feature chips — visible on mobile below hero */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-14 lg:hidden">
            <FeatureChip icon="🤖" text="AI Analisis Wajah" />
            <FeatureChip icon="📅" text="Booking Instan" />
            <FeatureChip icon="✂️" text="Barber Terpercaya" />
            <FeatureChip icon="⭐" text="Rating Terverifikasi" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          AI FEATURE SECTION
      ══════════════════════════════════════════════════ */}
      <section id="ai" className="bg-slate-900 py-20 sm:py-28 px-4 overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <span>🤖</span>
                Powered by Gemini AI
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
                AI Tahu Gaya<br/>
                yang Cocok<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-300">Untukmu</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                Upload foto wajahmu, dan teknologi AI kami akan menganalisis bentuk wajah
                serta merekomendasikan gaya rambut yang paling sesuai.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: '🔍', title: 'Deteksi Bentuk Wajah', desc: 'AI menganalisis proporsi dan bentuk wajahmu secara akurat' },
                  { icon: '💡', title: 'Rekomendasi Personal', desc: '3+ pilihan gaya rambut yang disesuaikan khusus untukmu' },
                  { icon: '✂️', title: 'Langsung Booking', desc: 'Temukan barber yang bisa mewujudkan gaya pilihanmu' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-slate-400 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/#explore"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 text-sm"
              >
                Coba di Barbershop →
              </Link>
            </div>

            {/* Right — AI card */}
            <div className="flex items-center justify-center py-8 px-4 lg:px-0">
              <div className="w-full max-w-sm">
                <AIShowcaseCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS — 3 steps
      ══════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-brand-500 uppercase tracking-widest mb-3">Cara Kerja</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Booking dalam 3 Langkah</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            {[
              { step: '01', icon: '🤖', title: 'Coba AI', desc: 'Upload foto dan dapatkan rekomendasi gaya rambut yang cocok untukmu.' },
              { step: '02', icon: '✂️', title: 'Pilih Barber', desc: 'Temukan barbershop dan barber terbaik di kotamu.' },
              { step: '03', icon: '📅', title: 'Booking', desc: 'Pilih jadwal, konfirmasi, dan datang tanpa antri.' },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-slate-900/10">
                  {item.icon}
                </div>
                <div className="absolute top-1 right-1/3 text-[11px] font-black text-slate-300 sm:right-0">{item.step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BARBERSHOP LIST
      ══════════════════════════════════════════════════ */}
      <section id="explore" className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-bold text-brand-500 uppercase tracking-widest mb-2">Tersedia</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Barbershop Premium</h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-52 w-full" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                  <div className="h-4 bg-slate-50 rounded-lg w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : barbershops.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl mx-auto mb-5">
              ✂️
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada barbershop</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
              Jadilah yang pertama mendaftarkan barbershopmu ke platform.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-md"
            >
              Daftar sebagai Owner →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {barbershops.map((shop) => (
              <BarbershopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-10 sm:p-14 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-brand-400 text-sm font-bold uppercase tracking-widest mb-4">Mulai sekarang</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Gaya Baru Menantimu
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Daftar gratis, coba AI, temukan barber, dan tampil percaya diri.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-7 py-3.5 rounded-2xl transition-all hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5"
              >
                ✨ Mulai Gratis
              </Link>
              <Link
                href="/#explore"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all"
              >
                💈 Lihat Barbershop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

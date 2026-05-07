'use client'

import { useState, useRef } from 'react'

export default function AIHairCheck() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cooldown, setCooldown] = useState(0)
  const fileInputRef = useRef(null)

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
    })

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await toBase64(file)
    setImage(base64)
    setPreview(base64)
    setResult(null)
    setError(null)
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClear = () => {
    setPreview(null)
    setImage(null)
    setResult(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!image) { setError('Upload foto dulu ya'); return }
    if (loading) return
    if (cooldown > 0) { setError(`Tunggu ${cooldown} detik sebelum mencoba lagi`); return }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })
      if (res.status === 429) throw new Error('Terlalu banyak permintaan. Tunggu sebentar ya 🙏')
      if (!res.ok) throw new Error('Gagal analisis. Coba lagi.')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
      startCooldown(10)
    } finally {
      setLoading(false)
    }
  }

  const startCooldown = (seconds) => {
    setCooldown(seconds)
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl flex-shrink-0">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-base leading-tight">AI Rekomendasi Gaya Rambut</h2>
          <p className="text-slate-400 text-xs mt-0.5">Upload foto · Analisis AI · Dapatkan rekomendasi</p>
        </div>
        <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          Live
        </span>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Upload zone (NO preview) or Preview (WITH image) ── */}
        {/* CRITICAL: both branches have IDENTICAL height (h-56) so layout never shifts */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden flex-shrink-0">
          {preview ? (
            /* ─── Preview state ─── */
            <>
              <img
                src={preview}
                alt="Foto yang diupload"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Hover overlay to change photo */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors cursor-pointer group">
                <span className="bg-black/70 text-white text-sm font-semibold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  📸 Ganti Foto
                </span>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              {/* Clear button */}
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-lg"
                title="Hapus foto"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {/* Uploaded badge */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Foto siap dianalisis
              </div>
            </>
          ) : (
            /* ─── Empty upload zone ─── */
            <label className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-brand-300 cursor-pointer transition-all group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 group-hover:border-brand-200 group-hover:bg-brand-50 flex items-center justify-center text-3xl transition-all shadow-sm">
                  📸
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-700 transition-colors">
                    Klik untuk upload foto wajah
                  </p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP · Foto tampak depan lebih akurat</p>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || cooldown > 0 || !image}
          className="w-full bg-gradient-to-r from-brand-500 to-orange-400 hover:from-brand-600 hover:to-orange-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-brand-500/20 hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              Menganalisis Wajah...
            </>
          ) : cooldown > 0 ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              Tunggu {cooldown}s
            </>
          ) : (
            <>
              <span>✨</span>
              Analisis Gaya Rambut Sekarang
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse pt-2">
            <div className="h-3 bg-slate-100 rounded-full w-1/4" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-slate-100 rounded-2xl" />
              <div className="h-24 bg-slate-100 rounded-2xl" />
            </div>
            <div className="h-3 bg-slate-100 rounded-full w-1/3 mt-2" />
            <div className="h-20 bg-slate-100 rounded-2xl" />
            <div className="h-20 bg-slate-100 rounded-2xl" />
            <div className="h-20 bg-slate-100 rounded-2xl" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-5 pt-2 animate-slide-up">
            {/* Face shape + description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bentuk Wajah</p>
                <p className="text-3xl font-black text-slate-900">{result.bentukWajah}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi</p>
                <p className="text-sm text-slate-600 leading-relaxed">{result.deskripsi}</p>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Rekomendasi Gaya</p>
              <div className="space-y-3">
                {result.rekomendasi?.map((item, i) => (
                  <div
                    key={i}
                    className="relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-card-hover transition-all overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 to-orange-400 group-hover:w-1.5 transition-all" />
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-base mb-1">{item.nama}</p>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.alasan}</p>
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs px-3 py-1.5 rounded-full font-medium mt-3">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L3.5 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Cocok untuk: {item.cocokUntuk}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-lg flex-shrink-0">
                  💡
                </div>
                <div>
                  <p className="font-bold text-emerald-800 text-sm mb-1">Tips Ekstra dari AI</p>
                  <p className="text-emerald-700 text-sm leading-relaxed">{result.tips}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

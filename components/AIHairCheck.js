'use client'

import { useState } from 'react'

export default function AIHairCheck() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cooldown, setCooldown] = useState(0)

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
  }

  const handleAnalyze = async () => {
    // 🔥 PROTECTION
    if (!image) {
      setError('Upload foto dulu ya')
      return
    }
    if (loading) return
    if (cooldown > 0) {
      setError(`Tunggu ${cooldown} detik sebelum mencoba lagi`)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })

      // 🔥 HANDLE RATE LIMIT
      if (res.status === 429) {
        throw new Error('Terlalu banyak permintaan. Tunggu sebentar ya 🙏')
      }

      if (!res.ok) {
        throw new Error('Gagal analisis. Coba lagi.')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
      startCooldown(10) // 🔥 10 detik cooldown
    } finally {
      setLoading(false)
    }
  }

  // 🔥 COOLDOWN TIMER
  const startCooldown = (seconds) => {
    setCooldown(seconds)
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -z-10 -mt-10 -mr-10"></div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Upload Foto Wajah</h2>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="mt-4 w-64 rounded-xl border"
        />
      )}

      {/* BUTTON */}
      <button
        onClick={handleAnalyze}
        disabled={loading || cooldown > 0}
        className="mt-6 w-full bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {loading
          ? 'Sedang Menganalisis Wajah...'
          : cooldown > 0
          ? `Tunggu ${cooldown}s`
          : '✨ Analisis Gaya Rambut Sekarang'}
      </button>

      {/* ERROR */}
      {error && (
        <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Bentuk Wajah</h3>
              <p className="text-slate-600">{result.bentukWajah}</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Deskripsi</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{result.deskripsi}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-xl text-slate-900 mb-4">Rekomendasi Gaya</h3>
            {result.rekomendasi?.map((item, i) => (
              <div
                key={i}
                className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>
                <p className="font-bold text-lg text-slate-900">{item.nama}</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.alasan}</p>
                <div className="mt-3 inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                  Cocok untuk: {item.cocokUntuk}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 mt-6">
            <h3 className="font-bold text-emerald-800 mb-1">💡 Tips Ekstra</h3>
            <p className="text-emerald-700 text-sm leading-relaxed">{result.tips}</p>
          </div>
        </div>
      )}
    </div>
  )
}
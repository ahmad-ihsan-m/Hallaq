'use client'
import { useState } from 'react'

export default function RatingModal({ isOpen, onClose, onSubmit, barberName, loading }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit({ rating, comment })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
          disabled={loading}
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            ⭐
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Beri Penilaian</h2>
          <p className="text-slate-500 text-sm">
            Bagaimana pengalaman cukur kamu dengan <span className="font-semibold text-slate-700">{barberName}</span>?
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-4xl focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              disabled={loading}
            >
              <span className={star <= (hoverRating || rating) ? 'text-yellow-400 drop-shadow-sm' : 'text-slate-200'}>
                ★
              </span>
            </button>
          ))}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Ulasan (Opsional)
          </label>
          <textarea
            rows="3"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none"
            placeholder="Ceritakan pengalamanmu..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className="w-full bg-slate-900 hover:bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Menyimpan...</span>
            </>
          ) : (
            'Kirim Penilaian'
          )}
        </button>
      </div>
    </div>
  )
}

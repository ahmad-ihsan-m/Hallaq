'use client'
export default function ReviewCard({ review }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating)

  return (
    <div className="bg-slate-50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-slate-800">
          {review.user?.name || 'Pelanggan'}
        </span>
        <div className="flex gap-0.5">
          {stars.map((filled, i) => (
            <span key={i} className={filled ? 'text-yellow-400' : 'text-gray-200'}>
              ★
            </span>
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
      )}
      <p className="text-xs text-gray-400 mt-2">
        {new Date(review.created_at).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}
      </p>
    </div>
  )
}

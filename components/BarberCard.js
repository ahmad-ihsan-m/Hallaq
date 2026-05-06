'use client'
export default function BarberCard({ barber, avgRating, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect && onSelect(barber)}
      className={`rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 ${
        selected
          ? 'border-brand-500 bg-brand-50/50 shadow-sm'
          : 'border-transparent hover:border-brand-200 bg-white shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-inner">
          {barber.image_url ? (
            <img src={barber.image_url} alt={barber.name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            barber.name[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 truncate">{barber.name}</h4>
          {barber.specialization && (
            <p className="text-sm text-slate-500 truncate">{barber.specialization}</p>
          )}
          {avgRating !== null && avgRating !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-sm font-medium text-slate-700">{avgRating}</span>
            </div>
          )}
        </div>
        {selected && (
          <span className="text-brand-500 text-lg">✓</span>
        )}
      </div>
    </div>
  )
}

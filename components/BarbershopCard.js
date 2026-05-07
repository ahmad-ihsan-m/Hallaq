import Link from 'next/link'

export default function BarbershopCard({ shop }) {
  return (
    <Link href={`/barbershops/${shop.id}`} className="group block h-full">
      <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer border border-slate-100 h-full flex flex-col">
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-56 flex items-center justify-center overflow-hidden">
          {shop.image_url ? (
            <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <span className="text-6xl opacity-50">✂️</span>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-1">{shop.name}</h3>
          <p className="text-sm text-slate-500 flex items-start gap-1.5 mb-3">
            <span className="mt-0.5">📍</span> 
            <span className="line-clamp-1">{shop.location}</span>
          </p>
          {shop.description && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{shop.description}</p>
          )}
          {shop.phone && (
            <p className="text-xs text-slate-400 mb-4">📞 {shop.phone}</p>
          )}
          <div className="mt-auto pt-4 border-t border-slate-50">
            <button className="w-full bg-slate-900 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-brand-500/30 flex items-center justify-center gap-2 group/btn">
              <span>Booking Now</span>
              <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

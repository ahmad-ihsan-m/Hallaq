import Link from 'next/link'

export default function BarbershopCard({ shop }) {
  return (
    <Link href={`/barbershops/${shop.id}`} className="group block h-full">
      <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer border border-slate-100 h-full flex flex-col">
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
          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-brand-600 text-sm font-semibold group-hover:text-brand-700 transition-colors">
              Lihat Detail
            </span>
            <span className="text-brand-500 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

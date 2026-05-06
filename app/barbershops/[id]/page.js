export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { getBarberReviews, getBarberAverageRating } from '@/services/reviewService'
import BarberCard from '@/components/BarberCard'
import ReviewCard from '@/components/ReviewCard'
import AIHairCheck from '@/components/AIHairCheck' // 🔥 TAMBAHAN
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getShop(id) {
  const { data, error } = await supabase
    .from('barbershops')
    .select('*, owner:users(name, email), barbers(*), services(*)')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export default async function BarbershopDetailPage({ params }) {
  const shop = await getShop(params.id)
  if (!shop) notFound()

  const ratingsData = await Promise.all(
    shop.barbers.map(async (barber) => ({
      barberId: barber.id,
      avg: await getBarberAverageRating(barber.id),
      reviews: await getBarberReviews(barber.id),
    }))
  )

  const ratingMap = Object.fromEntries(
    ratingsData.map((r) => [r.barberId, r.avg])
  )
  const allReviews = ratingsData.flatMap((r) => r.reviews)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Shop Header */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-brand-900 h-56 flex items-center justify-center">
          <span className="text-7xl opacity-90 drop-shadow-lg">✂️</span>
        </div>
        <div className="p-8 sm:p-10 relative">
          <div className="absolute top-0 right-10 -translate-y-1/2">
             {/* Decorative element or logo placeholder */}
             <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white rotate-3">
                <span className="text-3xl">💈</span>
             </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{shop.name}</h1>
          <p className="text-slate-500 flex items-center gap-2 mb-6">
            <span>📍</span> {shop.location}
          </p>

          {shop.description && (
            <p className="text-slate-600 mb-6 leading-relaxed max-w-2xl">{shop.description}</p>
          )}

          {shop.phone && (
            <p className="text-slate-500 text-sm font-medium">📞 {shop.phone}</p>
          )}

          <div className="mt-8">
            <Link
              href={`/booking/${shop.id}`}
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Booking Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* 🔥 AI FEATURE (INI YANG BARU) */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-brand-500 via-brand-400 to-purple-500 text-white p-6 rounded-3xl mb-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-1 relative z-10">
            <span>🤖</span> AI Rekomendasi Gaya Rambut
          </h2>
          <p className="opacity-90 max-w-lg relative z-10">
            Upload foto wajahmu dan dapatkan rekomendasi gaya rambut terbaik yang disesuaikan khusus untukmu.
          </p>
        </div>

        <AIHairCheck />
      </section>

      {/* Barbers */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Barber Kami</h2>
        {shop.barbers.length === 0 ? (
          <p className="text-gray-400">Belum ada barber terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shop.barbers.map((barber) => (
              <BarberCard
                key={barber.id}
                barber={barber}
                avgRating={ratingMap[barber.id]}
              />
            ))}
          </div>
        )}
      </section>

      {/* Services */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Layanan & Harga</h2>
        {shop.services.length === 0 ? (
          <p className="text-gray-400">Belum ada layanan terdaftar.</p>
        ) : (
          <div className="space-y-3">
            {shop.services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-5 flex justify-between items-center transition-all hover:shadow-md border border-transparent hover:border-slate-100"
              >
                <div>
                  <p className="font-bold text-slate-900 text-lg">{service.name}</p>
                  <p className="text-sm text-slate-500 mt-1">⏱ {service.duration} menit</p>
                </div>
                <p className="text-lg font-bold text-brand-600">
                  Rp {Number(service.price).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
          Ulasan ({allReviews.length})
        </h2>
        {allReviews.length === 0 ? (
          <p className="text-gray-400">Belum ada ulasan.</p>
        ) : (
          <div className="space-y-3">
            {allReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
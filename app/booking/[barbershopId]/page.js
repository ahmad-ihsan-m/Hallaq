export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import BookingFormWrapper from './BookingFormWrapper'
import { notFound } from 'next/navigation'
import Link from 'next/link'

async function getShop(id) {
  const { data, error } = await supabase
    .from('barbershops')
    .select('*, barbers(*), services(*)')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export default async function BookingPage({ params }) {
  const shop = await getShop(params.barbershopId)
  if (!shop) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href={`/barbershops/${shop.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">←</span>
        <span className="font-medium">Kembali ke {shop.name}</span>
      </Link>

      <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Booking Janji Temu</h1>
      <p className="text-slate-500 mb-10 text-lg">di <strong className="text-slate-800">{shop.name}</strong></p>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <BookingFormWrapper shop={shop} />
      </div>
    </div>
  )
}

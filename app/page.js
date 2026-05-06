'use client'

import { useEffect, useState } from 'react'
import BarbershopCard from '@/components/BarbershopCard'
import Link from 'next/link'
import { getAllBarbershops } from '@/services/barbershopService'

export default function HomePage() {
  const [barbershops, setBarbershops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchShops() {
      const data = await getAllBarbershops()
      console.log('HomePage SHOPS:', data)
      setBarbershops(data)
      setLoading(false)
    }
    fetchShops()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-24 px-4 sm:py-32">
        {/* Decorative background blobs */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-brand-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-medium mb-8">
            ✨ Platform Booking Barbershop No.1
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
            Gaya Rambut Terbaik,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400">Tanpa Antri.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Temukan barbershop premium di sekitarmu, lihat portfolio barber, dan booking jadwal secara instan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Mulai Booking Sekarang
            </Link>
            <a href="#explore" className="w-full sm:w-auto text-slate-600 font-semibold px-8 py-4 rounded-full text-lg hover:text-slate-900 transition-colors">
              Eksplor Barbershop ↓
            </a>
          </div>
        </div>
      </section>

      {/* Barbershop List */}
      <section id="explore" className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Barbershop Tersedia
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-200 h-56 w-full"></div>
                <div className="p-6">
                  <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-1/2 mb-6"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : barbershops.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">✂️</p>
            <p className="text-lg">Belum ada barbershop terdaftar.</p>
            <p className="text-sm mt-2">
              Daftar sebagai <strong>owner</strong> untuk menambahkan barbershopmu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {barbershops.map((shop) => (
              <BarbershopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

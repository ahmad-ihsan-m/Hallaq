'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BookingForm from '@/components/BookingForm'
import Link from 'next/link'

export default function BookingFormWrapper({ shop }) {
  const router = useRouter()
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  if (user === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <svg className="animate-spin w-7 h-7 text-brand-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <p className="text-slate-400 text-sm">Memuat...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
          🔒
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Login diperlukan</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
          Kamu harus login terlebih dahulu untuk melakukan booking.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-md"
        >
          Login Sekarang →
        </Link>
      </div>
    )
  }

  return <BookingForm shop={shop} user={user} />
}

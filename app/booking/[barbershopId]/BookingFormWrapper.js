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
    return <div className="text-center py-12 text-gray-400">Memuat...</div>
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Kamu harus login untuk melakukan booking.</p>
        <Link
          href="/auth/login"
          className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl inline-block transition-colors"
        >
          Login Sekarang
        </Link>
      </div>
    )
  }

  return <BookingForm shop={shop} user={user} />
}

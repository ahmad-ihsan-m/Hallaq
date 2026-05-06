'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('users').select('name, role').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('users').select('name, role').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-slate-900 tracking-tight">
          <span className="text-brand-500">✂</span> Hallaq
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-brand-500 transition-colors text-sm font-medium">
            Barbershop
          </Link>

          {user ? (
            <>
              {profile?.role === 'owner' && (
                <Link href="/dashboard" className="hover:text-brand-500 transition-colors text-sm font-medium">
                  Dashboard
                </Link>
              )}
              <span className="text-slate-500 text-sm font-medium">
                {profile?.name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-50 text-red-600 hover:bg-red-100 font-medium px-4 py-2 rounded-full text-sm transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hover:text-brand-500 transition-colors text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2 rounded-full text-sm transition-colors shadow-sm"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

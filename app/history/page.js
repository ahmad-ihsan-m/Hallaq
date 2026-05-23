'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserBookings } from '@/services/bookingService'
import { createReview } from '@/services/reviewService'
import RatingModal from '@/components/RatingModal'
import { useToast } from '@/components/Toast'
const STATUS_CONFIG = {
  pending:   { label: 'Menunggu',    dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200'  },
  confirmed: { label: 'Dikonfirmasi',dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200'        },
  done:      { label: 'Selesai',     dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700 border-green-200'     },
  cancelled: { label: 'Dibatalkan',  dot: 'bg-red-400',    badge: 'bg-red-50 text-red-700 border-red-200'           },
}

export default function HistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const addToast = useToast()

  // Rating State
  const [reviewBooking, setReviewBooking] = useState(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      try {
        const data = await getUserBookings(user.id)
        setBookings(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter)

  const handleSubmitReview = async ({ rating, comment }) => {
    if (!reviewBooking || !user) return
    setSubmittingReview(true)
    try {
      await createReview({
        userId: user.id,
        barberId: reviewBooking.barber_id,
        rating,
        comment
      })
      // Close modal
      setReviewBooking(null)
      // Optional: You might want to refresh the bookings here if you track which ones are already reviewed.
      addToast('Terima kasih! Ulasan kamu berhasil dikirim.', 'success')
    } catch (err) {
      console.error(err)
      addToast('Gagal mengirim ulasan, silakan coba lagi.', 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-slate-100 rounded-3xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-slate-100 rounded-full" />)}
          </div>
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in min-h-[60vh]">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Riwayat Booking</h1>
        <p className="text-slate-500">Lihat semua riwayat pemesanan barbershop kamu di sini.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-8 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            filter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Booking
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              filter === key ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filter === key ? 'bg-current' : cfg.dot}`} />
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] p-12 sm:p-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-4xl mx-auto mb-6">
            📅
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada riwayat booking</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Kamu belum memiliki booking dengan status ini. Yuk, mulai cari barbershop favoritmu!
          </p>
          <button
            onClick={() => router.push('/#explore')}
            className="inline-flex items-center justify-center bg-slate-900 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-brand-500/30 hover:-translate-y-0.5"
          >
            Cari Barbershop
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
            return (
              <div 
                key={booking.id} 
                className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ID: {booking.id.slice(0,8).toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {booking.barber?.barbershop?.name || 'Barbershop'}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 flex items-center gap-1">
                    <span>✂️</span> {booking.barber?.name || '—'} · {booking.service?.name || '—'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg font-medium">
                      <span>📅</span> 
                      {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg font-medium">
                      <span>⏱</span> {booking.booking_time.slice(0, 5)} WIB
                    </div>
                    {booking.created_at && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 sm:mt-0 sm:ml-auto">
                        Dipesan pada: {new Date(booking.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:text-right pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 mt-2 sm:mt-0">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Biaya</p>
                  <p className="text-xl font-black text-brand-600 mb-3">
                    Rp {Number(booking.service?.price || 0).toLocaleString('id-ID')}
                  </p>
                  {booking.status === 'pending' && (
                    <p className="text-xs text-slate-400">Silakan datang tepat waktu</p>
                  )}
                  {booking.status === 'done' && (
                    <button
                      onClick={() => setReviewBooking(booking)}
                      className="mt-2 inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Beri Penilaian
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        onSubmit={handleSubmitReview}
        barberName={reviewBooking?.barber?.name || 'Barber'}
        loading={submittingReview}
      />
    </div>
  )
}

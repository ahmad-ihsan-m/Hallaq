'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  getAllBarbershops,
  getBarbershopByOwner,
  createBarbershop,
  createBarber,
  deleteBarber,
  createService,
  deleteService,
} from '@/services/barbershopService'
import { getShopBookings, updateBookingStatus, deleteBooking } from '@/services/bookingService'
import { useToast } from '@/components/Toast'

const STATUS_CONFIG = {
  pending:   { label: 'Menunggu',    dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200'  },
  confirmed: { label: 'Dikonfirmasi',dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200'        },
  done:      { label: 'Selesai',     dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700 border-green-200'     },
  cancelled: { label: 'Dibatalkan',  dot: 'bg-red-400',    badge: 'bg-red-50 text-red-700 border-red-200'           },
}

const inputCls = 'w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all placeholder:text-slate-400'
const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5'

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function StatCard({ icon, value, label, desc, colorClass, urgent }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-card p-5 hover:shadow-card-hover transition-all group ${urgent ? 'border-yellow-200' : 'border-slate-100'}`}>
      <div className={`w-11 h-11 ${colorClass} rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform duration-200`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1 tabular-nums">{value}</div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const toast = useToast()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [shops, setShops] = useState([])
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  const [shopForm, setShopForm] = useState({ name: '', location: '', description: '', phone: '' })
  const [barberForm, setBarberForm] = useState({ name: '', specialization: '', shopId: '' })
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', duration: '', shopId: '' })
  const [deleteModal, setDeleteModal] = useState({ open: false, bookingId: null })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: prof } = await supabase
        .from('users').select('*').eq('id', user.id).single()

      if (!prof) { router.push('/'); return }
      if (prof.role !== 'owner') { router.push('/'); return }

      setUser(user)
      setProfile(prof)
      await loadData(user.id)
      setLoading(false)
    }
    init()
  }, [])

  async function loadData(ownerId) {
    let shopData = await getBarbershopByOwner(ownerId)
    if (!shopData || shopData.length === 0) {
      shopData = await getAllBarbershops()
    }
    setShops(shopData)

    if (shopData.length > 0) {
      const allBookings = await Promise.all(
        shopData.map((s) => getShopBookings(s.id).catch(() => []))
      )
      setBookings(allBookings.flat())
    }
  }

  async function handleCreateShop(e) {
    e.preventDefault()
    try {
      await createBarbershop({ ...shopForm, ownerId: user.id })
      setShopForm({ name: '', location: '', description: '', phone: '' })
      toast?.('Barbershop berhasil dibuat! 🎉', 'success')
      await loadData(user.id)
    } catch (err) {
      toast?.(err.message, 'error')
    }
  }

  async function handleCreateBarber(e) {
    e.preventDefault()
    try {
      await createBarber({ name: barberForm.name, specialization: barberForm.specialization, barbershopId: barberForm.shopId })
      setBarberForm({ name: '', specialization: '', shopId: '' })
      toast?.('Barber berhasil ditambahkan!', 'success')
      await loadData(user.id)
    } catch (err) {
      toast?.(err.message, 'error')
    }
  }

  async function handleCreateService(e) {
    e.preventDefault()
    try {
      await createService({
        name: serviceForm.name,
        price: parseFloat(serviceForm.price),
        duration: parseInt(serviceForm.duration),
        barbershopId: serviceForm.shopId,
      })
      setServiceForm({ name: '', price: '', duration: '', shopId: '' })
      toast?.('Layanan berhasil ditambahkan!', 'success')
      await loadData(user.id)
    } catch (err) {
      toast?.(err.message, 'error')
    }
  }

  async function handleStatusChange(bookingId, status) {
    try {
      await updateBookingStatus(bookingId, status)
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)))
      const labels = { confirmed: 'dikonfirmasi', done: 'selesai', cancelled: 'dibatalkan' }
      toast?.(`Booking ${labels[status] || 'diperbarui'}.`, 'success')
    } catch (err) {
      toast?.('Gagal update status: ' + err.message, 'error')
    }
  }

  async function handleDeleteBooking() {
    try {
      await deleteBooking(deleteModal.bookingId)
      setBookings((prev) => prev.filter((b) => b.id !== deleteModal.bookingId))
      setDeleteModal({ open: false, bookingId: null })
      toast?.('Booking berhasil dihapus secara permanen.', 'success')
    } catch (err) {
      toast?.('Gagal menghapus booking: ' + err.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-36 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
          </div>
          <div className="h-14 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const totalBarbers = shops.reduce((s, sh) => s + (sh.barbers?.length || 0), 0)

  const TABS = [
    { id: 'overview',    label: 'Ringkasan', icon: '📊' },
    { id: 'barbershops', label: 'Kelola',    icon: '⚙️' },
    { id: 'bookings',    label: 'Booking',   icon: '📅', badge: pendingCount },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-7 sm:p-10 mb-8 text-white">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500 rounded-full opacity-[0.07] blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500 rounded-full opacity-[0.07] blur-3xl -ml-16 -mb-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              <span className="text-slate-400 text-sm font-medium">Dashboard Owner</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Halo, {profile?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {pendingCount > 0 && (
            <button
              onClick={() => setActiveTab('bookings')}
              className="flex items-center gap-4 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/25 rounded-2xl px-5 py-4 transition-colors text-left flex-shrink-0"
            >
              <span className="text-3xl">⏳</span>
              <div>
                <p className="text-yellow-400 font-black text-2xl leading-none">{pendingCount}</p>
                <p className="text-yellow-400/70 text-xs mt-0.5">Booking menunggu konfirmasi</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🏪" value={shops.length} label="Barbershop" desc="terdaftar" colorClass="bg-blue-50" />
        <StatCard icon="✂️" value={totalBarbers} label="Total Barber" desc="aktif" colorClass="bg-orange-50" />
        <StatCard icon="📅" value={bookings.length} label="Total Booking" desc="semua waktu" colorClass="bg-green-50" />
        <StatCard
          icon="⏳"
          value={pendingCount}
          label="Menunggu"
          desc="perlu konfirmasi"
          colorClass={pendingCount > 0 ? 'bg-yellow-50' : 'bg-slate-50'}
          urgent={pendingCount > 0}
        />
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-1.5 mb-6 flex gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="hidden sm:block">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ TAB: RINGKASAN ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-slide-up">
          {shops.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-12 text-center">
              <div className="text-5xl mb-4">🏪</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Belum ada barbershop</h3>
              <p className="text-slate-500 text-sm mb-6">Tambahkan barbershop pertamamu di tab Kelola.</p>
              <button
                onClick={() => setActiveTab('barbershops')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-md"
              >
                Tambah Sekarang →
              </button>
            </div>
          ) : (
            shops.map((shop) => (
                <div key={shop.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{shop.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                        <span>📍</span> <span className="truncate">{shop.location}</span>
                      </p>
                    </div>
                    <span className="flex-shrink-0 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">Aktif</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5">
                    {[
                      { icon: '✂️', value: shop.barbers?.length || 0, label: 'Barber' },
                      { icon: '💈', value: shop.services?.length || 0, label: 'Layanan' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5">
                        <span>{item.icon}</span>
                        <span className="font-bold text-slate-900">{item.value}</span>
                        <span className="text-slate-500 text-sm">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  {shop.description && (
                    <p className="text-sm text-slate-500 mt-4 leading-relaxed line-clamp-2">{shop.description}</p>
                  )}
                </div>
            ))
          )}

          {/* Recent bookings preview */}
          {bookings.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Booking Terbaru</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-brand-600 text-sm font-semibold hover:text-brand-700 transition-colors"
                >
                  Lihat semua →
                </button>
              </div>
              <div className="space-y-2">
                {bookings.slice(0, 4).map((booking) => {
                  const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
                  return (
                    <div key={booking.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                          {(booking.user?.name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{booking.user?.name || '—'}</p>
                          <p className="text-xs text-slate-400 truncate">{booking.service?.name || '—'} · {booking.barber?.name || '—'}</p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.badge}`}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: KELOLA ═══ */}
      {activeTab === 'barbershops' && (
        <div className="space-y-6 animate-slide-up">

          {/* Create Barbershop */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <SectionHeader title="Tambah Barbershop" subtitle="Daftarkan barbershop baru ke platform" />
            <form onSubmit={handleCreateShop} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'name',     label: 'Nama Barbershop', placeholder: 'Hallaq Classic', required: true },
                { name: 'location', label: 'Lokasi',          placeholder: 'Jl. Sudirman No. 10, Jakarta', required: true },
                { name: 'phone',    label: 'Nomor Telepon',   placeholder: '021-5551234', required: false },
              ].map((field) => (
                <div key={field.name}>
                  <label className={labelCls}>{field.label}</label>
                  <input
                    name={field.name}
                    value={shopForm[field.name]}
                    onChange={(e) => setShopForm((p) => ({ ...p, [e.target.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    required={field.required}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className={labelCls}>Deskripsi</label>
                <textarea
                  name="description"
                  value={shopForm.description}
                  onChange={(e) => setShopForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Deskripsi singkat barbershopmu..."
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-md active:scale-[0.98]">
                  + Tambah Barbershop
                </button>
              </div>
            </form>
          </div>

          {/* Add Barber */}
          {shops.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <SectionHeader title="Tambah Barber" subtitle="Daftarkan barber ke barbershopmu" />
              <form onSubmit={handleCreateBarber} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nama Barber</label>
                  <input
                    value={barberForm.name}
                    onChange={(e) => setBarberForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ahmad Rizky"
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Spesialisasi</label>
                  <input
                    value={barberForm.specialization}
                    onChange={(e) => setBarberForm((p) => ({ ...p, specialization: e.target.value }))}
                    placeholder="Fade & Undercut"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Barbershop</label>
                  <select
                    value={barberForm.shopId}
                    onChange={(e) => setBarberForm((p) => ({ ...p, shopId: e.target.value }))}
                    required
                    className={inputCls}
                  >
                    <option value="">Pilih barbershop</option>
                    {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-md active:scale-[0.98]">
                    + Tambah Barber
                  </button>
                </div>
              </form>

              {shops.some((shop) => shop.barbers?.length > 0) && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Barber Terdaftar</p>
                  {shops.map((shop) =>
                    shop.barbers?.length > 0 ? (
                      <div key={shop.id} className="mb-4 last:mb-0">
                        <p className="text-xs font-bold text-slate-400 mb-2">{shop.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {shop.barbers.map((b) => (
                            <div key={b.id} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-xl px-3 py-1.5 text-sm transition-colors group">
                              <div className="w-5 h-5 rounded-full bg-slate-700 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                                {b.name[0].toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-700">{b.name}</span>
                              {b.specialization && <span className="text-slate-400">· {b.specialization}</span>}
                              <button
                                onClick={async () => { await deleteBarber(b.id); await loadData(user.id) }}
                                className="text-slate-300 hover:text-red-500 transition-colors ml-1"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add Service */}
          {shops.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <SectionHeader title="Tambah Layanan" subtitle="Kelola daftar layanan dan harga" />
              <form onSubmit={handleCreateService} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nama Layanan</label>
                  <input
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Potong Rambut"
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Harga (Rp)</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="35000"
                    required
                    min="0"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Durasi (menit)</label>
                  <input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm((p) => ({ ...p, duration: e.target.value }))}
                    placeholder="30"
                    required
                    min="1"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Barbershop</label>
                  <select
                    value={serviceForm.shopId}
                    onChange={(e) => setServiceForm((p) => ({ ...p, shopId: e.target.value }))}
                    required
                    className={inputCls}
                  >
                    <option value="">Pilih barbershop</option>
                    {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-md active:scale-[0.98]">
                    + Tambah Layanan
                  </button>
                </div>
              </form>

              {shops.some((shop) => shop.services?.length > 0) && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Layanan Terdaftar</p>
                  {shops.map((shop) =>
                    shop.services?.length > 0 ? (
                      <div key={shop.id} className="mb-4 last:mb-0">
                        <p className="text-xs font-bold text-slate-400 mb-2">{shop.name}</p>
                        <div className="space-y-1.5">
                          {shop.services.map((svc) => (
                            <div key={svc.id} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-2.5 text-sm transition-colors group">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="font-semibold text-slate-800 truncate">{svc.name}</span>
                                <span className="text-slate-400 flex-shrink-0">⏱ {svc.duration} mnt</span>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="font-bold text-brand-600">Rp {Number(svc.price).toLocaleString('id-ID')}</span>
                                <button
                                  onClick={async () => { await deleteService(svc.id); await loadData(user.id) }}
                                  className="text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: BOOKINGS ═══ */}
      {activeTab === 'bookings' && (
        <div className="animate-slide-up">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-16 text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Belum ada booking</h3>
              <p className="text-slate-500 text-sm">Booking dari pelanggan akan muncul di sini.</p>
            </div>
          ) : (
            <>
              {/* Status filter pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const count = bookings.filter((b) => b.status === key).length
                  return count > 0 ? (
                    <span key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label} ({count})
                    </span>
                  ) : null
                })}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        {['Pelanggan', 'Barber', 'Layanan', 'Waktu', 'Status', 'Aksi'].map((h) => (
                          <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bookings.map((booking) => {
                        const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
                        return (
                          <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                                  {(booking.user?.name || '?')[0].toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-900">{booking.user?.name || '—'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-600">{booking.barber?.name || '—'}</td>
                            <td className="px-5 py-4 text-slate-600">{booking.service?.name || '—'}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                              {new Date(booking.booking_date).toLocaleString('id-ID', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {st.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {booking.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:shadow-sm active:scale-95 flex items-center gap-1"
                                    >
                                      <span>✓</span> Konfirmasi
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:shadow-sm active:scale-95 flex items-center gap-1"
                                    >
                                      <span>✕</span> Batalkan
                                    </button>
                                  </>
                                )}
                                {booking.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleStatusChange(booking.id, 'done')}
                                    className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:shadow-sm active:scale-95 flex items-center gap-1"
                                  >
                                    <span>★</span> Selesai
                                  </button>
                                )}
                                <button
                                  onClick={() => setDeleteModal({ open: true, bookingId: booking.id })}
                                  className="text-slate-400 hover:bg-slate-100 hover:text-slate-700 border border-transparent text-xs font-semibold px-2 py-1.5 rounded-lg transition-all active:scale-95 flex items-center"
                                  title="Hapus"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Modal Delete ── */}
      {deleteModal.open && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setDeleteModal({ open: false, bookingId: null })} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-8 w-[90%] max-w-sm z-50 shadow-2xl animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5 text-2xl mx-auto">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Hapus Booking?</h3>
            <p className="text-slate-500 text-sm text-center mb-8">
              Data booking ini akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, bookingId: null })}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteBooking}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm hover:shadow-red-500/30 transition-all active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

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
import { getShopBookings, updateBookingStatus } from '@/services/bookingService'

const STATUS_LABELS = {
  pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800' },
  done: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [shops, setShops] = useState([])
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Forms
  const [shopForm, setShopForm] = useState({ name: '', location: '', description: '', phone: '' })
  const [barberForm, setBarberForm] = useState({ name: '', specialization: '', shopId: '' })
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', duration: '', shopId: '' })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: prof, error: profError } = await supabase
        .from('users').select('*').eq('id', user.id).single()

      console.log('Dashboard init — USER:', user)
      console.log('Dashboard init — PROFILE:', prof, profError)

      if (!prof) {
        console.warn('No profile found for user. Check if the trigger ran on signup.')
        router.push('/')
        return
      }
      if (prof.role !== 'owner') {
        console.warn('User role is not owner:', prof.role)
        router.push('/')
        return
      }

      setUser(user)
      setProfile(prof)
      await loadData(user.id)
      setLoading(false)
    }
    init()
  }, [])

  async function loadData(ownerId) {
    console.log('loadData: USER:', ownerId)

    let shopData = await getBarbershopByOwner(ownerId)
    console.log('loadData: OWNER SHOPS:', shopData)

    // Fallback for development: show all shops if owner filter returns nothing
    if (!shopData || shopData.length === 0) {
      console.log('loadData: no owner shops found, falling back to getAllBarbershops')
      shopData = await getAllBarbershops()
      console.log('loadData: ALL SHOPS fallback:', shopData)
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
    setFormError(''); setFormSuccess('')
    try {
      await createBarbershop({ ...shopForm, ownerId: user.id })
      setShopForm({ name: '', location: '', description: '', phone: '' })
      setFormSuccess('Barbershop berhasil dibuat!')
      await loadData(user.id)
    } catch (err) {
      setFormError(err.message)
    }
  }

  async function handleCreateBarber(e) {
    e.preventDefault()
    setFormError(''); setFormSuccess('')
    try {
      await createBarber({ name: barberForm.name, specialization: barberForm.specialization, barbershopId: barberForm.shopId })
      setBarberForm({ name: '', specialization: '', shopId: '' })
      setFormSuccess('Barber berhasil ditambahkan!')
      await loadData(user.id)
    } catch (err) {
      setFormError(err.message)
    }
  }

  async function handleCreateService(e) {
    e.preventDefault()
    setFormError(''); setFormSuccess('')
    try {
      await createService({
        name: serviceForm.name,
        price: parseFloat(serviceForm.price),
        duration: parseInt(serviceForm.duration),
        barbershopId: serviceForm.shopId,
      })
      setServiceForm({ name: '', price: '', duration: '', shopId: '' })
      setFormSuccess('Layanan berhasil ditambahkan!')
      await loadData(user.id)
    } catch (err) {
      setFormError(err.message)
    }
  }

  async function handleStatusChange(bookingId, status) {
    try {
      await updateBookingStatus(bookingId, status)
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      )
    } catch (err) {
      alert('Gagal update status: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-lg">Memuat dashboard...</div>
      </div>
    )
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Owner</h1>
        <p className="text-gray-500 mt-1">Selamat datang, <strong>{profile?.name}</strong>!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Barbershop', value: shops.length, icon: '🏪' },
          { label: 'Total Barber', value: shops.reduce((s, sh) => s + (sh.barbers?.length || 0), 0), icon: '✂️' },
          { label: 'Total Booking', value: bookings.length, icon: '📅' },
          { label: 'Menunggu', value: pendingCount, icon: '⏳' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-3xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['overview', 'barbershops', 'bookings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' ? 'Ringkasan' : tab === 'barbershops' ? 'Kelola' : 'Booking'}
          </button>
        ))}
      </div>

      {/* Feedback messages */}
      {formSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          ✅ {formSuccess}
        </div>
      )}
      {formError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          ❌ {formError}
        </div>
      )}

      {/* ===== TAB: OVERVIEW ===== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {shops.length === 0 ? (
            <p className="text-gray-400">Kamu belum memiliki barbershop. Tambahkan di tab &quot;Kelola&quot;.</p>
          ) : shops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{shop.name}</h3>
              <p className="text-sm text-gray-500 mb-4">📍 {shop.location}</p>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>✂️ {shop.barbers?.length || 0} barber</span>
                <span>💈 {shop.services?.length || 0} layanan</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== TAB: KELOLA ===== */}
      {activeTab === 'barbershops' && (
        <div className="space-y-8">
          {/* Create Barbershop */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">+ Tambah Barbershop</h3>
            <form onSubmit={handleCreateShop} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'name', label: 'Nama Barbershop', placeholder: 'Hallaq Classic' },
                { name: 'location', label: 'Lokasi', placeholder: 'Jl. Sudirman No. 10, Jakarta' },
                { name: 'phone', label: 'Nomor Telepon', placeholder: '021-5551234' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    value={shopForm[field.name]}
                    onChange={(e) => setShopForm((p) => ({ ...p, [e.target.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    required={field.name !== 'phone'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={shopForm.description}
                  onChange={(e) => setShopForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Deskripsi singkat barbershopmu..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                  Tambah Barbershop
                </button>
              </div>
            </form>
          </div>

          {/* Add Barber */}
          {shops.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">+ Tambah Barber</h3>
              <form onSubmit={handleCreateBarber} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barber</label>
                  <input
                    value={barberForm.name}
                    onChange={(e) => setBarberForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ahmad Rizky"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi</label>
                  <input
                    value={barberForm.specialization}
                    onChange={(e) => setBarberForm((p) => ({ ...p, specialization: e.target.value }))}
                    placeholder="Fade & Undercut"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barbershop</label>
                  <select
                    value={barberForm.shopId}
                    onChange={(e) => setBarberForm((p) => ({ ...p, shopId: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">Pilih barbershop</option>
                    {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                    Tambah Barber
                  </button>
                </div>
              </form>

              {/* Barber List */}
              {shops.map((shop) =>
                shop.barbers?.length > 0 ? (
                  <div key={shop.id} className="mt-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">{shop.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {shop.barbers.map((b) => (
                        <div key={b.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm">
                          <span>{b.name}</span>
                          <button
                            onClick={async () => { await deleteBarber(b.id); await loadData(user.id) }}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Add Service */}
          {shops.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">+ Tambah Layanan</h3>
              <form onSubmit={handleCreateService} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan</label>
                  <input
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Potong Rambut"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="35000"
                    required
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit)</label>
                  <input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm((p) => ({ ...p, duration: e.target.value }))}
                    placeholder="30"
                    required
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barbershop</label>
                  <select
                    value={serviceForm.shopId}
                    onChange={(e) => setServiceForm((p) => ({ ...p, shopId: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">Pilih barbershop</option>
                    {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                    Tambah Layanan
                  </button>
                </div>
              </form>

              {/* Service List */}
              {shops.map((shop) =>
                shop.services?.length > 0 ? (
                  <div key={shop.id} className="mt-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">{shop.name}</p>
                    <div className="space-y-1">
                      {shop.services.map((svc) => (
                        <div key={svc.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                          <span>{svc.name} — Rp {Number(svc.price).toLocaleString('id-ID')} ({svc.duration} mnt)</span>
                          <button
                            onClick={async () => { await deleteService(svc.id); await loadData(user.id) }}
                            className="text-red-400 hover:text-red-600 text-xs ml-2"
                          >✕</button>
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

      {/* ===== TAB: BOOKINGS ===== */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Belum ada booking masuk.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Pelanggan', 'Barber', 'Layanan', 'Waktu', 'Status', 'Aksi'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => {
                    const st = STATUS_LABELS[booking.status] || STATUS_LABELS.pending
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{booking.user?.name || '—'}</td>
                        <td className="px-4 py-3">{booking.barber?.name || '—'}</td>
                        <td className="px-4 py-3">{booking.service?.name || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(booking.booking_date).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {booking.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                              >Konfirmasi</button>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                              >Tolak</button>
                            </div>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'done')}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                            >Selesai</button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

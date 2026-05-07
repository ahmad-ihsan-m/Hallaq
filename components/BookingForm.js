'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BarberCard from './BarberCard'
import { DatePicker, SlotGrid, getNextDays } from './TimeSlotPicker'
import { getAvailableSlots, createBooking } from '@/services/bookingService'

const DAYS = getNextDays(7)

function StepHeader({ number, label }) {
  return (
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2.5">
      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0">
        {number}
      </span>
      {label}
    </h3>
  )
}

function BookingSuccess({ barber, service, date, time, onHome }) {
  const router = useRouter()

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00').toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  return (
    <div className="py-6 animate-slide-up">
      {/* Success icon */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 16.5L12 22.5L26 9" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {/* Sparkle dots */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 shadow-sm animate-bounce" style={{animationDelay:'0.1s'}}/>
          <div className="absolute -bottom-1 -left-2 w-3 h-3 rounded-full bg-green-400 shadow-sm animate-bounce" style={{animationDelay:'0.3s'}}/>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Booking Berhasil! 🎉</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          Jadwalmu sudah terkonfirmasi. Datang tepat waktu ya!
        </p>
      </div>

      {/* Booking detail card */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden mb-6">
        {/* Card header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brand-400 text-lg">✂</span>
            <span className="text-white font-bold text-sm">Detail Booking</span>
          </div>
          <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            Terkonfirmasi
          </span>
        </div>

        {/* Booking details */}
        <div className="divide-y divide-slate-200/60">
          {[
            { label: 'Barber', value: barber?.name, icon: '✂️' },
            { label: 'Layanan', value: service?.name, sub: service ? `Rp ${Number(service.price).toLocaleString('id-ID')} · ${service.duration} menit` : null, icon: '💈' },
            { label: 'Tanggal', value: date ? formatDate(date) : '—', icon: '📅' },
            { label: 'Jam', value: time ?? '—', icon: '⏰' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 px-6 py-4">
              <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium mb-0.5">{item.label}</p>
                <p className="text-sm font-bold text-slate-900 truncate">{item.value || '—'}</p>
                {item.sub && <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminder note */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200/60 rounded-2xl px-4 py-3.5 mb-8">
        <span className="text-blue-500 text-base flex-shrink-0 mt-0.5">💡</span>
        <p className="text-sm text-blue-700 leading-relaxed">
          Tunjukkan konfirmasi ini saat datang. Hadir 5 menit lebih awal untuk memastikan jadwal berjalan lancar.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push('/')}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-md active:scale-[0.98] text-sm"
        >
          🏠 Kembali ke Homepage
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-3.5 rounded-2xl transition-all hover:shadow-sm active:scale-[0.98] text-sm"
        >
          📅 Lihat Booking Saya
        </button>
      </div>
    </div>
  )
}

export default function BookingForm({ shop, user }) {
  const router = useRouter()

  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState(DAYS[0].value)
  const [selectedTime, setSelectedTime] = useState(null)
  const [notes, setNotes] = useState('')

  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!selectedBarber || !selectedDate) { setSlots([]); return }
    setSlotsLoading(true)
    setSelectedTime(null)
    getAvailableSlots(selectedBarber.id, selectedDate).then((result) => {
      setSlots(result)
      setSlotsLoading(false)
    })
  }, [selectedBarber, selectedDate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) {
      setError('Harap lengkapi semua pilihan.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createBooking({
        userId: user.id,
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        notes,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
      if (selectedBarber && selectedDate) {
        getAvailableSlots(selectedBarber.id, selectedDate).then(setSlots)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <BookingSuccess
        barber={selectedBarber}
        service={selectedService}
        date={selectedDate}
        time={selectedTime}
      />
    )
  }

  const isReady = selectedBarber && selectedService && selectedDate && selectedTime

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* STEP 1 — Barber */}
      <section>
        <StepHeader number="1" label="Pilih Barber" />
        {shop.barbers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-3xl mb-2">✂️</div>
            <p className="text-sm">Belum ada barber terdaftar di barbershop ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shop.barbers.map((barber) => (
              <BarberCard
                key={barber.id}
                barber={barber}
                selected={selectedBarber?.id === barber.id}
                onSelect={(b) => setSelectedBarber(b)}
              />
            ))}
          </div>
        )}
      </section>

      {/* STEP 2 — Service */}
      <section>
        <StepHeader number="2" label="Pilih Layanan" />
        {shop.services.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-3xl mb-2">💈</div>
            <p className="text-sm">Belum ada layanan terdaftar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shop.services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedService(service)}
                className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 ${
                  selectedService?.id === service.id
                    ? 'border-brand-500 bg-brand-50/60 shadow-sm'
                    : 'border-slate-100 hover:border-brand-200 bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{service.name}</p>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      {service.duration} menit
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-brand-600 text-base">
                      Rp {Number(service.price).toLocaleString('id-ID')}
                    </p>
                    {selectedService?.id === service.id && (
                      <span className="text-brand-500 text-xs font-bold">✓ Dipilih</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* STEP 3 — Date */}
      <section>
        <StepHeader number="3" label="Pilih Tanggal" />
        <DatePicker days={DAYS} selectedDate={selectedDate} onSelect={setSelectedDate} />
      </section>

      {/* STEP 4 — Time Slot */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <StepHeader number="4" label="Pilih Jam" />
          <div className="flex items-center gap-3 text-xs text-slate-400 pb-4">
            {[
              { color: 'bg-brand-500 border-brand-500', label: 'Dipilih' },
              { color: 'bg-white border-slate-200', label: 'Tersedia' },
              { color: 'bg-slate-50 border-slate-100', label: 'Penuh' },
            ].map((s) => (
              <span key={s.label} className="flex items-center gap-1">
                <span className={`w-3.5 h-3.5 rounded border-2 inline-block ${s.color}`} />
                {s.label}
              </span>
            ))}
          </div>
        </div>
        {!selectedBarber ? (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
            Pilih barber terlebih dahulu untuk melihat jadwal
          </div>
        ) : (
          <SlotGrid slots={slots} selectedTime={selectedTime} onSelect={setSelectedTime} loading={slotsLoading} />
        )}
      </section>

      {/* Notes */}
      <section>
        <StepHeader number="5" label="Catatan (Opsional)" />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contoh: minta rambut depan lebih pendek, atau preferensi tertentu..."
          rows={2}
          className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all placeholder:text-slate-400 resize-none"
        />
      </section>

      {/* Summary */}
      {isReady && (
        <div className="bg-slate-900 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-bold text-brand-400 uppercase tracking-widest">Ringkasan Booking</p>
          {[
            { label: 'Barber', value: selectedBarber.name },
            { label: 'Layanan', value: `${selectedService.name} · Rp ${Number(selectedService.price).toLocaleString('id-ID')}` },
            { label: 'Waktu', value: `${selectedDate} — ${selectedTime}` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-start gap-4 pb-4 border-b border-slate-800 last:pb-0 last:border-0">
              <span className="text-sm text-slate-400">{row.label}</span>
              <strong className="text-sm text-white text-right">{row.value}</strong>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !isReady}
        className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] text-base flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            Memproses...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5v1M3.7 3.7l.7.7M1.5 9h1M3.7 14.3l.7-.7M9 16.5v-1M14.3 14.3l-.7-.7M16.5 9h-1M14.3 3.7l-.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
            Konfirmasi Booking
          </>
        )}
      </button>
    </form>
  )
}

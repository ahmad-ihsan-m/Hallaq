'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BarberCard from './BarberCard'
import { DatePicker, SlotGrid, getNextDays } from './TimeSlotPicker'
import { getAvailableSlots, createBooking } from '@/services/bookingService'

const DAYS = getNextDays(7)

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

  // Re-fetch slots whenever barber or date changes
  useEffect(() => {
    if (!selectedBarber || !selectedDate) {
      setSlots([])
      return
    }
    setSlotsLoading(true)
    setSelectedTime(null) // reset time when barber/date changes
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
      setTimeout(() => router.push('/'), 2500)
    } catch (err) {
      setError(err.message)
      // If slot was taken, refresh the slot list
      if (selectedBarber && selectedDate) {
        getAvailableSlots(selectedBarber.id, selectedDate).then(setSlots)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil!</h2>
        <p className="text-gray-500">
          {selectedBarber?.name} — {selectedDate} pukul {selectedTime}
        </p>
        <p className="text-gray-400 text-sm mt-2">Mengalihkan ke halaman utama...</p>
      </div>
    )
  }

  const isReady = selectedBarber && selectedService && selectedDate && selectedTime

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* STEP 1 — Barber */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">1</span>
          Pilih Barber
        </h3>
        {shop.barbers.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada barber terdaftar.</p>
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
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 mt-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">2</span>
          Pilih Layanan
        </h3>
        {shop.services.length === 0 ? (
          <p className="text-slate-400 text-sm">Belum ada layanan terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shop.services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                  selectedService?.id === service.id
                    ? 'border-brand-500 bg-brand-50/50'
                    : 'border-transparent hover:border-brand-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900">{service.name}</p>
                    <p className="text-sm text-slate-500 mt-1">⏱ {service.duration} menit</p>
                  </div>
                  <p className="font-bold text-brand-600 text-sm">
                    Rp {Number(service.price).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* STEP 3 — Date */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 mt-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">3</span>
          Pilih Tanggal
        </h3>
        <DatePicker
          days={DAYS}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </section>

      {/* STEP 4 — Time Slot */}
      <section>
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">4</span>
            Pilih Jam
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded border-2 border-brand-500 bg-brand-500 inline-block" />
              Dipilih
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded border-2 border-gray-200 bg-white inline-block" />
              Tersedia
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded border-2 border-gray-100 bg-gray-50 inline-block" />
              Penuh
            </span>
          </div>
        </div>

        {!selectedBarber ? (
          <p className="text-gray-400 text-sm">Pilih barber dulu untuk melihat jadwal.</p>
        ) : (
          <SlotGrid
            slots={slots}
            selectedTime={selectedTime}
            onSelect={setSelectedTime}
            loading={slotsLoading}
          />
        )}
      </section>

      {/* Notes */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 mt-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">5</span>
          Catatan (Opsional)
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contoh: minta rambut depan lebih pendek..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </section>

      {/* Summary */}
      {isReady && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3 mt-8">
          <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-4">Ringkasan Booking</p>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
             <span className="text-sm text-slate-500">Barber</span>
             <strong className="text-sm text-slate-900">{selectedBarber.name}</strong>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
             <span className="text-sm text-slate-500">Layanan</span>
             <strong className="text-sm text-slate-900">{selectedService.name} (Rp {Number(selectedService.price).toLocaleString('id-ID')})</strong>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-sm text-slate-500">Waktu</span>
             <strong className="text-sm text-slate-900">{selectedDate} — {selectedTime}</strong>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !isReady}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5 text-base mt-6"
      >
        {submitting ? 'Memproses...' : 'Konfirmasi Booking'}
      </button>
    </form>
  )
}

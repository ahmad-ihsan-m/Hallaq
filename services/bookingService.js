import { supabase } from '@/lib/supabase'

// All possible time slots (10:00 – 20:00)
const ALL_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
]

/**
 * Get available slots (with real-time filtering)
 */
export async function getAvailableSlots(barberId, date) {
  console.log('getAvailableSlots:', { barberId, date })

  const now = new Date()

  // format hari ini
  const today = now.toISOString().split('T')[0]

  // jam sekarang (HH:MM)
  const currentTime = now.toTimeString().slice(0, 5)

  const { data, error } = await supabase
    .from('bookings')
    .select('booking_time')
    .eq('barber_id', barberId)
    .eq('booking_date', date)
    .neq('status', 'cancelled')

  if (error) {
    console.error('getAvailableSlots error:', error.message)
    return ALL_SLOTS.map((time) => ({ time, available: true }))
  }

  // normalize booking_time → HH:MM
  const booked = new Set(
    (data || []).map((b) => b.booking_time.slice(0, 5))
  )

  console.log('booked slots:', [...booked])

  return ALL_SLOTS.map((time) => {
    let available = !booked.has(time)

    // 🔥 FIX 1: block slot yang sudah lewat (hari ini)
    if (date === today && time <= currentTime) {
      available = false
    }

    return { time, available }
  })
}

/**
 * Create booking (with strict validation)
 */
export async function createBooking({
  userId,
  barberId,
  serviceId,
  bookingDate,
  bookingTime,
  notes,
}) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().slice(0, 5)

  // 🔥 FIX 2: block booking di masa lalu
  if (bookingDate === today && bookingTime <= currentTime) {
    throw new Error('Waktu booking sudah lewat. Pilih jam lain.')
  }

  // 🔥 FIX 3: double booking protection
  const { data: conflict } = await supabase
    .from('bookings')
    .select('id')
    .eq('barber_id', barberId)
    .eq('booking_date', bookingDate)
    .eq('booking_time', bookingTime)
    .neq('status', 'cancelled')
    .maybeSingle()

  if (conflict) {
    throw new Error('Slot ini baru saja dipesan. Silakan pilih waktu lain.')
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      barber_id: barberId,
      service_id: serviceId,
      booking_date: bookingDate,
      booking_time: bookingTime,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * User bookings
 */
export async function getUserBookings(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      barber:barbers(name, specialization, barbershop:barbershops(name, location)),
      service:services(name, price, duration)
    `)
    .eq('user_id', userId)
    .order('booking_date', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Shop bookings (owner view)
 */
export async function getShopBookings(barbershopId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      user:users(name, email),
      barber:barbers!inner(name, barbershop_id),
      service:services(name, price, duration)
    `)
    .eq('barber.barbershop_id', barbershopId)
    .order('booking_date', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Update booking status
 */
export async function updateBookingStatus(id, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function cancelBooking(id) {
  return updateBookingStatus(id, 'cancelled')
}
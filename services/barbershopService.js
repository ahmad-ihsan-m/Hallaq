import { supabase } from '@/lib/supabase'

export async function getAllBarbershops() {
  console.log('getAllBarbershops: fetching...')
  const { data, error } = await supabase
    .from('barbershops')
    .select('*')
    .order('created_at', { ascending: false })

  console.log('getAllBarbershops result:', { data, error })
  if (error) {
    console.error('getAllBarbershops error:', error.message)
    return []
  }
  return data || []
}

export async function getBarbershopById(id) {
  console.log('getBarbershopById:', id)
  const { data, error } = await supabase
    .from('barbershops')
    .select('*, barbers(*), services(*)')
    .eq('id', id)
    .single()

  console.log('getBarbershopById result:', { data, error })
  if (error) {
    console.error('getBarbershopById error:', error.message)
    return null
  }
  return data
}

export async function getBarbershopByOwner(ownerId) {
  console.log('getBarbershopByOwner: ownerId =', ownerId)
  const { data, error } = await supabase
    .from('barbershops')
    .select('*, barbers(*), services(*)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  console.log('getBarbershopByOwner result:', { data, error })
  if (error) {
    console.error('getBarbershopByOwner error:', error.message)
    return []
  }
  return data || []
}

export async function createBarbershop({ name, location, description, phone, ownerId }) {
  const { data, error } = await supabase
    .from('barbershops')
    .insert({ name, location, description, phone, owner_id: ownerId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBarbershop(id, updates) {
  const { data, error } = await supabase
    .from('barbershops')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBarbershop(id) {
  const { error } = await supabase.from('barbershops').delete().eq('id', id)
  if (error) throw error
}

export async function createBarber({ name, barbershopId, specialization }) {
  const { data, error } = await supabase
    .from('barbers')
    .insert({ name, barbershop_id: barbershopId, specialization })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBarber(id) {
  const { error } = await supabase.from('barbers').delete().eq('id', id)
  if (error) throw error
}

export async function createService({ name, price, duration, barbershopId }) {
  const { data, error } = await supabase
    .from('services')
    .insert({ name, price, duration, barbershop_id: barbershopId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteService(id) {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

export async function getHomepageStats() {
  try {
    const [shops, users, reviews, bookings] = await Promise.all([
      supabase.from('barbershops').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('reviews').select('rating'),
      supabase.from('bookings').select('id', { count: 'exact', head: true })
    ])
    
    let avgRating = 4.9
    if (reviews.data && reviews.data.length > 0) {
      avgRating = (reviews.data.reduce((a, b) => a + b.rating, 0) / reviews.data.length).toFixed(1)
    }

    return {
      barbershops: shops.count || 50,
      customers: users.count || 1200,
      rating: avgRating,
      bookings: bookings.count || 320
    }
  } catch (err) {
    console.error('getHomepageStats error:', err)
    return { barbershops: 50, customers: 1200, rating: '4.9', bookings: 320 }
  }
}


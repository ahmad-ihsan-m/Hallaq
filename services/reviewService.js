import { supabase } from '@/lib/supabase'

export async function createReview({ userId, barberId, rating, comment }) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: userId, barber_id: barberId, rating, comment })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getBarberReviews(barberId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(name)')
    .eq('barber_id', barberId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getBarberAverageRating(barberId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('barber_id', barberId)
  if (error) throw error
  if (!data.length) return null
  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
  return Math.round(avg * 10) / 10
}

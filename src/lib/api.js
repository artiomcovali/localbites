import { samplePlaces, sampleReviews } from '../data/samplePlaces'
import { isDemo, supabase } from './supabase'

const demoKey = 'localbites-demo-data'
const readDemo = () => {
  try { return JSON.parse(localStorage.getItem(demoKey) || '{}') } catch { return {} }
}
const writeDemo = (data) => localStorage.setItem(demoKey, JSON.stringify(data))
const unwrap = ({ data, error }) => { if (error) throw error; return data }
const withDemoRating = (place) => {
  const added = (readDemo().reviews || []).filter((review) => review.place_id === place.id)
  if (!added.length) return place
  const total = (place.average_rating || 0) * (place.review_count || 0) + added.reduce((sum, review) => sum + review.rating, 0)
  const count = (place.review_count || 0) + added.length
  return { ...place, average_rating: total / count, review_count: count }
}

export async function getPlaces() {
  if (isDemo) return samplePlaces.map(withDemoRating)
  const rows = unwrap(await supabase.from('places').select('*, reviews(rating)').eq('is_active', true).order('name'))
  return rows.map(({ reviews, ...place }) => ({
    ...place,
    average_rating: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null,
    review_count: reviews.length,
  }))
}

export async function getPlace(id) {
  if (isDemo) {
    const place = samplePlaces.find((item) => item.id === id)
    return place ? withDemoRating(place) : null
  }
  const place = unwrap(await supabase.from('places').select('*, reviews(rating)').eq('id', id).maybeSingle())
  if (!place) return null
  const { reviews, ...rest } = place
  return { ...rest, average_rating: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null, review_count: reviews.length }
}

export async function getReviews(placeId) {
  if (isDemo) {
    const state = readDemo()
    return [...(state.reviews || []), ...sampleReviews].filter((review) => review.place_id === placeId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  const rows = unwrap(await supabase.from('reviews').select('id, user_id, place_id, rating, comment, created_at, profiles(display_name)').eq('place_id', placeId).order('created_at', { ascending: false }))
  return rows.map(({ profiles, ...review }) => ({ ...review, display_name: profiles?.display_name || 'LocalBites member' }))
}

export async function addReview({ userId, placeId, rating, comment, displayName }) {
  if (isDemo) {
    const state = readDemo()
    const reviews = state.reviews || []
    if (reviews.some((review) => review.user_id === userId && review.place_id === placeId)) throw new Error('You have already reviewed this place.')
    reviews.unshift({ id: crypto.randomUUID(), user_id: userId, place_id: placeId, rating, comment, display_name: displayName, created_at: new Date().toISOString() })
    writeDemo({ ...state, reviews })
    return
  }
  unwrap(await supabase.from('reviews').insert({ user_id: userId, place_id: placeId, rating, comment }))
}

export async function getFavorites(userId) {
  if (isDemo) return (readDemo().favorites || []).filter((favorite) => favorite.user_id === userId).map((favorite) => favorite.place_id)
  const rows = unwrap(await supabase.from('favorites').select('place_id').eq('user_id', userId))
  return rows.map((row) => row.place_id)
}

export async function toggleFavorite(userId, placeId, isFavorite) {
  if (isDemo) {
    const state = readDemo()
    const favorites = (state.favorites || []).filter((favorite) => !(favorite.user_id === userId && favorite.place_id === placeId))
    if (!isFavorite) favorites.push({ user_id: userId, place_id: placeId })
    writeDemo({ ...state, favorites })
    return
  }
  if (isFavorite) unwrap(await supabase.from('favorites').delete().eq('user_id', userId).eq('place_id', placeId))
  else unwrap(await supabase.from('favorites').insert({ user_id: userId, place_id: placeId }))
}

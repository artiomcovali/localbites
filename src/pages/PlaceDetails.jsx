import { ArrowLeft, Clock3, ExternalLink, Heart, MapPin, Star, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ReviewForm, ReviewList } from '../components/Reviews'
import PlaceImage from '../components/PlaceImage'
import { ErrorState } from '../components/StateViews'
import { useAuth } from '../context/AuthContext'
import { addReview, getFavorites, getPlace, getReviews, toggleFavorite } from '../lib/api'

export default function PlaceDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [place, setPlace] = useState(null)
  const [reviews, setReviews] = useState([])
  const [favorite, setFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [actionError, setActionError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => { let active = true; setLoading(true); setReviewsLoading(true); setError(''); setReviewError(''); getPlace(id).then((data) => { if (active) setPlace(data) }).catch((err) => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) }); getReviews(id).then((data) => { if (active) setReviews(data) }).catch((err) => { if (active) setReviewError(err.message) }).finally(() => { if (active) setReviewsLoading(false) }); return () => { active = false } }, [id, reload])
  useEffect(() => { if (!user) { setFavorite(false); return } let active = true; getFavorites(user.id).then((ids) => { if (active) setFavorite(ids.includes(id)) }).catch((err) => { if (active) setActionError(err.message) }); return () => { active = false } }, [user, id])

  const save = async () => { if (!user) { navigate('/login', { state: { from: `/places/${id}` } }); return } const wasFavorite = favorite; setFavorite(!wasFavorite); setActionError(''); try { await toggleFavorite(user.id, id, wasFavorite) } catch (err) { setFavorite(wasFavorite); setActionError(err.message) } }
  const submit = async ({ rating, comment }) => { setSubmitting(true); try { await addReview({ userId: user.id, placeId: id, rating, comment, displayName: user.user_metadata?.display_name || user.email?.split('@')[0] }); setReload((value) => value + 1) } finally { setSubmitting(false) } }
  const existingReview = reviews.some((review) => review.user_id === user?.id)

  if (loading) return <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><div className="h-8 w-40 animate-pulse rounded bg-sage" /><div className="mt-8 h-[420px] animate-pulse rounded-[30px] bg-sage" /></main>
  if (error) return <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><ErrorState message={`Could not load this place: ${error}`} onRetry={() => setReload((value) => value + 1)} /></main>
  if (!place) return <main className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8"><h1 className="font-display text-3xl font-bold text-ink">Spot not found</h1><Link to="/" className="button-primary mt-6 inline-block">Explore places</Link></main>
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.latitude && place.longitude ? `${place.latitude},${place.longitude}` : place.address)}`

  return <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12"><Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-orange"><ArrowLeft size={17} /> Back to discover</Link>
    <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:gap-12"><div><div className="relative aspect-[1.4] overflow-hidden rounded-[30px] bg-sage sm:aspect-[1.7]"><PlaceImage place={place} className="h-full w-full object-cover" /><span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold capitalize text-ink shadow-sm">{place.category}</span></div><div className="mt-8 flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{place.name}</h1><div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted"><span className="font-semibold text-ink">{place.cuisine || place.category}</span><span>·</span><span>{place.price_level ? '$'.repeat(place.price_level) : 'Price not listed'}</span><span>·</span><span className="flex items-center gap-1"><MapPin size={15} /> {place.neighborhood}</span></div></div><span className="flex items-center gap-2 rounded-full bg-[#fff5e8] px-4 py-2 text-base font-bold text-[#aa6321]"><Star size={17} fill="currentColor" /> {place.average_rating ? Number(place.average_rating).toFixed(1) : 'New'} <span className="text-xs font-medium text-muted">({place.review_count || 0})</span></span></div><p className="mt-7 text-base leading-8 text-muted">{place.description}</p><div className="mt-6 flex flex-wrap gap-2">{place.tags?.map((tag) => <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-2 text-xs font-bold capitalize text-forest"><Tag size={12} /> {tag}</span>)}</div><div className="mt-10 border-t border-line pt-8"><div className="mb-6 flex items-center justify-between"><h2 className="font-display text-2xl font-extrabold text-ink">Student reviews</h2><span className="text-sm text-muted">{reviews.length} shared</span></div><ReviewList reviews={reviews} loading={reviewsLoading} error={reviewError} /></div></div>
      <aside className="space-y-6"><div className="rounded-[26px] border border-line bg-white p-6 shadow-card sm:p-7"><h2 className="font-display text-xl font-extrabold text-ink">Plan your visit</h2><div className="mt-6 space-y-5"><div className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-orange" size={20} /><div><div className="text-sm font-bold text-ink">Address</div><p className="mt-1 text-sm leading-relaxed text-muted">{place.address}</p></div></div><div className="flex gap-3"><Clock3 className="mt-0.5 shrink-0 text-orange" size={20} /><div><div className="text-sm font-bold text-ink">Hours</div><p className="mt-1 text-sm leading-relaxed text-muted">{place.hours || 'Hours not listed — check before visiting'}</p></div></div></div><a href={directions} target="_blank" rel="noopener noreferrer" className="button-primary mt-7 flex w-full items-center justify-center gap-2">Get directions <ExternalLink size={16} /></a><button onClick={save} className="button-outline mt-3 flex w-full items-center justify-center gap-2"><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Saved to favorites' : 'Save this spot'}</button>{place.source_url && <a href={place.source_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-muted underline hover:text-orange">View listing on OpenStreetMap <ExternalLink size={12} /></a>}{actionError && <p role="alert" className="mt-3 text-sm text-red-700">{actionError}</p>}</div>
      {user ? <ReviewForm onSubmit={submit} submitting={submitting} existingReview={existingReview} /> : <div className="rounded-[22px] bg-sage p-6"><h3 className="font-display text-lg font-extrabold text-forest">Have a favorite thing here?</h3><p className="mt-2 text-sm leading-relaxed text-forest/80">Log in to leave a review and help other students find their next spot.</p><Link to="/login" state={{ from: `/places/${id}` }} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-forest underline underline-offset-4">Log in to review →</Link></div>}</aside></div>
  </main>
}

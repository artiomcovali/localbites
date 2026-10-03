import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PlaceCard from '../components/PlaceCard'
import { EmptyState, ErrorState, LoadingCards } from '../components/StateViews'
import { useAuth } from '../context/AuthContext'
import { getFavorites, getPlaces, toggleFavorite } from '../lib/api'

export default function Favorites() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [places, setPlaces] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => { if (!authLoading && !user) navigate('/login', { replace: true, state: { from: '/favorites' } }) }, [authLoading, user, navigate])
  useEffect(() => { if (!user) return; let active = true; setLoading(true); setError(''); Promise.all([getPlaces(), getFavorites(user.id)]).then(([allPlaces, ids]) => { if (active) { setPlaces(allPlaces); setFavoriteIds(ids) } }).catch((err) => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [user, reload])
  const remove = async (place) => { setFavoriteIds((ids) => ids.filter((id) => id !== place.id)); try { await toggleFavorite(user.id, place.id, true) } catch (err) { setFavoriteIds((ids) => [...ids, place.id]); setError(err.message) } }
  const saved = places.filter((place) => favoriteIds.includes(place.id))

  return <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 sm:py-16"><div className="mb-9 flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e8] text-orange"><Heart size={23} /></span><div><div className="mb-1 text-xs font-extrabold uppercase tracking-[.2em] text-orange">Your collection</div><h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Saved spots<span className="text-orange">.</span></h1><p className="mt-2 text-sm text-muted">All the places you want to come back to.</p></div></div>
    {loading || authLoading ? <LoadingCards /> : error ? <ErrorState message={`Could not load favorites: ${error}`} onRetry={() => setReload((value) => value + 1)} /> : saved.length ? <><p className="mb-5 text-sm font-semibold text-ink">{saved.length} saved {saved.length === 1 ? 'place' : 'places'}</p><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{saved.map((place) => <PlaceCard key={place.id} place={place} isFavorite onFavorite={remove} />)}</div></> : <EmptyState title="Your list starts here" message="Save a café, lunch spot, or study corner you love and it will show up here." action={<Link to="/" className="button-primary">Discover places</Link>} />}
  </main>
}

import { ArrowRight, Coffee, MapPin, Search, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import PlaceCard from '../components/PlaceCard'
import { EmptyState, ErrorState, LoadingCards } from '../components/StateViews'
import { useAuth } from '../context/AuthContext'
import { getFavorites, getPlaces, toggleFavorite } from '../lib/api'

export default function Discover() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [places, setPlaces] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favoriteError, setFavoriteError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState(null)
  const [tag, setTag] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => { let active = true; setLoading(true); setError(''); getPlaces().then((data) => { if (active) setPlaces(data) }).catch((err) => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [reload])
  useEffect(() => { if (!user) { setFavorites([]); return } let active = true; getFavorites(user.id).then((data) => { if (active) setFavorites(data) }).catch((err) => { if (active) setFavoriteError(err.message) }); return () => { active = false } }, [user])

  const filtered = useMemo(() => places.filter((place) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [place.name, place.description, place.cuisine, place.neighborhood, ...(place.tags || [])].some((value) => value?.toLowerCase().includes(query))
    return matchesSearch && (!category || place.category === category) && (!price || place.price_level === price) && (!tag || place.tags?.includes(tag))
  }), [places, search, category, price, tag])

  const favorite = async (place) => {
    if (!user) { navigate('/login', { state: { from: `/places/${place.id}` } }); return }
    const wasFavorite = favorites.includes(place.id)
    setFavoriteError('')
    setFavorites((current) => wasFavorite ? current.filter((id) => id !== place.id) : [...current, place.id])
    try { await toggleFavorite(user.id, place.id, wasFavorite) } catch (err) { setFavorites((current) => wasFavorite ? [...current, place.id] : current.filter((id) => id !== place.id)); setFavoriteError(err.message) }
  }
  const clear = () => { setSearch(''); setCategory(''); setPrice(null); setTag('') }

  return <>
    <section className="relative overflow-hidden bg-[#f5f0e7]"><div className="hero-dot hero-dot-one" /><div className="hero-dot hero-dot-two" /><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.08fr_.92fr] md:py-20 lg:gap-20 lg:py-24">
      <div className="relative z-10"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efcfb9] bg-[#fff6ec] px-4 py-2 text-xs font-bold tracking-wide text-orangeDark"><Sparkles size={14} /> YOUR CAMPUS FOOD GUIDE</div><h1 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.14] tracking-[-.045em] text-ink sm:text-5xl lg:text-[62px]">Good spots.<br /><span className="text-orange">Great finds.</span><br />Right around campus.</h1><p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">From quick bites to your next favorite study corner, discover real local places around campus.</p><div className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-white p-2 shadow-card"><Search className="ml-3 shrink-0 text-orange" size={21} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try “late night”, “coffee”, or “Thai”" aria-label="Search places" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-[#98a096]" />{search && <button onClick={() => setSearch('')} aria-label="Clear search" className="text-muted"><X size={17} /></button>}<a href="#explore" className="hidden rounded-xl bg-orange px-5 py-3 text-sm font-bold text-white hover:bg-orangeDark sm:block">Explore</a></div><div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted"><span className="flex items-center gap-1.5"><MapPin size={16} className="text-orange" /> Near Cal Poly SLO</span><span className="flex items-center gap-1.5"><Coffee size={16} className="text-orange" /> Made for student life</span></div></div>
      <div className="relative mx-auto w-full max-w-[510px]"><div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-[#f8d9bf] blur-2xl" /><div className="relative aspect-[1.05] overflow-hidden rounded-[34px] shadow-[0_28px_80px_rgba(53,49,38,.18)]"><img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1300&q=85" alt="Warm café table with food and coffee" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-ink/35 to-transparent" /></div><div className="absolute -bottom-6 -left-5 rounded-2xl bg-white px-5 py-4 shadow-xl sm:-left-8"><div className="text-xs font-bold uppercase tracking-wider text-orange">The local shortlist</div><div className="mt-1 font-display text-lg font-extrabold text-ink">Eat well. Spend less. ✨</div></div></div>
    </div></section>

    <main id="explore" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 sm:py-16"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 text-xs font-extrabold uppercase tracking-[.2em] text-orange">Explore nearby</div><h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Find your kind of place<span className="text-orange">.</span></h2><p className="mt-2 text-sm text-muted">A little something for every craving and every study session.</p></div><Link to="/favorites" className="group flex items-center gap-2 text-sm font-bold text-forest hover:text-orange">Your saved spots <ArrowRight size={17} className="transition group-hover:translate-x-1" /></Link></div>
      <FilterBar category={category} setCategory={setCategory} price={price} setPrice={setPrice} tag={tag} setTag={setTag} hasFilters={!!(category || price || tag)} hasPriceData={places.some((place) => place.price_level != null)} availableTags={[...new Set(places.flatMap((place) => place.tags || []))]} onClear={clear} />
      <div className="mb-6 mt-8 flex items-center justify-between text-sm"><span className="font-semibold text-ink">{loading ? 'Finding places…' : `${filtered.length} ${filtered.length === 1 ? 'spot' : 'spots'} to explore`}</span><span className="text-muted">Curated for curious students</span></div>
      {favoriteError && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">Could not update favorites: {favoriteError}</div>}
      {loading ? <LoadingCards /> : error ? <ErrorState message={`Could not load places: ${error}`} onRetry={() => setReload((value) => value + 1)} /> : filtered.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((place) => <PlaceCard key={place.id} place={place} isFavorite={favorites.includes(place.id)} onFavorite={favorite} />)}</div> : <EmptyState title="No spots found" message="Try a different search or clear a few filters to see more places." action={<button onClick={clear} className="button-primary">Clear all filters</button>} />}
    </main>
  </>
}

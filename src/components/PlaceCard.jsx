import { ArrowUpRight, Heart, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import PlaceImage from './PlaceImage'

const categoryLabel = { restaurant: 'Restaurant', 'coffee shop': 'Coffee shop', 'study spot': 'Study spot' }

export default function PlaceCard({ place, isFavorite = false, onFavorite }) {
  return <article className="group overflow-hidden rounded-[26px] border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="relative h-52 overflow-hidden bg-sage sm:h-56">
      <Link to={`/places/${place.id}`} aria-label={`View ${place.name}`} className="block h-full"><PlaceImage place={place} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></Link>
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink shadow-sm">{categoryLabel[place.category] || place.category}</span>
      {onFavorite && <button onClick={() => onFavorite(place)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm hover:text-orange" aria-label={isFavorite ? `Remove ${place.name} from favorites` : `Save ${place.name}`}><Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'text-orange' : ''} /></button>}
    </div>
    <div className="p-5">
      <div className="mb-2 flex items-start justify-between gap-3"><Link to={`/places/${place.id}`} className="font-display text-xl font-extrabold leading-tight text-ink hover:text-orange">{place.name}</Link><span className="flex shrink-0 items-center gap-1 rounded-full bg-[#fff5e8] px-2.5 py-1 text-sm font-bold text-[#aa6321]"><Star size={14} fill="currentColor" />{place.average_rating ? Number(place.average_rating).toFixed(1) : 'New'}</span></div>
      <p className="mb-3 text-sm font-semibold text-muted">{place.cuisine || place.category} <span className="mx-1 text-[#b9b9ae]">·</span> {place.price_level ? '$'.repeat(place.price_level) : 'Price not listed'}</p>
      <p className="min-h-[44px] line-clamp-2 text-sm leading-relaxed text-muted">{place.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">{place.tags?.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-sage px-2.5 py-1 text-[11px] font-semibold text-forest">{tag}</span>)}</div>
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm text-muted"><span className="flex items-center gap-1.5"><MapPin size={15} /> {place.neighborhood}</span><Link to={`/places/${place.id}`} aria-label={`View ${place.name} details`} className="text-orange transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><ArrowUpRight size={20} /></Link></div>
    </div>
  </article>
}

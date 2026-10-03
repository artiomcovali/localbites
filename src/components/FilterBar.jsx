import { SlidersHorizontal, X } from 'lucide-react'

const categories = ['All spots', 'Restaurant', 'Coffee shop', 'Study spot']
const tags = ['late night', 'good for studying', 'cheap', 'outdoor seating']

export default function FilterBar({ category, setCategory, price, setPrice, tag, setTag, onClear, hasFilters, hasPriceData, availableTags = [] }) {
  return <div className="rounded-[24px] border border-line bg-white p-4 shadow-card sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm font-bold text-ink"><SlidersHorizontal size={17} className="text-orange" /> Filter by</div>
      {hasFilters && <button onClick={onClear} className="flex items-center gap-1 text-xs font-bold text-orange hover:text-orangeDark"><X size={14} /> Clear filters</button>}
    </div>
    <div className="mt-4 flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item === 'All spots' ? '' : item.toLowerCase())} className={`filter-pill ${category === (item === 'All spots' ? '' : item.toLowerCase()) ? 'filter-pill-active' : ''}`}>{item}</button>)}</div>
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4"><span className="mr-1 text-xs font-bold uppercase tracking-widest text-muted">Budget</span>{['$', '$$', '$$$'].map((item, index) => <button key={item} disabled={!hasPriceData} title={!hasPriceData ? 'Price data is not available for these listings yet' : undefined} onClick={() => setPrice(price === index + 1 ? null : index + 1)} className={`filter-pill min-w-11 disabled:cursor-not-allowed disabled:opacity-40 ${price === index + 1 ? 'filter-pill-active' : ''}`}>{item}</button>)}{!hasPriceData && <span className="text-xs text-muted">Prices not listed yet</span>}<span className="mx-2 hidden h-5 w-px bg-line sm:block" /><span className="mr-1 text-xs font-bold uppercase tracking-widest text-muted">Vibe</span>{tags.map((item) => <button key={item} disabled={!availableTags.includes(item)} title={!availableTags.includes(item) ? 'No verified listings have this tag yet' : undefined} onClick={() => setTag(tag === item ? '' : item)} className={`filter-pill capitalize disabled:cursor-not-allowed disabled:opacity-40 ${tag === item ? 'filter-pill-active' : ''}`}>{item}</button>)}</div>
  </div>
}

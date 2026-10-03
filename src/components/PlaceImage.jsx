const examples = {
  restaurant: 'photo-1517248135467-4c7edcad34c4',
  'coffee shop': 'photo-1442512595331-e89e73853f31',
  'study spot': 'photo-1507842217343-583bb7270b66',
}

export default function PlaceImage({ place, className = '' }) {
  const illustrative = !place.image_url
  const src = place.image_url || `https://images.unsplash.com/${examples[place.category] || examples.restaurant}?auto=format&fit=crop&w=1200&q=85`
  return <>
    <img src={src} alt={illustrative ? `Illustrative ${place.category} photo` : place.name} className={className} loading="lazy" />
    {illustrative && <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white">Illustrative photo</span>}
  </>
}

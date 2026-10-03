import { Star } from 'lucide-react'
import { useState } from 'react'

export function ReviewList({ reviews, loading, error }) {
  if (loading) return <div className="py-8 text-sm text-muted">Loading reviews…</div>
  if (error) return <div className="py-8 text-sm text-red-700">Could not load reviews. {error}</div>
  if (!reviews.length) return <div className="rounded-2xl bg-cream p-6 text-sm text-muted">No reviews yet. Be the first to share your thoughts!</div>
  return <div className="divide-y divide-line">{reviews.map((review) => <article key={review.id} className="py-5 first:pt-0">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-sm font-bold text-forest">{(review.display_name || 'L').charAt(0).toUpperCase()}</span><span className="font-bold text-ink">{review.display_name || 'LocalBites member'}</span></div><span className="text-xs text-muted">{new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
    <div className="mb-2 flex gap-0.5 text-[#e6a441]" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />)}</div>
    <p className="text-sm leading-relaxed text-muted">{review.comment}</p>
  </article>)}</div>
}

export function ReviewForm({ onSubmit, submitting, existingReview }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault(); setError('')
    try { await onSubmit({ rating, comment: comment.trim() }); setComment(''); setRating(5) } catch (err) { setError(err.message) }
  }
  if (existingReview) return <div className="rounded-2xl bg-sage p-5 text-sm font-medium text-forest">You’ve already reviewed this spot. Thanks for sharing your experience!</div>
  return <form onSubmit={submit} className="rounded-[22px] bg-cream p-5 sm:p-6">
    <h3 className="font-display text-lg font-extrabold text-ink">Share your experience</h3>
    <p className="mb-4 mt-1 text-sm text-muted">How was your visit?</p>
    <div className="mb-4 flex gap-1" role="group" aria-label="Rating">{Array.from({ length: 5 }, (_, i) => <button type="button" key={i} onClick={() => setRating(i + 1)} aria-label={`Rate ${i + 1} stars`} className="p-1 text-[#e6a441] hover:scale-110"><Star size={26} fill={i < rating ? 'currentColor' : 'none'} /></button>)}</div>
    <label htmlFor="review-comment" className="mb-2 block text-sm font-bold text-ink">Your review</label>
    <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} required minLength={10} maxLength={500} rows={4} placeholder="Tell other students what made this spot worth visiting..." className="input resize-none" />
    <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-muted">{comment.length}/500 characters</span><button disabled={submitting} className="button-primary disabled:opacity-60">{submitting ? 'Posting…' : 'Post review'}</button></div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </form>
}

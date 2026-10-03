import { SearchX } from 'lucide-react'

export function LoadingCards() { return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="animate-pulse overflow-hidden rounded-[26px] border border-line bg-white"><div className="h-56 bg-sage" /><div className="space-y-3 p-5"><div className="h-5 w-2/3 rounded bg-sage" /><div className="h-4 w-1/2 rounded bg-sage" /><div className="h-12 rounded bg-sage" /></div></div>)}</div> }

export function EmptyState({ title, message, action }) { return <div className="flex flex-col items-center rounded-[26px] border border-dashed border-line bg-white px-5 py-16 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-forest"><SearchX size={26} /></span><h3 className="font-display text-xl font-bold text-ink">{title}</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{message}</p>{action && <div className="mt-5">{action}</div>}</div> }

export function ErrorState({ message, onRetry }) { return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{message} {onRetry && <button onClick={onRetry} className="ml-2 font-bold underline">Try again</button>}</div> }

import { ArrowLeft, ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth({ mode }) {
  const { user, signIn, signUp, isDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const destination = location.state?.from || '/'
  if (user) return <Navigate to={destination} replace />
  const submit = async (event) => { event.preventDefault(); setError(''); setMessage(''); setSubmitting(true); try { if (mode === 'signup') { const result = await signUp(email, password, name.trim()); if (!isDemo && !result.session) { setMessage('Check your email for a confirmation link, then come back to log in.'); return } } else await signIn(email, password); navigate(destination, { replace: true }) } catch (err) { setError(err.message) } finally { setSubmitting(false) } }

  return <main className="flex min-h-[calc(100vh-180px)] items-center justify-center bg-[#f7f2ea] px-5 py-12"><div className="w-full max-w-[460px] rounded-[30px] border border-line bg-white p-7 shadow-card sm:p-10"><Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-orange"><ArrowLeft size={16} /> Back to discover</Link><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0e8] text-orange"><span className="text-2xl">✳</span></div><h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">{mode === 'signup' ? 'Join the good finds.' : 'Welcome back.'}</h1><p className="mt-2 text-sm leading-relaxed text-muted">{mode === 'signup' ? 'Save your favorites and share the places you love.' : 'Your next favorite spot is waiting.'}</p>{isDemo && <div className="mt-6 rounded-xl bg-sage p-3 text-xs leading-relaxed text-forest"><strong>Preview mode:</strong> use any email and password to try the app. Data is saved in this browser.</div>}
    <form onSubmit={submit} className="mt-7 space-y-4">{mode === 'signup' && <label className="block"><span className="mb-2 block text-sm font-bold text-ink">Display name</span><span className="input-wrap"><UserRound size={18} /><input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={50} placeholder="Your name" className="w-full bg-transparent outline-none" /></span></label>}<label className="block"><span className="mb-2 block text-sm font-bold text-ink">Email address</span><span className="input-wrap"><Mail size={18} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@university.edu" className="w-full bg-transparent outline-none" /></span></label><label className="block"><span className="mb-2 block text-sm font-bold text-ink">Password</span><span className="input-wrap"><LockKeyhole size={18} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="At least 6 characters" className="w-full bg-transparent outline-none" /></span></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-xl bg-sage p-3 text-sm text-forest">{message}</p>}<button disabled={submitting} className="button-primary flex w-full items-center justify-center gap-2 py-3.5 disabled:opacity-60">{submitting ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Log in'} <ArrowRight size={17} /></button></form><p className="mt-6 text-center text-sm text-muted">{mode === 'signup' ? 'Already have an account?' : 'New to LocalBites?'} <Link to={mode === 'signup' ? '/login' : '/signup'} state={location.state} className="font-bold text-orange hover:text-orangeDark">{mode === 'signup' ? 'Log in' : 'Sign up'}</Link></p></div></main>
}

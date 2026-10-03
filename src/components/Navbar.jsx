import { useState } from 'react'
import { Heart, LogOut, Menu, Search, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const logout = async () => { await signOut(); setOpen(false); navigate('/') }
  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'text-orange' : 'text-ink hover:text-orange'}`

  return <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur-lg">
    <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
      <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)} aria-label="LocalBites home">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange text-xl text-white shadow-sm">✳</span>
        <span className="font-display text-[22px] font-extrabold tracking-tight text-ink">local<span className="text-orange">bites</span><span className="text-orange">.</span></span>
      </Link>
      <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
        <NavLink to="/" end className={linkClass}>Discover</NavLink>
        <NavLink to="/favorites" className={linkClass}>Favorites</NavLink>
      </nav>
      <div className="hidden items-center gap-3 md:flex">
        {user ? <><span className="rounded-full bg-sage px-4 py-2 text-sm font-semibold text-forest">Hi, {user.user_metadata?.display_name || user.email?.split('@')[0]}!</span><button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-bold text-ink hover:border-orange hover:text-orange"><LogOut size={16} /> Log out</button></> : <><Link to="/login" className="px-3 py-2 text-sm font-bold text-ink hover:text-orange">Log in</Link><Link to="/signup" className="button-primary text-sm">Sign up</Link></>}
      </div>
      <button className="rounded-xl p-2 text-ink md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav className="border-t border-line bg-cream px-5 pb-5 pt-3 md:hidden" aria-label="Mobile navigation">
      <NavLink to="/" end className="mobile-link" onClick={() => setOpen(false)}><Search size={18} /> Discover</NavLink>
      <NavLink to="/favorites" className="mobile-link" onClick={() => setOpen(false)}><Heart size={18} /> Favorites</NavLink>
      {user ? <button className="mobile-link w-full" onClick={logout}><LogOut size={18} /> Log out</button> : <div className="mt-3 flex gap-3"><Link to="/login" onClick={() => setOpen(false)} className="button-outline flex-1 text-center">Log in</Link><Link to="/signup" onClick={() => setOpen(false)} className="button-primary flex-1 text-center">Sign up</Link></div>}
    </nav>}
  </header>
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import Auth from './pages/Auth'
import Discover from './pages/Discover'
import Favorites from './pages/Favorites'
import PlaceDetails from './pages/PlaceDetails'
import './styles.css'

function App() { return <BrowserRouter><AuthProvider><div className="min-h-screen bg-cream"><Navbar /><Routes><Route path="/" element={<Discover />} /><Route path="/places/:id" element={<PlaceDetails />} /><Route path="/favorites" element={<Favorites />} /><Route path="/login" element={<Auth mode="login" />} /><Route path="/signup" element={<Auth mode="signup" />} /><Route path="*" element={<main className="mx-auto max-w-7xl px-5 py-24 text-center"><h1 className="font-display text-3xl font-bold text-ink">We couldn’t find that page.</h1><a href="/" className="button-primary mt-6 inline-block">Back to discover</a></main>} /></Routes><footer className="border-t border-line bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-7 text-xs text-muted sm:px-8"><span className="font-display text-sm font-extrabold text-ink">local<span className="text-orange">bites.</span></span><span>Good spots, good company, good campus days.</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-orange">Place data © OpenStreetMap contributors</a></div></footer></div></AuthProvider></BrowserRouter> }

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)

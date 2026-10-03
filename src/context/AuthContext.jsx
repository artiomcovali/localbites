import { createContext, useContext, useEffect, useState } from 'react'
import { isDemo, supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const demoUserKey = 'localbites-demo-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => isDemo ? JSON.parse(localStorage.getItem(demoUserKey) || 'null') : null)
  const [loading, setLoading] = useState(!isDemo)

  useEffect(() => {
    if (isDemo) return
    supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); setLoading(false) }).catch(() => setLoading(false))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (isDemo) {
      const next = { id: email.trim().toLowerCase(), email: email.trim().toLowerCase(), user_metadata: { display_name: email.split('@')[0] } }
      localStorage.setItem(demoUserKey, JSON.stringify(next)); setUser(next); return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }
  const signUp = async (email, password, displayName) => {
    if (isDemo) return signIn(email, password)
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    if (error) throw error
    return data
  }
  const signOut = async () => {
    if (isDemo) { localStorage.removeItem(demoUserKey); setUser(null); return }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isDemo }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

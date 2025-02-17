
import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(session => {
        if (session?.user) {
          setUser(session.user)
        }
        setLoading(false)
      })
  }, [])

  const signIn = () => {
    window.location.href = '/api/auth/signin/google'
  }

  const signOut = () => {
    window.location.href = '/api/auth/signout'
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

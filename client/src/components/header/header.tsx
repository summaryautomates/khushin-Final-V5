
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"
import { useEffect, useState } from "react"

export function Header() {
  const [user, setUser] = useState<{ name?: string; image?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-4">
          <Link href="/" className="flex items-center space-x-2 font-bold">
            <span>KHUSH-IN</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {!loading && (
              user ? (
                <UserMenu user={user} />
              ) : (
                <Button asChild variant="ghost">
                  <Link href="/login">Sign In</Link>
                </Button>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

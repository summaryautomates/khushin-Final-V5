
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { UserMenu } from "./user-menu"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, Heart, Search, Menu, X } from "lucide-react"

export function Header() {
  const [user, setUser] = useState<{ name?: string; image?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

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

  const menuItems = [
    { name: "Collections", path: "/collections" },
    { name: "New Arrivals", path: "/new-arrivals" },
    { name: "Bestsellers", path: "/bestsellers" },
    { name: "Customization", path: "/customize" },
  ]

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      isScrolled 
        ? "bg-black/95 backdrop-blur-md h-16 shadow-xl" 
        : "bg-gradient-to-b from-black/90 to-black/70 h-20"
    }`}>
      <div className="container mx-auto px-4 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-1 cursor-pointer group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center">
                <span className="font-serif text-2xl font-medium tracking-widest text-primary">KHUSHIN</span>
                <div className="h-px w-0 bg-primary group-hover:w-full transition-all duration-500" />
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <motion.a 
                  className="relative px-3 py-2 text-white/90 hover:text-primary transition-colors duration-300 text-sm tracking-wide group"
                  whileHover={{ y: -1 }}
                >
                  {item.name}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
                </motion.a>
              </Link>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-1">
            {/* Search */}
            <Button variant="ghost" size="icon" className="text-white/90 hover:text-primary hover:bg-transparent rounded-full">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            
            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="text-white/90 hover:text-primary hover:bg-transparent rounded-full">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>
            
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="text-white/90 hover:text-primary hover:bg-transparent rounded-full">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            
            {/* User Menu */}
            <div className="ml-2">
              {!loading && (
                user ? (
                  <UserMenu user={user} />
                ) : (
                  <LuxuryButton 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/login'}
                  >
                    Sign In
                  </LuxuryButton>
                )
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/90 hover:text-primary hover:bg-transparent rounded-full md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="absolute top-full left-0 right-0 bg-black/95 border-t border-white/10 py-4 px-6 md:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col space-y-4">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path} onClick={() => setMobileMenuOpen(false)}>
                <a className="text-white/90 hover:text-primary transition-colors duration-300 py-2">
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Bottom Border Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </header>
  )
}

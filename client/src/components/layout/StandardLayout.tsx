import React from 'react';
import { Link } from 'wouter';
import { CommonButton } from '../ui/CommonButton';
import { ShoppingCart, User, Menu, X } from 'lucide-react';

interface StandardLayoutProps {
  children: React.ReactNode;
}

export function StandardLayout({ children }: StandardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-black text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="text-2xl font-bold tracking-wider">KHUSHIN</a>
            </Link>
          </div>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/collections">
              <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">Collections</a>
            </Link>
            <Link href="/products">
              <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">Products</a>
            </Link>
            <Link href="/virtual-showroom">
              <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">Virtual Showroom</a>
            </Link>
            <Link href="/about">
              <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">About</a>
            </Link>
            <Link href="/contact">
              <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">Contact</a>
            </Link>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/account">
              <a className="p-2">
                <User className="h-5 w-5" />
              </a>
            </Link>
            <Link href="/cart">
              <a className="p-2 relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  0
                </span>
              </a>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black text-white border-t border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/collections">
                  <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">Collections</a>
                </Link>
                <Link href="/products">
                  <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">Products</a>
                </Link>
                <Link href="/virtual-showroom">
                  <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">Virtual Showroom</a>
                </Link>
                <Link href="/about">
                  <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">About</a>
                </Link>
                <Link href="/contact">
                  <a className="text-sm uppercase tracking-wider hover:text-primary transition-colors">Contact</a>
                </Link>
              </nav>
              <div className="mt-4 flex justify-center">
                <CommonButton variant="luxury" size="sm">
                  Explore Collections
                </CommonButton>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About KHUSHIN</h3>
              <p className="text-sm text-gray-300">
                Luxury home decor and lifestyle products crafted with the finest materials and design principles.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/faq"><a className="hover:text-primary transition-colors">FAQs</a></Link></li>
                <li><Link href="/shipping"><a className="hover:text-primary transition-colors">Shipping & Returns</a></Link></li>
                <li><Link href="/warranty"><a className="hover:text-primary transition-colors">Warranty</a></Link></li>
                <li><Link href="/contact"><a className="hover:text-primary transition-colors">Contact Us</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Policies</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/privacy"><a className="hover:text-primary transition-colors">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="hover:text-primary transition-colors">Terms of Service</a></Link></li>
                <li><Link href="/returns"><a className="hover:text-primary transition-colors">Return Policy</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4 mb-4">
                {/* Social icons would go here */}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Subscribe to our newsletter</h4>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="p-2 text-sm bg-gray-800 border border-gray-700 rounded-l focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <CommonButton 
                    className="rounded-l-none"
                    variant="luxury"
                    size="sm"
                  >
                    Subscribe
                  </CommonButton>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} KHUSHIN. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
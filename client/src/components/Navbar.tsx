import { Button } from "@/components/ui/button"
import { Link } from "wouter";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm py-4 px-6 flex justify-between items-center border-b border-primary/20">
      <Link href="/">
        <a className="font-bold text-xl hover:text-primary transition-colors">KHUSH.IN</a>
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/products">
          <a className="hover:text-primary transition-colors">Products</a>
        </Link>
        <Link href="/loyalty">
          <a className="hover:text-primary transition-colors">Loyalty</a>
        </Link>
        <Link href="/rewards">
          <a className="hover:text-primary transition-colors">Rewards</a>
        </Link>
        <Link href="/referral">
          <a className="hover:text-primary transition-colors">Referral</a>
        </Link>
        <Link href="/contact">
          <a className="hover:text-primary transition-colors">Contact</a>
        </Link>
        <Link href="/blog">
          <a className="hover:text-primary transition-colors">Blog</a>
        </Link>
      </div>
    </nav>
  )
}
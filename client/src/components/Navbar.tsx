import { Button } from "@/components/ui/button"
import { Link } from "wouter";

export function Navbar() {
  return (
    <nav className="py-4 px-6 flex justify-between items-center border-b">
      <div className="font-bold text-xl">KHUSH.IN</div>

      <div className="flex items-center gap-4">
        <Link href="/products">
          <a className="hover:text-primary">Products</a>
        </Link>
        <Link href="/loyalty">
          <a className="hover:text-primary">Loyalty</a>
        </Link>
        <Link href="/rewards">
          <a className="hover:text-primary">Rewards</a>
        </Link>
        <Link href="/contact">
          <a className="hover:text-primary">Contact</a>
        </Link>
        <Link href="/blog">
          <a className="hover:text-primary">Blog</a>
        </Link>
      </div>
    </nav>
  )
}
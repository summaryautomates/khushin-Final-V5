import { Button } from "@/components/ui/button"
import Link from 'next/link'; // Assuming Next.js Link component

export function Navbar() {
  return (
    <nav className="py-4 px-6 flex justify-between items-center border-b">
      <div className="font-bold text-xl">KHUSH.IN</div>

      <div className="flex items-center gap-4">
        <Link href="/products">Products</Link>
        <Link href="/loyalty">Loyalty</Link>
        <Link href="/rewards">Rewards</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/blog">Blog</Link>
      </div>
    </nav>
  )
}
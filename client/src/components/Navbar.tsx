import { Button } from "@/components/ui/button"
import { Link } from "wouter";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm py-4 px-6 flex justify-between items-center border-b border-primary/20">
      <Link href="/">
        <a className="font-bold text-xl hover:text-primary transition-colors">KHUSH.IN</a>
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/collections">
          <a className="hover:text-primary transition-colors">COLLECTIONS</a>
        </Link>
        <Link href="/luxury-lighters">
          <a className="hover:text-primary transition-colors">LUXURY LIGHTERS</a>
        </Link>
        <Link href="/refueling-solutions">
          <a className="hover:text-primary transition-colors">REFUELING SOLUTIONS</a>
        </Link>
        <Link href="/customize">
          <a className="hover:text-primary transition-colors">CUSTOMIZE</a>
        </Link>
        <Link href="/contact">
          <a className="hover:text-primary transition-colors">CONTACT</a>
        </Link>
        <div className="flex items-center gap-2 ml-4">
          <Link href="/orders">
            <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
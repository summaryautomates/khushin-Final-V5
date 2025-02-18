import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="py-4 px-6 flex justify-between items-center border-b">
      <div className="font-bold text-xl">KHUSH.IN</div>

      <div className="flex items-center gap-4">
        {/* Login button removed */}
      </div>
    </nav>
  )
}
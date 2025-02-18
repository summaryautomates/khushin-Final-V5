import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoginPanel } from "./LoginPanel"

export function Navbar() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <nav className="py-4 px-6 flex justify-between items-center border-b">
      <div className="font-bold text-xl">KHUSH.IN</div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost"
          onClick={() => setShowLogin(true)}
        >
          Login
        </Button>
      </div>

      <LoginPanel 
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </nav>
  )
}

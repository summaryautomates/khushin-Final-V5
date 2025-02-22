import { Clock, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Features() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Book Experience Box */}
      <div className="bg-card rounded-lg p-8 text-center flex flex-col items-center space-y-4">
        <Clock className="w-12 h-12 text-primary" />
        <h2 className="text-2xl font-bold">Book Experience</h2>
        <p className="text-muted-foreground">
          Schedule premium styling sessions with our expert consultants for a personalized luxury experience
        </p>
        <Button variant="outline" className="mt-4">
          Book Now
        </Button>
      </div>

      {/* Loyalty Program Box */}
      <div className="bg-card rounded-lg p-8 text-center flex flex-col items-center space-y-4">
        <Gift className="w-12 h-12 text-primary" />
        <h2 className="text-2xl font-bold">Loyalty Program</h2>
        <p className="text-muted-foreground">
          Join our exclusive rewards program and earn points on every purchase for special discounts
        </p>
        <Button variant="outline" className="mt-4">
          Join Program
        </Button>
      </div>
    </div>
  )
}

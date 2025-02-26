import { Link } from "wouter";
import { Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExperienceBoxes() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto text-center">
        <div className="flex flex-col items-center space-y-4">
          <Clock className="w-16 h-16 text-white" />
          <h2 className="text-2xl font-semibold text-white">Book Experience</h2>
          <p className="text-zinc-400 mb-4">
            Schedule premium styling sessions with our expert consultants for a personalized luxury experience
          </p>
          <Link href="/event-organizer">
            <Button className="rounded-md">Book Now</Button>
          </Link>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Gift className="w-16 h-16 text-white" />
          <h2 className="text-2xl font-semibold text-white">Loyalty Program</h2>
          <p className="text-zinc-400 mb-4">
            Join our exclusive rewards program and earn points on every purchase for special discounts
          </p>
          <Link href="/loyalty">
            <Button className="rounded-md">Join Program</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

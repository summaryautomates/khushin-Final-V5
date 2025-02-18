import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Users, Package, Clock } from "lucide-react";

export default function EventOrganizer() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [eventType, setEventType] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Event Scheduled",
      description: "Your experience has been booked successfully!",
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-extralight text-center mb-12 tracking-wider">
            Book Your Luxury Experience
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar Section */}
            <Card className="p-6 bg-white/[0.02] backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl font-light">Select Date</CardTitle>
                <CardDescription>Choose your preferred date</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Event Details Form */}
            <Card className="p-6 bg-white/[0.02] backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl font-light">Event Details</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="package">Experience Package</Label>
                    <Select onValueChange={setEventType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">Premium Collection Preview</SelectItem>
                        <SelectItem value="custom">Custom Engraving Experience</SelectItem>
                        <SelectItem value="tasting">Luxury Tasting Event</SelectItem>
                        <SelectItem value="private">Private Shopping Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Enter number of guests"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">10:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="afternoon">2:00 PM - 4:00 PM</SelectItem>
                        <SelectItem value="evening">6:00 PM - 8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Requests</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements or preferences?"
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Book Experience
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Package Information */}
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            {[
              {
                icon: Package,
                title: "Premium Collection",
                description: "Exclusive preview of our latest luxury items",
              },
              {
                icon: Users,
                title: "Private Sessions",
                description: "Personalized shopping experience",
              },
              {
                icon: Clock,
                title: "Flexible Timing",
                description: "Choose your preferred time slot",
              },
              {
                icon: CalendarIcon,
                title: "Easy Scheduling",
                description: "Simple booking process",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="bg-white/[0.02] backdrop-blur-sm border-primary/20"
              >
                <CardHeader>
                  <feature.icon className="w-8 h-8 text-primary" />
                  <CardTitle className="text-xl font-light">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

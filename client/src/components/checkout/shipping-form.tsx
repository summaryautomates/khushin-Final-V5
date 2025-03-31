import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string()
    .min(5, "Complete address is required")
    .max(200, "Address is too long"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string()
    .min(1, "PIN code is required")
    .max(6, "PIN code must be 6 digits")
    .regex(/^\d*$/, "PIN code must contain only numbers"),
  phone: z.string()
    .min(1, "Phone number is required")
    .max(10, "Phone number must be 10 digits")
    .regex(/^\d*$/, "Phone number must contain only numbers"),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
  isLoading?: boolean;
}

export function ShippingForm({ onSubmit, isLoading }: ShippingFormProps) {
  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
    },
  });

  const handleSubmit = async (data: ShippingFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Contact Section */}
        <div>
          <h2 className="text-base font-medium mb-4 text-zinc-100">Contact</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-200">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      className="h-11 px-4 py-2 bg-white/[0.05] border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-200">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Email address" 
                      className="h-11 px-4 py-2 bg-white/[0.05] border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Delivery Section */}
        <div>
          <h2 className="text-base font-medium mb-4 text-zinc-100">Delivery</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-200">Street Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Complete street address (min. 5 characters)" 
                      className="h-11 px-4 py-2 bg-white/[0.05] border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-200">Apartment (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Apartment, suite, etc." 
                      className="h-11 px-4 py-2 bg-white/[0.05] border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-200">City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="City" 
                        className="h-11 px-4 py-2 bg-white/[0.05] border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-200">State</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="State" 
                        className="h-11 px-4 py-2 bg-white/[0.05] border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-200">PIN Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="6-digit PIN code" 
                        className="h-11 px-4 py-2 bg-white/[0.05] border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                        maxLength={6}
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-200">Phone</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="10-digit mobile number" 
                        className="h-11 px-4 py-2 bg-white/[0.05] border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                        maxLength={10}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-medium" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </Form>
  );
}
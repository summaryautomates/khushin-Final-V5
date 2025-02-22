import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const shippingSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  address: z.string()
    .min(5, "Complete address is required")
    .max(200, "Address is too long"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit pincode"),
  phone: z.string()
    .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number")
    .transform((val) => val.replace(/\D/g, "")),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
  isLoading?: boolean;
}

export function ShippingForm({ onSubmit, isLoading }: ShippingFormProps) {
  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    mode: "onChange",
    defaultValues: {
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
          <h2 className="text-sm font-medium mb-3 text-zinc-200">Contact</h2>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    className="h-10 px-3 py-2 bg-white/[0.05] border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>

        {/* Delivery Section */}
        <div>
          <h2 className="text-sm font-medium mb-3 text-zinc-200">Delivery</h2>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Address" 
                      className="h-10 px-3 py-2 bg-white/[0.05] border-0 focus-visible:ring-1 focus-visible:ring-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apartment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Apartment, suite, etc. (optional)" 
                      className="h-10 px-3 py-2 bg-white/[0.05] border-0 focus-visible:ring-1 focus-visible:ring-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="City" 
                        className="h-10 px-3 py-2 bg-white/[0.05] border-0 focus-visible:ring-1 focus-visible:ring-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="State" 
                        className="h-10 px-3 py-2 bg-white/[0.05] border-0 focus-visible:ring-1 focus-visible:ring-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="PIN code" 
                        className="h-10 px-3 py-2 bg-white/[0.05] border-0 focus-visible:ring-1 focus-visible:ring-primary"
                        maxLength={6}
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="Phone" 
                        className="h-10 px-3 py-2 bg-white/[0.05] border-0 focus-visible:ring-1 focus-visible:ring-primary"
                        maxLength={10}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 bg-primary hover:bg-primary/90" 
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
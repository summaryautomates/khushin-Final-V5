import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/products";
import { Loader2, CheckCircle, XCircle, RotateCw, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type OrderStatus = 'pending' | 'completed' | 'failed';

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  name: string;
}

interface Order {
  orderRef: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
  shipping: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
}

interface ReturnRequest {
  id: number;
  orderRef: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  items: Array<{
    productId: number;
    quantity: number;
    reason: string;
  }>;
  additionalNotes?: string;
  createdAt: string;
}

const returnRequestSchema = z.object({
  reason: z.string().min(10, "Please provide a detailed reason for the return"),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    reason: z.string().min(1, "Please provide a reason for returning this item")
  })).min(1, "Please select at least one item to return"),
  additionalNotes: z.string().optional()
});

type ReturnRequestFormData = z.infer<typeof returnRequestSchema>;

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const statusConfig = {
    pending: { icon: Loader2, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", text: "Processing" },
    completed: { icon: CheckCircle, className: "bg-green-500/10 text-green-500 border-green-500/20", text: "Completed" },
    failed: { icon: XCircle, className: "bg-red-500/10 text-red-500 border-red-500/20", text: "Failed" }
  };

  const { icon: Icon, className, text } = statusConfig[status];

  return (
    <Badge variant="outline" className={`${className} px-3 py-1 gap-2`}>
      <Icon className="h-4 w-4" />
      <span className="font-light">{text}</span>
    </Badge>
  );
}

function ReturnRequestDialog({ order }: { order: Order }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ReturnRequestFormData>({
    resolver: zodResolver(returnRequestSchema),
    defaultValues: {
      reason: "",
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: 0,
        reason: ""
      })),
      additionalNotes: ""
    }
  });

  const returnMutation = useMutation({
    mutationFn: async (data: ReturnRequestFormData) => {
      const validItems = data.items.filter(item => item.quantity > 0);
      if (validItems.length === 0) {
        throw new Error("Please select at least one item to return");
      }

      const response = await apiRequest('POST', '/api/returns', {
        ...data,
        items: validItems,
        orderRef: order.orderRef
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.message || 'Failed to submit return request');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/returns/${order.orderRef}`] });
      toast({
        title: "Success",
        description: "Return request submitted successfully",
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ReturnRequestFormData) => {
    returnMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <RotateCw className="mr-2 h-4 w-4" />
          Request Return
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Return for Order #{order.orderRef}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why you want to return these items..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="font-medium">Select Items to Return</h4>
              {order.items.map((item, index) => (
                <div key={item.productId} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Original Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity to Return</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            className="w-20 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.reason`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item-specific Reason</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Why are you returning this specific item?"
                            className="h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information you'd like to provide..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 space-x-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={returnMutation.isPending}
              >
                {returnMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Return Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ReturnRequests({ orderRef }: { orderRef: string }) {
  const { data: returns } = useQuery<ReturnRequest[]>({
    queryKey: [`/api/returns/${orderRef}`],
  });

  if (!returns?.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-semibold text-sm">Return Requests</h4>
      {returns.map((returnRequest) => (
        <div
          key={returnRequest.id}
          className="text-sm p-2 border rounded-lg bg-muted/50"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Status: {returnRequest.status}</p>
              <p className="text-muted-foreground">{returnRequest.reason}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(returnRequest.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  if (isLoading) {
    return (
      <div className="container py-20 min-h-screen bg-black/[0.96] backdrop-blur-sm">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container py-20 min-h-screen bg-black/[0.96] backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-lg mx-auto border-none bg-white/[0.02] backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-light tracking-wide text-center">No Orders Found</CardTitle>
              <p className="text-muted-foreground font-light text-center">
                You haven't placed any orders yet.
              </p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button variant="outline" className="border-white/20">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-20 min-h-screen bg-black/[0.96] backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-light tracking-tight mb-8 text-white/90">Order History</h1>
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.orderRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-none bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-light tracking-wide text-white/90">
                      #{order.orderRef}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-light">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary mb-3">
                          <Package className="h-5 w-5" />
                          <h3 className="font-light text-lg">Order Summary</h3>
                        </div>
                        <div className="space-y-2 divide-y divide-white/10">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between py-2 text-sm font-light">
                              <div className="flex items-start gap-2">
                                <span className="text-white/60">{item.quantity}x</span>
                                <span className="text-white/90">{item.name}</span>
                              </div>
                              <span className="text-white/90 tabular-nums">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                          <div className="pt-4">
                            <div className="flex justify-between font-light text-lg">
                              <span>Total</span>
                              <span className="text-primary tabular-nums">
                                {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary mb-3">
                          <MapPin className="h-5 w-5" />
                          <h3 className="font-light text-lg">Delivery Address</h3>
                        </div>
                        <div className="space-y-2 text-sm font-light text-white/80 bg-white/[0.02] p-4 rounded-lg border border-white/10">
                          <p className="text-white/90 font-normal">{order.shipping.fullName}</p>
                          <p>{order.shipping.address}</p>
                          <p>
                            {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
                          </p>
                          <p className="text-primary">{order.shipping.phone}</p>
                        </div>
                        {order.status === 'completed' && (
                          <ReturnRequestDialog order={order} />
                        )}
                      </div>
                    </div>
                    <ReturnRequests orderRef={order.orderRef} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
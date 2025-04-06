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
import { Image } from "@/components/ui/image";
import { Link } from "wouter";

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

      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          items: validItems,
          orderRef: order.orderRef
        })
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
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 border-white/20">
          <RotateCw className="h-4 w-4" />
          <span>Request Return</span>
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
    <div className="space-y-2">
      <h4 className="font-medium text-xs uppercase tracking-wide text-primary">Return Requests</h4>
      {returns.map((returnRequest) => (
        <div
          key={returnRequest.id}
          className="text-sm p-3 rounded-lg bg-white/[0.02] border border-white/10"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Badge variant={
                  returnRequest.status === 'approved' ? 'default' : 
                  returnRequest.status === 'rejected' ? 'destructive' : 'secondary'
                } className="text-xs px-2 py-0">
                  {returnRequest.status}
                </Badge>
              </p>
              <p className="text-white/70 mt-1 text-xs line-clamp-1">{returnRequest.reason}</p>
            </div>
            <span className="text-xs text-white/60">
              {new Date(returnRequest.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    retry: 3,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="container py-20 min-h-screen bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-sm">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-white/70 animate-pulse">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-20 min-h-screen bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-lg mx-auto border-none bg-white/[0.02] backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500/80" />
              </div>
              <CardTitle className="text-2xl font-light tracking-wide text-center">Error Loading Orders</CardTitle>
              <p className="text-muted-foreground font-light text-center">
                There was an error loading your orders. Please try again later.
              </p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button variant="outline" className="border-white/20" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container py-20 min-h-screen bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-lg mx-auto border-none bg-white/[0.02] backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <Package className="h-16 w-16 text-primary/80" />
              </div>
              <CardTitle className="text-2xl font-light tracking-wide text-center">No Orders Found</CardTitle>
              <p className="text-muted-foreground font-light text-center">
                You haven't placed any orders yet. Start shopping to find your favorite premium products.
              </p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/products">
                <Button variant="default" className="px-6">
                  Explore Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-20 min-h-screen bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-white/90">Order History</h1>
            <p className="text-white/60 mt-2">Track and manage your purchases</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/products">
              <Button variant="outline" className="border-white/20">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="space-y-8">
          {orders.map((order, index) => (
            <motion.div
              key={order.orderRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-none bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-300 overflow-hidden">
                <div className="relative">
                  {/* Status indicator bar */}
                  <div 
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      order.status === 'completed' ? 'bg-green-500/80' : 
                      order.status === 'pending' ? 'bg-amber-500/80' : 'bg-red-500/80'
                    }`}
                  />
                  
                  <CardHeader className="pt-6 flex flex-row items-center justify-between">
                    <Link href={`/order-details/${order.orderRef}`} className="group">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl font-light tracking-wide text-white/90 group-hover:text-primary transition-colors">
                          Order #{order.orderRef}
                        </CardTitle>
                        <p className="text-sm text-white/60 font-light flex items-center gap-2">
                          <span>Placed on</span> 
                          <span className="text-white/80">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      {/* Product preview */}
                      <div className="flex flex-nowrap overflow-x-auto pb-4 gap-3 -mx-2 px-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {order.items.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="flex-none w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10 relative group"
                          >
                            <Image
                              src={`/placeholders/product.svg`}
                              alt={item.name}
                              className="w-full h-full object-contain p-2"
                              type="product"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-xs text-white font-medium text-center px-1">
                                {item.quantity > 1 ? `${item.quantity}x` : ''} {item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-3">
                        {/* Order Summary */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary">
                            <Package className="h-4 w-4" />
                            <h3 className="font-medium text-sm uppercase tracking-wider">Summary</h3>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/70">Items</span>
                              <span className="text-white/90 font-medium">{order.items.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Total Quantity</span>
                              <span className="text-white/90 font-medium">
                                {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-white/10">
                              <span className="text-white/90 font-medium">Total</span>
                              <span className="text-primary font-medium tabular-nums">
                                {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary">
                            <MapPin className="h-4 w-4" />
                            <h3 className="font-medium text-sm uppercase tracking-wider">Shipping</h3>
                          </div>
                          <div className="space-y-1 text-sm text-white/80">
                            <p className="text-white/90 font-medium">{order.shipping.fullName}</p>
                            <p className="line-clamp-1">{order.shipping.address}</p>
                            <p>{order.shipping.city}, {order.shipping.state}</p>
                            <p>{order.shipping.pincode}</p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="space-y-3">
                          <h3 className="font-medium text-sm uppercase tracking-wider text-primary">Actions</h3>
                          <div className="space-y-2">
                            <Link href={`/order-details/${order.orderRef}`} className="w-full">
                              <Button variant="outline" size="sm" className="w-full justify-start gap-2 border-white/20">
                                <span>View Details</span>
                              </Button>
                            </Link>
                            {order.status === 'completed' && (
                              <ReturnRequestDialog order={order} />
                            )}
                          </div>
                          
                          {/* Existing return requests */}
                          <div className="pt-2">
                            <ReturnRequests orderRef={order.orderRef} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
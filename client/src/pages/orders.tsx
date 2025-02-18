import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/products";
import { Loader2, CheckCircle, XCircle, RotateCw } from "lucide-react";
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
    quantity: z.number().min(1),
    reason: z.string()
  })).min(1, "Please select at least one item to return"),
  additionalNotes: z.string().optional()
});

type ReturnRequestFormData = z.infer<typeof returnRequestSchema>;

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const statusConfig = {
    pending: { icon: Loader2, className: "text-yellow-500", text: "Pending" },
    completed: { icon: CheckCircle, className: "text-green-500", text: "Completed" },
    failed: { icon: XCircle, className: "text-red-500", text: "Failed" }
  };

  const { icon: Icon, className, text } = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${className}`} />
      <span>{text}</span>
    </div>
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
        quantity: item.quantity,
        reason: ""
      })),
      additionalNotes: ""
    }
  });

  const returnMutation = useMutation({
    mutationFn: (data: ReturnRequestFormData & { orderRef: string }) => 
      apiRequest("/api/returns", {
        method: "POST",
        data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/returns/${order.orderRef}`] });
      toast({
        title: "Return Request Submitted",
        description: "We'll review your request and get back to you soon.",
      });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit return request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ReturnRequestFormData) => {
    returnMutation.mutate({
      ...data,
      orderRef: order.orderRef
    });
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
      <div className="container py-20 min-h-screen">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container py-20 min-h-screen">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>No Orders Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven't placed any orders yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-20 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.orderRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Order #{order.orderRef}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                {order.status === 'completed' && (
                  <ReturnRequestDialog order={order} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shipping Details</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>{order.shipping.fullName}</p>
                    <p>{order.shipping.address}</p>
                    <p>
                      {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
                    </p>
                    <p>Phone: {order.shipping.phone}</p>
                  </div>
                </div>
                <ReturnRequests orderRef={order.orderRef} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
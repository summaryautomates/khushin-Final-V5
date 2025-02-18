import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { OrderTracking } from "@/components/order/order-tracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function OrderDetails() {
  const { orderRef } = useParams();
  
  const { data: order, isLoading } = useQuery({
    queryKey: ['/api/orders', orderRef],
    enabled: !!orderRef,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not find order with reference: {orderRef}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Order Reference:</p>
                  <p className="text-sm">{order.orderRef}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Amount:</p>
                  <p className="text-sm">₹{order.total / 100}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Shipping Address:</p>
                <div className="text-sm">
                  <p>{order.shipping.fullName}</p>
                  <p>{order.shipping.address}</p>
                  <p>{order.shipping.city}, {order.shipping.state} {order.shipping.pincode}</p>
                  <p>Phone: {order.shipping.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Items:</p>
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity) / 100}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <OrderTracking orderRef={orderRef} />
      </div>
    </div>
  );
}

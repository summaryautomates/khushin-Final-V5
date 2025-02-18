import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { OrderTracking } from "@/components/order/order-tracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@shared/schema";

export default function OrderDetails() {
  const { orderRef } = useParams();

  const { data: order, isLoading } = useQuery<Order>({
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
            <CardTitle className="flex items-center justify-between">
              Order Details
              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Order Reference and Total */}
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

              {/* Delivery Status */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5" />
                  <h3 className="font-medium">Delivery Status</h3>
                </div>
                <div className="space-y-2">
                  {order.trackingStatus && (
                    <p className="text-sm">
                      Current Status: <Badge>{order.trackingStatus}</Badge>
                    </p>
                  )}
                  {order.estimatedDelivery && (
                    <p className="text-sm">
                      Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  {order.trackingNumber && (
                    <p className="text-sm">
                      Tracking Number: {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5" />
                  <h3 className="font-medium">Shipping Address</h3>
                </div>
                <div className="text-sm space-y-1">
                  <p>{order.shipping.fullName}</p>
                  <p>{order.shipping.address}</p>
                  <p>{order.shipping.city}, {order.shipping.state} {order.shipping.pincode}</p>
                  <p>Phone: {order.shipping.phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
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

        {/* Real-time Order Tracking */}
        {orderRef && <OrderTracking orderRef={orderRef} />}
      </div>
    </div>
  );
}
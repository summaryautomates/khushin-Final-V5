import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { OrderTracking } from "@/components/order/order-tracking";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Package, Truck, Clock, ArrowLeft, CalendarDays, CreditCard, MapPin, ReceiptText, Undo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/products";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@shared/schema";

export default function OrderDetails() {
  const { orderRef } = useParams();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['/api/orders', orderRef],
    enabled: !!orderRef,
  });

  if (isLoading) {
    return (
      <div className="container py-20 min-h-screen bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-sm">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-white/70 animate-pulse">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-20 min-h-screen bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-sm">
        <Card className="max-w-lg mx-auto border-none bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-light tracking-wide text-center">Order Not Found</CardTitle>
            <p className="text-muted-foreground font-light text-center">
              Could not find order with reference: {orderRef}
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/orders">
              <Button variant="outline" className="border-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate expected delivery date as 3-5 days from order date if not available
  const orderDate = new Date(order.createdAt);
  const expectedDeliveryDate = order.estimatedDelivery 
    ? new Date(order.estimatedDelivery) 
    : new Date(orderDate.setDate(orderDate.getDate() + 5));

  type StatusType = {
    color: string;
    icon: typeof Clock | typeof Package | typeof Undo;
    message: string;
  };

  const statusOptions: Record<string, StatusType> = {
    pending: { 
      color: "bg-amber-500/80",
      icon: Clock,
      message: "Your order is being processed"
    },
    completed: { 
      color: "bg-green-500/80",
      icon: Package,
      message: "Your order has been delivered"
    },
    failed: { 
      color: "bg-red-500/80",
      icon: Undo,
      message: "Your order has failed"
    }
  };

  // Make sure we have a valid status or default to pending
  const normalizedStatus = order.status && 
    (order.status.toLowerCase() === 'completed' || 
     order.status.toLowerCase() === 'failed' || 
     order.status.toLowerCase() === 'pending') 
    ? order.status.toLowerCase() 
    : 'pending';
  
  const orderStatus: StatusType = statusOptions[normalizedStatus as keyof typeof statusOptions];

  return (
    <div className="container py-12 min-h-screen bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Back to orders link */}
        <Link href="/orders" className="inline-flex items-center mb-8 text-white/70 hover:text-white transition-colors group">
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          <span>Back to Orders</span>
        </Link>

        {/* Order header card */}
        <Card className="border-none bg-white/[0.03] backdrop-blur-sm overflow-hidden mb-8">
          <div className="relative">
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${orderStatus.color}`} />
            
            <CardHeader className="pt-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-3xl font-light tracking-wide text-white/90">
                    Order #{order.orderRef}
                  </CardTitle>
                  <CardDescription className="text-white/60 mt-1 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className={`
                  ${order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'}
                  px-4 py-2 text-sm`
                }>
                  <orderStatus.icon className="h-4 w-4 mr-2" />
                  {order.status === 'completed' ? 'Completed' : 
                   order.status === 'pending' ? 'Processing' : 'Failed'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Order summary */}
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <ReceiptText className="h-4 w-4" />
                    <h3 className="font-medium text-sm uppercase tracking-wider">Order Summary</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Items</span>
                      <span className="text-white/90">{order.items.length}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Total Quantity</span>
                      <span className="text-white/90">
                        {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                      </span>
                    </div>
                    {order.status !== 'failed' && (
                      <div className="flex justify-between text-white/70">
                        <span>Payment Method</span>
                        <span className="text-white/90">{order.paymentMethod === null ? 'COD' : order.paymentMethod}</span>
                      </div>
                    )}
                    <Separator className="my-2 bg-white/10" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping info */}
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <MapPin className="h-4 w-4" />
                    <h3 className="font-medium text-sm uppercase tracking-wider">Shipping Address</h3>
                  </div>
                  <div className="space-y-1 text-sm text-white/80">
                    <p className="text-white/90 font-medium">{order.shipping.fullName}</p>
                    <p>{order.shipping.address}</p>
                    <p>
                      {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
                    </p>
                    <p className="text-primary pt-1">{order.shipping.phone}</p>
                  </div>
                </div>

                {/* Delivery status */}
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <Truck className="h-4 w-4" />
                    <h3 className="font-medium text-sm uppercase tracking-wider">Delivery Status</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">Status:</span>
                      <span className="text-white/90 flex items-center gap-1">
                        <Badge variant="outline" className={`
                          ${order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'}
                          px-2 py-0 text-xs`
                        }>
                          {order.trackingStatus || order.status}
                        </Badge>
                      </span>
                    </div>
                    {order.status !== 'failed' && (
                      <>
                        <div className="flex flex-col gap-1 pt-1">
                          <span className="text-white/70">Expected Delivery:</span>
                          <span className="text-white/90">
                            {expectedDeliveryDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex flex-col gap-1 pt-1">
                            <span className="text-white/70">Tracking Number:</span>
                            <span className="text-primary font-mono text-xs">{order.trackingNumber}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status message banner */}
              <div 
                className={`
                  ${order.status === 'completed' ? 'bg-green-500/10 border-green-500/20' : 
                    order.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    'bg-red-500/10 border-red-500/20'}
                  p-4 rounded-lg border mb-8 flex items-center gap-3
                `}
              >
                <div className={`
                  ${order.status === 'completed' ? 'bg-green-500/20' : 
                    order.status === 'pending' ? 'bg-yellow-500/20' :
                    'bg-red-500/20'}
                  rounded-full p-2
                `}>
                  <orderStatus.icon className={`
                    ${order.status === 'completed' ? 'text-green-500' : 
                      order.status === 'pending' ? 'text-yellow-500' :
                      'text-red-500'}
                    h-5 w-5
                  `} />
                </div>
                <div>
                  <h4 className={`
                    ${order.status === 'completed' ? 'text-green-500' : 
                      order.status === 'pending' ? 'text-yellow-500' :
                      'text-red-500'}
                    font-medium
                  `}>
                    {order.status === 'completed' ? 'Order Completed' : 
                     order.status === 'pending' ? 'Order in Progress' : 
                     'Order Failed'}
                  </h4>
                  <p className="text-white/70 text-sm">{orderStatus.message}</p>
                </div>
              </div>

              {/* Order items */}
              <div className="mb-8">
                <h3 className="text-lg font-light text-white/90 mb-4">Items in Your Order</h3>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/[0.01] border border-white/10 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center border border-white/10">
                          <Image
                            src={`/placeholders/product.svg`}
                            alt={item.name}
                            className="w-full h-full object-contain p-2"
                            type="product"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-white/90">{item.name}</h4>
                          <p className="text-sm text-white/60">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/90">{formatPrice(item.price)}</p>
                        <p className="text-sm text-primary font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time tracking */}
              {order.status === 'pending' && orderRef && (
                <div className="mb-8">
                  <h3 className="text-lg font-light text-white/90 mb-4">Live Order Tracking</h3>
                  <OrderTracking orderRef={orderRef} />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4 pb-6 justify-between items-center">
              <Link href="/orders">
                <Button variant="outline" className="border-white/20 w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <div className="flex gap-3">
                {order.status === 'completed' && (
                  <Button variant="outline" className="border-primary/30 bg-primary/5">
                    <Undo className="h-4 w-4 mr-2" />
                    Request Return
                  </Button>
                )}
                <Link href="/products">
                  <Button>
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
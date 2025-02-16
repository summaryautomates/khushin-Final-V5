import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/products";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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
              <OrderStatusBadge status={order.status} />
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

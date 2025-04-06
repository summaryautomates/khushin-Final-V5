import { useLocation, Link } from "wouter";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccess() {
  const [, params] = useLocation();
  const { clearCart } = useCart();
  const [isCodOrder, setIsCodOrder] = useState(false);

  useEffect(() => {
    // Check if this is a COD order from the URL
    const searchParams = new URLSearchParams(window.location.search);
    const method = searchParams.get('method');
    if (method === 'cod') {
      setIsCodOrder(true);
    }
    
    // Clear the cart after successful payment/order
    clearCart();
  }, [clearCart]);

  return (
    <div className="container py-20 min-h-screen">
      <Card className="max-w-lg mx-auto bg-black">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <CardTitle>{isCodOrder ? "Order Confirmed!" : "Payment Successful!"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {isCodOrder 
              ? "Thank you for your order. Your order has been confirmed and will be processed for shipping. You will receive an email confirmation shortly."
              : "Thank you for your purchase. Your order has been processed successfully. You will receive an email confirmation shortly."
            }
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button asChild>
            <Link href="/orders">View Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

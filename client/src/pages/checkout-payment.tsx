import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function generateQRCodeSVG(text: string) {
  // Simple QR code representation for demo
  return `
    <svg width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <text x="50%" y="50%" text-anchor="middle" fill="black">
        Scan to Pay
        ${text}
      </text>
    </svg>
  `;
}

export default function CheckoutPayment() {
  const [, params] = useLocation();
  const orderRef = new URLSearchParams(params?.search).get('ref');
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  const { data: paymentDetails, isLoading } = useQuery({
    queryKey: [`/api/payment/${orderRef}`],
    enabled: !!orderRef,
  });

  useEffect(() => {
    if (paymentStatus === 'completed') {
      clearCart();
    }
  }, [paymentStatus, clearCart]);

  if (isLoading) {
    return (
      <div className="container py-20 min-h-screen">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const qrCodeSvg = generateQRCodeSVG(JSON.stringify(paymentDetails));

  return (
    <div className="container py-20 min-h-screen">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div 
              className="bg-white p-4 rounded-lg"
              dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            />
          </div>
          <div className="text-center">
            <p className="font-semibold">Order Reference: {orderRef}</p>
            <p className="text-muted-foreground mt-2">
              Scan the QR code using any UPI app to complete your payment
            </p>
          </div>
          {/* For demo purposes, we'll add buttons to simulate payment status */}
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => setPaymentStatus('completed')}
              disabled={paymentStatus === 'completed'}
            >
              Simulate Payment Success
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setPaymentStatus('failed')}
              disabled={paymentStatus === 'completed'}
            >
              Simulate Payment Failure
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Payment Status: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";

interface PaymentDetails {
  status: 'pending' | 'completed' | 'failed';
  upiId: string;
  merchantName: string;
  amount: number;
  orderRef: string;
}

export default function CheckoutPayment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const orderRef = new URLSearchParams(window.location.search).get('ref');
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { data: paymentDetails, isLoading, error } = useQuery<PaymentDetails>({
    queryKey: [`/api/payment/${orderRef}`],
    enabled: !!orderRef,
    retry: 3,
  });

  useEffect(() => {
    if (!orderRef) {
      setLocation('/cart');
      toast({
        title: "Error",
        description: "Invalid payment session. Please try again.",
        variant: "destructive",
      });
      return;
    }
  }, [orderRef, setLocation, toast]);

  useEffect(() => {
    if (paymentDetails) {
      const qrData = JSON.stringify({
        pa: paymentDetails.upiId,
        pn: paymentDetails.merchantName,
        am: paymentDetails.amount.toString(),
        tr: paymentDetails.orderRef,
        tn: `Payment for order ${paymentDetails.orderRef}`,
      });

      QRCode.toDataURL(qrData)
        .then(url => setQrCodeUrl(url))
        .catch(err => {
          console.error('QR Code generation failed:', err);
          toast({
            title: "Error",
            description: "Failed to generate payment QR code. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [paymentDetails, toast]);

  useEffect(() => {
    if (paymentStatus === 'completed') {
      clearCart();
      setLocation(`/checkout/success?ref=${orderRef}`);
    }
  }, [paymentStatus, clearCart, orderRef, setLocation]);

  const handlePaymentStatusUpdate = async (newStatus: 'completed' | 'failed') => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/payment/${orderRef}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      setPaymentStatus(newStatus);
      if (newStatus === 'failed') {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (error) {
    return (
      <div className="container py-20 min-h-screen">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Payment Error</h2>
              <p className="text-muted-foreground">
                There was an error loading your payment details. Please try again.
              </p>
              <Button onClick={() => setLocation('/cart')}>
                Return to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-20 min-h-screen">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading payment details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-20 min-h-screen">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            {qrCodeUrl ? (
              <div className="bg-white p-4 rounded-lg">
                <img src={qrCodeUrl} alt="Payment QR Code" className="w-64 h-64" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-64 h-64 bg-muted rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="font-semibold">Order Reference: {orderRef}</p>
            <p className="text-muted-foreground mt-2">
              Scan the QR code using any UPI app to complete your payment
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            {paymentStatus === 'pending' && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {paymentStatus === 'completed' && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {paymentStatus === 'failed' && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <p className="text-sm font-medium">
              Payment Status: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/cart')}
            disabled={paymentStatus === 'completed' || isUpdatingStatus}
          >
            Back to Cart
          </Button>
          {/* For demo purposes only */}
          <div className="space-x-2">
            <Button
              variant="default"
              onClick={() => handlePaymentStatusUpdate('completed')}
              disabled={paymentStatus === 'completed' || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Simulate Success'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePaymentStatusUpdate('failed')}
              disabled={paymentStatus === 'completed' || isUpdatingStatus}
            >
              Simulate Failure
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
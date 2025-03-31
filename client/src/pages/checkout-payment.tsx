import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Banknote, QrCode, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentDetails {
  status: 'pending' | 'completed' | 'failed';
  upiId: string;
  merchantName: string;
  amount: number;
  orderRef: string;
  stripeSessionId?: string;
}

export default function CheckoutPayment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const orderRef = new URLSearchParams(window.location.search).get('ref');
  const status = new URLSearchParams(window.location.search).get('status');
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'upi' | 'cod'>('stripe');

  const { data: paymentDetails, isLoading, error } = useQuery<PaymentDetails>({
    queryKey: [`/api/payment/${orderRef}`],
    enabled: !!orderRef,
    retry: 3,
  });

  useEffect(() => {
    if (status === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. Please try again or choose a different payment method.",
        variant: "destructive",
      });
    }
  }, [status, toast]);

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
    if (paymentDetails && paymentMethod === 'upi') {
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
  }, [paymentDetails, paymentMethod, toast]);

  useEffect(() => {
    if (paymentStatus === 'completed') {
      clearCart();
      setLocation(`/checkout/success?ref=${orderRef}`);
    }
  }, [paymentStatus, clearCart, orderRef, setLocation]);

  const handleStripeCheckout = async () => {
    if (!paymentDetails?.stripeSessionId) {
      toast({
        title: "Error",
        description: "Payment session not found. Please try again.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = `https://checkout.stripe.com/pay/${paymentDetails.stripeSessionId}`;
  };

  const handlePaymentStatusUpdate = async (newStatus: 'completed' | 'failed') => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/payment/${orderRef}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          method: paymentMethod
        })
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
    <div className="container py-8 md:py-20 min-h-screen px-4">
      <Card className="max-w-lg mx-auto bg-black">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="stripe" onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'upi' | 'cod')}>
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="stripe" className="flex items-center gap-2 px-2 py-2 md:px-4">
                <CreditCard className="h-4 w-4" />
                <span className="hidden md:inline">Card Payment</span>
                <span className="md:hidden">Card</span>
              </TabsTrigger>
              <TabsTrigger value="upi" className="flex items-center gap-2 px-2 py-2 md:px-4">
                <QrCode className="h-4 w-4" />
                <span className="hidden md:inline">UPI Payment</span>
                <span className="md:hidden">UPI</span>
              </TabsTrigger>
              <TabsTrigger value="cod" className="flex items-center gap-2 px-2 py-2 md:px-4">
                <Banknote className="h-4 w-4" />
                <span className="hidden md:inline">Cash on Delivery</span>
                <span className="md:hidden">COD</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stripe">
              <div className="space-y-4 text-center py-4 md:py-6">
                <CreditCard className="h-8 w-8 md:h-12 md:w-12 mx-auto text-primary" />
                <div>
                  <h3 className="text-base md:text-lg font-medium">Secure Card Payment</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Pay securely using your credit or debit card
                  </p>
                </div>
                <div className="bg-black p-3 md:p-4 rounded-lg border">
                  <p className="font-semibold text-sm md:text-base">Amount to be paid: ₹{paymentDetails?.amount}</p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleStripeCheckout}
                  disabled={!paymentDetails?.stripeSessionId}
                >
                  Proceed to Pay
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upi">
              <div className="flex justify-center mt-4">
                {qrCodeUrl ? (
                  <div className="bg-white p-2 md:p-4 rounded-lg">
                    <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48 md:w-64 md:h-64" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-48 h-48 md:w-64 md:h-64 bg-black rounded-lg border">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cod">
              <div className="space-y-4 text-center py-4 md:py-6">
                <Banknote className="h-8 w-8 md:h-12 md:w-12 mx-auto text-primary" />
                <div>
                  <h3 className="text-base md:text-lg font-medium">Cash on Delivery</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Pay in cash when your order arrives
                  </p>
                </div>
                <div className="bg-black p-3 md:p-4 rounded-lg border">
                  <p className="font-semibold text-sm md:text-base">Amount to be paid: ₹{paymentDetails?.amount}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center space-y-2">
            <p className="font-semibold text-sm md:text-base">Order Reference: {orderRef}</p>
            {paymentMethod === 'upi' && (
              <p className="text-xs md:text-sm text-muted-foreground">
                Scan the QR code using any UPI app to complete your payment
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-4 md:gap-2 md:justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/cart')}
            disabled={paymentStatus === 'completed' || isUpdatingStatus}
            className="w-full md:w-auto"
          >
            Back to Cart
          </Button>
          {paymentMethod === 'cod' ? (
            <Button
              variant="default"
              onClick={() => handlePaymentStatusUpdate('completed')}
              disabled={paymentStatus === 'completed' || isUpdatingStatus}
              className="w-full md:w-auto"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm COD Order'
              )}
            </Button>
          ) : (
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="default"
                onClick={() => handlePaymentStatusUpdate('completed')}
                disabled={paymentStatus === 'completed' || isUpdatingStatus}
                className="w-full md:w-auto"
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
                className="w-full md:w-auto"
              >
                Simulate Failure
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
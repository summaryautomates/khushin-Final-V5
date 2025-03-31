import { useOrderTracking } from "@/hooks/use-order-tracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface OrderTrackingProps {
  orderRef: string;
}

export function OrderTracking({ orderRef }: OrderTrackingProps) {
  const { status, isConnected } = useOrderTracking(orderRef);

  return (
    <Card className="w-full max-w-md mx-auto bg-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Order Tracking
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="ml-2"
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Order Reference:</span>
            <span className="text-sm">{orderRef}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {status ? (
              <Badge variant="secondary">{status}</Badge>
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Package, Clock, CreditCard, CheckCircle2, Circle, Truck } from "lucide-react";
import { LiveOrderMap } from "@/components/LiveOrderMap";
import { DroghedaMap } from "@/components/DroghedaMap";
import type { Order } from "@shared/schema";

const statusColors: Record<string, string> = {
  'created': 'bg-gray-500',
  'confirmed': 'bg-blue-500',
  'picked_up': 'bg-yellow-500',
  'at_origin_shop': 'bg-orange-500',
  'processing': 'bg-purple-500',
  'out_for_delivery': 'bg-cyan-500',
  'delivered': 'bg-green-500',
  'closed': 'bg-gray-400',
};

const statusLabels: Record<string, string> = {
  'created': 'Order Created',
  'confirmed': 'Confirmed',
  'picked_up': 'Picked Up',
  'at_origin_shop': 'At Shop',
  'washing': 'Being Washed',
  'drying': 'Drying',
  'pressing': 'Being Pressed',
  'qc': 'Quality Check',
  'packed': 'Packed & Ready',
  'out_for_delivery': 'Out for Delivery',
  'delivered': 'Delivered',
  'closed': 'Completed',
};

const statusDescriptions: Record<string, string> = {
  'created': 'Your order has been placed',
  'confirmed': 'Shop confirmed your order',
  'picked_up': 'Driver has collected your laundry',
  'at_origin_shop': 'Laundry arrived at processing facility',
  'washing': 'Your items are being washed',
  'drying': 'Your items are being dried',
  'pressing': 'Your items are being pressed',
  'qc': 'Final quality inspection in progress',
  'packed': 'Ready for delivery',
  'out_for_delivery': 'On the way to you',
  'delivered': 'Successfully delivered',
  'closed': 'Order complete',
};

export default function OrderDetails() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/customer/orders/:id");

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", params?.id],
    enabled: !!params?.id,
    refetchInterval: 5000, // Auto-refresh every 5 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/customer')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-sm text-muted-foreground">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            <Badge className={`${statusColors[order.state] || 'bg-gray-500'} text-white border-0`}>
              {statusLabels[order.state] || order.state}
            </Badge>
          </div>
        </div>

        {/* Live Tracking Map */}
        <div className="mb-6">
          {order.state === 'confirmed' ? (
            <DroghedaMap showDriverVan={true} orderStatus={order.state} />
          ) : (
            <LiveOrderMap orderId={order.id} />
          )}
        </div>

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Timeline Steps */}
              {[
                { state: 'created', icon: Package, label: statusLabels['created'], desc: statusDescriptions['created'], time: order.createdAt },
                { state: 'confirmed', icon: Package, label: statusLabels['confirmed'], desc: statusDescriptions['confirmed'], time: order.confirmedAt },
                { state: 'picked_up', icon: Package, label: statusLabels['picked_up'], desc: statusDescriptions['picked_up'], time: order.pickedUpAt },
                { state: 'at_origin_shop', icon: Package, label: statusLabels['at_origin_shop'], desc: statusDescriptions['at_origin_shop'] },
                { state: 'washing', icon: Package, label: statusLabels['washing'], desc: statusDescriptions['washing'] },
                { state: 'packed', icon: Package, label: statusLabels['packed'], desc: statusDescriptions['packed'] },
                { state: 'out_for_delivery', icon: Package, label: statusLabels['out_for_delivery'], desc: statusDescriptions['out_for_delivery'] },
                { state: 'delivered', icon: Package, label: statusLabels['delivered'], desc: statusDescriptions['delivered'], time: order.deliveredAt },
              ].map((step, index, array) => {
                const stateOrder = ['created', 'confirmed', 'picked_up', 'at_origin_shop', 'washing', 'packed', 'out_for_delivery', 'delivered'];
                const currentIndex = stateOrder.indexOf(order.state);
                const stepIndex = stateOrder.indexOf(step.state);
                const isCompleted = stepIndex <= currentIndex;
                const isCurrent = step.state === order.state;
                const isLast = index === array.length - 1;

                return (
                  <div key={step.state} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={`font-semibold ${!isCompleted && 'text-muted-foreground'}`}>
                        {step.label}
                        {isCurrent && <span className="ml-2 text-xs text-primary">(Current)</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                      {step.time && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(step.time).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pickup Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pickup Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.addressLine1}</p>
            {order.addressLine2 && <p className="text-sm text-muted-foreground">{order.addressLine2}</p>}
            <p className="text-sm text-muted-foreground">
              {order.city}{order.eircode ? `, ${order.eircode}` : ''}
            </p>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>€{((order.subtotalCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (23%)</span>
                <span>€{((order.vatCents || 0) / 100).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>€{((order.totalCents || 0) / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <CreditCard className="h-4 w-4" />
              <span className="capitalize">{order.paymentMethod || 'Card'} payment</span>
            </div>

            {order.notes && (
              <div className="pt-2">
                <p className="text-sm font-medium mb-1">Special Instructions:</p>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Need help? Contact support at{' '}
              <a href="mailto:support@mrbubbles.ie" className="text-primary underline">
                support@mrbubbles.ie
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

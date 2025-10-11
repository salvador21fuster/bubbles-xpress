import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, Package, CheckCircle, Camera, Navigation } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { QRScanner } from "@/components/QRScanner";
import { QRLabelPrinter } from "@/components/QRLabelPrinter";
import { DroghedaMap } from "@/components/DroghedaMap";
import type { Order } from "@shared/schema";

export default function DriverOrderDetails() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute("/driver/orders/:id");
  const [showScanner, setShowScanner] = useState(false);
  const [labelPrinted, setLabelPrinted] = useState(false);
  const [onWay, setOnWay] = useState(false);

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", params?.id],
    enabled: !!params?.id,
  });

  const markPickedUpMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/scan", {
        type: 'pickup',
        order_id: params?.id,
        geo: { lat: 0, lng: 0 },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
      toast({
        title: "Pickup Confirmed",
        description: "Order marked as picked up",
      });
      navigate('/driver');
    },
    onError: (error) => {
      toast({
        title: "Failed to confirm pickup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markDeliveredMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/scan", {
        type: 'delivery',
        order_id: params?.id,
        geo: { lat: 0, lng: 0 },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
      toast({
        title: "Delivery Confirmed",
        description: "Order marked as delivered",
      });
      navigate('/driver');
    },
    onError: (error) => {
      toast({
        title: "Failed to confirm delivery",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const isPickup = order.state === 'confirmed';
  const isDelivery = order.state === 'packed' || order.state === 'out_for_delivery';
  const earnings = ((order.totalCents || 0) * 0.1) / 100;

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/driver')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-sm text-green-600 font-medium">+€{earnings.toFixed(2)} earning</p>
            </div>
            <Badge className={`${isPickup ? 'bg-blue-500' : 'bg-green-500'} text-white border-0`}>
              {isPickup ? 'Pickup' : 'Delivery'}
            </Badge>
          </div>
        </div>

        {/* Customer Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {isPickup ? 'Pickup' : 'Delivery'} Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{order.addressLine1}</p>
              {order.addressLine2 && <p className="text-sm text-muted-foreground">{order.addressLine2}</p>}
              <p className="text-sm text-muted-foreground">
                {order.city}{order.eircode ? `, ${order.eircode}` : ''}
              </p>
            </div>
            <Button className="w-full gap-2" data-testid="button-navigate">
              <MapPin className="h-4 w-4" />
              Open in Maps
            </Button>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">€{((order.totalCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Earnings (10%)</span>
                <span className="font-semibold text-green-600">€{earnings.toFixed(2)}</span>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-1">Customer Notes:</p>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        {showScanner ? (
          <QRScanner
            scanType={isPickup ? 'pickup' : 'delivery'}
            orderId={order.id}
            onScanComplete={() => {
              setShowScanner(false);
              queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
              queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
              toast({
                title: isPickup ? "Pickup Confirmed" : "Delivery Confirmed",
                description: isPickup ? "Laundry collected successfully" : "Order delivered successfully",
              });
              navigate('/driver');
            }}
            onCancel={() => setShowScanner(false)}
          />
        ) : (
          <div className="space-y-6">
            {/* Step 1: Print Label (Pickup Only) */}
            {isPickup && !labelPrinted && (
              <QRLabelPrinter 
                order={order} 
                onPrintComplete={() => {
                  setLabelPrinted(true);
                  toast({
                    title: "Label Printed",
                    description: "You can now start the pickup",
                  });
                }}
              />
            )}

            {/* Step 2: Customer Location Map & On Way Button (Pickup) */}
            {isPickup && labelPrinted && !onWay && (
              <div className="space-y-4">
                <DroghedaMap showDriverVan={false} orderStatus="confirmed" />
                
                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={() => {
                    setOnWay(true);
                    toast({
                      title: "En Route",
                      description: `Heading to pickup in ${order.timeWindow} window`,
                    });
                  }}
                  data-testid="button-on-way"
                >
                  <Navigation className="h-5 w-5" />
                  I'm On My Way
                </Button>
              </div>
            )}

            {/* Step 3: Scan QR at Customer Location (Pickup) */}
            {isPickup && onWay && (
              <Button 
                size="lg" 
                className="w-full gap-2"
                onClick={() => setShowScanner(true)}
                data-testid="button-scan-pickup"
              >
                <Camera className="h-5 w-5" />
                Scan QR & Confirm Pickup
              </Button>
            )}

            {/* Delivery Flow */}
            {isDelivery && (
              <Button 
                size="lg" 
                className="w-full gap-2"
                onClick={() => setShowScanner(true)}
                data-testid="button-scan-delivery"
              >
                <Camera className="h-5 w-5" />
                Scan QR & Confirm Delivery
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

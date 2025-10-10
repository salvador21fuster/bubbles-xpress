import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, Scale, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function ShopIntake() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrCode, setQrCode] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);

  const scanMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("GET", `/api/orders/${code}`);
      return response;
    },
    onSuccess: (order: Order) => {
      setScannedOrder(order);
      toast({
        title: "Order Scanned",
        description: `Order #${order.id.slice(0, 8)} loaded successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const intakeMutation = useMutation({
    mutationFn: async () => {
      if (!scannedOrder) throw new Error("No order scanned");
      return await apiRequest("POST", "/api/scan", {
        type: "intake",
        order_id: scannedOrder.id,
        from_party: { type: "driver" },
        to_party: { type: "shop" },
        weight_kg: parseFloat(weightKg),
        notes,
      });
    },
    onSuccess: () => {
      toast({
        title: "Intake Complete",
        description: "Order has been logged and moved to processing queue",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/orders"] });
      setQrCode("");
      setWeightKg("");
      setNotes("");
      setScannedOrder(null);
    },
    onError: (error) => {
      toast({
        title: "Intake Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScan = () => {
    if (qrCode.trim()) {
      scanMutation.mutate(qrCode.trim());
    }
  };

  const handleIntake = () => {
    if (weightKg && scannedOrder) {
      intakeMutation.mutate();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Intake Station</h1>
        <p className="text-muted-foreground">Scan and process incoming orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-code">Order QR Code or ID</Label>
            <div className="flex gap-2">
              <Input
                id="qr-code"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Scan or enter order ID"
                data-testid="input-qr-code"
              />
              <Button onClick={handleScan} disabled={scanMutation.isPending} data-testid="button-scan">
                {scanMutation.isPending ? "Scanning..." : "Scan"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {scannedOrder && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium" data-testid="text-order-id">#{scannedOrder.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{scannedOrder.customerId}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{scannedOrder.addressLine1}, {scannedOrder.city}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Enter weight in kg"
                data-testid="input-weight"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intake-notes">Notes (Optional)</Label>
              <Textarea
                id="intake-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations or special instructions"
                data-testid="textarea-intake-notes"
              />
            </div>

            <Button 
              onClick={handleIntake} 
              disabled={!weightKg || intakeMutation.isPending} 
              className="w-full"
              data-testid="button-complete-intake"
            >
              {intakeMutation.isPending ? "Processing..." : "Complete Intake"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

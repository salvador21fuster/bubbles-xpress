import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Navigation, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import type { Order } from "@shared/schema";

export default function DriverDashboard() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders"],
  });

  const pickups = orders.filter(o => o.state === 'confirmed');
  const deliveries = orders.filter(o => o.state === 'packed' || o.state === 'out_for_delivery');
  const completed = orders.filter(o => o.state === 'delivered');

  const todayEarnings = completed.reduce((sum, order) => {
    return sum + ((order.totalCents || 0) * 0.1); // 10% driver commission
  }, 0) / 100;

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Driver Dashboard</h1>
        <p className="text-muted-foreground">Today's pickups and deliveries</p>
      </div>

      {/* Earnings Card */}
      <Card className="mb-6 bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Today's Earnings</p>
              <p className="text-3xl font-bold">€{todayEarnings.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-12 w-12 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pickups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pickups" data-testid="tab-pickups">
            Pickups ({pickups.length})
          </TabsTrigger>
          <TabsTrigger value="deliveries" data-testid="tab-deliveries">
            Deliveries ({deliveries.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pickups" className="space-y-3">
          {pickups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pickups scheduled</p>
              </CardContent>
            </Card>
          ) : (
            pickups.map((order) => (
              <Link key={order.id} href={`/driver/orders/${order.id}`}>
                <Card className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                        <Badge className="bg-blue-500 text-white border-0 mt-1">Pickup</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{((order.totalCents || 0) / 100).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">+€{(((order.totalCents || 0) * 0.1) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{order.addressLine1}, {order.city}</span>
                    </div>
                    <Button size="sm" className="w-full gap-2" data-testid={`button-navigate-${order.id}`}>
                      <Navigation className="h-4 w-4" />
                      Navigate
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-3">
          {deliveries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No deliveries scheduled</p>
              </CardContent>
            </Card>
          ) : (
            deliveries.map((order) => (
              <Link key={order.id} href={`/driver/orders/${order.id}`}>
                <Card className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                        <Badge className="bg-green-500 text-white border-0 mt-1">Delivery</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{((order.totalCents || 0) / 100).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">+€{(((order.totalCents || 0) * 0.1) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{order.addressLine1}, {order.city}</span>
                    </div>
                    <Button size="sm" className="w-full gap-2" data-testid={`button-navigate-${order.id}`}>
                      <Navigation className="h-4 w-4" />
                      Navigate
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completed.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No completed deliveries today</p>
              </CardContent>
            </Card>
          ) : (
            completed.map((order) => (
              <Card key={order.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                      <Badge variant="secondary" className="mt-1">Completed</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{((order.totalCents || 0) / 100).toFixed(2)}</p>
                      <p className="text-xs text-green-600">+€{(((order.totalCents || 0) * 0.1) / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.addressLine1}, {order.city}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

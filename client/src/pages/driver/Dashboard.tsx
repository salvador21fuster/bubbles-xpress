import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Navigation, TrendingUp, Power, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Order, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import { RoleSwitcher } from "@/components/RoleSwitcher";

// Simple route optimization: sort by city then address
function optimizeRoute(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    // First sort by city
    const cityCompare = (a.city || '').localeCompare(b.city || '');
    if (cityCompare !== 0) return cityCompare;
    // Then by address within same city
    return (a.addressLine1 || '').localeCompare(b.addressLine1 || '');
  });
}

export default function DriverDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders"],
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const { data: availableOrders = [], isLoading: isLoadingAvailable } = useQuery<Order[]>({
    queryKey: ["/api/driver/available-orders"],
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Track driver location when online
  const { isTracking } = useDriverLocation(user?.isActive || false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      // Clear all cached data to prevent next user from seeing previous user's data
      queryClient.clear();
      
      // Navigate to landing page
      navigate("/");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", "/api/driver/accept-order", { orderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/available-orders"] });
      toast({
        title: "Order Accepted",
        description: "The order has been assigned to you",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to accept order",
        description: error.message || "Something went wrong",
      });
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      return await apiRequest("POST", "/api/driver/availability", { isActive });
    },
    onSuccess: async (_data, isActive) => {
      // Force refetch to get updated user data (bypasses 304 cache)
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: isActive ? "You're now online" : "You're now offline",
        description: isActive 
          ? "You'll be visible to customers looking for drivers"
          : "You won't receive new pickup requests",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update availability status",
      });
    },
  });

  const pickups = optimizeRoute(orders.filter(o => o.state === 'confirmed'));
  const deliveries = optimizeRoute(orders.filter(o => o.state === 'packed' || o.state === 'out_for_delivery'));
  const completed = orders.filter(o => o.state === 'delivered');

  const todayEarnings = completed.reduce((sum, order) => {
    return sum + ((order.totalCents || 0) * 0.1); // 10% driver commission
  }, 0) / 100;

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Driver Dashboard</h1>
          <p className="text-muted-foreground">Today's pickups and deliveries</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Availability Toggle */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Power className={`h-5 w-5 ${user?.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-medium">
                  {user?.isActive ? 'You\'re Online' : 'You\'re Offline'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.isActive 
                    ? 'Customers can see you for pickups' 
                    : 'Turn on to accept pickups'}
                </p>
              </div>
            </div>
            <Switch
              checked={user?.isActive || false}
              onCheckedChange={(checked) => availabilityMutation.mutate(checked)}
              disabled={availabilityMutation.isPending}
              data-testid="switch-driver-availability"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                    <div className="h-2 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Earnings Cards and Tabs */}
      {!isLoading && (
      <>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4">
            <p className="text-xs opacity-90 mb-1">Today's Earnings</p>
            <p className="text-2xl font-bold">€{todayEarnings.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">{completed.length} deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold">{pickups.length + deliveries.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {pickups.length} pickups, {deliveries.length} drops
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available" data-testid="tab-available">
            Available ({availableOrders.length})
          </TabsTrigger>
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

        <TabsContent value="available" className="space-y-3">
          {isLoadingAvailable ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No orders available</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon for new pickup requests</p>
              </CardContent>
            </Card>
          ) : (
            availableOrders.map((order) => (
              <Card key={order.id} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                      <Badge className="bg-orange-500 text-white border-0 mt-1">Awaiting Driver</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{((order.totalCents || 0) / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">+€{(((order.totalCents || 0) * 0.1) / 100).toFixed(2)} commission</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.addressLine1}, {order.city}</span>
                  </div>
                  {order.pickupDate && order.timeWindow && (
                    <div className="text-sm text-muted-foreground mb-3">
                      <p>Pickup: {order.pickupDate} • {order.timeWindow}</p>
                    </div>
                  )}
                  <Button 
                    size="sm" 
                    className="w-full" 
                    onClick={() => acceptOrderMutation.mutate(order.id)}
                    disabled={acceptOrderMutation.isPending}
                    data-testid={`button-accept-order-${order.id}`}
                  >
                    {acceptOrderMutation.isPending ? "Accepting..." : "Accept Order"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pickups" className="space-y-3">
          {pickups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pickups scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {pickups.length > 1 && (
                <div className="bg-primary/10 text-primary p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium">📍 Optimized Route</p>
                  <p className="text-xs opacity-90">Stops ordered by location for efficiency</p>
                </div>
              )}
              {pickups.map((order, index) => (
                <Link key={order.id} href={`/driver/orders/${order.id}`}>
                <Card className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                          <Badge className="bg-blue-500 text-white border-0 mt-1">Pickup</Badge>
                        </div>
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
              ))}
            </>
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
            <>
              {deliveries.length > 1 && (
                <div className="bg-primary/10 text-primary p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium">📍 Optimized Route</p>
                  <p className="text-xs opacity-90">Stops ordered by location for efficiency</p>
                </div>
              )}
              {deliveries.map((order, index) => (
                <Link key={order.id} href={`/driver/orders/${order.id}`}>
                <Card className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                          <Badge className="bg-green-500 text-white border-0 mt-1">Delivery</Badge>
                        </div>
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
              ))}
            </>
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
      </>
      )}
    </div>
  );
}

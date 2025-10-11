import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, MapPin, Clock, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  'created': 'Pending',
  'confirmed': 'Confirmed',
  'picked_up': 'Picked Up',
  'at_origin_shop': 'At Shop',
  'washing': 'Washing',
  'drying': 'Drying',
  'pressing': 'Pressing',
  'qc': 'Quality Check',
  'packed': 'Packed',
  'out_for_delivery': 'Out for Delivery',
  'delivered': 'Delivered',
  'closed': 'Completed',
};

export default function CustomerDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/customer/orders"],
    refetchInterval: 10000, // Auto-refresh every 10 seconds for real-time updates
  });

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

  const activeOrders = orders.filter(o => o.state !== 'delivered' && o.state !== 'closed');
  const pastOrders = orders.filter(o => o.state === 'delivered' || o.state === 'closed');

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">Track your laundry orders</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* New Order Button */}
      <Link href="/customer/new-order">
        <Button className="w-full mb-6 gap-2" size="lg" data-testid="button-new-order">
          <Plus className="h-5 w-5" />
          Book New Laundry Pickup
        </Button>
      </Link>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
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

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Active Orders</h2>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <Link key={order.id} href={`/customer/orders/${order.id}`}>
                <Card className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                        <Badge className={`${statusColors[order.state] || 'bg-gray-500'} text-white border-0 mt-1`}>
                          {statusLabels[order.state] || order.state}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{((order.totalCents || 0) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{order.addressLine1}, {order.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past Orders */}
      {pastOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Order History</h2>
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <Link key={order.id} href={`/customer/orders/${order.id}`}>
                <Card className="hover-elevate opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                        <Badge variant="secondary" className="mt-1">
                          {statusLabels[order.state] || order.state}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{((order.totalCents || 0) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{order.addressLine1}, {order.city}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">Book your first laundry pickup to get started</p>
            <Link href="/customer/new-order">
              <Button data-testid="button-first-order">Book Now</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

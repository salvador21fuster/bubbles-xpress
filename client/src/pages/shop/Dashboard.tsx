import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, TrendingUp, AlertCircle, Star } from "lucide-react";
import { Link } from "wouter";
import type { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/authUtils";

export default function ShopDashboard() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/shop/orders"],
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o: Order) => ['at_origin_shop', 'at_processing_shop'].includes(o.state)).length,
    processing: orders.filter((o: Order) => ['washing', 'drying', 'pressing', 'qc'].includes(o.state)).length,
    completed: orders.filter((o: Order) => ['packed', 'out_for_delivery', 'delivered'].includes(o.state)).length,
  };

  const totalRevenue = orders.reduce((sum: number, order: Order) => sum + (order.totalCents || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your shop overview</p>
      </div>

      {/* Key Metrics - Uber Eats Manager Style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-revenue">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-green-600 mt-1">+12.3% from last week</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-orders">{stats.total}</div>
            <p className="text-xs text-blue-600 mt-1">+8 new today</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-avg-order">{formatCurrency(avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per order average</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-completion-rate">
              {orders.length > 0 ? Math.round((stats.completed / orders.length) * 100) : 0}%
            </div>
            <p className="text-xs text-green-600 mt-1">Excellent performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600" data-testid="stat-pending">{stats.pending}</div>
            <p className="text-sm text-muted-foreground mt-2">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600" data-testid="stat-processing">{stats.processing}</div>
            <p className="text-sm text-muted-foreground mt-2">Currently processing</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600" data-testid="stat-completed">{stats.completed}</div>
            <p className="text-sm text-muted-foreground mt-2">Ready for delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Link href="/shop/orders">
              <button className="text-sm text-primary hover:underline">View all</button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order: Order) => (
              <Link key={order.id} href={`/shop/orders/${order.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{order.city} • {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : 'Not scheduled'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(order.totalCents || 0)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{order.state.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </Link>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

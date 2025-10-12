import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderCard } from "@/components/OrderCard";
import { Package, Clock, CheckCircle, TrendingUp } from "lucide-react";
import type { Order } from "@shared/schema";

export default function ShopDashboard() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/shop/orders"],
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['at_origin_shop', 'at_processing_shop'].includes(o.state)).length,
    processing: orders.filter(o => ['washing', 'drying', 'pressing', 'qc'].includes(o.state)).length,
    completed: orders.filter(o => ['packed', 'out_for_delivery', 'delivered'].includes(o.state)).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Uber Eats Style Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Shop Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your orders and workflow</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards - Mobile First Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold" data-testid="stat-total-orders">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold" data-testid="stat-pending">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Processing</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold" data-testid="stat-processing">{stats.processing}</div>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-primary" data-testid="stat-completed">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orders.slice(0, 6).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, TrendingUp, AlertCircle, Star, FileText, Users, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  const getStatusBadge = (state: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'created': { label: 'New', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      'confirmed': { label: 'Confirmed', className: 'bg-green-50 text-green-700 border-green-200' },
      'picked_up': { label: 'Picked Up', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      'at_origin_shop': { label: 'At Shop', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      'subcontracted': { label: 'Subcontracted', className: 'bg-orange-50 text-orange-700 border-orange-200' },
      'at_processing_shop': { label: 'At Processing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      'washing': { label: 'Washing', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      'drying': { label: 'Drying', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      'pressing': { label: 'Pressing', className: 'bg-pink-50 text-pink-700 border-pink-200' },
      'qc': { label: 'QC', className: 'bg-violet-50 text-violet-700 border-violet-200' },
      'packed': { label: 'Packed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      'out_for_delivery': { label: 'Out', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      'delivered': { label: 'Delivered', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      'closed': { label: 'Closed', className: 'bg-slate-50 text-slate-700 border-slate-200' },
    };
    return statusConfig[state] || { label: state, className: 'bg-gray-50 text-gray-700' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header - Uber Eats Manager Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your shop overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-export">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics - Uber Eats Manager Style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-revenue">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.3% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-orders">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">+8 new today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-avg-order">{formatCurrency(avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per order average</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
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

      {/* Order Status Breakdown - Uber Eats Style */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-yellow-600" data-testid="stat-pending">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">orders</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Awaiting processing</p>
            <Link href="/shop/orders?status=at_origin_shop">
              <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                View pending orders →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-blue-600" data-testid="stat-processing">{stats.processing}</div>
              <p className="text-sm text-muted-foreground">orders</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Currently processing</p>
            <Link href="/shop/orders?status=washing">
              <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                View in progress →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-green-600" data-testid="stat-completed">{stats.completed}</div>
              <p className="text-sm text-muted-foreground">orders</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Ready for delivery</p>
            <Link href="/shop/orders?status=delivered">
              <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                View completed →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders - Uber Eats Style Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <Link href="/shop/orders">
              <Button variant="outline" size="sm" data-testid="button-view-all-orders">
                View all orders
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {orders.slice(0, 5).map((order: Order) => {
              const status = getStatusBadge(order.state);
              const initials = order.customerFullName
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || '?';

              return (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer transition-all"
                  data-testid={`recent-order-${order.id}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{order.customerFullName || 'Unknown Customer'}</p>
                        <Badge variant="outline" className={`${status.className} border text-xs`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        #{order.id.slice(0, 8)} • {order.city}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(order.totalCents || 0)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not scheduled'}
                    </p>
                  </div>
                </div>
              );
            })}

            {orders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No orders yet</p>
                <p className="text-xs mt-1">Orders will appear here when customers place them</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Uber Eats Style */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm hover-elevate active-elevate-2 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">View Invoices</p>
                <p className="text-xs text-muted-foreground mt-0.5">Access billing records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover-elevate active-elevate-2 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Customer Insights</p>
                <p className="text-xs text-muted-foreground mt-0.5">View customer data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover-elevate active-elevate-2 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Analytics</p>
                <p className="text-xs text-muted-foreground mt-0.5">View performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

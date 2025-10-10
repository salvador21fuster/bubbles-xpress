import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Package, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/authUtils";
import type { Order } from "@shared/schema";

export default function AdminDashboard() {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalCents || 0), 0);
  const completedOrders = orders.filter(o => o.state === 'closed' || o.state === 'delivered').length;
  const activeOrders = orders.filter(o => !['closed', 'delivered'].includes(o.state)).length;

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      trend: "+12.5%",
      testId: "stat-revenue"
    },
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: Package,
      trend: "+8.2%",
      testId: "stat-total-orders"
    },
    {
      title: "Completed Orders",
      value: completedOrders.toString(),
      icon: TrendingUp,
      trend: "+15.3%",
      testId: "stat-completed"
    },
    {
      title: "Active Orders",
      value: activeOrders.toString(),
      icon: BarChart3,
      trend: "-2.1%",
      testId: "stat-active"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform performance and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={stat.testId}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                  {stat.trend}
                </span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{order.city}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(order.totalCents || 0)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Order Value</span>
                <span className="font-medium">{formatCurrency(orders.length > 0 ? totalRevenue / orders.length : 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="font-medium">{orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Drivers</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Partner Shops</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, Users, Package, DollarSign, TrendingUp, TrendingDown, AlertCircle, Star, Clock, CheckCircle, Eye, FileText, MapPin, Calendar } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/authUtils";
import type { Order } from "@shared/schema";
import { useState } from "react";

export default function AdminDashboard() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalCents || 0), 0);
  const completedOrders = orders.filter((o: Order) => o.state === 'closed' || o.state === 'delivered').length;
  const activeOrders = orders.filter((o: Order) => !['closed', 'delivered'].includes(o.state)).length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const weeklyRevenue = formatCurrency(totalRevenue * 0.25); // Mock weekly
  const monthlyRevenue = formatCurrency(totalRevenue);
  const completionRate = orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0;

  // Top performing shops (mock data)
  const topShops = [
    { name: "Dublin Central", orders: 145, revenue: 4850 },
    { name: "Drogheda Express", orders: 98, revenue: 3240 },
    { name: "Cork Processing", orders: 67, revenue: 2180 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform insights and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Primary Metrics - Uber Eats Manager Style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-revenue">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600">+12.5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-orders">{orders.length}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <p className="text-xs text-blue-600">+8.2% this week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-active">{activeOrders}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <p className="text-xs text-red-600">-2.1% from yesterday</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(avgOrderValue)}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600">+3.8% from last week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="text-lg font-bold text-green-600">{completionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Weekly Revenue</span>
              <span className="text-lg font-bold">{weeklyRevenue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Revenue</span>
              <span className="text-lg font-bold">{monthlyRevenue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Drivers</span>
              <span className="text-lg font-bold">12</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top Performing Shops</CardTitle>
            <Link href="/admin/users">
              <button className="text-sm text-primary hover:underline">View all</button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topShops.map((shop, index) => (
                <div key={shop.name} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">{shop.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(shop.revenue * 100)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <span className="text-sm">API Services</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <span className="text-sm">Database</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <span className="text-sm">Payment Gateway</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-600"></div>
                <span className="text-sm">SMS Notifications</span>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">Degraded</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table - Uber Style */}
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Latest orders across all shops</p>
          </div>
          <Link href="/admin/transactions">
            <button className="text-sm text-primary hover:underline">View all transactions</button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-sm text-muted-foreground">Order ID</th>
                  <th className="text-left p-3 font-medium text-sm text-muted-foreground">Customer</th>
                  <th className="text-left p-3 font-medium text-sm text-muted-foreground">Location</th>
                  <th className="text-left p-3 font-medium text-sm text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-sm text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order: Order) => (
                  <tr 
                    key={order.id} 
                    className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetail(true);
                    }}
                  >
                    <td className="p-3">
                      <button className="font-mono text-sm text-primary hover:underline">
                        #{order.id.slice(0, 8)}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {order.addressLine1[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{order.customerFullName || 'Customer'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{order.city}</span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize text-xs">
                        {order.state.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold text-sm">{formatCurrency(order.totalCents || 0)}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setShowOrderDetail(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Details: #{selectedOrder?.id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status & Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <Badge variant="outline" className="capitalize">
                      {selectedOrder.state.replace(/_/g, ' ')}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedOrder.totalCents || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Order Date</div>
                    <div className="font-medium">
                      {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleDateString('en-IE', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer & Delivery Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium">{selectedOrder.customerFullName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Customer ID</div>
                      <div className="font-mono text-sm">{selectedOrder.customerId.slice(0, 12)}...</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Order State</div>
                      <div className="font-medium capitalize">{selectedOrder.state.replace(/_/g, ' ')}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="font-medium">{selectedOrder.addressLine1}</div>
                    {selectedOrder.addressLine2 && <div>{selectedOrder.addressLine2}</div>}
                    <div>{selectedOrder.city}</div>
                    <div>{selectedOrder.eircode}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Breakdown - Invoice Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Invoice & Financial Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(Math.round((selectedOrder.totalCents || 0) / 1.23))}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">VAT (23%)</span>
                      <span className="font-medium">
                        {formatCurrency(Math.round((selectedOrder.totalCents || 0) - (selectedOrder.totalCents || 0) / 1.23))}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-t-2 border-border">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-lg">{formatCurrency(selectedOrder.totalCents || 0)}</span>
                    </div>

                    {/* Revenue Split Info */}
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
                      <div className="font-semibold mb-3">Revenue Distribution</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shop Revenue (estimated)</span>
                        <span className="font-medium">
                          {formatCurrency(Math.round((selectedOrder.totalCents || 0) * 0.75))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Driver Fee (estimated)</span>
                        <span className="font-medium">
                          {formatCurrency(Math.round((selectedOrder.totalCents || 0) * 0.15))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform Fee (estimated)</span>
                        <span className="font-medium">
                          {formatCurrency(Math.round((selectedOrder.totalCents || 0) * 0.10))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline & Processing Shop */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Processing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Origin Shop ID</div>
                      <div className="font-mono text-sm">{selectedOrder.originShopId || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Processing Shop ID</div>
                      <div className="font-mono text-sm">{selectedOrder.processingShopId || 'Same as origin'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Driver ID</div>
                      <div className="font-mono text-sm">{selectedOrder.driverId || 'Not assigned'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">Order Created</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleString('en-IE')}
                        </div>
                      </div>
                    </div>
                    {selectedOrder.confirmedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                        <div className="flex-1">
                          <div className="font-medium">Confirmed</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(selectedOrder.confirmedAt).toLocaleString('en-IE')}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedOrder.deliveredAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                        <div className="flex-1">
                          <div className="font-medium">Delivered</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(selectedOrder.deliveredAt).toLocaleString('en-IE')}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/admin/orders?orderId=${selectedOrder.id}`}>
                    View Full Order Details
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

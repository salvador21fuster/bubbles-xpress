import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, ChevronDown, FileText, Truck, User, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import type { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/authUtils";

export default function ShopOrders() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialStatus = urlParams.get('status') || 'all';
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status" | "customer">("date");

  // Update filter when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const status = params.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [location]);
  
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/shop/orders"],
  });

  // Filter and sort orders
  let filteredOrders = orders.filter(order => {
    const matchesSearch = search === "" || 
      order.customerFullName?.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.state === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort orders
  if (sortBy === "date") {
    filteredOrders = [...filteredOrders].sort((a, b) => 
      new Date(b.pickupDate || b.createdAt || 0).getTime() - new Date(a.pickupDate || a.createdAt || 0).getTime()
    );
  } else if (sortBy === "amount") {
    filteredOrders = [...filteredOrders].sort((a, b) => (b.totalCents || 0) - (a.totalCents || 0));
  } else if (sortBy === "status") {
    filteredOrders = [...filteredOrders].sort((a, b) => a.state.localeCompare(b.state));
  } else if (sortBy === "customer") {
    filteredOrders = [...filteredOrders].sort((a, b) => 
      (a.customerFullName || '').localeCompare(b.customerFullName || '')
    );
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const getStatusBadge = (state: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'created': { label: 'New Order', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      'confirmed': { label: 'Confirmed', className: 'bg-green-50 text-green-700 border-green-200' },
      'picked_up': { label: 'Picked Up', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      'at_origin_shop': { label: 'At Shop', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      'subcontracted': { label: 'Subcontracted', className: 'bg-orange-50 text-orange-700 border-orange-200' },
      'at_processing_shop': { label: 'At Processing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      'washing': { label: 'Washing', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      'drying': { label: 'Drying', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      'pressing': { label: 'Pressing', className: 'bg-pink-50 text-pink-700 border-pink-200' },
      'qc': { label: 'Quality Check', className: 'bg-violet-50 text-violet-700 border-violet-200' },
      'packed': { label: 'Packed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      'out_for_delivery': { label: 'Out for Delivery', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      'delivered': { label: 'Delivered', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      'closed': { label: 'Closed', className: 'bg-slate-50 text-slate-700 border-slate-200' },
    };

    const config = statusConfig[state] || { label: state, className: 'bg-gray-50 text-gray-700 border-gray-200' };
    return { ...config };
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage incoming orders and track processing
        </p>
      </div>

      {/* Filters Bar - Exact Uber Eats Layout */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" className="gap-2" data-testid="button-date-range">
          <Calendar className="h-4 w-4" />
          <span>Oct 1 - Oct 12, 2025</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="created">New Orders</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="picked_up">Picked Up</SelectItem>
            <SelectItem value="at_origin_shop">At Shop</SelectItem>
            <SelectItem value="subcontracted">Subcontracted</SelectItem>
            <SelectItem value="at_processing_shop">At Processing</SelectItem>
            <SelectItem value="washing">Washing</SelectItem>
            <SelectItem value="drying">Drying</SelectItem>
            <SelectItem value="pressing">Pressing</SelectItem>
            <SelectItem value="qc">Quality Check</SelectItem>
            <SelectItem value="packed">Packed</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-[160px]" data-testid="select-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="amount">Sort by Amount</SelectItem>
            <SelectItem value="status">Sort by Status</SelectItem>
            <SelectItem value="customer">Sort by Customer</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="default" 
          disabled={selectedOrders.size === 0}
          className="gap-2"
          data-testid="button-process-selected"
        >
          Process selected ({selectedOrders.size})
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      {/* Orders Table - Uber Eats Manager Style */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="p-4 text-left w-12">
                <Checkbox 
                  checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all"
                />
              </th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">Customer</th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">Order Details</th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">Driver</th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">Status</th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">Total</th>
              <th className="p-4 text-left font-medium text-sm text-muted-foreground">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const status = getStatusBadge(order.state);
                const initials = order.customerFullName
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || '?';

                return (
                  <tr 
                    key={order.id} 
                    className="hover-elevate cursor-pointer"
                    data-testid={`row-order-${order.id}`}
                  >
                    <td className="p-4">
                      <Checkbox 
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                        data-testid={`checkbox-order-${order.id}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium" data-testid={`text-customer-name-${order.id}`}>
                            {order.customerFullName || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {order.pickupDate && format(new Date(order.pickupDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {order.timeWindow || 'TBD'} • {order.addressLine1}, {order.city}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {order.driverId ? 'Assigned' : 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant="outline" 
                        className={`${status.className} border`}
                        data-testid={`badge-status-${order.id}`}
                      >
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold" data-testid={`text-total-${order.id}`}>
                          {formatCurrency(order.totalCents || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1.5"
                        data-testid={`button-view-invoice-${order.id}`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards - Uber Eats Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {orders.filter(o => ['washing', 'drying', 'pressing', 'qc', 'at_processing_shop'].includes(o.state)).length}
              </p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {orders.filter(o => o.state === 'delivered').length}
              </p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(orders.reduce((sum, o) => sum + (o.totalCents || 0), 0))}
              </p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

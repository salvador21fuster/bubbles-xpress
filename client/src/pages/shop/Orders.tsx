import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Filter, MoreVertical } from "lucide-react";
import { Link } from "wouter";
import type { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/authUtils";

export default function ShopOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState("today");
  
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/shop/orders"],
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
                         order.addressLine1.toLowerCase().includes(search.toLowerCase()) ||
                         order.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.state === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      'at_origin_shop': { label: 'At Shop', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'at_processing_shop': { label: 'Processing', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'washing': { label: 'Washing', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
      'drying': { label: 'Drying', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'pressing': { label: 'Pressing', className: 'bg-pink-100 text-pink-800 border-pink-200' },
      'qc': { label: 'Quality Check', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      'packed': { label: 'Packed', className: 'bg-green-100 text-green-800 border-green-200' },
      'delivered': { label: 'Delivered', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };

    const config = statusConfig[state] || { label: state, className: 'bg-gray-100 text-gray-800' };
    return <Badge variant="outline" className={`${config.className} font-medium`}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {filteredOrders.length} results • <button className="text-primary hover:underline" onClick={() => { setSearch(""); setStatusFilter("all"); setDateRange("today"); }}>Reset</button>
        </p>
      </div>

      {/* Filters Bar - Uber Eats Style */}
      <div className="flex flex-wrap gap-3">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]" data-testid="select-date-range">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="at_origin_shop">At Shop</SelectItem>
            <SelectItem value="at_processing_shop">Processing</SelectItem>
            <SelectItem value="washing">Washing</SelectItem>
            <SelectItem value="drying">Drying</SelectItem>
            <SelectItem value="pressing">Pressing</SelectItem>
            <SelectItem value="qc">Quality Check</SelectItem>
            <SelectItem value="packed">Packed</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="pl-9"
            data-testid="input-search-orders"
          />
        </div>

        <Button variant="ghost" size="icon" data-testid="button-more-filters">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
          <p className="text-sm font-medium text-primary">
            {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Export</Button>
            <Button size="sm" variant="outline">Mark as Processed</Button>
            <Button size="sm" variant="outline">Assign Driver</Button>
          </div>
        </div>
      )}

      {/* Orders Table - Uber Eats Manager Style */}
      <Card className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-sm">
                  <Checkbox
                    checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                </th>
                <th className="text-left p-4 font-medium text-sm">Customer</th>
                <th className="text-left p-4 font-medium text-sm">Order ID</th>
                <th className="text-left p-4 font-medium text-sm">Delivery Type</th>
                <th className="text-left p-4 font-medium text-sm">Location / Time</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
                <th className="text-right p-4 font-medium text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="border-b hover:bg-muted/30 transition-colors"
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
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {order.addressLine1[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">Customer</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Link href={`/shop/orders/${order.id}`}>
                      <button className="font-mono text-sm text-primary hover:underline">
                        #{order.id.slice(0, 8)}
                      </button>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">Delivery • Laundry</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="font-medium">{order.city}</p>
                      <p className="text-muted-foreground text-xs">
                        {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : 'Not scheduled'}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order.state)}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold text-sm">{formatCurrency(order.totalCents || 0)}</span>
                    <p className="text-xs text-muted-foreground">+{formatCurrency((order.totalCents || 0) * 0.05)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </Card>
    </div>
  );
}

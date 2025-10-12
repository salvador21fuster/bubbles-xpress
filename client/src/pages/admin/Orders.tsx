import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/authUtils";
import { format } from "date-fns";
import type { Order } from "@shared/schema";

export default function AdminOrders() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("2020/1/25 - 2025/12/25");
  const [storeFilter, setStoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const toggleOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const getStatusBadge = (state: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'created': { label: 'Onboarding', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'picked_up': { label: 'In Transit', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'at_origin_shop': { label: 'Processing', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'processing': { label: 'Processing', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'delivered': { label: 'Dispatched', className: 'bg-green-100 text-green-800 border-green-200' },
      'closed': { label: 'Completed', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    return statusMap[state] || { label: 'Unknown', className: 'bg-gray-100 text-gray-800' };
  };

  const getOrderType = (order: Order) => {
    return order.pickupDate ? 'Pickup' : 'Delivery';
  };

  // Filter and sort orders
  let filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === "" || 
      order.customerFullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Store filter (would need shop names from API in real implementation)
    const matchesStore = storeFilter === "all" || true; // TODO: Implement actual store filtering
    
    return matchesSearch && matchesStore;
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

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-orders">Orders</h1>
      </div>

      {/* Filters Bar - Uber Eats Manager Style */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Date Range Picker */}
        <Button variant="outline" className="gap-2" data-testid="button-date-range">
          <Calendar className="h-4 w-4" />
          {dateRange}
          <ChevronDown className="h-4 w-4" />
        </Button>

        {/* All Stores Filter */}
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-store-filter">
            <SelectValue placeholder="All stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stores</SelectItem>
            <SelectItem value="dublin">Dublin Central</SelectItem>
            <SelectItem value="drogheda">Drogheda Express</SelectItem>
            <SelectItem value="cork">Cork Processing</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[120px]" data-testid="select-sort">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>

        {/* Store Selected Button */}
        <Button 
          variant="default" 
          className="rounded-full"
          disabled={selectedOrders.length === 0}
          data-testid="button-store-selected"
        >
          Store selected ({selectedOrders.length})
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredOrders.length}</span> results
          {searchQuery && (
            <>
              {" "}· <button 
                className="text-primary hover:underline" 
                onClick={() => setSearchQuery("")}
                data-testid="button-reset"
              >
                Reset
              </button>
            </>
          )}
        </div>
        <Button variant="ghost" size="sm" data-testid="button-include-orders">
          Include orders (0)
        </Button>
      </div>

      {/* Orders Table - Uber Eats Manager Style */}
      <Card className="border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="p-4 text-left w-12">
                  <Checkbox 
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onCheckedChange={toggleAll}
                    data-testid="checkbox-select-all"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Customer</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Order</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Shop</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-right text-sm font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status = getStatusBadge(order.state);
                  const orderType = getOrderType(order);
                  const initials = order.customerFullName
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || '?';

                  return (
                    <tr 
                      key={order.id} 
                      className="border-b hover-elevate transition-colors"
                      data-testid={`row-order-${order.id}`}
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => toggleOrder(order.id)}
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
                        <div className="text-sm" data-testid={`text-order-type-${order.id}`}>
                          {orderType} - Mr Bubbles
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm font-medium">
                            {order.processingShopId ? 'Processing Center' : 'Pending Assignment'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.pickupDate && format(new Date(order.pickupDate), 'MM/dd/yy')} at {order.timeWindow || 'TBD'}
                          </div>
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
                      <td className="p-4 text-right">
                        <div className="font-semibold" data-testid={`text-amount-${order.id}`}>
                          {formatCurrency(order.totalCents || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          +{formatCurrency((order.totalCents || 0) * 0.1)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { OrderCard } from "@/components/OrderCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Order } from "@shared/schema";

export default function ShopOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
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
        <h1 className="text-2xl font-bold">All Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage all orders</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Filter - Mobile First */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, address, or city..."
              className="pl-10 rounded-lg"
              data-testid="input-search-orders"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-lg" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="at_origin_shop">At Origin Shop</SelectItem>
              <SelectItem value="at_processing_shop">At Processing</SelectItem>
              <SelectItem value="washing">Washing</SelectItem>
              <SelectItem value="drying">Drying</SelectItem>
              <SelectItem value="pressing">Pressing</SelectItem>
              <SelectItem value="qc">Quality Check</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

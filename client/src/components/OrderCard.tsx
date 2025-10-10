import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatDate } from "@/lib/authUtils";
import { Package, MapPin, Calendar } from "lucide-react";
import type { Order } from "@shared/schema";

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <Card 
      className={`hover-elevate ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      data-testid={`card-order-${order.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-mono text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
            <p className="text-lg font-semibold">{formatCurrency(order.totalCents || 0, order.currency || 'EUR')}</p>
          </div>
        </div>
        <StatusBadge status={order.state} />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{order.addressLine1}, {order.city}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(order.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

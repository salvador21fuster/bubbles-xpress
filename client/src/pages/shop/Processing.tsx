import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Wind, Sparkles, CheckSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function ShopProcessing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/shop/orders"],
  });

  const washingOrders = orders.filter(o => o.state === 'at_origin_shop' || o.state === 'at_processing_shop');
  const dryingOrders = orders.filter(o => o.state === 'washing');
  const pressingOrders = orders.filter(o => o.state === 'drying');
  const qcOrders = orders.filter(o => o.state === 'pressing');

  const updateStateMutation = useMutation({
    mutationFn: async ({ orderId, newState }: { orderId: string; newState: string }) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}/state`, { state: newState });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/orders"] });
      toast({
        title: "Status Updated",
        description: "Order moved to next stage",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const ProcessingColumn = ({ 
    title, 
    icon: Icon, 
    orders, 
    currentState, 
    nextState,
    color 
  }: { 
    title: string; 
    icon: any; 
    orders: Order[]; 
    currentState: string;
    nextState: string;
    color: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{orders.length}</Badge>
      </div>
      <div className="space-y-2">
        {orders.map((order) => (
          <Card key={order.id} className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                <Badge className="bg-status-processing text-white border-0">Processing</Badge>
              </div>
              <p className="text-sm mb-3">{order.addressLine1}, {order.city}</p>
              <Button 
                size="sm" 
                className="w-full" 
                onClick={() => updateStateMutation.mutate({ orderId: order.id, newState: nextState })}
                disabled={updateStateMutation.isPending}
                data-testid={`button-move-${order.id}`}
              >
                Move to {nextState === 'washing' ? 'Washing' : nextState === 'drying' ? 'Drying' : nextState === 'pressing' ? 'Pressing' : 'QC'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Processing Board</h1>
        <p className="text-muted-foreground">Manage workflow stages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProcessingColumn
          title="Washing"
          icon={Droplets}
          orders={washingOrders}
          currentState="at_origin_shop"
          nextState="washing"
          color="text-blue-500"
        />
        <ProcessingColumn
          title="Drying"
          icon={Wind}
          orders={dryingOrders}
          currentState="washing"
          nextState="drying"
          color="text-cyan-500"
        />
        <ProcessingColumn
          title="Pressing"
          icon={Sparkles}
          orders={pressingOrders}
          currentState="drying"
          nextState="pressing"
          color="text-orange-500"
        />
        <ProcessingColumn
          title="Quality Check"
          icon={CheckSquare}
          orders={qcOrders}
          currentState="pressing"
          nextState="qc"
          color="text-green-500"
        />
      </div>
    </div>
  );
}

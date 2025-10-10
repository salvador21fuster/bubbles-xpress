import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package } from "lucide-react";
import type { Service, Order } from "@shared/schema";
import { WashingMachineLoader } from "@/components/WashingMachineLoader";
import { useLoadingAction } from "@/hooks/use-loading-action";

const orderSchema = z.object({
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  eircode: z.string().optional(),
  serviceId: z.string().min(1, "Please select a service"),
  quantity: z.string().min(1, "Quantity is required"),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function NewOrder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isLoading, withLoading } = useLoadingAction();

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      eircode: '',
      serviceId: '',
      quantity: '1',
      notes: '',
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const response = await apiRequest("POST", "/api/orders", {
        customer: { email: 'customer@example.com' },
        address: {
          line1: data.addressLine1,
          line2: data.addressLine2,
          city: data.city,
          eircode: data.eircode,
        },
        services: [{
          service_id: data.serviceId,
          quantity: parseFloat(data.quantity),
        }],
        payment_method: 'card',
        notes: data.notes,
      });
      return response as Order;
    },
    onSuccess: (order: Order) => {
      toast({
        title: "Order Created!",
        description: `Order #${order.id.slice(0, 8)} has been created successfully.`,
      });
      navigate(`/customer/orders/${order.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to create order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    await withLoading(async () => {
      return new Promise<void>((resolve, reject) => {
        createOrderMutation.mutate(data, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    });
  };

  const selectedService = services.find(s => s.serviceId === form.watch('serviceId'));
  const quantity = parseFloat(form.watch('quantity') || '0');
  const subtotal = selectedService ? parseFloat(selectedService.pricePerUnit) * quantity : 0;
  const vat = subtotal * 0.23;
  const total = subtotal + vat;

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <WashingMachineLoader isVisible={isLoading} />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/customer')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold mb-2">New Laundry Order</h1>
          <p className="text-muted-foreground">Book a pickup for your laundry</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.serviceId}>
                              {service.name} - €{service.pricePerUnit}/{service.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity ({selectedService?.unit || 'units'})</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          min="0.1"
                          placeholder="e.g., 5" 
                          {...field}
                          data-testid="input-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedService && quantity > 0 && (
                  <div className="bg-muted p-4 rounded-md space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>VAT (23%):</span>
                      <span>€{vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span>Total:</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pickup Address */}
            <Card>
              <CardHeader>
                <CardTitle>Pickup Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} data-testid="input-address1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apt 4B" {...field} data-testid="input-address2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Dublin" {...field} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eircode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eircode (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="D01 XY45" {...field} data-testid="input-eircode" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Leave at reception, Ring doorbell twice" 
                          {...field}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={createOrderMutation.isPending}
              data-testid="button-submit-order"
            >
              {createOrderMutation.isPending ? 'Creating Order...' : 'Book Pickup'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

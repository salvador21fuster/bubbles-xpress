import { useState, useEffect } from "react";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, Users, User as UserIcon, Calendar, Clock, Sparkles } from "lucide-react";
import type { Service, Order, User } from "@shared/schema";
import { WashingMachineLoader } from "@/components/WashingMachineLoader";
import { useLoadingAction } from "@/hooks/use-loading-action";

const orderSchema = z.object({
  // Customer contact
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  
  // Pickup schedule
  pickupDate: z.string().min(1, "Pickup date is required"),
  timeWindow: z.string().min(1, "Please select a time window"),
  
  // Address
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  eircode: z.string().optional(),
  
  // Service
  serviceId: z.string().min(1, "Please select a service"),
  quantity: z.string().min(1, "Quantity is required"),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function NewOrder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isLoading, withLoading } = useLoadingAction();

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: activeDrivers = [] } = useQuery<User[]>({
    queryKey: ["/api/drivers/active"],
  });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      fullName: '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      pickupDate: '',
      timeWindow: '',
      addressLine1: '',
      addressLine2: '',
      city: 'Drogheda, Louth',
      eircode: '',
      serviceId: '',
      quantity: '1',
      notes: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      if (currentUser.email) form.setValue('email', currentUser.email);
      if (currentUser.phone) form.setValue('phone', currentUser.phone);
    }
  }, [currentUser, form]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const response = await apiRequest("POST", "/api/orders", {
        customer: { 
          id: currentUser?.id,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
        },
        address: {
          line1: data.addressLine1,
          line2: data.addressLine2,
          city: data.city,
          eircode: data.eircode,
        },
        pickupDate: data.pickupDate,
        timeWindow: data.timeWindow,
        services: [{
          service_id: data.serviceId,
          quantity: parseFloat(data.quantity),
        }],
        payment_method: 'card',
        notes: data.notes,
      });
      return await response.json() as Order;
    },
    onSuccess: (order: Order) => {
      // Invalidate customer orders cache so new order appears in history
      queryClient.invalidateQueries({ queryKey: ["/api/customer/orders"] });
      
      toast({
        title: "Order Created!",
        description: "Redirecting to payment...",
      });
      navigate(`/customer/payment?orderId=${order.id}`);
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

        {/* Active Drivers */}
        {activeDrivers.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Drivers ({activeDrivers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                These drivers are currently online and available to collect your laundry
              </p>
              <div className="space-y-2">
                {activeDrivers.map((driver) => (
                  <div 
                    key={driver.id} 
                    className="flex items-center gap-3 p-2 rounded-md bg-muted"
                    data-testid={`driver-${driver.id}`}
                  >
                    <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {driver.firstName} {driver.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Online • Ready for pickup
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Your Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-fullname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+353 87 123 4567" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pickup Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Pickup Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-pickup-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeWindow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Window</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-time-window">
                              <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="9-12">9:00 AM - 12:00 PM</SelectItem>
                            <SelectItem value="12-3">12:00 PM - 3:00 PM</SelectItem>
                            <SelectItem value="3-6">3:00 PM - 6:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
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
                        <FormLabel>City (Pilot Area)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-city">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Drogheda, Louth">Drogheda, Louth</SelectItem>
                          </SelectContent>
                        </Select>
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

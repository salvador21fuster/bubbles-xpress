import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";
import type { Order, Invoice } from "@shared/schema";
import { WashingMachineLoader } from "@/components/WashingMachineLoader";

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(19),
  cardName: z.string().min(1, "Cardholder name is required"),
  expiryMonth: z.string().min(2, "Required").max(2),
  expiryYear: z.string().min(2, "Required").max(2),
  cvv: z.string().min(3, "CVV must be 3-4 digits").max(4),
  billingAddress: z.string().min(1, "Billing address is required"),
  billingCity: z.string().min(1, "City is required"),
  billingPostcode: z.string().min(1, "Postcode is required"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function Payment() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get order ID from URL
  const orderId = new URLSearchParams(window.location.search).get("orderId");

  const { data: order, isLoading: orderLoading } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const { data: invoice, isLoading: invoiceLoading } = useQuery<Invoice>({
    queryKey: ["/api/orders", orderId, "invoice"],
    enabled: !!orderId,
  });

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      billingAddress: '',
      billingCity: '',
      billingPostcode: '',
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const response = await apiRequest("POST", "/api/payment/process", {
        orderId,
        invoiceId: invoice?.id,
        paymentDetails: data,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful!",
        description: "Your order has been confirmed and is being processed.",
      });
      navigate(`/customer/orders/${orderId}`);
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      processPaymentMutation.mutate(data);
      setIsProcessing(false);
    }, 2000);
  };

  if (!orderId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No order found</p>
            <Button onClick={() => navigate("/customer")} className="w-full mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderLoading || invoiceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WashingMachineLoader isVisible={true} />
      </div>
    );
  }

  if (!order || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Order or invoice not found</p>
            <Button onClick={() => navigate("/customer")} className="w-full mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = (invoice.subtotalCents || 0) / 100;
  const vat = (invoice.vatCents || 0) / 100;
  const total = (invoice.totalCents || 0) / 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/customer/orders/${orderId}`)}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono">#{order.id.slice(0, 8)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Pickup Address</p>
                <p className="text-sm">{order.addressLine1}</p>
                {order.addressLine2 && <p className="text-sm">{order.addressLine2}</p>}
                <p className="text-sm">{order.city} {order.eircode}</p>
              </div>

              {order.pickupDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Schedule</p>
                  <p className="text-sm">{order.pickupDate}</p>
                  <p className="text-sm">{order.timeWindow}</p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT (23%)</span>
                  <span>€{vat.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            {...field}
                            data-testid="input-card-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            data-testid="input-card-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="MM"
                              maxLength={2}
                              {...field}
                              data-testid="input-expiry-month"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiryYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="YY"
                              maxLength={2}
                              {...field}
                              data-testid="input-expiry-year"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123"
                              maxLength={4}
                              type="password"
                              {...field}
                              data-testid="input-cvv"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="billingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main Street"
                            {...field}
                            data-testid="input-billing-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="billingCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dublin"
                              {...field}
                              data-testid="input-billing-city"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billingPostcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postcode</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="D02 XY45"
                              {...field}
                              data-testid="input-billing-postcode"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isProcessing || processPaymentMutation.isPending}
                    data-testid="button-pay-now"
                  >
                    {isProcessing || processPaymentMutation.isPending ? (
                      <>
                        <Lock className="h-4 w-4 mr-2 animate-pulse" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay €{total.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    <Lock className="h-3 w-3 inline mr-1" />
                    Your payment is secure and encrypted
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

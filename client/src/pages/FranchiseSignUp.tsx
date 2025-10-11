import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import logoImage from "@assets/1800302f-8921-4957-8c39-3059183e7401_1760066658468.jpg";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  username: z.string().min(3, "Username must be at least 3 characters").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  franchiseName: z.string().min(3, "Franchise name is required"),
  subscriptionTier: z.enum(["free", "silver", "gold"]),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
});

type SignUpForm = z.infer<typeof signUpSchema>;

const tiers = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    fee: 25,
    features: [
      "Limited access",
      "25% fee to Mr Bubbles",
      "Basic dashboard access",
      "Standard support"
    ],
    color: "border-gray-300"
  },
  {
    id: "silver",
    name: "Silver",
    monthlyPrice: 99,
    yearlyPrice: 750,
    fee: 15,
    features: [
      "All training materials",
      "Equipment & clothing",
      "Accessories included",
      "15% fee to Mr Bubbles",
      "Priority support"
    ],
    color: "border-blue-500"
  },
  {
    id: "gold",
    name: "Gold",
    monthlyPrice: 299,
    yearlyPrice: 2500,
    fee: 5,
    features: [
      "Ultimate access",
      "Premium training",
      "All equipment & clothing",
      "Marketing materials",
      "5% fee to Mr Bubbles",
      "24/7 premium support"
    ],
    color: "border-yellow-500"
  }
];

export default function FranchiseSignUp() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"details" | "tier" | "payment">("details");
  const [selectedTier, setSelectedTier] = useState<string>("free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      phone: "",
      password: "",
      firstName: "",
      lastName: "",
      franchiseName: "",
      subscriptionTier: "free",
      billingCycle: "monthly",
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpForm) => {
      const response = await apiRequest("POST", "/api/auth/franchise-signup", {
        ...data,
        role: "franchise"
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Franchise account created!",
        description: "Welcome to Mr Bubbles Express.",
      });
      
      window.location.href = '/franchise';
    },
    onError: (error: any) => {
      toast({
        title: "Sign up failed",
        description: error.message || "Unable to create account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignUpForm) => {
    signUpMutation.mutate(data);
  };

  const handleDetailsNext = async () => {
    const detailFields = ["firstName", "lastName", "phone", "email", "username", "password", "franchiseName"];
    const isValid = await form.trigger(detailFields as any);
    if (isValid) {
      setStep("tier");
    }
  };

  const handleTierNext = () => {
    form.setValue("subscriptionTier", selectedTier as any);
    form.setValue("billingCycle", selectedTier === "free" ? undefined : billingCycle);
    
    if (selectedTier === "free") {
      form.handleSubmit(onSubmit)();
    } else {
      setStep("payment");
    }
  };

  const handlePaymentSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  const getCurrentPrice = () => {
    const tier = tiers.find(t => t.id === selectedTier);
    if (!tier || tier.id === "free") return 0;
    return billingCycle === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src={logoImage} 
            alt="Mr Bubbles Express" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Franchise Partner Sign Up</h1>
          <p className="text-muted-foreground mt-2">Join the Mr Bubbles Express network</p>
        </div>

        {/* Step 1: Account Details */}
        {step === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Create your franchise partner account</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="franchiseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchise Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Dublin City Laundry" data-testid="input-franchise-name" />
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
                          <Input {...field} type="tel" placeholder="+353 XX XXX XXXX" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={handleDetailsNext}
                    data-testid="button-next-to-tier"
                  >
                    Next: Choose Subscription
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Tier Selection */}
        {step === "tier" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Subscription Tier</CardTitle>
                <CardDescription>Select the plan that fits your franchise needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {tiers.map((tier) => (
                    <Card 
                      key={tier.id}
                      className={`cursor-pointer transition-all ${
                        selectedTier === tier.id 
                          ? `ring-2 ${tier.color.replace('border', 'ring')}` 
                          : 'hover-elevate'
                      }`}
                      onClick={() => setSelectedTier(tier.id)}
                      data-testid={`card-tier-${tier.id}`}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {tier.name}
                          {selectedTier === tier.id && <Check className="w-5 h-5 text-primary" />}
                        </CardTitle>
                        {tier.id !== "free" && (
                          <CardDescription className="text-2xl font-bold">
                            €{billingCycle === "monthly" ? tier.monthlyPrice : tier.yearlyPrice}
                            <span className="text-sm font-normal">/{billingCycle === "monthly" ? "month" : "year"}</span>
                          </CardDescription>
                        )}
                        {tier.id === "free" && (
                          <CardDescription className="text-2xl font-bold">Free</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedTier !== "free" && (
                  <div className="mb-6">
                    <Label className="mb-3 block font-semibold">Billing Cycle</Label>
                    <RadioGroup value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" data-testid="radio-monthly" />
                        <Label htmlFor="monthly" className="cursor-pointer">
                          Monthly billing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="yearly" data-testid="radio-yearly" />
                        <Label htmlFor="yearly" className="cursor-pointer">
                          Yearly billing (Save money!)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep("details")}
                    data-testid="button-back-to-details"
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    className="flex-1" 
                    onClick={handleTierNext}
                    data-testid="button-next-to-payment"
                  >
                    {selectedTier === "free" ? "Complete Sign Up" : "Proceed to Payment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Fake Payment */}
        {step === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Complete your subscription payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="flex justify-between items-center">
                  <span>{tiers.find(t => t.id === selectedTier)?.name} Plan ({billingCycle})</span>
                  <span className="text-xl font-bold">€{getCurrentPrice()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456" 
                    defaultValue="4242 4242 4242 4242"
                    data-testid="input-card-number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input 
                      id="expiry" 
                      placeholder="MM/YY" 
                      defaultValue="12/25"
                      data-testid="input-expiry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      id="cvv" 
                      placeholder="123" 
                      defaultValue="123"
                      data-testid="input-cvv"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input 
                    id="cardName" 
                    placeholder="John Doe"
                    defaultValue={`${form.getValues("firstName")} ${form.getValues("lastName")}`}
                    data-testid="input-card-name"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Test Mode:</strong> This is a simulated payment. No real charges will be made. 
                  Stripe integration coming soon!
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep("tier")}
                  data-testid="button-back-to-tier"
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  className="flex-1" 
                  onClick={handlePaymentSubmit}
                  disabled={signUpMutation.isPending}
                  data-testid="button-submit-payment"
                >
                  {signUpMutation.isPending ? "Processing..." : `Pay €${getCurrentPrice()}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

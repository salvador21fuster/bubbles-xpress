import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Clock, MapPin, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/1800302f-8921-4957-8c39-3059183e7401_1760066658468.jpg";

export default function CustomerAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign in failed");
      }

      const user = await response.json();
      
      if (user.role !== "customer") {
        throw new Error("This account is not registered as a customer");
      }

      toast({
        title: "Welcome back!",
        description: "Signed in successfully",
      });

      setLocation("/customer");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block">
          <div className="mb-8">
            <img 
              src={logoImage} 
              alt="Mr Bubbles Express" 
              className="h-16 w-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Laundry made simple
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Professional laundry service delivered to your door
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: ShoppingBag, text: "Easy online booking" },
              { icon: Clock, text: "Same-day pickup & delivery" },
              { icon: MapPin, text: "Track your order in real-time" },
              { icon: Star, text: "Premium quality service" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth Card */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="md:hidden mb-4">
              <img 
                src={logoImage} 
                alt="Mr Bubbles Express" 
                className="h-12 w-auto mx-auto"
              />
            </div>
            <CardTitle className="text-2xl">Customer Sign In</CardTitle>
            <CardDescription>Access your orders and account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer1@test.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>

              <Button 
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
                data-testid="button-customer-signin"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Test Account: customer1@test.com / test123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

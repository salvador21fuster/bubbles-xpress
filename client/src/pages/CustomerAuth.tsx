import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, Clock, Shield } from "lucide-react";
import logoImage from "@assets/1800302f-8921-4957-8c39-3059183e7401_1760066658468.jpg";

export default function CustomerAuth() {
  const handleSignIn = () => {
    window.location.href = "/api/login?role=customer";
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
              Welcome to Mr Bubbles Express
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your laundry, delivered fresh and clean in 24 hours
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Package, text: "Book pickups in 60 seconds" },
              { icon: Clock, text: "24-hour turnaround time" },
              { icon: CheckCircle, text: "Track orders in real-time" },
              { icon: Shield, text: "Secure payment & delivery" },
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
            <CardTitle className="text-2xl">Customer Portal</CardTitle>
            <CardDescription>Sign in to manage your laundry orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full h-12 text-base"
              onClick={handleSignIn}
              data-testid="button-customer-signin"
            >
              Sign In with Replit
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  New customer?
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 text-base"
              onClick={handleSignIn}
              data-testid="button-customer-signup"
            >
              Create Account
            </Button>

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

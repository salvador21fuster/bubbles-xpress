import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Truck, Package, CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/1800302f-8921-4957-8c39-3059183e7401_1760066658468.jpg";
import { BubblesBackground } from "@/components/BubblesBackground";
import { WashingMachineLoader } from "@/components/WashingMachineLoader";

export default function Landing() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    addressLine1: '',
    city: '',
    eircode: '',
    service: '',
    notes: '',
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: typeof bookingData) => {
      setIsLoading(true);
      try {
        return await apiRequest("POST", "/api/orders", {
          customer: { id: 'guest' },
          address: {
            line1: data.addressLine1,
            city: data.city,
            eircode: data.eircode,
          },
          services: [{ service_id: data.service, qty: 1 }],
          payment_method: 'card',
          notes: data.notes,
        });
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    },
    onSuccess: () => {
      toast({
        title: "Booking Submitted!",
        description: "We'll contact you shortly to confirm your order.",
      });
      setBookingData({ addressLine1: '', city: '', eircode: '', service: '', notes: '' });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookingMutation.mutate(bookingData);
  };

  return (
    <div className="min-h-screen">
      <WashingMachineLoader isVisible={isLoading} />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 overflow-hidden">
        <BubblesBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Ireland's Premier Laundry Service</span>
          </div>
          <div className="mb-8 flex justify-center">
            <img 
              src={logoImage} 
              alt="Mr Bubbles Laundry & Linen Specialist" 
              className="h-32 md:h-40 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-lg">
            Professional laundry collection, processing, and delivery. Book your pickup in seconds.
          </p>
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="gap-2 bg-white text-primary hover:bg-white/90 border-white shadow-xl" 
                asChild
              >
                <a href="#booking" data-testid="button-book-now">
                  Book Now <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 bg-white/10 backdrop-blur-sm text-white border-white/50 hover:bg-white/20" 
                asChild
              >
                <a href="/api/login?role=customer" data-testid="button-login-customer">
                  <Package className="h-5 w-5 mr-2" />
                  Customer Login
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 bg-white/10 backdrop-blur-sm text-white border-white/50 hover:bg-white/20" 
                asChild
              >
                <a href="/api/login?role=driver" data-testid="button-login-driver">
                  <Truck className="h-5 w-5 mr-2" />
                  Driver Login
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Package, title: "Book Online", desc: "Schedule your pickup in 60 seconds" },
              { icon: Truck, title: "We Collect", desc: "Driver picks up and weighs your laundry" },
              { icon: Sparkles, title: "We Clean", desc: "Professional processing at our facilities" },
              { icon: CheckCircle, title: "We Deliver", desc: "Fresh, clean laundry back to your door" },
            ].map((step, i) => (
              <Card key={i} className="text-center hover-elevate">
                <CardHeader>
                  <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Widget */}
      <section id="booking" className="py-20 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Book Your Pickup</CardTitle>
              <CardDescription>Fill in your details and we'll handle the rest</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={bookingData.addressLine1}
                    onChange={(e) => setBookingData({ ...bookingData, addressLine1: e.target.value })}
                    placeholder="123 Main Street"
                    required
                    data-testid="input-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={bookingData.city}
                      onChange={(e) => setBookingData({ ...bookingData, city: e.target.value })}
                      placeholder="Drogheda"
                      required
                      data-testid="input-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eircode">Eircode</Label>
                    <Input
                      id="eircode"
                      value={bookingData.eircode}
                      onChange={(e) => setBookingData({ ...bookingData, eircode: e.target.value })}
                      placeholder="A92 X7Y8"
                      data-testid="input-eircode"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Type</Label>
                  <Select value={bookingData.service} onValueChange={(val) => setBookingData({ ...bookingData, service: val })}>
                    <SelectTrigger id="service" data-testid="select-service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="svc_laundry_kg">Laundry (per kg)</SelectItem>
                      <SelectItem value="svc_dry_clean">Dry Cleaning</SelectItem>
                      <SelectItem value="svc_shirt_press">Shirt Press</SelectItem>
                      <SelectItem value="svc_iron">Ironing Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Any special requests or instructions"
                    data-testid="textarea-notes"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={bookingMutation.isPending} data-testid="button-submit-booking">
                  {bookingMutation.isPending ? "Submitting..." : "Submit Booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="text-xl">Become a Driver</CardTitle>
              <CardDescription>Flexible hours, great earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join our driver network and earn on your schedule. Full training and equipment provided.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/api/login" data-testid="link-driver-signup">Apply Now</a>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="text-xl">Partner Launderette</CardTitle>
              <CardDescription>Grow your business with us</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join Ireland's premier laundry network. Access to more customers and streamlined operations.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/api/login" data-testid="link-franchise-signup">Learn More</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Mr Bubbles Express. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

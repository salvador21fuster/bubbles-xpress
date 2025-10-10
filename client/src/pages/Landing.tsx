import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Truck, Package, CheckCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/1800302f-8921-4957-8c39-3059183e7401_1760066658468.jpg";
import heroImage from "@assets/aae38cdd-27b3-45da-865a-20f84aaf2aa7_1760102196289.jpg";
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
          customer: { email: 'guest@example.com' },
          address: {
            line1: data.addressLine1,
            city: data.city,
            eircode: data.eircode,
          },
          services: [{ service_id: data.service, quantity: 1 }],
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
    <div className="min-h-screen bg-[#F5EDE4]">
      <WashingMachineLoader isVisible={isLoading} />
      
      {/* Top Bar */}
      <div className="bg-[#2D2D2D] text-white py-2 px-4 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-xs md:text-sm">
          <span className="inline-block">
            Professional Laundry & Dry Cleaning Service • 24-Hour Turnaround • Serving Ireland & 20+ Cities • Wash, Dry & Fold • Ironing Service • Dry Cleaning • Bedding & Duvet Cleaning • Alterations & Repairs • Shoe Repair • Eco-Friendly Products • Free Collection & Delivery • Trusted by 2,000+ Irish Customers • 5-Star Rated • Over 50,000 Garments Cleaned • Professional Equipment • Expert Care • 
          </span>
          <span className="inline-block">
            Professional Laundry & Dry Cleaning Service • 24-Hour Turnaround • Serving Ireland & 20+ Cities • Wash, Dry & Fold • Ironing Service • Dry Cleaning • Bedding & Duvet Cleaning • Alterations & Repairs • Shoe Repair • Eco-Friendly Products • Free Collection & Delivery • Trusted by 2,000+ Irish Customers • 5-Star Rated • Over 50,000 Garments Cleaned • Professional Equipment • Expert Care • 
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={logoImage} 
                alt="Mr Bubbles Express" 
                className="h-12 w-auto object-contain"
                data-testid="logo-image"
              />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-gray-700 hover:text-primary" data-testid="nav-services">SERVICES</a>
              <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-primary" data-testid="nav-pricing">PRICES</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-primary" data-testid="nav-how-it-works">HOW IT WORKS</a>
              <a href="/signin" className="text-sm font-medium text-gray-700 hover:text-primary" data-testid="nav-login">SIGN IN</a>
              <Button 
                className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 font-semibold px-6"
                asChild
              >
                <a href="#booking" data-testid="nav-book-now">BOOK NOW</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="pt-16 md:pt-24 pb-0 bg-cover bg-no-repeat relative min-h-[600px]"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: 'center center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 relative z-10 h-full">
          <div className="grid md:grid-cols-2 gap-12 items-center h-full">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Laundry, Dry Cleaning & Ironing – Done in 24 Hours
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Now serving Ireland & 20+ cities. Over 50,000 garments cleaned. 5-star rated by 2,000+ locals.
              </p>
              <Button 
                size="lg" 
                className="bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90 px-8 py-6 text-lg font-semibold"
                asChild
              >
                <a href="#booking" data-testid="button-schedule-pickup">
                  SCHEDULE YOUR PICKUP
                  <span className="ml-2 text-xs block">IN NEXT 60 MINUTES</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-[#2D2D2D] text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">A Trusted Choice for Laundry Services</h3>
            <p className="text-sm opacity-90">Expert in Dry Cleaning • Bedding • Wash, Dry & Fold, Ironing, Alteration, Shoe Repair and more</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Package, title: "Book Online", desc: "Schedule your pickup in 60 seconds" },
              { icon: Truck, title: "We Collect", desc: "Driver picks up and weighs your laundry" },
              { icon: Sparkles, title: "We Clean", desc: "Professional processing at our facilities" },
              { icon: CheckCircle, title: "We Deliver", desc: "Fresh, clean laundry back to your door" },
            ].map((step, i) => (
              <Card key={i} className="text-center hover-elevate bg-[#F5EDE4] border-gray-200">
                <CardHeader>
                  <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Widget */}
      <section id="booking" className="py-20 px-4 bg-[#F5EDE4]">
        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-200">
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
                      placeholder="Dublin"
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
                      <SelectItem value="svc_laundry_kg" data-testid="select-option-laundry">Laundry (per kg)</SelectItem>
                      <SelectItem value="svc_dry_clean" data-testid="select-option-dry-clean">Dry Cleaning</SelectItem>
                      <SelectItem value="svc_shirt_press" data-testid="select-option-shirt-press">Shirt Press</SelectItem>
                      <SelectItem value="svc_iron" data-testid="select-option-ironing">Ironing Service</SelectItem>
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
                <Button 
                  type="submit" 
                  className="w-full bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90" 
                  disabled={bookingMutation.isPending} 
                  data-testid="button-submit-booking"
                >
                  {bookingMutation.isPending ? "Submitting..." : "Submit Booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Wash & Fold", desc: "Professional cleaning for everyday items", testId: "service-wash-fold" },
              { title: "Dry Cleaning", desc: "Expert care for delicate garments", testId: "service-dry-cleaning" },
              { title: "Ironing Service", desc: "Crisp, professional pressing", testId: "service-ironing" },
            ].map((service, i) => (
              <Card key={i} className="hover-elevate bg-[#F5EDE4] border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.desc}</p>
                  <Button variant="outline" className="w-full" data-testid={`button-learn-more-${service.testId}`}>Learn More</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 px-4 bg-[#F5EDE4]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="hover-elevate border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Become a Driver</CardTitle>
              <CardDescription>Flexible hours, great earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join our driver network and earn on your schedule. Full training and equipment provided.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/signup" data-testid="link-driver-signup">Apply Now</a>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover-elevate border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Partner Launderette</CardTitle>
              <CardDescription>Grow your business with us</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join Ireland's premier laundry network. Access to more customers and streamlined operations.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/api/login?role=shop" data-testid="link-franchise-signup">Learn More</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#2D2D2D] text-white">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>&copy; 2025 Mr Bubbles Express. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

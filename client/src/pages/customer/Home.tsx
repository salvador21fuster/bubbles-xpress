import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronDown, Search, Package, Star, Clock, Home, User, Receipt, Sparkles, Shirt, Wind, Droplets, TrendingUp, Gift, Zap, RotateCcw, Award, Truck, Scissors, Heart, Bed, ShoppingBag, Footprints, Snowflake, Ticket } from "lucide-react";
import { Link } from "wouter";
import { DroghedaMap } from "@/components/DroghedaMap";
import type { Service, Order } from "@shared/schema";
import logoImage from "@assets/image_1760233335456.png";

interface ServiceWithImage extends Service {
  imageUrl?: string;
}

export default function CustomerHome() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'browse' | 'map' | 'orders' | 'account'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: services = [] } = useQuery<ServiceWithImage[]>({
    queryKey: ["/api/services"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/customer/orders"],
  });

  // Helper function to get laundry-specific icon for each service
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    
    if (name.includes('shirt') || name.includes('iron') || name.includes('press')) return Shirt;
    if (name.includes('suit') || name.includes('jacket')) return Wind;
    if (name.includes('dress') || name.includes('wedding')) return Heart;
    if (name.includes('bed') || name.includes('linen')) return Bed;
    if (name.includes('curtain') || name.includes('drape')) return Home;
    if (name.includes('shoe') || name.includes('boot')) return Footprints;
    if (name.includes('bag') || name.includes('handbag')) return ShoppingBag;
    if (name.includes('ski') || name.includes('winter')) return Snowflake;
    if (name.includes('alter') || name.includes('repair')) return Scissors;
    if (name.includes('dry') || name.includes('clean')) return Sparkles;
    if (name.includes('wash') || name.includes('laundry')) return Droplets;
    if (name.includes('delivery') || name.includes('collection')) return Truck;
    
    return Droplets; // Default: general laundry service icon
  };

  const categories = [
    { id: 'all', name: 'All', IconComponent: Sparkles },
    { id: 'washing', name: 'Washing', IconComponent: Droplets },
    { id: 'ironing', name: 'Ironing', IconComponent: Shirt },
    { id: 'dry-cleaning', name: 'Dry Clean', IconComponent: Sparkles },
    { id: 'specialty', name: 'Specialty', IconComponent: Scissors },
  ];

  // Enhanced filtering with search
  const filteredServices = services.filter(service => {
    // Better category matching using service name patterns
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'washing' && (service.name.toLowerCase().includes('wash') || service.name.toLowerCase().includes('load'))) ||
      (selectedCategory === 'ironing' && (service.name.toLowerCase().includes('iron') || service.name.toLowerCase().includes('press'))) ||
      (selectedCategory === 'dry-cleaning' && (service.name.toLowerCase().includes('dry') || service.name.toLowerCase().includes('clean'))) ||
      (selectedCategory === 'specialty' && (service.name.toLowerCase().includes('special') || service.name.toLowerCase().includes('delicate') || service.name.toLowerCase().includes('suit')));
    
    const matchesSearch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // AI-based recommendations - Only show if user has order history
  const completedOrders = orders.filter(o => o.state === 'delivered' || o.state === 'closed');
  const recommendedServices = completedOrders.length > 0 ? services.slice(0, 3) : [];
  
  // Quick reorder - Get most recent completed order
  const recentOrder = completedOrders[0];

  // Handle quick reorder - Navigate to services page (user will see cart and can place order)
  const handleQuickReorder = () => {
    // In a real implementation, this would pre-fill the cart with last order items
    // For now, navigate to services page where they can browse and order
    navigate('/customer/services');
  };

  // Uber Eats style Browse View
  const BrowseView = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Hero Banner - Uber Eats Style */}
      <div className="relative h-48 bg-gradient-to-br from-primary/90 to-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>
        <div className="relative h-full flex flex-col justify-end p-6">
          <h2 className="text-3xl font-bold text-white mb-2">€0 delivery fee</h2>
          <p className="text-white/90 text-lg">from Mr Bubbles Express</p>
          <Button variant="secondary" size="sm" className="mt-3 w-fit" data-testid="button-order-now">
            Order Now
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="sticky top-0 bg-background border-b z-10 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.IconComponent;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="flex-shrink-0 gap-1.5 rounded-full"
                data-testid={`button-category-${cat.id}`}
              >
                <Icon className="h-4 w-4" />
                <span>{cat.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Quick Reorder - If user has past orders */}
      {recentOrder && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Reorder</h3>
          </div>
          <Card className="p-4 bg-primary/5 border-primary/20 hover-elevate active-elevate-2 cursor-pointer" data-testid="card-quick-reorder">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold">Your last order</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {recentOrder.addressLine1}, {recentOrder.city}
                </p>
              </div>
              <Button 
                size="sm" 
                className="gap-2" 
                onClick={handleQuickReorder}
                data-testid="button-reorder-now"
              >
                <RotateCcw className="h-4 w-4" />
                Reorder
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* AI-Based Recommendations */}
      {recommendedServices.length > 0 && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Recommended for you</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {recommendedServices.map((service) => {
              const ServiceIcon = getServiceIcon(service.name);
              return (
                <Link key={service.id} href={`/customer/services?service=${service.id}`}>
                  <Card className="flex-shrink-0 w-40 hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-recommended-${service.id}`}>
                    <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <ServiceIcon className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm truncate">{service.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-xs font-medium">4.8</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Offers & Deals */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Offers near you</h3>
        </div>
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30" data-testid="card-offer">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold">First order €5 off</p>
              <p className="text-sm text-muted-foreground">Valid for new customers</p>
            </div>
            <Button size="sm" variant="outline" data-testid="button-claim-offer">Claim</Button>
          </div>
        </Card>
      </div>

      {/* Services Section - "Hidden gems" style */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Our Services</h3>
          <Button variant="ghost" size="sm" data-testid="button-see-all">See all</Button>
        </div>

        <div className="grid gap-4">
          {filteredServices.slice(0, 6).map((service) => {
            const ServiceIcon = getServiceIcon(service.name);
            return (
              <Link key={service.id} href={`/customer/services?service=${service.id}`}>
                <Card className="flex gap-3 p-3 hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-service-${service.id}`}>
                  {/* Service Image */}
                  <div className="w-20 h-20 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                    {service.imageUrl ? (
                      <img 
                        src={service.imageUrl} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <ServiceIcon className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{service.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-sm text-muted-foreground">• </span>
                      <span className="text-sm text-muted-foreground">
                        €{parseFloat(service.pricePerUnit).toFixed(2)} / {service.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">24-48 hrs</span>
                    </div>
                  </div>

                  {/* Service Badge */}
                  <div className="flex items-start">
                    <Badge variant="secondary" className="text-xs">
                      {service.unit === 'kg' ? 'By Weight' : 'Per Item'}
                    </Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Map View
  const MapView = () => {
    // Mock driver location for demo (near Drogheda center)
    const mockDriverLocation = { latitude: 53.7197, longitude: -6.3488 };
    
    return (
      <div className="flex-1 flex flex-col pb-16 relative">
        <div className="flex-1">
          <DroghedaMap 
            height="100%" 
            showMarker={true} 
            showDriverVan={true}
            driverLocation={mockDriverLocation}
          />
        </div>
        {/* Nearby shops overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent pt-8 pb-4 px-4 pointer-events-none">
          <div className="pointer-events-auto">
            <h3 className="font-semibold mb-2">Nearby laundry shops</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Card className="flex-shrink-0 w-64 p-3">
                <div className="flex items-start gap-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Mr Bubbles HQ</h4>
                    <p className="text-xs text-muted-foreground">Bubbles Road • 0.5 km</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Orders View
  const OrdersView = () => (
    <div className="flex-1 overflow-y-auto pb-20 p-4">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      <p className="text-muted-foreground">Your order history will appear here</p>
      <Link href="/customer/orders">
        <Button className="mt-4" data-testid="button-view-orders">View All Orders</Button>
      </Link>
    </div>
  );

  // Account View
  const AccountView = () => {
    // Mock loyalty points data
    const loyaltyPoints = 450;
    const nextRewardAt = 500;
    const progressPercent = (loyaltyPoints / nextRewardAt) * 100;

    return (
      <div className="flex-1 overflow-y-auto pb-20 p-4 space-y-6">
        {/* Loyalty Points Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6" />
                <h3 className="text-lg font-bold">Mr Bubbles Rewards</h3>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-none">
                Gold Member
              </Badge>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">{loyaltyPoints}</span>
                <span className="text-white/80">points</span>
              </div>
              <p className="text-sm text-white/90">
                {nextRewardAt - loyaltyPoints} points until your next reward
              </p>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Wave decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10">
            <svg viewBox="0 0 1440 320" className="w-full h-full">
              <path fill="white" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </Card>

        {/* Rewards Benefits */}
        <div>
          <h3 className="font-bold mb-3">Your Benefits</h3>
          <div className="space-y-2">
            <Card className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">€5 off every 5th order</p>
                <p className="text-xs text-muted-foreground">Automatically applied</p>
              </div>
            </Card>
            <Card className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Priority pickup</p>
                <p className="text-xs text-muted-foreground">Get collected first</p>
              </div>
            </Card>
            <Card className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Free express service</p>
                <p className="text-xs text-muted-foreground">Once per month</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Profile Info */}
        <div>
          <h3 className="font-bold mb-3">Profile</h3>
          <Card className="p-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">customer@example.com</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">+353 123 456 7890</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">October 2025</p>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar - Uber Eats Style */}
      <div className="flex-shrink-0 border-b bg-background">
        {/* Delivery/Pickup Toggle */}
        <div className="flex gap-2 p-3 border-b">
          <Button 
            variant={deliveryMode === 'delivery' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-full" 
            onClick={() => setDeliveryMode('delivery')}
            data-testid="button-delivery"
          >
            Delivery
          </Button>
          <Button 
            variant={deliveryMode === 'pickup' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-full"
            onClick={() => setDeliveryMode('pickup')}
            data-testid="button-pickup"
          >
            Pickup
          </Button>
        </div>

        {/* Address Bar */}
        <div className="flex items-center gap-2 px-4 py-3">
          <MapPin className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Button variant="ghost" className="w-full justify-start p-0 h-auto font-normal" data-testid="button-address">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">123 Main St</span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </div>
            </Button>
          </div>
        </div>

        {/* Search Bar - Only show in browse view */}
        {activeTab === 'browse' && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for laundry services..." 
                className="pl-10 h-11 rounded-lg bg-muted"
                data-testid="input-search"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'browse' && <BrowseView />}
      {activeTab === 'map' && <MapView />}
      {activeTab === 'orders' && <OrdersView />}
      {activeTab === 'account' && <AccountView />}

      {/* Bottom Navigation - Uber Eats Style */}
      <div className="flex-shrink-0 border-t bg-background">
        <div className="flex items-center justify-around px-4 py-2 safe-area-bottom">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col h-auto py-2 gap-1 ${activeTab === 'browse' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('browse')}
            data-testid="tab-browse"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col h-auto py-2 gap-1 ${activeTab === 'map' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('map')}
            data-testid="tab-map"
          >
            <MapPin className="h-5 w-5" />
            <span className="text-xs">Browse</span>
          </Button>
          
          {/* Mr Bubbles Logo - Center */}
          <div className="flex items-center justify-center px-2">
            <img 
              src={logoImage} 
              alt="Mr Bubbles" 
              className="h-10 w-auto object-contain"
              data-testid="logo-bottom-nav"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={`flex-col h-auto py-2 gap-1 ${activeTab === 'orders' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('orders')}
            data-testid="tab-orders"
          >
            <Receipt className="h-5 w-5" />
            <span className="text-xs">Orders</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col h-auto py-2 gap-1 ${activeTab === 'account' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('account')}
            data-testid="tab-account"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Account</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

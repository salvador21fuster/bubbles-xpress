import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronDown, Search, Package, ShoppingBag, Star, Clock, Home, User, Receipt, Sparkles, Shirt, Wind, Droplets } from "lucide-react";
import { Link } from "wouter";
import { DroghedaMap } from "@/components/DroghedaMap";
import type { Service } from "@shared/schema";

interface ServiceWithImage extends Service {
  imageUrl?: string;
}

export default function CustomerHome() {
  const [activeTab, setActiveTab] = useState<'browse' | 'map' | 'orders' | 'account'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');

  const { data: services = [] } = useQuery<ServiceWithImage[]>({
    queryKey: ["/api/services"],
  });

  const categories = [
    { id: 'all', name: 'All', IconComponent: Package },
    { id: 'washing', name: 'Washing', IconComponent: Droplets },
    { id: 'ironing', name: 'Ironing', IconComponent: Shirt },
    { id: 'dry-cleaning', name: 'Dry Clean', IconComponent: Sparkles },
    { id: 'specialty', name: 'Specialty', IconComponent: Wind },
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.name.toLowerCase().includes(selectedCategory));

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

      {/* Services Section - "Hidden gems" style */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Our Services</h3>
          <Button variant="ghost" size="sm" data-testid="button-see-all">See all</Button>
        </div>

        <div className="grid gap-4">
          {filteredServices.slice(0, 6).map((service) => (
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
                      <Package className="h-8 w-8 text-primary" />
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
          ))}
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
                    <Package className="h-6 w-6 text-primary" />
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
  const AccountView = () => (
    <div className="flex-1 overflow-y-auto pb-20 p-4">
      <h2 className="text-2xl font-bold mb-4">Account</h2>
      <p className="text-muted-foreground">Your profile and settings</p>
    </div>
  );

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

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Phone, Star, Menu, User, LogOut, GraduationCap, ChevronRight, Navigation } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Order, User as UserType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Simple route optimization: sort by city then address
function optimizeRoute(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    // First sort by city
    const cityCompare = (a.city || '').localeCompare(b.city || '');
    if (cityCompare !== 0) return cityCompare;
    // Then by address within same city
    return (a.addressLine1 || '').localeCompare(b.addressLine1 || '');
  });
}

export default function DriverDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders"],
    refetchInterval: 10000,
  });

  const { data: availableOrders = [], isLoading: isLoadingAvailable } = useQuery<Order[]>({
    queryKey: ["/api/driver/available-orders"],
    refetchInterval: 10000,
  });

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  // Track driver location when online
  const { isTracking } = useDriverLocation(user?.isActive || false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", "/api/driver/accept-order", { orderId });
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/available-orders"] });
      toast({
        title: "Order Accepted",
        description: "The order has been assigned to you",
      });
      // Navigate to order details page
      navigate(`/driver/orders/${orderId}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to accept order",
        description: error.message || "Something went wrong",
      });
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      return await apiRequest("POST", "/api/driver/availability", { isActive });
    },
    onSuccess: async (_data, isActive) => {
      queryClient.setQueryData(["/api/auth/user"], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, isActive };
      });
      
      toast({
        title: isActive ? "You're now online" : "You're now offline",
        description: isActive 
          ? "You'll be visible to customers looking for drivers"
          : "You won't receive new pickup requests",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update availability status",
      });
    },
  });

  const pickups = optimizeRoute(orders.filter(o => o.state === 'confirmed'));
  const deliveries = optimizeRoute(orders.filter(o => o.state === 'packed' || o.state === 'out_for_delivery'));
  const completed = orders.filter(o => o.state === 'delivered');

  const todayEarnings = completed.reduce((sum, order) => {
    return sum + ((order.totalCents || 0) * 0.1); // 10% driver commission
  }, 0) / 100;

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map centered on Drogheda, Ireland
    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([53.7187, -6.3476], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Add custom zoom control in top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Add driver marker (current location)
    const driverIcon = L.divIcon({
      html: '<div style="background: #0079E7; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    
    L.marker([53.7187, -6.3476], { icon: driverIcon }).addTo(map);

    // Add pickup markers if available
    if (availableOrders.length > 0) {
      availableOrders.forEach((order, index) => {
        if (index < 3) { // Show first 3 orders on map
          const pickupIcon = L.divIcon({
            html: `<div style="background: #FF6B35; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${index + 1}</div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          
          // Random nearby locations for demo (in production, use actual coordinates)
          const lat = 53.7187 + (Math.random() - 0.5) * 0.02;
          const lon = -6.3476 + (Math.random() - 0.5) * 0.02;
          L.marker([lat, lon], { icon: pickupIcon }).addTo(map);
        }
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [availableOrders]);

  const currentOrder = availableOrders[0];

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {/* Full-Screen Map */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0"
        data-testid="driver-map"
      />

      {/* Top Overlay - Earnings & Profile */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <div className="bg-black text-white px-4 py-2 rounded-full font-bold shadow-lg" data-testid="text-earnings">
          €{todayEarnings.toFixed(2)}
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full w-10 h-10 shadow-lg"
          onClick={() => setShowMenu(!showMenu)}
          data-testid="button-menu"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.username?.[0]?.toUpperCase() || 'D'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-16 right-4 bg-background border rounded-lg shadow-xl z-20 w-64 overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {user?.username?.[0]?.toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user?.username || 'Driver'}</p>
                <p className="text-sm text-muted-foreground">{user?.phone || user?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            <RoleSwitcher />
            <Link href="/driver/training">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setShowMenu(false)}
                data-testid="button-training"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Training
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => {
                setShowMenu(false);
                logoutMutation.mutate();
              }}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Offline/Online Status */}
      {!user?.isActive && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <Card className="bg-background shadow-xl">
            <div className="px-6 py-3 flex items-center gap-4">
              <Menu className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">You're Offline!</span>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => availabilityMutation.mutate(true)}
                disabled={availabilityMutation.isPending}
                data-testid="button-go-online"
              >
                Go Online
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Sheet - Available Order Card (Uber Style) */}
      {user?.isActive && currentOrder && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <Card className="rounded-t-3xl border-0 shadow-2xl">
            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-muted">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Laundry Pickup</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  data-testid="button-contact-customer"
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </div>

              {/* Pickup Location */}
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="mt-1">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Pickup</p>
                    <p className="font-medium">{currentOrder.addressLine1}</p>
                    <p className="text-sm text-muted-foreground">{currentOrder.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">3 mins</p>
                    <p className="text-xs text-muted-foreground">(0.9 mi) away</p>
                  </div>
                </div>

                {/* Route Line */}
                <div className="ml-[5px] border-l-2 border-dashed border-muted h-6" />

                {/* Delivery Location */}
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Delivery</p>
                    <p className="font-medium">Mr Bubbles Shop</p>
                    <p className="text-sm text-muted-foreground">Drogheda</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">9 mins</p>
                    <p className="text-xs text-muted-foreground">(3.1 mi) trip</p>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">€{(((currentOrder.totalCents || 0) * 0.1) / 100).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Your earnings</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Laundry Service
                </Badge>
              </div>

              {/* Accept Button - Uber Blue */}
              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-xl bg-[#276EF1] hover:bg-[#1E5ED9]"
                onClick={() => acceptOrderMutation.mutate(currentOrder.id)}
                disabled={acceptOrderMutation.isPending}
                data-testid="button-accept-order"
              >
                {acceptOrderMutation.isPending ? "Accepting..." : "Accept"}
              </Button>

              {/* Dismiss Link */}
              <button 
                className="w-full text-center text-sm text-muted-foreground underline"
                onClick={() => {
                  // In production, this would dismiss/skip this order
                  toast({
                    title: "Order dismissed",
                    description: "Looking for more orders...",
                  });
                }}
                data-testid="button-dismiss-order"
              >
                Dismiss
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Active Orders List (when driver has accepted orders) */}
      {user?.isActive && !currentOrder && (pickups.length > 0 || deliveries.length > 0) && (
        <div className="absolute bottom-0 left-0 right-0 z-10 max-h-[60vh] overflow-y-auto">
          <Card className="rounded-t-3xl border-0 shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Your Active Orders ({pickups.length + deliveries.length})</h3>
              
              {pickups.length > 0 && (
                <div className="space-y-3 mb-4">
                  <p className="text-sm font-semibold text-primary">Pickups</p>
                  {pickups.map((order, index) => (
                    <Link key={order.id} href={`/driver/orders/${order.id}`}>
                      <Card className="hover-elevate active-elevate-2">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{order.addressLine1}</p>
                                <p className="text-sm text-muted-foreground">{order.city}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <Button size="sm" className="w-full gap-2" data-testid={`button-navigate-${order.id}`}>
                            <Navigation className="h-4 w-4" />
                            Navigate
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {deliveries.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-green-600">Deliveries</p>
                  {deliveries.map((order, index) => (
                    <Link key={order.id} href={`/driver/orders/${order.id}`}>
                      <Card className="hover-elevate active-elevate-2">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{order.addressLine1}</p>
                                <p className="text-sm text-muted-foreground">{order.city}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <Button size="sm" className="w-full gap-2" data-testid={`button-navigate-${order.id}`}>
                            <Navigation className="h-4 w-4" />
                            Navigate
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* No Orders State */}
      {user?.isActive && !currentOrder && pickups.length === 0 && deliveries.length === 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <Card className="bg-background shadow-xl">
            <div className="px-6 py-4 text-center">
              <p className="font-medium mb-1">Looking for orders...</p>
              <p className="text-sm text-muted-foreground">We'll notify you when a pickup is available</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

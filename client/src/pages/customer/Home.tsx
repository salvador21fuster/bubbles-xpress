import { useState, useEffect, useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, ChevronDown, Search, Package, Star, Clock, Home, User, Receipt, Sparkles, Shirt, Wind, Droplets, TrendingUp, Gift, Zap, RotateCcw, Award, Truck, Scissors, Heart, Bed, ShoppingBag, Footprints, Snowflake, Ticket, X, Plus, Minus, ShoppingCart, CreditCard, Calendar, Check, MessageCircle, Send, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { DroghedaMap } from "@/components/DroghedaMap";
import type { Service, Order } from "@shared/schema";
import logoImage from "@assets/image_1760233335456.png";
import serviceImage from "@assets/download (4)_1760237350814.jpg";

interface ServiceWithImage extends Service {
  imageUrl?: string;
}

export default function CustomerHome() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'browse' | 'map' | 'orders' | 'account'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking flow states
  const [selectedService, setSelectedService] = useState<ServiceWithImage | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<Array<{service: ServiceWithImage, quantity: number}>>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Order detail states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Live Agent Chat states
  const [showLiveAgent, setShowLiveAgent] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'bot', timestamp: Date}>>([
    {
      id: "welcome",
      text: "Hi! I'm your Mr Bubbles assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Address autocomplete states
  const [addressInput, setAddressInput] = useState("123 Main St");
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{
    displayName: string;
    street: string;
    city: string;
    county: string;
    postcode: string;
  }>>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

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

  // Cart management functions
  const addToCart = (service: ServiceWithImage, qty: number) => {
    const existingItem = cart.find(item => item.service.id === service.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.service.id === service.id 
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setCart([...cart, { service, quantity: qty }]);
    }
    setSelectedService(null);
    setQuantity(1);
  };

  const removeFromCart = (serviceId: string) => {
    setCart(cart.filter(item => item.service.id !== serviceId));
  };

  const updateCartQuantity = (serviceId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(serviceId);
    } else {
      setCart(cart.map(item => 
        item.service.id === serviceId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const cartTotal = cart.reduce((total, item) => {
    return total + (parseFloat(item.service.pricePerUnit) * item.quantity);
  }, 0);

  const handleServiceClick = (service: ServiceWithImage) => {
    setSelectedService(service);
    setQuantity(1);
  };

  // Live Agent Chat - Knowledge Base
  const knowledgeBase = {
    services: {
      keywords: ["service", "wash", "dry", "clean", "iron", "press", "fold", "price", "cost", "fee"],
      response: "Mr Bubbles Express offers professional laundry services including washing, drying, ironing, and folding. We charge by weight (per kg) or per item. Our services include: standard wash & fold (€3/kg), express service (€5/kg), dry cleaning, and ironing (€2/item). All prices include 23% VAT."
    },
    franchise: {
      keywords: ["franchise", "partner", "join", "tier", "silver", "gold", "subscription", "fee", "percentage"],
      response: "We offer 3 franchise tiers:\n\n• Free Tier: Limited access, 25% fee to Mr Bubbles\n\n• Silver (€99/month or €750/year): All training, equipment & clothing, 15% fee\n\n• Gold (€299/month or €2500/year): Ultimate access, premium training, all equipment, 5% fee\n\nReady to join? Sign up as a franchise partner to get started!"
    },
    ordering: {
      keywords: ["order", "book", "pickup", "delivery", "schedule", "time", "when", "how long"],
      response: "Booking is easy!\n\n1. Select your pickup time (we offer morning/afternoon/evening slots)\n2. We collect your laundry from your door\n3. Items are washed, dried & folded professionally\n4. We deliver back to you within 24-48 hours\n\nYou can track your order in real-time through the app!"
    },
    location: {
      keywords: ["area", "location", "drogheda", "where", "coverage", "deliver", "pilot"],
      response: "We're currently operating in Drogheda, Louth as our pilot area. Our headquarters is on Bubbles Road. We're expanding soon to other areas in Ireland. Want to bring Mr Bubbles to your area? Contact us about franchise opportunities!"
    },
    payment: {
      keywords: ["pay", "payment", "card", "cash", "stripe", "cost", "charge"],
      response: "We accept multiple payment methods:\n• Credit/Debit cards (via Stripe)\n• Cash on delivery\n• Account billing for businesses\n\nAll prices include 23% Irish VAT. Payment is processed after delivery for your peace of mind."
    },
    driver: {
      keywords: ["driver", "job", "work", "earn", "requirements", "apply"],
      response: "Join our driver team!\n\nDrivers earn competitive rates plus tips. Requirements:\n• Valid driver's license\n• Own vehicle\n• Smartphone for app\n• Clean driving record\n\nSign up as a driver to get started. We provide training, branded gear, and flexible hours!"
    },
    tracking: {
      keywords: ["track", "status", "where", "gps", "location", "follow"],
      response: "Track your order in real-time!\n\nYou can see:\n• Driver's live GPS location\n• Order status updates (collected → washing → drying → delivering)\n• Estimated delivery time\n• QR code scanning confirmations\n\nJust open your order in the customer app to see live tracking!"
    },
    scanning: {
      keywords: ["qr", "scan", "code", "bag", "label", "tag"],
      response: "We use QR codes for complete tracking! Each bag gets a unique QR code that tracks:\n• Pickup confirmation with photo\n• Shop intake scan\n• Quality control checks\n• Delivery handoff with signature\n\nThis ensures complete transparency and prevents mix-ups!"
    },
    support: {
      keywords: ["help", "support", "contact", "issue", "problem", "question", "phone", "email"],
      response: "I'm here to help!\n\nFor immediate support:\n• Chat with me anytime\n• Call: +353 XX XXX XXXX\n• Email: support@mrbubbles.ie\n\nFor Franchises: Gold tier gets 24/7 premium support, Silver gets priority support, Free tier gets standard email support."
    },
    greeting: {
      keywords: ["hello", "hi", "hey", "good", "morning", "afternoon", "evening"],
      response: "Hello! I'm your Mr Bubbles assistant. How can I help you today? I can tell you about our services, franchise opportunities, order tracking, or anything else about Mr Bubbles Express!"
    },
    thanks: {
      keywords: ["thank", "thanks", "appreciate"],
      response: "You're very welcome! Happy to help! Is there anything else you'd like to know about Mr Bubbles Express?"
    }
  };

  const findBestResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return data.response;
      }
    }
    
    return "I'd be happy to help you with that! I can answer questions about:\n\n• Our laundry services & pricing\n• Franchise opportunities (Free/Silver/Gold tiers)\n• How to place an order\n• Order tracking & delivery\n• Payment methods\n• Driver opportunities\n• QR code scanning\n\nWhat would you like to know?";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showLiveAgent) {
      scrollToBottom();
    }
  }, [chatMessages, showLiveAgent]);

  // Address autocomplete search
  useEffect(() => {
    // Clear suggestions immediately when input changes to prevent showing stale results
    setAddressSuggestions([]);
    
    const searchAddress = async () => {
      if (addressInput.length < 3) {
        setAddressSuggestions([]);
        setShowAddressDropdown(false);
        return;
      }

      setIsLoadingAddress(true);
      try {
        const response = await fetch(`/api/address/search?q=${encodeURIComponent(addressInput)}`);
        const data = await response.json();
        setAddressSuggestions(data.results || []);
        if (data.results && data.results.length > 0) {
          setShowAddressDropdown(true);
        }
      } catch (error) {
        console.error("Address search error:", error);
        setAddressSuggestions([]);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    const debounceTimer = setTimeout(searchAddress, 300);
    return () => clearTimeout(debounceTimer);
  }, [addressInput]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageText = chatInput;
    setChatInput("");
    setIsTyping(true);

    try {
      // Call Gemini AI backend
      const response = await fetch('/api/chat/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: chatMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            text: msg.text
          }))
        }),
      });

      const data = await response.json();

      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm here to help! Could you please rephrase your question?",
        sender: 'bot' as const,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment!",
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
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
                <Card 
                  key={service.id}
                  className="flex-shrink-0 w-40 hover-elevate active-elevate-2 cursor-pointer" 
                  onClick={() => handleServiceClick(service)}
                  data-testid={`card-recommended-${service.id}`}
                >
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
              <Card 
                key={service.id}
                className="flex gap-3 p-3 hover-elevate active-elevate-2 cursor-pointer" 
                onClick={() => handleServiceClick(service)}
                data-testid={`card-service-${service.id}`}
              >
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
      <div className="flex-1 flex flex-col pb-20 relative">
        <div className="flex-1">
          <DroghedaMap 
            height="100%" 
            showMarker={true} 
            showDriverVan={true}
            driverLocation={mockDriverLocation}
          />
        </div>
        {/* Nearby shops overlay */}
        <div className="absolute bottom-20 left-0 right-0 bg-gradient-to-t from-background to-transparent pt-8 pb-4 px-4 pointer-events-none">
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

  // Orders View - Uber Eats Style
  const OrdersView = () => {
    const getStatusColor = (state: string) => {
      switch (state) {
        case 'delivered': return 'text-green-600';
        case 'picked_up': case 'out_for_delivery': return 'text-blue-600';
        case 'washing': case 'drying': case 'pressing': case 'qc': return 'text-orange-600';
        case 'created': case 'confirmed': return 'text-yellow-600';
        default: return 'text-muted-foreground';
      }
    };

    const getStatusText = (state: string) => {
      switch (state) {
        case 'delivered': return 'Delivered';
        case 'out_for_delivery': return 'Out for Delivery';
        case 'picked_up': return 'Picked Up';
        case 'washing': case 'drying': case 'pressing': return 'Processing';
        case 'qc': return 'Quality Check';
        case 'packed': return 'Packed';
        case 'created': return 'Order Placed';
        case 'confirmed': return 'Confirmed';
        case 'at_origin_shop': case 'at_processing_shop': return 'At Shop';
        default: return state;
      }
    };

    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">My Orders</h2>
          
          {orders.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">No orders yet</h3>
                  <p className="text-sm text-muted-foreground">When you place an order, it will appear here</p>
                </div>
                <Button 
                  onClick={() => setActiveTab('browse')}
                  className="mt-2"
                  data-testid="button-browse-services"
                >
                  Browse Services
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const deliveryAddress = `${order.addressLine1}${order.addressLine2 ? ', ' + order.addressLine2 : ''}, ${order.city}`;
                const totalWithVat = order.totalCents ? (order.totalCents / 100).toFixed(2) : '0.00';
                
                return (
                  <Card 
                    key={order.id} 
                    className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetail(true);
                    }}
                    data-testid={`card-order-${order.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${getStatusColor(order.state)}`}>
                            {getStatusText(order.state)}
                          </span>
                          {(order.state === 'picked_up' || order.state === 'out_for_delivery') && (
                            <Badge variant="secondary" className="text-xs">
                              In Transit
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt && new Date(order.createdAt).toLocaleDateString('en-IE', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{totalWithVat}</p>
                        <p className="text-xs text-muted-foreground">incl. VAT</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{deliveryAddress}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">View Details</span>
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

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

  // Service Detail Modal - Uber Eats Style
  const ServiceDetailModal = () => {
    if (!selectedService) return null;
    const ServiceIcon = getServiceIcon(selectedService.name);
    
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-x-0 bottom-0 bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b z-10">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-bold">{selectedService.name}</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedService(null)}
                data-testid="button-close-service"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Service Image */}
          <div className="aspect-video bg-muted overflow-hidden">
            <img 
              src={serviceImage} 
              alt={selectedService.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Service Details */}
          <div className="p-4 space-y-4">
            {selectedService.description && (
              <p className="text-muted-foreground">{selectedService.description}</p>
            )}

            {/* Price & Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">4.8</span>
                <span className="text-sm text-muted-foreground">(500+ reviews)</span>
              </div>
              <div className="text-lg font-bold">
                €{parseFloat(selectedService.pricePerUnit).toFixed(2)} / {selectedService.unit}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <Clock className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium">Processing Time</p>
                <p className="text-xs text-muted-foreground">24-48 hours</p>
              </Card>
              <Card className="p-3">
                <Truck className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium">Free Delivery</p>
                <p className="text-xs text-muted-foreground">On all orders</p>
              </Card>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity ({selectedService.unit})</label>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-increase-quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="sticky bottom-0 bg-background border-t p-4">
            <Button 
              className="w-full h-12 text-lg" 
              onClick={() => addToCart(selectedService, quantity)}
              data-testid="button-add-to-cart"
            >
              Add to Cart • €{(parseFloat(selectedService.pricePerUnit) * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Checkout View - Uber Eats Style
  const CheckoutView = () => (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="flex items-center gap-3 p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowCheckout(false)}
            data-testid="button-close-checkout"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Delivery Address Info */}
        <Card className="m-4 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Delivery address</p>
              <p className="text-sm text-muted-foreground">123 Main St, Drogheda</p>
              <Button variant="ghost" className="h-auto p-0 mt-1 text-primary" data-testid="button-change-address">
                Change address
              </Button>
            </div>
          </div>
        </Card>

        {/* Cart Items */}
        <div className="m-4 space-y-3">
          <h3 className="font-bold">Your Order</h3>
          {cart.map((item) => {
            const ItemIcon = getServiceIcon(item.service.name);
            return (
              <Card key={item.service.id} className="p-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ItemIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.service.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      €{parseFloat(item.service.pricePerUnit).toFixed(2)} / {item.service.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateCartQuantity(item.service.id, item.quantity - 1)}
                        data-testid={`button-decrease-${item.service.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateCartQuantity(item.service.id, item.quantity + 1)}
                        data-testid={`button-increase-${item.service.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€{(parseFloat(item.service.pricePerUnit) * item.quantity).toFixed(2)}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive h-auto p-0 mt-1"
                      onClick={() => removeFromCart(item.service.id)}
                      data-testid={`button-remove-${item.service.id}`}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Schedule Pickup */}
        <Card className="m-4 p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Schedule Pickup</p>
              <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM - 12:00 PM</p>
              <Button variant="ghost" className="h-auto p-0 mt-1 text-primary" data-testid="button-change-schedule">
                Change time
              </Button>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="m-4 p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Payment Method</p>
              <p className="text-sm text-muted-foreground">Visa •••• 4242</p>
              <Button variant="ghost" className="h-auto p-0 mt-1 text-primary" data-testid="button-change-payment">
                Change payment method
              </Button>
            </div>
          </div>
        </Card>

        {/* Order Summary */}
        <div className="m-4 space-y-2">
          <h3 className="font-bold">Order Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>€{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="text-primary font-medium">FREE</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (23%)</span>
            <span>€{(cartTotal * 0.23).toFixed(2)}</span>
          </div>
          <div className="h-px bg-border my-2"></div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>€{(cartTotal * 1.23).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <Button 
          className="w-full h-12 text-lg" 
          data-testid="button-place-order"
          onClick={() => {
            // In real app, would submit order here
            setShowCheckout(false);
            setCart([]);
            setActiveTab('orders');
          }}
        >
          Place Order • €{(cartTotal * 1.23).toFixed(2)}
        </Button>
      </div>
    </div>
  );

  // Order Detail View with Invoice and Live Tracking
  const OrderDetailView = () => {
    if (!selectedOrder) return null;

    const deliveryAddress = `${selectedOrder.addressLine1}${selectedOrder.addressLine2 ? ', ' + selectedOrder.addressLine2 : ''}, ${selectedOrder.city}`;
    const subtotal = selectedOrder.subtotalCents ? (selectedOrder.subtotalCents / 100).toFixed(2) : '0.00';
    const vat = selectedOrder.vatCents ? (selectedOrder.vatCents / 100).toFixed(2) : '0.00';
    const total = selectedOrder.totalCents ? (selectedOrder.totalCents / 100).toFixed(2) : '0.00';
    
    const hasDriver = selectedOrder.driverId !== null;
    const showTracking = selectedOrder.state === 'picked_up' || selectedOrder.state === 'out_for_delivery';

    return (
      <div className="fixed inset-0 z-50 bg-background">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-background">
          <div className="flex items-center gap-3 p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowOrderDetail(false)}
              data-testid="button-close-order-detail"
            >
              <X className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Order Details</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          {/* Live Tracking - Only show if driver accepted */}
          {showTracking && hasDriver && (
            <div className="bg-primary/5 p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Driver on the way</h3>
                  <p className="text-sm text-muted-foreground">Estimated arrival in 15 minutes</p>
                </div>
              </div>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <DroghedaMap 
                  height="100%" 
                  showMarker={true} 
                  showDriverVan={true}
                  driverLocation={{ latitude: 53.7197, longitude: -6.3488 }}
                />
              </div>
            </div>
          )}

          {/* Invoice Section */}
          <div className="m-4">
            <Card className="p-6">
              {/* Invoice Header with Logo */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b">
                <div>
                  <img 
                    src={logoImage} 
                    alt="Mr Bubbles Express" 
                    className="h-12 w-auto object-contain mb-2"
                  />
                  <p className="text-xs text-muted-foreground">Professional Laundry Service</p>
                  <p className="text-xs text-muted-foreground">Drogheda, Ireland</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">Invoice</h3>
                  <p className="text-xs text-muted-foreground">Order #{selectedOrder.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleDateString('en-IE')}
                  </p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Bill To:</h4>
                <p className="text-sm">{selectedOrder.customerFullName || 'Customer'}</p>
                <p className="text-sm text-muted-foreground">{deliveryAddress}</p>
                {selectedOrder.eircode && (
                  <p className="text-sm text-muted-foreground">{selectedOrder.eircode}</p>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-3">Services:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Laundry Service</span>
                    <span>€{subtotal}</span>
                  </div>
                  {selectedOrder.deliveryInstructions && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: {selectedOrder.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>€{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-primary font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (23%)</span>
                  <span>€{vat}</span>
                </div>
                <div className="h-px bg-border my-2"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>€{total}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Paid with {selectedOrder.paymentMethod || 'card'} • {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleDateString('en-IE')}
                  </span>
                </div>
              </div>

              {/* AI Generated Notice */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-center text-muted-foreground">
                  This invoice was automatically generated by Mr Bubbles AI
                </p>
              </div>
            </Card>

            {/* Order Status Timeline */}
            <Card className="p-4 mt-4">
              <h4 className="font-semibold mb-3">Order Status</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${selectedOrder.state !== 'created' ? 'bg-primary text-white' : 'bg-muted'}`}>
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Order Placed</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleString('en-IE')}
                    </p>
                  </div>
                </div>
                {selectedOrder.pickedUpAt && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Picked Up</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedOrder.pickedUpAt).toLocaleString('en-IE')}
                      </p>
                    </div>
                  </div>
                )}
                {selectedOrder.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Delivered</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedOrder.deliveredAt).toLocaleString('en-IE')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar - Uber Eats Style */}
      <div className="flex-shrink-0 border-b bg-background">
        {/* Pickup and Delivery Button with Cart and Live Agent */}
        <div className="flex items-center justify-between gap-2 p-3 border-b">
          <Button 
            variant="default" 
            size="sm" 
            className="rounded-full" 
            data-testid="button-pickup-delivery"
          >
            Pickup and Delivery
          </Button>
          
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            {cart.length > 0 && !showCheckout && (
              <Button
                variant="default"
                size="sm"
                className="rounded-full gap-2 relative"
                onClick={() => setShowCheckout(true)}
                data-testid="button-view-cart"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="font-bold">{cart.length}</span>
                <span>€{(cartTotal * 1.23).toFixed(2)}</span>
              </Button>
            )}
            
            {/* Live Agent Button - Top Right */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowLiveAgent(true)}
              data-testid="button-live-agent"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Live Agent</span>
            </Button>
          </div>
        </div>

        {/* Address Bar with Autocomplete */}
        <div className="relative px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0 relative">
              <Input
                ref={addressInputRef}
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                }}
                onFocus={() => {
                  if (addressSuggestions.length > 0 && addressInput.length >= 3) {
                    setShowAddressDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowAddressDropdown(false), 200);
                }}
                placeholder="Enter your address..."
                className="font-medium h-auto py-1 px-2 border-0 focus-visible:ring-0"
                data-testid="input-address"
              />
              {isLoadingAddress && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Address Suggestions Dropdown */}
          {showAddressDropdown && addressSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mx-4">
              {addressSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setAddressInput(suggestion.displayName);
                    setShowAddressDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-0"
                  data-testid={`address-suggestion-${index}`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{suggestion.displayName}</p>
                      {suggestion.city && (
                        <p className="text-xs text-muted-foreground">
                          {suggestion.city}{suggestion.county && `, ${suggestion.county}`}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
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

      {/* Service Detail Modal */}
      <ServiceDetailModal />

      {/* Checkout View */}
      {showCheckout && <CheckoutView />}

      {/* Order Detail View */}
      {showOrderDetail && <OrderDetailView />}

      {/* Live Agent Chat */}
      {showLiveAgent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-end p-0 sm:p-4">
          <div className="bg-background w-full sm:w-96 h-[80vh] sm:h-[600px] sm:rounded-lg shadow-2xl flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Live Agent</h3>
                  <p className="text-xs opacity-90">AI Assistant • Online</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLiveAgent(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
                data-testid="button-close-live-agent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                      data-testid={`message-${message.sender}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Assistant is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1"
                  disabled={isTyping}
                  data-testid="input-live-agent-message"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!chatInput.trim() || isTyping}
                  data-testid="button-send-live-agent-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

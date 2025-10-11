import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Clock } from 'lucide-react';

interface DroghedaMapProps {
  showDriverVan?: boolean;
  driverLocation?: { latitude: number; longitude: number } | null;
  orderStatus?: string;
}

export function DroghedaMap({ showDriverVan = true, driverLocation, orderStatus }: DroghedaMapProps) {
  const [vanPosition, setVanPosition] = useState({ x: 50, y: 50 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Drogheda coordinates (approximate center)
  const droghedaCenter = { lat: 53.7175, lng: -6.3572 };
  
  // Mr Bubbles HQ on Bubbles Road (simulated position)
  const mrBubblesHQ = { x: 50, y: 50 }; // Center of map for demo

  useEffect(() => {
    // Idle animation - van bobbing slightly
    if (showDriverVan && !driverLocation) {
      const interval = setInterval(() => {
        setIsAnimating(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [showDriverVan, driverLocation]);

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-[400px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
            
            {/* Geofence Boundary - Drogheda, Louth Area */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid lines for street effect */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.3"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              
              {/* Geofence boundary - circular area around Drogheda */}
              <circle 
                cx="50" 
                cy="50" 
                r="35" 
                fill="none" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2" 
                strokeDasharray="4 2"
                opacity="0.6"
              />
              
              {/* Roads (simplified) */}
              <path d="M 20 50 L 80 50" stroke="rgba(100,100,100,0.3)" strokeWidth="1.5" />
              <path d="M 50 20 L 50 80" stroke="rgba(100,100,100,0.3)" strokeWidth="1.5" />
              <path d="M 30 30 L 70 70" stroke="rgba(100,100,100,0.3)" strokeWidth="1" />
              
              {/* Mr Bubbles HQ Marker */}
              <g transform={`translate(${mrBubblesHQ.x}, ${mrBubblesHQ.y})`}>
                {/* HQ Building */}
                <rect x="-3" y="-5" width="6" height="5" fill="hsl(var(--primary))" opacity="0.8" />
                <circle cx="0" cy="-8" r="2" fill="hsl(var(--primary))" />
                <text x="0" y="-12" fontSize="3" textAnchor="middle" fill="hsl(var(--primary))" fontWeight="bold">HQ</text>
              </g>
            </svg>

            {/* Animated Van */}
            {showDriverVan && (
              <div 
                className="absolute transition-all duration-1000 ease-in-out"
                style={{
                  left: `${vanPosition.x}%`,
                  top: `${vanPosition.y}%`,
                  transform: `translate(-50%, -50%) scale(${isAnimating ? 1.05 : 1})`,
                }}
              >
                <div className="relative">
                  {/* Van SVG */}
                  <svg width="60" height="40" viewBox="0 0 60 40" className="drop-shadow-lg">
                    {/* Van body */}
                    <rect x="5" y="12" width="45" height="20" rx="3" fill="hsl(var(--primary))" />
                    {/* Van cab */}
                    <path d="M 12 12 L 12 8 L 30 8 L 35 12 Z" fill="hsl(var(--primary))" opacity="0.9" />
                    {/* Windows */}
                    <rect x="14" y="9.5" width="8" height="5" rx="1" fill="rgba(255,255,255,0.3)" />
                    <rect x="24" y="9.5" width="7" height="5" rx="1" fill="rgba(255,255,255,0.3)" />
                    <rect x="10" y="16" width="35" height="10" rx="1" fill="rgba(255,255,255,0.2)" />
                    {/* Wheels */}
                    <circle cx="18" cy="32" r="5" fill="#333" />
                    <circle cx="18" cy="32" r="3" fill="#666" />
                    <circle cx="42" cy="32" r="5" fill="#333" />
                    <circle cx="42" cy="32" r="3" fill="#666" />
                    {/* Logo */}
                    <text x="27" y="23" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">MB</text>
                  </svg>
                  
                  {/* Pulsing indicator */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 animate-ping" />
                    <div className="absolute inset-0 w-8 h-8 rounded-full bg-primary/40" />
                  </div>
                </div>
              </div>
            )}

            {/* Driver location marker (when available) */}
            {driverLocation && (
              <div 
                className="absolute transition-all duration-500"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Navigation className="h-8 w-8 text-primary animate-pulse" />
              </div>
            )}

            {/* Location labels */}
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-medium">Pilot Area</p>
                  <p className="text-xs text-muted-foreground">Drogheda, Louth</p>
                </div>
              </div>
            </div>

            {/* Geofence info */}
            <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-medium">Service Area Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {orderStatus === 'confirmed' ? (
                <Clock className="h-5 w-5 text-primary" />
              ) : (
                <Navigation className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {orderStatus === 'confirmed' && 'Awaiting Driver Acceptance'}
                {orderStatus === 'picked_up' && 'Driver En Route to Shop'}
                {orderStatus === 'out_for_delivery' && 'Out for Delivery'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {orderStatus === 'confirmed' && 'Mr Bubbles van is ready at HQ on Bubbles Road'}
                {orderStatus === 'picked_up' && 'Your laundry is being transported for cleaning'}
                {orderStatus === 'out_for_delivery' && 'Driver is heading to your location'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

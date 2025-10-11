import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface RealDroghedaMapProps {
  showDriverLocation?: boolean;
  driverLat?: number;
  driverLng?: number;
  customerLat?: number;
  customerLng?: number;
  height?: string;
}

// Drogheda, Louth, Ireland coordinates
const DROGHEDA_CENTER = { lat: 53.7175, lng: -6.3500 };
const GEOFENCE_RADIUS = 5000; // 5km radius in meters

export function RealDroghedaMap({ 
  showDriverLocation = false, 
  driverLat, 
  driverLng,
  customerLat,
  customerLng,
  height = "400px" 
}: RealDroghedaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Drogheda
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([DROGHEDA_CENTER.lat, DROGHEDA_CENTER.lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add geofence boundary circle
    L.circle([DROGHEDA_CENTER.lat, DROGHEDA_CENTER.lng], {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      radius: GEOFENCE_RADIUS,
      dashArray: '10, 10',
      weight: 3,
    }).addTo(map);

    // Add Mr Bubbles HQ marker
    const hqIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <div style="
            background: #3b82f6;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 12px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            position: absolute;
            bottom: 35px;
            left: 50%;
            transform: translateX(-50%);
          ">
            🫧 Mr Bubbles HQ
          </div>
          <div style="
            width: 32px;
            height: 32px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
          ">
            🏢
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([DROGHEDA_CENTER.lat, DROGHEDA_CENTER.lng], { icon: hqIcon }).addTo(map);

    // Add customer location if provided
    if (customerLat && customerLng) {
      const customerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: #10b981;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          ">
            🏠
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      L.marker([customerLat, customerLng], { icon: customerIcon }).addTo(map);
    }

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [customerLat, customerLng]);

  // Update driver location
  useEffect(() => {
    if (!mapInstanceRef.current || !showDriverLocation) return;

    const map = mapInstanceRef.current;

    if (driverLat && driverLng) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([driverLat, driverLng]);
      } else {
        const driverIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="position: relative;">
              <div style="
                background: #f59e0b;
                color: white;
                padding: 6px 10px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 11px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                position: absolute;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
              ">
                Driver
              </div>
              <div style="
                width: 40px;
                height: 40px;
                background: #f59e0b;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                animation: pulse 2s infinite;
              ">
                🚐
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        driverMarkerRef.current = L.marker([driverLat, driverLng], { 
          icon: driverIcon 
        }).addTo(map);
      }

      // Pan to driver location
      map.panTo([driverLat, driverLng]);
    }
  }, [showDriverLocation, driverLat, driverLng]);

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div 
          ref={mapRef} 
          style={{ height, width: '100%' }}
          data-testid="real-drogheda-map"
        />
        
        {/* Pilot Area Label */}
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[1000]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-semibold">Pilot Area</p>
              <p className="text-xs text-muted-foreground">Drogheda, Louth</p>
            </div>
          </div>
        </div>

        {/* Service Area Active */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 z-[1000]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs font-medium">Service Area Active</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        .leaflet-container {
          font-family: inherit;
        }
        
        .custom-marker {
          background: none;
          border: none;
        }
      `}</style>
    </Card>
  );
}

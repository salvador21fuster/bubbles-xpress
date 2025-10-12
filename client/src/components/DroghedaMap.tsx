import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DroghedaMapProps {
  height?: string;
  showMarker?: boolean;
  markerPosition?: [number, number];
  markerLabel?: string;
  showDriverVan?: boolean;
  driverLocation?: { latitude: number; longitude: number } | null;
}

export function DroghedaMap({ 
  height = "400px", 
  showMarker = true,
  markerPosition,
  markerLabel = "Your location",
  showDriverVan = false,
  driverLocation
}: DroghedaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Drogheda, Ireland coordinates
    const droghedaCenter: [number, number] = [53.7187, -6.3478];
    
    // Initialize map
    const map = L.map(mapRef.current, {
      center: markerPosition || droghedaCenter,
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles (Uber-like style)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add user location marker if enabled
    if (showMarker) {
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: #06C167;
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg style="transform: rotate(45deg);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      L.marker(markerPosition || droghedaCenter, { icon: markerIcon })
        .addTo(map)
        .bindPopup(markerLabel);
    }

    // Add driver van marker if enabled
    if (showDriverVan && driverLocation) {
      const vanIcon = L.divIcon({
        className: 'van-marker',
        html: `
          <div style="
            background: #06C167;
            padding: 8px 12px;
            border-radius: 20px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <path d="M16 8h2l3 3v5h-3"></path>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span style="color: white; font-weight: 600; font-size: 14px;">Driver</span>
          </div>
        `,
        iconSize: [100, 36],
        iconAnchor: [50, 18],
      });

      L.marker([driverLocation.latitude, driverLocation.longitude], { icon: vanIcon })
        .addTo(map)
        .bindPopup('Your driver is here!');
    }

    // Add nearby laundry shops markers (mock data for Drogheda area)
    const laundryShops = [
      { lat: 53.7197, lng: -6.3488, name: "Mr Bubbles HQ", type: "hq" },
      { lat: 53.7177, lng: -6.3468, name: "Bubbles Road Station", type: "shop" },
      { lat: 53.7207, lng: -6.3458, name: "Quick Clean Express", type: "shop" },
    ];

    laundryShops.forEach(shop => {
      const shopIcon = L.divIcon({
        className: 'shop-marker',
        html: `
          <div style="
            background: ${shop.type === 'hq' ? '#06C167' : '#ffffff'};
            color: ${shop.type === 'hq' ? '#ffffff' : '#000000'};
            padding: 6px 12px;
            border-radius: 20px;
            border: 2px solid #06C167;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          ">${shop.name}</div>
        `,
        iconSize: [140, 30],
        iconAnchor: [70, 15],
      });

      L.marker([shop.lat, shop.lng], { icon: shopIcon })
        .addTo(map)
        .bindPopup(`<b>${shop.name}</b><br>${shop.type === 'hq' ? 'Main Hub' : 'Pickup Point'}`);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [markerPosition, markerLabel, showMarker, showDriverVan, driverLocation]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%', borderRadius: '8px' }}
      data-testid="map-drogheda"
      className="shadow-sm"
    />
  );
}

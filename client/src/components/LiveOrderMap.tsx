import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { RealDroghedaMap } from '@/components/RealDroghedaMap';
import type { Order, User } from '@shared/schema';

interface LiveOrderMapProps {
  orderId: string;
}

export function LiveOrderMap({ orderId }: LiveOrderMapProps) {
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { data: order } = useQuery<Order>({
    queryKey: ['/api/orders', orderId],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: driver } = useQuery<User>({
    queryKey: ['/api/users', order?.driverId],
    enabled: !!order?.driverId,
    refetchInterval: 5000, // Refresh driver location every 5 seconds
  });

  useEffect(() => {
    if (driver?.currentLatitude && driver?.currentLongitude) {
      setDriverLocation({
        latitude: parseFloat(driver.currentLatitude),
        longitude: parseFloat(driver.currentLongitude),
      });
    }
  }, [driver]);

  if (!order) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  const isPickupPhase = order.state === 'confirmed' || order.state === 'picked_up';
  const isDeliveryPhase = order.state === 'out_for_delivery';
  const showTracking = isPickupPhase || isDeliveryPhase;

  if (!showTracking) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {order.state === 'created' ? 'Awaiting payment' :
             order.state === 'delivered' ? 'Order delivered' :
             'Order is being processed'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real Map with Live Tracking */}
      <RealDroghedaMap 
        height="400px"
        showDriverLocation={!!driverLocation}
        driverLat={driverLocation?.latitude}
        driverLng={driverLocation?.longitude}
      />

      {/* Status Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-full ${driverLocation ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center`}>
              <Navigation className={`h-5 w-5 ${driverLocation ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {isPickupPhase ? 'Driver heading to pickup location' : 'Driver heading to delivery location'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {driverLocation ? 'Live tracking active' : 'Waiting for driver to go online'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

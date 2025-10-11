import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useDriverLocation(isActive: boolean) {
  const watchIdRef = useRef<number | null>(null);

  const updateLocationMutation = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      return await apiRequest('POST', '/api/driver/location', { latitude, longitude });
    },
  });

  useEffect(() => {
    if (!isActive) {
      // Stop watching location when driver goes offline
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Start watching location when driver is online
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          updateLocationMutation.mutate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000, // 10 seconds
          timeout: 30000, // 30 seconds
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isActive, updateLocationMutation]);

  return { isTracking: isActive && watchIdRef.current !== null };
}

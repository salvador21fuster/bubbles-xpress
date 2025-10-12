import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, placeDetails?: any) => void;
  placeholder?: string;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
  };
}

export function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter your address",
  className = ""
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=ie&` + // Restrict to Ireland
        `addressdetails=1&` +
        `limit=5`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data: NominatimResult[] = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error('Address search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    setInputValue(suggestion.display_name);
    onChange(suggestion.display_name, suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `format=json&` +
            `lat=${latitude}&` +
            `lon=${longitude}&` +
            `addressdetails=1`,
            {
              headers: {
                'Accept': 'application/json',
              }
            }
          );

          if (response.ok) {
            const data: NominatimResult = await response.json();
            const address = data.display_name;
            setInputValue(address);
            onChange(address, data);
            toast({
              title: "Location found",
              description: "Using your current location",
            });
          }
        } catch (error) {
          toast({
            title: "Location error",
            description: "Unable to get address from location",
            variant: "destructive",
          });
        }
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Unable to get your location. Please enter manually.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pl-10 h-12 rounded-lg border-gray-300"
            data-testid="input-address-autocomplete"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUseCurrentLocation}
          className="h-12 w-12 rounded-lg"
          data-testid="button-use-gps"
        >
          <Navigation className="h-5 w-5 text-primary" />
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const mainText = suggestion.address?.road || suggestion.address?.suburb || 
                           suggestion.display_name.split(',')[0];
            const secondaryText = suggestion.display_name
              .split(',')
              .slice(1)
              .join(',')
              .trim();
            
            return (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0"
                data-testid={`suggestion-${index}`}
              >
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {mainText}
                  </p>
                  {secondaryText && (
                    <p className="text-xs text-gray-500 truncate">
                      {secondaryText}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

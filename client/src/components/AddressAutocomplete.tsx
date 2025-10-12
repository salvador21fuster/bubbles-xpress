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

export function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter your address",
  className = ""
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    // Initialize Google Places API services
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found');
      return;
    }

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeServices;
      document.head.appendChild(script);
    } else {
      initializeServices();
    }
  }, []);

  const initializeServices = () => {
    if (window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (!newValue || !autocompleteService.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Get predictions from Google Places
    autocompleteService.current.getPlacePredictions(
      {
        input: newValue,
        componentRestrictions: { country: 'ie' }, // Restrict to Ireland
      },
      (predictions: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion.description);
    onChange(suggestion.description, suggestion);
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
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address from coordinates
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: any[], status: any) => {
              if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                setInputValue(address);
                onChange(address, results[0]);
                toast({
                  title: "Location found",
                  description: "Using your current location",
                });
              }
            }
          );
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
          {suggestions.map((suggestion, index) => (
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
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </p>
                {suggestion.structured_formatting?.secondary_text && (
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

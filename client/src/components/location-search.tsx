import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface LocationSearchProps {
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  map: google.maps.Map | null;
}

export function LocationSearch({ onLocationChange, map }: LocationSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
      fields: ['place_id', 'geometry', 'formatted_address']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onLocationChange(lat, lng, place.formatted_address);
        
        toast({
          title: "Location found",
          description: place.formatted_address || "Location updated",
        });
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onLocationChange, toast]);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsSearching(true);
    
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
        geocoder.geocode({ address: searchValue }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve({ results } as google.maps.GeocoderResponse);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (result.results && result.results[0]) {
        const location = result.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        onLocationChange(lat, lng, result.results[0].formatted_address);
        
        toast({
          title: "Location found",
          description: result.results[0].formatted_address,
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not find the specified location",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange(latitude, longitude);

        // Reverse geocode to get address
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results) {
                  resolve({ results } as google.maps.GeocoderResponse);
                } else {
                  reject(new Error(`Reverse geocoding failed: ${status}`));
                }
              }
            );
          });

          if (result.results && result.results[0]) {
            setSearchValue(result.results[0].formatted_address);
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        }

        toast({
          title: "Location found",
          description: "Using your current location",
        });

        setIsGettingLocation(false);
      },
      (error) => {
        let message = "Could not get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }

        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        });

        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="absolute top-4 left-4 right-20 z-10">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for a location..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4"
              disabled={isSearching}
            />
          </div>
          
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchValue.trim()}
            size="icon"
            variant="outline"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>

          <Button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            size="icon"
            variant="outline"
            title="Use current location"
          >
            {isGettingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Locate className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Polygon } from "@react-google-maps/api";
import { Layers, ZoomIn, ZoomOut, RotateCcw, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getMoodColorWithOpacity } from "@/lib/map-utils";
import { LocationSearch } from "@/components/location-search";
import type { MoodData } from "@shared/schema";

interface MapViewProps {
  moodData: (MoodData & { filteredScore: number })[];
  onAreaClick: (area: MoodData) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const libraries = ['places'] as const;

const options = {
  disableDefaultUI: false,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export function MapView({ moodData, onAreaClick, onRefresh, isRefreshing }: MapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const { toast } = useToast();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(Math.max(1, currentZoom - 1));
    }
  };

  const toggleMapType = () => {
    const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    setMapType(newType);
    if (map) {
      map.setMapTypeId(newType);
    }
  };

  const handleRefresh = () => {
    onRefresh();
    toast({
      title: "Refreshing data",
      description: "Updating mood data from all sources...",
    });
  };

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    const newCenter = { lat, lng };
    setMapCenter(newCenter);
    setMapZoom(14);
    
    if (map) {
      map.panTo(newCenter);
      map.setZoom(14);
    }
  };

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Loading Error</h3>
          <p className="text-gray-600 mb-4">Failed to load Google Maps. Please check your API key.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Map</h3>
          <p className="text-gray-600">Initializing Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <LocationSearch onLocationChange={handleLocationChange} map={map} />
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          ...options,
          mapTypeId: mapType,
        }}
      >
        {moodData.map((area) => (
          <Polygon
            key={area.areaId}
            paths={area.coordinates}
            onClick={() => onAreaClick(area)}
            options={{
              fillColor: getMoodColorWithOpacity(area.filteredScore || area.overallScore),
              fillOpacity: 0.6,
              strokeColor: '#000000',
              strokeOpacity: 0.8,
              strokeWeight: 1,
              clickable: true,
            }}
          />
        ))}
      </GoogleMap>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-3">
        {/* Map Style Toggle */}
        <div className="bg-white rounded-lg shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMapType}
            className="h-10 w-10"
          >
            <Layers className="h-5 w-5" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="bg-white rounded-lg shadow-lg flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="h-10 w-10 rounded-b-none"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="h-px bg-gray-200"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="h-10 w-10 rounded-t-none"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Refresh Data */}
        <div className="bg-white rounded-lg shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 w-10"
          >
            <RotateCcw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Palette className="mr-2 text-primary h-4 w-4" />
          Mood Scale
        </h4>
        <div className="space-y-2">
          {[
            { color: '#4CAF50', label: 'Very Positive', range: '8-10' },
            { color: '#8BC34A', label: 'Positive', range: '6-7' },
            { color: '#FF9800', label: 'Neutral', range: '4-5' },
            { color: '#FF7043', label: 'Negative', range: '2-3' },
            { color: '#F44336', label: 'Very Negative', range: '0-1' },
          ].map(({ color, label, range }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
              <span className="text-xs text-gray-500">{range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-gray-700">Loading mood data...</span>
          </div>
        </div>
      )}
    </div>
  );
}

import { useCallback, useRef, useState } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { LocateFixed, MapPin, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useGoogleMaps, isGoogleMapsConfigured, parseAddressComponents, ParsedAddress } from '../../lib/googleMaps';
import { cn } from '../../lib/utils';

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // India centroid — sensible default, re-centers on first pick
const containerStyle = { width: '100%', height: '280px', borderRadius: '12px' };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8b93a7' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d3a' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0f1a' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
};

interface LocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (location: ParsedAddress) => void;
}

export const LocationPicker = ({ value, onChange }: LocationPickerProps) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [marker, setMarker] = useState(value || null);
  const [mapCenter, setMapCenter] = useState(value || DEFAULT_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const getGeocoder = () => {
    if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
    return geocoderRef.current;
  };

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    getGeocoder().geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const parsed = parseAddressComponents(results[0].address_components, results[0].formatted_address);
        onChange({ ...parsed, lat, lng, placeId: results[0].place_id });
      } else {
        onChange({ address: '', city: '', state: '', pincode: '', formattedAddress: '', lat, lng });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeMarker = (lat: number, lng: number) => {
    setMarker({ lat, lng });
    setMapCenter({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    placeMarker(e.latLng.lat(), e.latLng.lng());
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    placeMarker(e.latLng.lat(), e.latLng.lng());
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const parsed = parseAddressComponents(place.address_components, place.formatted_address);
    setMarker({ lat, lng });
    setMapCenter({ lat, lng });
    onChange({ ...parsed, lat, lng, placeId: place.place_id });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        placeMarker(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!isGoogleMapsConfigured) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center text-xs text-muted-foreground">
        <MapPin className="mx-auto mb-1.5 h-4 w-4" />
        Map location picker isn't configured. You can still fill in the address fields below manually.
      </div>
    );
  }

  if (loadError) {
    return <p className="text-xs text-red-400">Failed to load Google Maps. Check your API key and try again.</p>;
  }

  if (!isLoaded) {
    return <div className="h-[280px] animate-pulse rounded-xl bg-white/5" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Autocomplete onLoad={(ac) => (autocompleteRef.current = ac)} onPlaceChanged={handlePlaceChanged}>
            <input
              type="text"
              placeholder="Search for an address or place..."
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all duration-200 focus:border-indigo-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Autocomplete>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          isLoading={isLocating}
          onClick={handleUseCurrentLocation}
          title="Use my current location"
        >
          <LocateFixed className="h-4 w-4" />
        </Button>
      </div>

      <div className={cn('overflow-hidden rounded-xl border border-white/10')}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={marker ? 16 : 5}
          options={mapOptions}
          onClick={handleMapClick}
        >
          {marker && <Marker position={marker} draggable onDragEnd={handleMarkerDragEnd} />}
        </GoogleMap>
      </div>

      <p className="text-xs text-muted-foreground">
        {marker ? 'Drag the pin to fine-tune, or search a new address above.' : 'Click on the map, search an address, or use your current location to drop a pin.'}
      </p>
    </div>
  );
};

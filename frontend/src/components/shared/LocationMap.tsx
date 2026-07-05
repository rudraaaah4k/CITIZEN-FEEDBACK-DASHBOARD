import { GoogleMap, Marker } from '@react-google-maps/api';
import { MapPin, ExternalLink } from 'lucide-react';
import { useGoogleMaps, isGoogleMapsConfigured } from '../../lib/googleMaps';

const containerStyle = { width: '100%', height: '220px', borderRadius: '12px' };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: 'cooperative',
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8b93a7' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d3a' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0f1a' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
};

interface LocationMapProps {
  lat: number;
  lng: number;
  label?: string;
}

export const LocationMap = ({ lat, lng, label }: LocationMapProps) => {
  const { isLoaded, loadError } = useGoogleMaps();

  if (!isGoogleMapsConfigured) return null;
  if (loadError) return <p className="text-xs text-red-400">Failed to load map.</p>;
  if (!isLoaded) return <div className="h-[220px] animate-pulse rounded-xl bg-white/5" />;

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-white/10">
        <GoogleMap mapContainerStyle={containerStyle} center={{ lat, lng }} zoom={16} options={mapOptions}>
          <Marker position={{ lat, lng }} title={label} />
        </GoogleMap>
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
      >
        <MapPin className="h-3.5 w-3.5" /> Open in Google Maps <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
};

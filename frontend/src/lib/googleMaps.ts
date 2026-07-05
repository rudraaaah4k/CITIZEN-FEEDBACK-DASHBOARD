import { useJsApiLoader } from '@react-google-maps/api';

// Must be a stable module-level reference — @react-google-maps/api warns/breaks
// if the `libraries` array is a new object on every render.
export const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places'];

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const isGoogleMapsConfigured = !!GOOGLE_MAPS_API_KEY;

/** Shared loader so every map/autocomplete on the page reuses one script tag. */
export const useGoogleMaps = () => {
  return useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
};

export interface ParsedAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
  formattedAddress: string;
  placeId?: string;
  lat: number;
  lng: number;
}

/** Extracts city/state/pincode out of Google's address_components array */
export const parseAddressComponents = (
  components: google.maps.GeocoderAddressComponent[] = [],
  fallbackFormatted = ''
): Omit<ParsedAddress, 'lat' | 'lng' | 'placeId'> => {
  const get = (type: string) => components.find((c) => c.types.includes(type))?.long_name || '';

  const streetNumber = get('street_number');
  const route = get('route');
  const city = get('locality') || get('postal_town') || get('administrative_area_level_2');
  const state = get('administrative_area_level_1');
  const pincode = get('postal_code');
  const address = [streetNumber, route].filter(Boolean).join(' ') || fallbackFormatted;

  return { address, city, state, pincode, formattedAddress: fallbackFormatted };
};

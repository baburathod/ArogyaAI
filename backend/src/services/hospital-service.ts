export type Hospital = {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  distanceKm?: number;
};

const hospitals: Hospital[] = [
  { name: 'Arogya Health Center', latitude: 12.9716, longitude: 77.5946, address: '1 Main Road, Central City' },
  { name: 'City Care Hospital', latitude: 12.9750, longitude: 77.5938, address: '15 Hospital Street, East Block' },
  { name: 'Green Cross Emergency', latitude: 12.9689, longitude: 77.6036, address: '22 Park Avenue, North Sector' },
  { name: 'Metro Lifeline Clinic', latitude: 12.9611, longitude: 77.6201, address: '47 New Town Road, Westside' },
  { name: 'Rapid Response Trauma Center', latitude: 12.9877, longitude: 77.5998, address: '89 Riverbend Lane, South Junction' },
];

const rad = (value: number) => (value * Math.PI) / 180;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

export function findNearbyHospitals(
  latitude?: number,
  longitude?: number,
  maxDistanceKm = 15,
  searchQuery?: string
) {
  let results = hospitals.map((hospital) => ({
    ...hospital,
    distanceKm: latitude !== undefined && longitude !== undefined
      ? calculateDistanceKm(latitude, longitude, hospital.latitude, hospital.longitude)
      : undefined,
  }));

  if (searchQuery) {
    const normalized = searchQuery.trim().toLowerCase();
    results = results.filter((hospital) =>
      hospital.name.toLowerCase().includes(normalized) || hospital.address.toLowerCase().includes(normalized)
    );
  }

  if (latitude !== undefined && longitude !== undefined) {
    results = results.filter((hospital) => hospital.distanceKm !== undefined && hospital.distanceKm <= maxDistanceKm);
    results.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  return results;
}

/**
 * Parse common external hospital API response formats into Hospital[] shape.
 * Supports: Google Places, OSM Nominatim, custom arrays, and nested structures.
 */
function parseExternalApiResponse(data: any): Hospital[] {
  if (!data) return [];

  // Direct array of hospitals
  if (Array.isArray(data)) {
    return data.map((h: any) => ({
      name: h.name || h.title || h.displayName || '',
      latitude: h.latitude || h.lat || h.geometry?.location?.lat || 0,
      longitude: h.longitude || h.lon || h.lng || h.geometry?.location?.lng || 0,
      address: h.address || h.vicinity || h.formatted_address || '',
      distanceKm: h.distanceKm || h.distance,
    })).filter((h: Hospital) => h.name && h.latitude && h.longitude);
  }

  // Nested results (Google Places, Nominatim, etc.)
  const results = data.hospitals || data.results || data.candidates || data.features || [];
  if (Array.isArray(results)) {
    return results.map((h: any) => ({
      name: h.name || h.displayName?.text || h.title || '',
      latitude: h.latitude || h.lat || h.geometry?.location?.lat || h.geometry?.coordinates?.[1] || 0,
      longitude: h.longitude || h.lon || h.lng || h.geometry?.location?.lng || h.geometry?.coordinates?.[0] || 0,
      address: h.address || h.vicinity || h.formatted_address || '',
      distanceKm: h.distanceKm || h.distance,
    })).filter((h: Hospital) => h.name && h.latitude && h.longitude);
  }

  return [];
}

// Optional external lookup: If BACKEND_HOSPITALS_API is configured, try fetching from it.
export async function externalHospitalLookup(query: string, latitude?: number, longitude?: number, maxDistanceKm = 15) {
  const api = process.env.BACKEND_HOSPITALS_API;
  if (!api) return [];

  try {
    const url = new URL(api);
    url.searchParams.set('query', query || 'hospital');
    if (latitude !== undefined) url.searchParams.set('latitude', String(latitude));
    if (longitude !== undefined) url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('maxDistance', String(maxDistanceKm));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    const parsed = parseExternalApiResponse(data);
    
    // Filter by distance if we have coordinates
    if (latitude !== undefined && longitude !== undefined) {
      return parsed.filter((h) => {
        const dist = calculateDistanceKm(latitude, longitude, h.latitude, h.longitude);
        return dist <= maxDistanceKm;
      }).map((h) => ({
        ...h,
        distanceKm: calculateDistanceKm(latitude, longitude, h.latitude, h.longitude),
      })).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    
    return parsed;
  } catch (error) {
    console.warn('External hospital API lookup failed:', error);
    return [];
  }
}

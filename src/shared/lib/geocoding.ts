type GeocodePoint = {
  lat: number;
  lng: number;
  label: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

const geocodeCache = new Map<string, GeocodePoint | null>();

export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<GeocodePoint | null> {
  const normalizedAddress = address.trim();
  if (!normalizedAddress) return null;

  const cached = geocodeCache.get(normalizedAddress);
  if (cached !== undefined) {
    return cached;
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", normalizedAddress);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "ru");

  const response = await fetch(url.toString(), {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const results = (await response.json()) as NominatimResult[];
  const match = results[0];

  if (!match) {
    geocodeCache.set(normalizedAddress, null);
    return null;
  }

  const point = {
    lat: Number(match.lat),
    lng: Number(match.lon),
    label: match.display_name,
  };

  if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) {
    geocodeCache.set(normalizedAddress, null);
    return null;
  }

  geocodeCache.set(normalizedAddress, point);
  return point;
}

export function buildOpenStreetMapSearchUrl(address: string) {
  const url = new URL("https://www.openstreetmap.org/search");
  url.searchParams.set("query", address);
  return url.toString();
}

export function buildOpenStreetMapDirectionsUrl(
  destination: { lat: number; lng: number },
  source?: { lat: number; lng: number } | null,
) {
  if (!source) {
    return buildOpenStreetMapSearchUrl(`${destination.lat},${destination.lng}`);
  }

  const url = new URL("https://www.openstreetmap.org/directions");
  url.searchParams.set("engine", "fossgis_osrm_car");
  url.searchParams.set(
    "route",
    `${source.lat},${source.lng};${destination.lat},${destination.lng}`,
  );
  return url.toString();
}

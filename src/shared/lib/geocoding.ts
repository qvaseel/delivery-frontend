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

type ParsedRussianAddress = {
  postalcode?: string;
  state?: string;
  city?: string;
  street?: string;
  house?: string;
};

const geocodeCache = new Map<string, GeocodePoint | null>();

function cleanupAddress(address: string) {
  return address
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ");
}

function parseRussianAddress(address: string): ParsedRussianAddress {
  const normalized = cleanupAddress(address);

  const postalcode = normalized.match(/\b\d{6}\b/)?.[0];

  const city =
    normalized.match(/(?:^|,\s*)(?:г\.?|город)\s+([^,]+)/i)?.[1]?.trim() ??
    undefined;

  const state =
    normalized.match(/([^,]*\bобл(?:асть)?\.?)/i)?.[1]?.trim() ?? undefined;

  const street =
    normalized.match(/(?:^|,\s*)(?:ул\.?|улица)\s+([^,]+)/i)?.[1]?.trim() ??
    undefined;

  const house =
    normalized
      .match(/(?:^|,\s*)(?:д\.?|дом)\s*([0-9А-Яа-яA-Za-z/\\-]+)/i)?.[1]
      ?.trim() ?? undefined;

  return {
    postalcode,
    state,
    city,
    street,
    house,
  };
}

function normalizeFreeFormAddress(address: string) {
  return cleanupAddress(address)
    .replace(/\bг\.?\s+/gi, "")
    .replace(/\bгород\s+/gi, "")
    .replace(/\bул\.?\s+/gi, "улица ")
    .replace(/\bд\.?\s*/gi, "")
    .replace(/\bдом\s*/gi, "");
}

function buildFreeFormQueries(address: string) {
  const parsed = parseRussianAddress(address);
  const normalized = normalizeFreeFormAddress(address).replace(
    /\b\d{6},?\s*/g,
    "",
  );

  const queries: string[] = [];

  if (parsed.street && parsed.house && parsed.city) {
    queries.push(
      `улица ${parsed.street} ${parsed.house}, ${parsed.city}, Россия`,
    );
    queries.push(`${parsed.street} ${parsed.house}, ${parsed.city}, Россия`);
  }

  queries.push(normalized);
  queries.push(`${normalized}, Россия`);

  return [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
}

async function fetchNominatim(
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<GeocodePoint | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");

  for (const [key, value] of Object.entries(params)) {
    if (value.trim()) {
      url.searchParams.set(key, value.trim());
    }
  }

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "ru");
  url.searchParams.set("countrycodes", "ru");
  url.searchParams.set("addressdetails", "1");

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

  if (!match) return null;

  const point = {
    lat: Number(match.lat),
    lng: Number(match.lon),
    label: match.display_name,
  };

  if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) {
    return null;
  }

  return point;
}

export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<GeocodePoint | null> {
  const normalizedAddress = cleanupAddress(address);
  if (!normalizedAddress) return null;

  const cached = geocodeCache.get(normalizedAddress);
  if (cached !== undefined) {
    return cached;
  }

  const parsed = parseRussianAddress(normalizedAddress);

  const attempts: Record<string, string>[] = [];

  if (parsed.street && parsed.house && parsed.city) {
    attempts.push({
      street: `${parsed.house} ${parsed.street}`,
      city: parsed.city,
      state: parsed.state ?? "",
      country: "Россия",
      postalcode: parsed.postalcode ?? "",
    });
  }

  for (const query of buildFreeFormQueries(normalizedAddress)) {
    attempts.push({ q: query });
  }

  for (const params of attempts) {
    const point = await fetchNominatim(params, signal);
    if (point) {
      geocodeCache.set(normalizedAddress, point);
      return point;
    }
  }

  geocodeCache.set(normalizedAddress, null);
  return null;
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

/**
 * Bunnings Developer API client.
 * OAuth2 Client Credentials + Item Search, Pricing, Location, Inventory, Spaces APIs.
 * Sandbox only — switch base URLs via env vars for production.
 */

// --- Types ---

export interface BunningsProduct {
  itemNumber: string | null;
  title: string | null;
  brand?: string;
  price?: number;
  inStock?: boolean;
  aisle?: string;
  bay?: string;
  matchedTo: string;
  error?: "no_match" | "api_error";
}

export interface BunningsStoreInfo {
  locationCode: string;
  name: string;
  address: string;
}

export interface BunningsData {
  products: BunningsProduct[];
  store: BunningsStoreInfo;
  totalEstimate: number;
  matchedAt: string;
}

interface BunningsSearchResult {
  itemNumber: string;
  title: string;
}

interface BunningsPrice {
  itemNumber: string;
  unitPrice: number;
}

interface BunningsLocation {
  locationCode: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface BunningsStock {
  itemNumber: string;
  levelIndicator: string;
}

interface BunningsAisleInfo {
  itemNumber: string;
  aisle?: string;
  bay?: string;
}

// --- Token Cache ---

const TOKEN_URL = "https://connect.sandbox.api.bunnings.com.au/connect/token";
const ITEM_BASE = "https://item.sandbox.api.bunnings.com.au/item";
const PRICING_BASE = "https://pricing.sandbox.api.bunnings.com.au/pricing";
const LOCATION_BASE = "https://location.sandbox.api.bunnings.com.au/location";
const INVENTORY_BASE = "https://inventory.sandbox.api.bunnings.com.au/inventory";

let tokenCache: { jwt: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();

  if (tokenCache && tokenCache.expiresAt - 60000 > now) {
    return tokenCache.jwt;
  }

  const clientId = process.env.BUNNINGS_CLIENT_ID;
  const clientSecret = process.env.BUNNINGS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("BUNNINGS_CLIENT_ID and BUNNINGS_CLIENT_SECRET must be set");
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials&scope=itm:details pri:pub loc:pub inv:pub`,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bunnings auth failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  tokenCache = {
    jwt: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return tokenCache.jwt;
}

// --- Helper ---

function buildSearchQuery(materialItem: string): string {
  return materialItem
    .replace(/\b\d+\s*(ml|L|mm|cm|m|sheets?|packs?|rolls?)\b/gi, "")
    .replace(/\s*[-—–]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 60);
}

// --- API Functions ---

export async function searchItem(query: string): Promise<BunningsSearchResult[]> {
  const token = await getToken();
  const searchQuery = buildSearchQuery(query);

  const response = await fetch(`${ITEM_BASE}/search/AU`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-version-api": "1.3",
    },
    body: JSON.stringify({
      query: searchQuery,
      filters: {},
    }),
  });

  if (!response.ok) {
    console.error(`Bunnings item search failed (${response.status}): ${await response.text()}`);
    return [];
  }

  const data = await response.json();
  const results = data.results || [];

  return results.map((r: any) => ({
    itemNumber: r.itemNumber || r._meta?.itemNumber,
    title: r.title || r.name || "Unknown item",
  }));
}

export async function getPrices(
  itemNumbers: string[],
  locationCode: string
): Promise<BunningsPrice[]> {
  if (itemNumbers.length === 0) return [];

  const token = await getToken();

  const response = await fetch(`${PRICING_BASE}/catalog/prices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-version-api": "1.0",
    },
    body: JSON.stringify({
      context: {
        country: "AU",
        location: locationCode,
      },
      items: itemNumbers.map((num) => ({ itemNumber: num })),
    }),
  });

  if (!response.ok) {
    console.error(`Bunnings pricing failed (${response.status}): ${await response.text()}`);
    return [];
  }

  const data = await response.json();
  const prices = data.prices || [];

  return prices.map((p: any) => ({
    itemNumber: p.itemNumber,
    unitPrice: p.unitPrice ?? p.lineUnitPrice ?? 0,
  }));
}

export async function getNearestStores(
  lat: number,
  lng: number
): Promise<BunningsLocation[]> {
  const token = await getToken();

  const response = await fetch(
    `${LOCATION_BASE}/locations/nearest?latitude=${lat}&longitude=${lng}&diameter=50&maxResults=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-version-api": "1.0",
      },
    }
  );

  if (!response.ok) {
    console.error(`Bunnings location failed (${response.status}): ${await response.text()}`);
    return [];
  }

  const data = await response.json();
  const locations = Array.isArray(data) ? data : data.locations || [];

  return locations.map((loc: any) => ({
    locationCode: loc.locationCode,
    name: loc.friendlyName || loc.name || `Store ${loc.locationCode}`,
    address: [loc.address?.line1, loc.address?.townCity, loc.address?.state, loc.address?.postCode]
      .filter(Boolean)
      .join(", "),
    latitude: loc.geoLocation?.latitude ?? loc.latitude ?? 0,
    longitude: loc.geoLocation?.longitude ?? loc.longitude ?? 0,
    distance: loc.distance,
  }));
}

export async function getStock(
  locationCode: string,
  itemNumber: string
): Promise<BunningsStock | null> {
  const token = await getToken();

  const response = await fetch(
    `${INVENTORY_BASE}/itemStock/AU/${locationCode}/${itemNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-version-api": "1.0",
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return {
    itemNumber: data.itemNumber || itemNumber,
    levelIndicator: data.levelIndicator || "unknown",
  };
}

export async function getItemLocations(
  itemNumbers: string[],
  locationCode: string
): Promise<BunningsAisleInfo[]> {
  if (itemNumbers.length === 0) return [];

  const token = await getToken();

  const response = await fetch(
    `${ITEM_BASE}/locations/AU?itemNumbers=${itemNumbers.join(",")}&locationCodes=${locationCode}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-version-api": "1.3",
      },
    }
  );

  if (!response.ok) {
    console.error(`Bunnings item locations failed (${response.status}): ${await response.text()}`);
    return [];
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : data.results || [];

  return items.map((item: any) => {
    const loc = item.inStoreLocations?.[0];
    return {
      itemNumber: item.itemNumber,
      aisle: loc?.aisle || undefined,
      bay: loc?.bay || undefined,
    };
  });
}

/**
 * Match an array of AI-generated materials to real Bunnings products.
 * Searches, prices, checks stock, and finds in-store locations.
 */
export async function matchMaterials(
  materials: Array<{ item: string; qty: string }>,
  locationCode: string
): Promise<BunningsProduct[]> {
  // Step 1: Search for each material
  const searchResults = await Promise.all(
    materials.map(async (material) => {
      try {
        const results = await searchItem(material.item);
        return { material, result: results[0] || null };
      } catch {
        return { material, result: null };
      }
    })
  );

  // Separate matched and unmatched
  const matched = searchResults.filter((s) => s.result !== null);
  const unmatched = searchResults.filter((s) => s.result === null);

  if (matched.length === 0) {
    return materials.map((m) => ({
      itemNumber: null,
      title: null,
      matchedTo: m.item,
      error: "no_match" as const,
    }));
  }

  const itemNumbers = matched.map((m) => m.result!.itemNumber);

  // Step 2: Bulk fetch prices + locations in parallel
  const [prices, locations, stocks] = await Promise.all([
    getPrices(itemNumbers, locationCode).catch(() => [] as BunningsPrice[]),
    getItemLocations(itemNumbers, locationCode).catch(() => [] as BunningsAisleInfo[]),
    Promise.all(
      itemNumbers.map((num) => getStock(locationCode, num).catch(() => null))
    ),
  ]);

  // Build lookup maps
  const priceMap = new Map(prices.map((p) => [p.itemNumber, p.unitPrice]));
  const locationMap = new Map(locations.map((l) => [l.itemNumber, l]));
  const stockMap = new Map(
    stocks.map((s, i) => [itemNumbers[i], s])
  );

  // Step 3: Merge into BunningsProduct array
  const products: BunningsProduct[] = [];

  for (const { material, result } of matched) {
    const num = result!.itemNumber;
    const stock = stockMap.get(num);
    const loc = locationMap.get(num);
    const price = priceMap.get(num);

    products.push({
      itemNumber: num,
      title: result!.title,
      price,
      inStock: stock ? stock.levelIndicator !== "outOfStock" && stock.levelIndicator !== "0" : undefined,
      aisle: loc?.aisle,
      bay: loc?.bay,
      matchedTo: material.item,
    });
  }

  for (const { material } of unmatched) {
    products.push({
      itemNumber: null,
      title: null,
      matchedTo: material.item,
      error: "no_match",
    });
  }

  return products;
}

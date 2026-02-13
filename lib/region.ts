/**
 * Region configuration for location-aware AI prompts.
 * Maps user timezone/locale to currency and pricing context.
 */

export interface RegionConfig {
  country: string;
  currency: string;
  currencySymbol: string;
  pricingContext: string;
  budgetMultiplier: number; // relative to AUD base prices
}

const REGION_MAP: Record<string, RegionConfig> = {
  AU: {
    country: "AU",
    currency: "AUD",
    currencySymbol: "$",
    pricingContext: "Use generic product descriptions without brand or store names. Price estimates in Australian dollars (AUD).",
    budgetMultiplier: 1.0,
  },
  US: {
    country: "US",
    currency: "USD",
    currencySymbol: "$",
    pricingContext: "Use generic product descriptions without brand or store names. Price estimates in US dollars (USD).",
    budgetMultiplier: 0.65,
  },
  GB: {
    country: "GB",
    currency: "GBP",
    currencySymbol: "£",
    pricingContext: "Use generic product descriptions without brand or store names. Price estimates in British pounds (GBP).",
    budgetMultiplier: 0.52,
  },
  CA: {
    country: "CA",
    currency: "CAD",
    currencySymbol: "$",
    pricingContext: "Use generic product descriptions without brand or store names. Price estimates in Canadian dollars (CAD).",
    budgetMultiplier: 0.88,
  },
  NZ: {
    country: "NZ",
    currency: "NZD",
    currencySymbol: "$",
    pricingContext: "Use generic product descriptions without brand or store names. Price estimates in New Zealand dollars (NZD).",
    budgetMultiplier: 1.08,
  },
  EU: {
    country: "EU",
    currency: "EUR",
    currencySymbol: "€",
    pricingContext: "Use generic product descriptions without brand or store names. Price estimates in euros (EUR).",
    budgetMultiplier: 0.60,
  },
  IN: {
    country: "IN",
    currency: "INR",
    currencySymbol: "₹",
    pricingContext: "Use generic product descriptions without brand or store names. Price estimates in Indian rupees (INR).",
    budgetMultiplier: 54.0,
  },
};

const DEFAULT_REGION = REGION_MAP.AU;

// Maps timezone prefix to country code
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  "Australia/": "AU",
  "Pacific/Auckland": "NZ",
  "Pacific/Chatham": "NZ",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "Europe/London": "GB",
  "Europe/Paris": "EU",
  "Europe/Berlin": "EU",
  "Europe/Rome": "EU",
  "Europe/Madrid": "EU",
  "Europe/Amsterdam": "EU",
  "Europe/Brussels": "EU",
  "Europe/Vienna": "EU",
  "Europe/Dublin": "EU",
  "Europe/Lisbon": "EU",
  "Europe/Stockholm": "EU",
  "Europe/Helsinki": "EU",
  "Europe/Copenhagen": "EU",
  "Europe/Oslo": "EU",
  "Europe/Warsaw": "EU",
  "Europe/Prague": "EU",
  "Europe/Zurich": "EU",
  "Asia/Kolkata": "IN",
  "Asia/Mumbai": "IN",
};

/**
 * Resolve region config from timezone string.
 * Falls back to AUD/AU if unknown.
 */
export function getRegionConfig(timezone?: string): RegionConfig {
  if (!timezone) return DEFAULT_REGION;

  // Check exact match first
  const exactCountry = TIMEZONE_TO_COUNTRY[timezone];
  if (exactCountry && REGION_MAP[exactCountry]) {
    return REGION_MAP[exactCountry];
  }

  // Check prefix match (e.g. "Australia/" covers all AU timezones)
  for (const [prefix, country] of Object.entries(TIMEZONE_TO_COUNTRY)) {
    if (prefix.endsWith("/") && timezone.startsWith(prefix)) {
      if (REGION_MAP[country]) return REGION_MAP[country];
    }
  }

  return DEFAULT_REGION;
}

/**
 * Get country code from timezone.
 */
export function getCountryCode(timezone?: string): string {
  return getRegionConfig(timezone).country;
}

/**
 * Scale budget ranges based on region.
 */
export function scaleBudget(
  baseRanges: Record<string, { min: number; max: number; description: string }>,
  region: RegionConfig
): Record<string, { min: number; max: number; description: string }> {
  const scaled: Record<string, { min: number; max: number; description: string }> = {};
  for (const [key, val] of Object.entries(baseRanges)) {
    scaled[key] = {
      min: Math.round(val.min * region.budgetMultiplier),
      max: Math.round(val.max * region.budgetMultiplier),
      description: val.description,
    };
  }
  return scaled;
}

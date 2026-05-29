// lib/search/listings-search.ts
import type { Listing } from "@/app/actions/listings";

// POPULAR_SEARCHES are hardcoded because they describe *intent* (room types,
// price bands, property categories) not place names. Place name suggestions
// come from the DB via getDistinctLocations() instead.
export const POPULAR_SEARCHES = [
  "Single room", "Double room", "Self contained", "Bedsitter",
  "Under 300k", "300k - 700k", "Over 1M",
  "Office", "Shop", "Airbnb",
  "2 bedroom", "Ntinda", "Najjera", "Kololo", "Entebbe",
] as const;

type PropertyFilter = Listing["type"] | "airbnb";

type ParsedQuery = {
  text: string;
  locations: string[];
  types: PropertyFilter[];
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  roomPhrases: string[];
};

const TYPE_ALIASES: Record<PropertyFilter, string[]> = {
  house: [
    "house", "houses", "home", "homes", "apartment", "apartments", "flat",
    "flats", "rental", "rentals", "bungalow", "villa", "residence", "dwelling",
    "bedroom", "bedrooms", "room", "rooms", "self contained", "self-contained",
    "selfcontained", "studio", "bedsitter", "bed sitter", "bedsit",
    "single room", "double room", "master bedroom", "guest wing",
  ],
  office: [
    "office", "offices", "workspace", "work space", "commercial", "co working",
    "coworking", "business space",
  ],
  shop: [
    "shop", "shops", "store", "stores", "retail", "kiosk", "stall",
    "boutique", "warehouse", "showroom",
  ],
  airbnb: [
    "airbnb", "air bnb", "air-bnb", "bnb", "short stay", "short-term",
    "short term", "nightly", "vacation rental", "holiday home", "furnished",
    "guest house", "guesthouse",
  ],
};

const TYPO_MAP: Record<string, string> = {
  kampara: "kampala", kamapala: "kampala", kampela: "kampala",
  entebe: "entebbe", jinga: "jinja", ntind: "ntinda",
  najera: "najjera", najjerra: "najjera", kisasi: "kisaasi",
  mbarra: "mbarara", airbnbb: "airbnb", airbmb: "airbnb",
  "airb&b": "airbnb", "bed sitter": "bedsitter", selfcontained: "self contained",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NORMALIZED_TYPE_ALIASES = (
  Object.entries(TYPE_ALIASES) as [PropertyFilter, string[]][]
)
  .flatMap(([type, words]) =>
    words.map((alias) => ({ type, alias, norm: normalize(alias) }))
  )
  .sort((a, b) => b.norm.length - a.norm.length);

const NORMALIZED_AIRBNB_ALIASES = TYPE_ALIASES.airbnb.map(normalize);

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost);
      row[j - 1] = prev;
      prev = next;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

function fuzzyMatchNormalized(hay: string, needle: string): boolean {
  if (!needle) return true;
  if (hay.includes(needle)) return true;
  const needleTokens = needle.split(" ");
  if (needleTokens.length > 1) return hay.includes(needle);
  return hay.split(" ").some((token) => {
    if (token === needle || token.includes(needle) || needle.includes(token))
      return true;
    const maxDist = token.length <= 4 ? 0 : token.length <= 6 ? 1 : 2;
    return levenshtein(token, needle) <= maxDist;
  });
}

// ── Price parsing ──────────────────────────────────────────────────────────────
function parseAmount(raw: string, suffix?: string): number {
  let n = parseFloat(raw);
  if (Number.isNaN(n)) return 0;
  const s = (suffix ?? "").toLowerCase();
  if (s === "k" || s.startsWith("thousand")) n *= 1_000;
  if (s === "m" || s.includes("million")) n *= 1_000_000;
  return Math.round(n);
}

function parsePriceFilters(query: string): {
  minPrice?: number;
  maxPrice?: number;
  rest: string;
} {
  let rest = query;
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  rest = rest.replace(
    /(\d+(?:\.\d+)?)\s*(k|m|million|thousand)?\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(k|m|million|thousand)?/gi,
    (_, a, aSuf, b, bSuf) => { minPrice = parseAmount(a, aSuf); maxPrice = parseAmount(b, bSuf); return " "; }
  );
  rest = rest.replace(
    /(?:under|below|less than|cheaper than|max|upto|up to)\s*(\d+(?:\.\d+)?)\s*(k|m|million|thousand)?/gi,
    (_, n, suf) => { maxPrice = parseAmount(n, suf); return " "; }
  );
  rest = rest.replace(
    /(?:over|above|more than|from|min|at least)\s*(\d+(?:\.\d+)?)\s*(k|m|million|thousand)?/gi,
    (_, n, suf) => { minPrice = parseAmount(n, suf); return " "; }
  );
  rest = rest.replace(/\b(\d+(?:\.\d+)?)\s*(k|m|million|thousand)\b/gi, (_, n, suf) => {
    const amount = parseAmount(n, suf);
    if (minPrice === undefined && maxPrice === undefined) {
      minPrice = Math.round(amount * 0.85);
      maxPrice = Math.round(amount * 1.15);
    }
    return " ";
  });
  rest = rest.replace(/\bugx\s*(\d[\d,]*)\b/gi, (_, n) => {
    const amount = parseInt(n.replace(/,/g, ""), 10);
    if (!Number.isNaN(amount)) {
      minPrice = Math.round(amount * 0.9);
      maxPrice = Math.round(amount * 1.1);
    }
    return " ";
  });

  return { minPrice, maxPrice, rest: normalize(rest) };
}

// ── Room parsing ───────────────────────────────────────────────────────────────
function parseRoomFilters(query: string): {
  minRooms?: number;
  maxRooms?: number;
  roomPhrases: string[];
  rest: string;
} {
  let rest = query;
  let minRooms: number | undefined;
  let maxRooms: number | undefined;
  const roomPhrases: string[] = [];

  const patterns: { re: RegExp; min?: number; max?: number; phrase: string }[] = [
    { re: /\bdouble\s+room\b/gi, min: 2, phrase: "double room" },
    { re: /\bsingle\s+room\b/gi, min: 1, max: 1, phrase: "single room" },
    { re: /\b(\d+)\s*bed(?:room)?s?\b/gi, phrase: "bedroom" },
    { re: /\b(\d+)\s*br\b/gi, phrase: "br" },
    { re: /\b(\d+)\s*rooms?\b/gi, phrase: "room" },
    { re: /\bbedsitter\b/gi, min: 1, max: 1, phrase: "bedsitter" },
    { re: /\bself\s*contained\b/gi, phrase: "self contained" },
    { re: /\bstudio\b/gi, min: 1, max: 1, phrase: "studio" },
  ];

  for (const { re, min, max, phrase } of patterns) {
    rest = rest.replace(re, (_, count?: string) => {
      roomPhrases.push(phrase);
      if (count) {
        const n = parseInt(count, 10);
        if (!Number.isNaN(n)) { minRooms = n; maxRooms = n; }
      } else if (min !== undefined) {
        minRooms = minRooms === undefined ? min : Math.max(minRooms, min);
        if (max !== undefined) maxRooms = max;
      }
      return " ";
    });
  }

  return { minRooms, maxRooms, roomPhrases, rest: normalize(rest) };
}

// ── Type detection ─────────────────────────────────────────────────────────────
function detectTypes(query: string): { types: PropertyFilter[]; rest: string } {
  let rest = query;
  const types = new Set<PropertyFilter>();
  for (const { type, norm } of NORMALIZED_TYPE_ALIASES) {
    if (rest.includes(norm)) {
      types.add(type);
      rest = rest.replace(norm, " ");
    }
  }
  return { types: [...types], rest: normalize(rest) };
}

// ── Location detection — driven by DB locations, not a hardcoded list ──────────
// knownLocations comes from getDistinctLocations() in listings.ts.
// The shape is identical to what UGANDA_LOCATIONS used to provide, so all
// the fuzzy/typo logic below works exactly the same way.
function detectLocations(
  query: string,
  knownLocations: string[],
): { locations: string[]; rest: string } {
  // Pre-normalise once so we're not repeating work in the loop
  const normalised = knownLocations.map((loc) => ({
    location: loc,
    norm: normalize(loc),
  })).sort((a, b) => b.norm.length - a.norm.length); // longest first — greedy match

  let rest = query;
  const locations: string[] = [];

  // Pass 1 — exact substring match
  for (const { location, norm } of normalised) {
    if (rest.includes(norm)) {
      locations.push(location);
      rest = rest.replace(norm, " ").replace(/\s+/g, " ").trim();
    }
  }

  // Pass 2 — typo correction (only when nothing matched in pass 1)
  if (locations.length === 0) {
    for (const token of rest.split(" ").filter((t) => t.length > 4)) {
      const corrected = normalize(TYPO_MAP[token] ?? token);
      for (const { location, norm } of normalised) {
        if (
          !locations.includes(location) &&
          norm.length > 4 &&
          levenshtein(corrected, norm) <= 1
        ) {
          locations.push(location);
        }
      }
    }
  }

  return { locations, rest: normalize(rest) };
}

// ── Main parser ────────────────────────────────────────────────────────────────
// knownLocations is passed in from the DB so the parser stays pure/testable.
export function parseSearchQuery(
  raw: string,
  knownLocations: string[] = [],
): ParsedQuery {
  const normalized = normalize(raw);
  const price = parsePriceFilters(normalized);
  const rooms = parseRoomFilters(price.rest);
  const types = detectTypes(rooms.rest);
  const locations = detectLocations(types.rest, knownLocations);

  return {
    text: locations.rest,
    locations: locations.locations,
    types: types.types,
    minPrice: price.minPrice,
    maxPrice: price.maxPrice,
    minRooms: rooms.minRooms,
    maxRooms: rooms.maxRooms,
    roomPhrases: rooms.roomPhrases,
  };
}

// ── Listing matching ───────────────────────────────────────────────────────────
function listingBlob(listing: Listing): string {
  return normalize(
    [
      listing.title,
      listing.description,
      listing.location_name,
      listing.type,
      listing.rooms != null ? `${listing.rooms} rooms` : "",
      listing.price,
      `ugx ${listing.price}`,
    ].join(" ")
  );
}

function matchesPrice(listing: Listing, parsed: ParsedQuery): boolean {
  if (parsed.minPrice !== undefined && listing.price < parsed.minPrice) return false;
  if (parsed.maxPrice !== undefined && listing.price > parsed.maxPrice) return false;
  return true;
}

function matchesTypes(listing: Listing, parsed: ParsedQuery): boolean {
  const concreteTypes = parsed.types.filter((t) => t !== "airbnb") as Listing["type"][];
  if (concreteTypes.length === 0) return true;
  return concreteTypes.includes(listing.type);
}

function matchesAirbnbIntent(blob: string, parsed: ParsedQuery): boolean {
  if (!parsed.types.includes("airbnb")) return true;
  return NORMALIZED_AIRBNB_ALIASES.some((kw) => blob.includes(kw));
}

function matchesRooms(
  listing: Listing,
  parsed: ParsedQuery,
  blob: string,
  normalizedRoomPhrases: string[]
): boolean {
  if (parsed.minRooms === undefined && parsed.maxRooms === undefined) {
    if (normalizedRoomPhrases.length === 0) return true;
    return normalizedRoomPhrases.some((phrase) => blob.includes(phrase));
  }
  if (listing.rooms == null) {
    return normalizedRoomPhrases.some((phrase) => fuzzyMatchNormalized(blob, phrase));
  }
  if (parsed.minRooms !== undefined && listing.rooms < parsed.minRooms) return false;
  if (parsed.maxRooms !== undefined && listing.rooms > parsed.maxRooms) return false;
  return true;
}

function matchesLocations(
  locationNorm: string,
  normalizedLocations: string[]
): boolean {
  if (normalizedLocations.length === 0) return true;
  return normalizedLocations.some((loc) =>
    locationNorm.includes(loc) || fuzzyMatchNormalized(locationNorm, loc)
  );
}

function matchesFreeText(blob: string, parsed: ParsedQuery, rawNorm: string): boolean {
  const tokens = parsed.text.split(" ").filter((t) => t.length > 1);

  if (tokens.length === 0) {
    return (
      parsed.locations.length > 0 ||
      parsed.types.length > 0 ||
      parsed.minPrice !== undefined ||
      parsed.maxPrice !== undefined ||
      parsed.minRooms !== undefined ||
      parsed.maxRooms !== undefined ||
      parsed.roomPhrases.length > 0
    );
  }

  if (rawNorm && blob.includes(rawNorm)) return true;
  return tokens.every((token) => fuzzyMatchNormalized(blob, token));
}

// ── Public API ─────────────────────────────────────────────────────────────────
// knownLocations should be passed from getDistinctLocations() — the DB-driven list.
export function filterListings(
  listings: Listing[],
  rawQuery: string,
  knownLocations: string[] = [],
): Listing[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) return [];

  const parsed = parseSearchQuery(trimmed, knownLocations);
  const rawNorm = normalize(trimmed);
  const normalizedLocations = parsed.locations.map(normalize);
  const normalizedRoomPhrases = parsed.roomPhrases.map(normalize);

  return listings.filter((listing) => {
    if (!matchesPrice(listing, parsed)) return false;
    const blob = listingBlob(listing);
    if (!matchesRooms(listing, parsed, blob, normalizedRoomPhrases)) return false;
    if (!matchesTypes(listing, parsed)) return false;
    if (!matchesLocations(normalize(listing.location_name), normalizedLocations)) return false;
    if (!matchesAirbnbIntent(blob, parsed)) return false;
    if (!matchesFreeText(blob, parsed, rawNorm)) return false;
    return true;
  });
}

// ── Grouped results for the UI ─────────────────────────────────────────────────
export function groupResultsByLocation(
  listings: Listing[]
): { location: string; items: Listing[] }[] {
  const map = new Map<string, Listing[]>();
  for (const listing of listings) {
    const key = listing.location_name;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(listing);
  }
  return Array.from(map.entries())
    .map(([location, items]) => ({ location, items }))
    .sort((a, b) => b.items.length - a.items.length);
}
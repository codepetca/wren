/**
 * Apple Maps Server API utilities for location search
 * Uses the /v1/searchAutocomplete and /v1/search endpoints
 */

export interface GeocodingResult {
  id: string;
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

interface AppleSearchResult {
  completionUrl: string;
  displayLines: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface AppleSearchResponse {
  results: AppleSearchResult[];
}

interface ApplePlaceResult {
  name: string;
  formattedAddressLines: string[];
  coordinate: {
    latitude: number;
    longitude: number;
  };
  structuredAddress?: {
    locality?: string;
    administrativeArea?: string;
    country?: string;
  };
}

interface ApplePlaceResponse {
  results: ApplePlaceResult[];
}

// Cache for the token
let tokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Reset token cache (for testing)
 */
export function resetTokenCache() {
  tokenCache = null;
}

/**
 * Get Apple Maps token from our API route
 */
async function getToken(): Promise<string | null> {
  // Check cache
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.expiresAt > now + 60) {
    return tokenCache.token;
  }

  try {
    const response = await fetch("/api/apple-maps-token");
    if (!response.ok) {
      throw new Error("Failed to get token");
    }
    const data = await response.json();

    // Cache for 55 minutes (token expires in 1 hour)
    tokenCache = {
      token: data.token,
      expiresAt: now + 55 * 60,
    };

    return data.token;
  } catch (error) {
    console.error("Failed to get Apple Maps token:", error);
    return null;
  }
}

/**
 * Search for locations using Apple Maps Server API
 */
export async function searchLocations(
  query: string,
  options?: {
    limit?: number;
    proximity?: { lat: number; lng: number };
  }
): Promise<GeocodingResult[]> {
  if (!query.trim()) {
    return [];
  }

  const token = await getToken();
  if (!token) {
    console.error("Apple Maps token not available");
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    lang: "en-US",
  });

  // Add location hint if provided
  if (options?.proximity) {
    params.set("searchLocation", `${options.proximity.lat},${options.proximity.lng}`);
  }

  // Use the search endpoint for better business results
  const url = `https://maps-api.apple.com/v1/search?${params}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Apple Maps search failed:", response.status, errorText);
      throw new Error(`Search request failed: ${response.status}`);
    }

    const data: ApplePlaceResponse = await response.json();
    const limit = options?.limit ?? 5;
    const results = data.results || [];

    return results.slice(0, limit).map((result, index) => {
      // Build full address from structured address or formatted lines
      let fullAddress = result.formattedAddressLines?.join(", ") || "";
      if (!fullAddress && result.structuredAddress) {
        const parts = [
          result.structuredAddress.locality,
          result.structuredAddress.administrativeArea,
          result.structuredAddress.country,
        ].filter(Boolean);
        fullAddress = parts.join(", ");
      }

      return {
        id: `apple-${index}-${result.coordinate.latitude}-${result.coordinate.longitude}`,
        name: result.name,
        fullAddress: fullAddress || result.name,
        lat: result.coordinate.latitude,
        lng: result.coordinate.longitude,
      };
    });
  } catch (error) {
    console.error("Apple Maps search error:", error);
    return [];
  }
}

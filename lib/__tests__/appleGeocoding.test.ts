import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchLocations, resetTokenCache } from "../appleGeocoding";

describe("searchLocations (Apple Maps)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetTokenCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns empty array for empty query", async () => {
    const results = await searchLocations("");
    expect(results).toEqual([]);
  });

  it("returns empty array for whitespace-only query", async () => {
    const results = await searchLocations("   ");
    expect(results).toEqual([]);
  });

  it("returns empty array when token fetch fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal("fetch", mockFetch);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const results = await searchLocations("test");

    expect(results).toEqual([]);
    consoleSpy.mockRestore();
  });

  it("fetches token from API route before searching", async () => {
    const mockFetch = vi.fn()
      // First call - token fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: "test-token" }),
      })
      // Second call - search
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });
    vi.stubGlobal("fetch", mockFetch);

    await searchLocations("Toronto");

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/apple-maps-token");
  });

  it("calls Apple Maps API with correct URL and auth header", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: "test-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });
    vi.stubGlobal("fetch", mockFetch);

    await searchLocations("Toronto");

    const searchCall = mockFetch.mock.calls[1];
    expect(searchCall[0]).toContain("https://maps-api.apple.com/v1/search");
    expect(searchCall[0]).toContain("q=Toronto");
    expect(searchCall[1].headers.Authorization).toBe("Bearer test-token");
  });

  it("includes searchLocation parameter when proximity provided", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: "test-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });
    vi.stubGlobal("fetch", mockFetch);

    await searchLocations("coffee", { proximity: { lat: 43.65, lng: -79.38 } });

    const searchUrl = mockFetch.mock.calls[1][0];
    expect(searchUrl).toContain("searchLocation=43.65%2C-79.38");
  });

  it("transforms Apple Maps response to GeocodingResult format", async () => {
    const mockResponse = {
      results: [
        {
          name: "Sutton Place Hotel",
          formattedAddressLines: ["1700 Grafton Street", "Halifax, NS B3J 2C4", "Canada"],
          coordinate: {
            latitude: 44.6488,
            longitude: -63.5752,
          },
        },
        {
          name: "The Westin Nova Scotian",
          formattedAddressLines: ["1181 Hollis Street", "Halifax, NS"],
          coordinate: {
            latitude: 44.6414,
            longitude: -63.5695,
          },
        },
      ],
    };

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: "test-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
    vi.stubGlobal("fetch", mockFetch);

    const results = await searchLocations("Sutton Place Hotel Halifax");

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      name: "Sutton Place Hotel",
      fullAddress: "1700 Grafton Street, Halifax, NS B3J 2C4, Canada",
      lat: 44.6488,
      lng: -63.5752,
    });
    expect(results[0].id).toContain("apple-");
  });

  it("returns empty array on API error", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: "test-token" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });
    vi.stubGlobal("fetch", mockFetch);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const results = await searchLocations("Toronto");

    expect(results).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("respects custom limit option", async () => {
    const mockResponse = {
      results: Array(10).fill(null).map((_, i) => ({
        name: `Place ${i}`,
        formattedAddressLines: [`Address ${i}`],
        coordinate: { latitude: 43.65 + i * 0.01, longitude: -79.38 },
      })),
    };

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: "test-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
    vi.stubGlobal("fetch", mockFetch);

    const results = await searchLocations("Toronto", { limit: 3 });

    expect(results).toHaveLength(3);
  });

  it("caches token for subsequent requests", async () => {
    const mockFetch = vi.fn()
      // First request - token + search
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: "test-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      })
      // Second request - only search (token cached)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });
    vi.stubGlobal("fetch", mockFetch);

    await searchLocations("Toronto");
    await searchLocations("Vancouver");

    // Token should only be fetched once
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/apple-maps-token");
    expect(mockFetch.mock.calls[2][0]).toContain("maps-api.apple.com");
  });
});

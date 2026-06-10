import { describe, expect, test } from "vite-plus/test";
import { calculateDistanceMeters, isValidGeoLocation } from "./geo";

describe("calculateDistanceMeters", () => {
  test("returns zero for the same location", () => {
    const location = { lat: 37.500_918, lng: 127.036_371 };

    expect(calculateDistanceMeters(location, location)).toBe(0);
  });

  test("calculates distance between nearby Seoul coordinates", () => {
    const distance = calculateDistanceMeters(
      { lat: 37.500_918, lng: 127.036_371 },
      { lat: 37.501_754_2, lng: 127.034_097_3 },
    );

    expect(Math.round(distance)).toBe(221);
  });
});

describe("isValidGeoLocation", () => {
  test("rejects invalid coordinates", () => {
    expect(isValidGeoLocation({ lat: Number.NaN, lng: 127 })).toBe(false);
    expect(isValidGeoLocation({ lat: 90, lng: 127 })).toBe(false);
    expect(isValidGeoLocation({ lat: 37, lng: 181 })).toBe(false);
  });

  test("accepts valid coordinates", () => {
    expect(isValidGeoLocation({ lat: 37.5, lng: 127 })).toBe(true);
  });
});

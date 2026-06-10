import type { StoreLocation } from "../types/store";

const EARTH_RADIUS_METERS = 6_371_000;

export function calculateDistanceMeters(from: StoreLocation, to: StoreLocation) {
  const fromLatRadians = toRadians(from.lat);
  const toLatRadians = toRadians(to.lat);
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(fromLatRadians) *
      Math.cos(toLatRadians) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2);
  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_METERS * angularDistance;
}

export function isValidGeoLocation(location: StoreLocation) {
  return (
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng) &&
    Math.abs(location.lat) <= 85.051_128_78 &&
    Math.abs(location.lng) <= 180
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

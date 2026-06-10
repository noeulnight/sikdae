import type { StoreLocation } from "../types/store";

export type ClusterableStoreMapMarker = {
  id: string;
  label: string;
  location: StoreLocation;
  selectable?: boolean;
  selected?: boolean;
  variant?: "store" | "user";
};

export type StoreMapMarkerGroup =
  | {
      kind: "marker";
      marker: ClusterableStoreMapMarker;
    }
  | {
      id: string;
      kind: "cluster";
      label: string;
      location: StoreLocation;
      markers: ClusterableStoreMapMarker[];
      selected: boolean;
    };

type ProjectLocation = (location: StoreLocation, zoom: number) => { x: number; y: number };

type StoreMapClusterOptions = {
  gridSize?: number;
  maxClusterZoom?: number;
  minClusterMarkers?: number;
  project: ProjectLocation;
  zoom: number;
};

const DEFAULT_GRID_SIZE = 56;
const DEFAULT_MAX_CLUSTER_ZOOM = 17;
const DEFAULT_MIN_CLUSTER_MARKERS = 30;

export function getStoreMapMarkerGroups(
  markers: ClusterableStoreMapMarker[],
  {
    gridSize = DEFAULT_GRID_SIZE,
    maxClusterZoom = DEFAULT_MAX_CLUSTER_ZOOM,
    minClusterMarkers = DEFAULT_MIN_CLUSTER_MARKERS,
    project,
    zoom,
  }: StoreMapClusterOptions,
): StoreMapMarkerGroup[] {
  const storeMarkers = markers.filter((marker) => marker.variant !== "user");
  const fixedMarkers = markers.filter((marker) => marker.variant === "user");

  if (storeMarkers.length < minClusterMarkers || zoom >= maxClusterZoom) {
    return markers.map((marker) => ({ kind: "marker", marker }));
  }

  const buckets = new Map<string, ClusterableStoreMapMarker[]>();

  for (const marker of storeMarkers) {
    const projected = project(marker.location, zoom);
    const key = `${Math.floor(projected.x / gridSize)}:${Math.floor(projected.y / gridSize)}`;
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.push(marker);
    } else {
      buckets.set(key, [marker]);
    }
  }

  const groups: StoreMapMarkerGroup[] = [];

  for (const bucket of buckets.values()) {
    if (bucket.length === 1) {
      groups.push({
        kind: "marker",
        marker: bucket[0],
      });
      continue;
    }

    groups.push({
      id: bucket
        .map((marker) => marker.id)
        .sort()
        .join(":"),
      kind: "cluster",
      label: `${bucket.length}개 매장`,
      location: getAverageLocation(bucket),
      markers: bucket,
      selected: bucket.some((marker) => marker.selected),
    });
  }

  fixedMarkers.forEach((marker) => {
    groups.push({
      kind: "marker",
      marker,
    });
  });

  return groups;
}

function getAverageLocation(markers: ClusterableStoreMapMarker[]) {
  const totals = markers.reduce(
    (location, marker) => ({
      lat: location.lat + marker.location.lat,
      lng: location.lng + marker.location.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: totals.lat / markers.length,
    lng: totals.lng / markers.length,
  };
}

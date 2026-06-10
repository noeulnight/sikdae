import { describe, expect, test } from "vite-plus/test";
import { getStoreMapMarkerGroups, type ClusterableStoreMapMarker } from "./map-clusters";

const closeMarkers: ClusterableStoreMapMarker[] = Array.from({ length: 3 }, (_, index) => ({
  id: `store-${index}`,
  label: `매장 ${index}`,
  location: {
    lat: 37.5 + index * 0.000_1,
    lng: 127.03 + index * 0.000_1,
  },
}));

const project = (location: { lat: number; lng: number }) => ({
  x: location.lng * 10_000,
  y: location.lat * 10_000,
});

describe("getStoreMapMarkerGroups", () => {
  test("clusters nearby store markers", () => {
    const groups = getStoreMapMarkerGroups(closeMarkers, {
      gridSize: 20,
      minClusterMarkers: 2,
      project,
      zoom: 14,
    });

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      kind: "cluster",
      label: "3개 매장",
      selected: false,
    });
  });

  test("keeps user markers outside clusters", () => {
    const groups = getStoreMapMarkerGroups(
      [
        ...closeMarkers,
        {
          id: "current-location",
          label: "내 위치",
          location: { lat: 37.5, lng: 127.03 },
          variant: "user",
        },
      ],
      {
        gridSize: 20,
        minClusterMarkers: 2,
        project,
        zoom: 14,
      },
    );

    expect(groups).toHaveLength(2);
    expect(groups.some((group) => group.kind === "cluster")).toBe(true);
    expect(
      groups.some((group) => group.kind === "marker" && group.marker.id === "current-location"),
    ).toBe(true);
  });

  test("does not cluster at high zoom", () => {
    const groups = getStoreMapMarkerGroups(closeMarkers, {
      gridSize: 20,
      maxClusterZoom: 17,
      minClusterMarkers: 2,
      project,
      zoom: 17,
    });

    expect(groups).toHaveLength(closeMarkers.length);
    expect(groups.every((group) => group.kind === "marker")).toBe(true);
  });
});

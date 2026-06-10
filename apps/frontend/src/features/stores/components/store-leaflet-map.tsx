import { useEffect, useMemo, useRef } from "react";
import L, { type LatLngBoundsExpression, type Map as LeafletMap } from "leaflet";
import { cn } from "@/lib/utils";
import type { StoreLocation } from "../types/store";
import { isValidGeoLocation } from "../utils/geo";
import { getStoreMapMarkerGroups, type ClusterableStoreMapMarker } from "../utils/map-clusters";

type StoreLeafletMarker = ClusterableStoreMapMarker;

type StoreLeafletMapProps = {
  ariaLabel: string;
  center?: StoreLocation;
  className?: string;
  fitToMarkers?: boolean;
  markers: StoreLeafletMarker[];
  onMarkerSelect?: (markerId: string) => void;
  zoom?: number;
};

const TILE_LAYER_URL = "https://osm.lth.so/tiles/base/{z}/{x}/{y}.png";
const DEFAULT_ZOOM = 16;
const FALLBACK_LOCATION: StoreLocation = {
  lat: 37.500_918,
  lng: 127.036_371,
};

export function StoreLeafletMap({
  ariaLabel,
  center,
  className,
  fitToMarkers = true,
  markers,
  onMarkerSelect,
  zoom = DEFAULT_ZOOM,
}: StoreLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const validMarkers = useMemo(
    () => markers.filter((marker) => isValidStoreLocation(marker.location)),
    [markers],
  );
  const mapCenter = center && isValidStoreLocation(center) ? center : getMapCenter(validMarkers);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center: [mapCenter.lat, mapCenter.lng],
      scrollWheelZoom: true,
      zoom,
      zoomControl: true,
    });
    const markerLayer = L.layerGroup().addTo(map);

    L.tileLayer(TILE_LAYER_URL, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map);

    mapRef.current = map;
    markerLayerRef.current = markerLayer;

    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, [mapCenter.lat, mapCenter.lng, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;

    if (!map || !markerLayer) {
      return;
    }

    markerLayer.clearLayers();

    function renderMarkers() {
      if (!map || !markerLayer) {
        return;
      }

      markerLayer.clearLayers();

      const markerGroups = getStoreMapMarkerGroups(validMarkers, {
        project: (location, currentZoom) => {
          const point = map.project([location.lat, location.lng], currentZoom);

          return {
            x: point.x,
            y: point.y,
          };
        },
        zoom: map.getZoom(),
      });

      for (const markerGroup of markerGroups) {
        if (markerGroup.kind === "cluster") {
          const clusterMarker = L.marker([markerGroup.location.lat, markerGroup.location.lng], {
            icon: createClusterIcon(markerGroup.markers.length, markerGroup.selected),
            keyboard: true,
            title: markerGroup.label,
          });

          clusterMarker.bindTooltip(markerGroup.label, {
            direction: "top",
            offset: [0, -12],
          });

          clusterMarker.on("click", () => {
            zoomToCluster(map, markerGroup.markers);
          });

          clusterMarker.addTo(markerLayer);
          continue;
        }

        const { marker } = markerGroup;
        const leafletMarker = L.marker([marker.location.lat, marker.location.lng], {
          icon: createMarkerIcon(Boolean(marker.selected), marker.variant ?? "store"),
          keyboard: true,
          title: marker.label,
        });

        leafletMarker.bindTooltip(marker.label, {
          direction: "top",
          offset: [0, -12],
        });

        if (onMarkerSelect && marker.selectable !== false) {
          leafletMarker.on("click", () => onMarkerSelect(marker.id));
        }

        leafletMarker.addTo(markerLayer);
      }
    }

    renderMarkers();
    map.on("zoomend moveend", renderMarkers);

    if (fitToMarkers && !center && validMarkers.length > 1) {
      const bounds: LatLngBoundsExpression = validMarkers.map((marker) => [
        marker.location.lat,
        marker.location.lng,
      ]);

      map.fitBounds(bounds, {
        maxZoom: zoom,
        padding: [36, 36],
      });
    } else {
      map.setView([mapCenter.lat, mapCenter.lng], zoom);
    }

    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.off("zoomend moveend", renderMarkers);
    };
  }, [center, fitToMarkers, mapCenter.lat, mapCenter.lng, onMarkerSelect, validMarkers, zoom]);

  return (
    <div
      ref={containerRef}
      aria-label={ariaLabel}
      className={cn("isolate z-0 overflow-hidden rounded-lg border bg-muted", className)}
    />
  );
}

export function isValidStoreLocation(location: StoreLocation) {
  return isValidGeoLocation(location);
}

function getMapCenter(markers: StoreLeafletMarker[]) {
  if (!markers.length) {
    return FALLBACK_LOCATION;
  }

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

function createMarkerIcon(selected: boolean, variant: StoreLeafletMarker["variant"]) {
  const userMarker = variant === "user";
  const classNames = [
    "sikdae-map-marker",
    selected ? "sikdae-map-marker-selected" : null,
    userMarker ? "sikdae-map-marker-user" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return L.divIcon({
    className: classNames,
    html: '<span aria-hidden="true"></span>',
    iconAnchor: userMarker ? [14, 14] : [14, 28],
    iconSize: [28, 28],
    popupAnchor: [0, userMarker ? -14 : -28],
    tooltipAnchor: [0, userMarker ? -14 : -28],
  });
}

function createClusterIcon(count: number, selected: boolean) {
  const classNames = ["sikdae-map-cluster", selected ? "sikdae-map-cluster-selected" : null]
    .filter(Boolean)
    .join(" ");

  return L.divIcon({
    className: classNames,
    html: `<span aria-hidden="true">${count}</span>`,
    iconAnchor: [18, 18],
    iconSize: [36, 36],
    popupAnchor: [0, -18],
    tooltipAnchor: [0, -18],
  });
}

function zoomToCluster(map: LeafletMap, markers: StoreLeafletMarker[]) {
  if (markers.length < 2) {
    return;
  }

  const boundsPoints: LatLngBoundsExpression = markers.map((marker) => [
    marker.location.lat,
    marker.location.lng,
  ]);
  const bounds = L.latLngBounds(boundsPoints);
  const currentZoom = map.getZoom();
  const nextZoom = Math.min(currentZoom + 2, 19);

  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
    map.setView(bounds.getCenter(), nextZoom);
    return;
  }

  map.fitBounds(boundsPoints, {
    maxZoom: nextZoom,
    padding: [48, 48],
  });
}

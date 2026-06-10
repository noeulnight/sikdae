import type { StoreLocation } from "../types/store";
import { isValidStoreLocation, StoreLeafletMap } from "./store-leaflet-map";

type StoreLocationMapProps = {
  location: StoreLocation;
  storeName: string;
};

export function StoreLocationMap({ location, storeName }: StoreLocationMapProps) {
  if (!isValidStoreLocation(location)) {
    return null;
  }

  return (
    <section className="mt-3 space-y-2" aria-label={`${storeName} 위치 지도`}>
      <p className="text-xs font-medium text-muted-foreground">위치</p>
      <StoreLeafletMap
        ariaLabel={`${storeName} 위치 지도`}
        center={location}
        className="h-36 sm:h-44"
        markers={[
          {
            id: "store",
            label: storeName,
            location,
            selected: true,
          },
        ]}
        zoom={16}
      />
    </section>
  );
}

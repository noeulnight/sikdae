import { useEffect, useMemo, useState } from "react";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentLocation } from "../hooks/use-current-location";
import { useStoreMapQuery } from "../queries/store-queries";
import type { StoreFilters, StoreLocation, StoreSummary, StoreSupply } from "../types/store";
import { getStoreRequestErrorMessage } from "../utils/api-error";
import { formatNumber, formatRating, getSupplyName } from "../utils/format";
import { isValidStoreLocation, StoreLeafletMap } from "./store-leaflet-map";

type StoreMapDialogProps = {
  disabled: boolean;
  filters: StoreFilters;
  selectedStoreId: null | string;
  supplies?: StoreSupply[];
  total: number;
  onSelect: (storeId: string) => void;
};

const STORE_MAP_LIMIT = 500;
const STORE_MAP_ZOOM = 15;

export function StoreMapDialog({
  disabled,
  filters,
  selectedStoreId,
  supplies,
  total,
  onSelect,
}: StoreMapDialogProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const currentLocation = useCurrentLocation(open);
  const mapFilters = useMemo(
    () => ({
      ...filters,
      limit: STORE_MAP_LIMIT,
      offset: 0,
    }),
    [filters],
  );
  const mapQuery = useStoreMapQuery(mapFilters, open);
  const stores = mapQuery.data?.items ?? [];
  const description = getMapDescription(stores.length, mapQuery.data?.pagination.total ?? total);
  const panelContent = (
    <StoreMapPanel
      error={mapQuery.error}
      isError={mapQuery.isError}
      isLoading={mapQuery.isLoading}
      selectedStoreId={selectedStoreId}
      stores={stores}
      supplies={supplies}
      userLocation={currentLocation.location}
      userLocationError={currentLocation.errorMessage}
      onSelect={(storeId) => {
        onSelect(storeId);
        setOpen(false);
      }}
    />
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="지도 보기"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Map aria-hidden="true" />
      </Button>

      <Sheet open={open && !isDesktop} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="h-[min(88svh,760px)] max-h-[88svh] gap-0 overflow-hidden rounded-t-2xl lg:hidden"
        >
          <SheetHeader className="border-b pr-12">
            <SheetTitle>지도 보기</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          {panelContent}
        </SheetContent>
      </Sheet>

      <Dialog open={open && isDesktop} onOpenChange={setOpen}>
        <DialogContent className="hidden max-h-[88vh] max-w-[1080px] flex-col gap-0 overflow-hidden lg:flex">
          <DialogHeader className="border-b pr-12">
            <DialogTitle>지도 보기</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {panelContent}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StoreMapPanel({
  error,
  isError,
  isLoading,
  selectedStoreId,
  stores,
  supplies,
  userLocation,
  userLocationError,
  onSelect,
}: {
  error: unknown;
  isError: boolean;
  isLoading: boolean;
  selectedStoreId: null | string;
  stores: StoreSummary[];
  supplies?: StoreSupply[];
  userLocation: null | StoreLocation;
  userLocationError?: string;
  onSelect: (storeId: string) => void;
}) {
  if (isError && !stores.length) {
    return (
      <div className="p-4">
        <div className="rounded-lg border p-4 text-sm text-destructive">
          {getStoreRequestErrorMessage(error, "매장 위치를 불러오지 못했습니다.")}
        </div>
      </div>
    );
  }

  if (isLoading && !stores.length) {
    return (
      <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Skeleton className="h-[420px] rounded-lg" />
        <div className="grid gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const locatedStores = stores.filter((store) => isValidStoreLocation(store.location));

  if (!locatedStores.length) {
    return (
      <div className="p-4">
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          표시할 위치가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-0 flex-1 gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <StoreMapCanvas
        selectedStoreId={selectedStoreId}
        stores={locatedStores}
        userLocation={userLocation}
        userLocationError={userLocationError}
        onSelect={onSelect}
      />
      <StoreMapStoreList
        selectedStoreId={selectedStoreId}
        stores={locatedStores}
        supplies={supplies}
        onSelect={onSelect}
      />
    </div>
  );
}

function StoreMapCanvas({
  selectedStoreId,
  stores,
  userLocation,
  userLocationError,
  onSelect,
}: {
  selectedStoreId: null | string;
  stores: StoreSummary[];
  userLocation: null | StoreLocation;
  userLocationError?: string;
  onSelect: (storeId: string) => void;
}) {
  return (
    <div className="relative">
      <StoreLeafletMap
        ariaLabel="매장 위치 지도"
        center={userLocation ?? undefined}
        className="h-[min(58svh,520px)] min-h-80 lg:h-[520px]"
        fitToMarkers={!userLocation}
        markers={[
          ...stores.map((store) => ({
            id: store.id,
            label: store.name,
            location: store.location,
            selected: selectedStoreId === store.id,
          })),
          ...(userLocation
            ? [
                {
                  id: "current-location",
                  label: "내 위치",
                  location: userLocation,
                  selectable: false,
                  selected: true,
                  variant: "user" as const,
                },
              ]
            : []),
        ]}
        onMarkerSelect={onSelect}
        zoom={STORE_MAP_ZOOM}
      />
      <div className="pointer-events-none absolute right-3 bottom-3 rounded-md border bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
        {formatNumber(stores.length)}개
      </div>
      {userLocationError ? (
        <div className="pointer-events-none absolute bottom-3 left-3 max-w-[min(18rem,calc(100%-6rem))] rounded-md border bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
          내 위치 없이 표시 중
        </div>
      ) : null}
    </div>
  );
}

function StoreMapStoreList({
  selectedStoreId,
  stores,
  supplies,
  onSelect,
}: {
  selectedStoreId: null | string;
  stores: StoreSummary[];
  supplies?: StoreSupply[];
  onSelect: (storeId: string) => void;
}) {
  return (
    <ScrollArea className="h-56 pr-0 lg:h-[520px] lg:pr-3">
      <div className="grid gap-2">
        {stores.map((store) => {
          const selected = selectedStoreId === store.id;

          return (
            <Button
              key={store.id}
              type="button"
              variant={selected ? "secondary" : "ghost"}
              className="h-auto min-w-0 justify-start border p-3 text-left"
              aria-label={`${store.name} 상세 보기`}
              onClick={() => onSelect(store.id)}
            >
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {store.name}
                </span>
                <span className="flex min-w-0 flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <span>{store.category.name}</span>
                  {store.supply.map((supply) => (
                    <span key={supply}>{getSupplyName(supply, supplies)}</span>
                  ))}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatRating(store.rating.score, store.rating.count)}
                </span>
              </span>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function getMapDescription(visibleCount: number, total: number) {
  if (!visibleCount) {
    return "매장 위치를 불러오는 중입니다.";
  }

  if (total > visibleCount) {
    return `${formatNumber(total)}개 중 ${formatNumber(visibleCount)}개 매장 위치`;
  }

  return `${formatNumber(visibleCount)}개 매장 위치`;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(min-width: 1024px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches);

    updateIsDesktop();
    mediaQuery.addEventListener("change", updateIsDesktop);

    return () => mediaQuery.removeEventListener("change", updateIsDesktop);
  }, []);

  return isDesktop;
}

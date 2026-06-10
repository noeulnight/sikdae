import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentLocation } from "../hooks/use-current-location";
import { useStoreRecommendationsMutation } from "../queries/store-queries";
import type { StoreCategoriesResponse, StoreRecommendation, StoreSupply } from "../types/store";
import { getStoreRequestErrorMessage } from "../utils/api-error";
import { getStoreRowAccessibleName, StoreListRow } from "./store-list-row";

type StoreRecommendationsProps = {
  categories?: StoreCategoriesResponse;
  supplies?: StoreSupply[];
  onRecommend?: () => void;
  onSelect: (storeId: string) => void;
};

const RANGE_OPTIONS = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1_000 },
  { label: "2km", value: 2_000 },
  { label: "5km", value: 5_000 },
];

export function StoreRecommendations({
  categories,
  supplies,
  onRecommend,
  onSelect,
}: StoreRecommendationsProps) {
  const sortedCategories = useMemo(
    () => [...(categories?.categories ?? [])].sort((first, second) => first.order - second.order),
    [categories?.categories],
  );
  const [open, setOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [rangeMeters, setRangeMeters] = useState(1_000);
  const [locationLabel, setLocationLabel] = useState<string>();
  const [locationError, setLocationError] = useState<string>();
  const isDesktop = useIsDesktop();
  const currentLocation = useCurrentLocation();
  const recommendationsMutation = useStoreRecommendationsMutation();
  const canRecommend = Boolean(sortedCategories.length);
  const isLoading = currentLocation.isLocating || recommendationsMutation.isPending;

  function handleSelectAllCategories() {
    setSelectedCategoryIds([]);
  }

  function handleToggleCategory(categoryId: number) {
    setSelectedCategoryIds((currentCategoryIds) =>
      currentCategoryIds.includes(categoryId)
        ? currentCategoryIds.filter((currentCategoryId) => currentCategoryId !== categoryId)
        : [...currentCategoryIds, categoryId],
    );
  }

  async function handleRecommend() {
    onRecommend?.();
    setLocationError(undefined);

    const locationResult = await currentLocation.requestLocation();

    if (!locationResult.location) {
      setLocationError(locationResult.errorMessage);
      return;
    }

    setLocationLabel("현재 위치 기준 추천");
    recommendationsMutation.mutate({
      categoryIds: selectedCategoryIds.length ? selectedCategoryIds.join(",") : undefined,
      lat: locationResult.location.lat,
      lng: locationResult.location.lng,
      rangeMeters,
    });
  }

  function handleSelectRecommendation(storeId: string) {
    onSelect(storeId);
    setOpen(false);
  }

  const items = recommendationsMutation.data?.items;
  const description = locationLabel ?? "현재 위치 기준으로 가까운 매장을 추천합니다.";
  const panelContent = (
    <RecommendationPanelContent
      canRecommend={canRecommend}
      error={recommendationsMutation.error}
      isLoading={isLoading}
      items={items}
      locationError={locationError}
      rangeMeters={rangeMeters}
      selectedCategoryIds={selectedCategoryIds}
      sortedCategories={sortedCategories}
      supplies={supplies}
      onRecommend={handleRecommend}
      onSelect={handleSelectRecommendation}
      onSelectAllCategories={handleSelectAllCategories}
      onSetRangeMeters={setRangeMeters}
      onToggleCategory={handleToggleCategory}
    />
  );

  return (
    <>
      <span className="lg:hidden">
        <RecommendationTrigger
          disabled={!sortedCategories.length}
          expanded={open && !isDesktop}
          onOpen={() => setOpen(true)}
        />
        <Sheet open={open && !isDesktop} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="h-[min(86svh,680px)] max-h-[86svh] gap-0 overflow-hidden rounded-t-2xl"
          >
            <SheetHeader className="border-b pr-12">
              <SheetTitle>근처 랜덤 추천</SheetTitle>
              <SheetDescription className="line-clamp-2">{description}</SheetDescription>
            </SheetHeader>
            {panelContent}
          </SheetContent>
        </Sheet>
      </span>

      <span className="hidden lg:inline-flex">
        <RecommendationTrigger
          disabled={!sortedCategories.length}
          expanded={open && isDesktop}
          onOpen={() => setOpen(true)}
        />
        <Dialog open={open && isDesktop} onOpenChange={setOpen}>
          <DialogContent className="flex max-h-[82vh] max-w-[560px] flex-col gap-0 overflow-hidden">
            <DialogHeader className="border-b pr-12">
              <DialogTitle>근처 랜덤 추천</DialogTitle>
              <DialogDescription className="line-clamp-2">{description}</DialogDescription>
            </DialogHeader>
            {panelContent}
          </DialogContent>
        </Dialog>
      </span>
    </>
  );
}

function RecommendationTrigger({
  disabled,
  expanded,
  onOpen,
}: {
  disabled: boolean;
  expanded: boolean;
  onOpen: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-expanded={expanded}
      aria-haspopup="dialog"
      aria-label="근처 추천"
      disabled={disabled}
      onClick={onOpen}
    >
      <Shuffle aria-hidden="true" />
    </Button>
  );
}

function RecommendationPanelContent({
  canRecommend,
  error,
  isLoading,
  items,
  locationError,
  rangeMeters,
  selectedCategoryIds,
  sortedCategories,
  supplies,
  onRecommend,
  onSelect,
  onSelectAllCategories,
  onSetRangeMeters,
  onToggleCategory,
}: {
  canRecommend: boolean;
  error: unknown;
  isLoading: boolean;
  items?: StoreRecommendation[];
  locationError?: string;
  rangeMeters: number;
  selectedCategoryIds: number[];
  sortedCategories: StoreCategoriesResponse["categories"];
  supplies?: StoreSupply[];
  onRecommend: () => void;
  onSelect: (storeId: string) => void;
  onSelectAllCategories: () => void;
  onSetRangeMeters: (rangeMeters: number) => void;
  onToggleCategory: (categoryId: number) => void;
}) {
  const selectedCategoryIdSet = new Set(selectedCategoryIds);

  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
      <FilterSection title="카테고리">
        <div className="grid grid-cols-2 gap-2 min-[430px]:grid-cols-3">
          <Button
            type="button"
            variant={selectedCategoryIds.length ? "outline" : "default"}
            size="default"
            className="justify-start whitespace-normal text-left"
            onClick={onSelectAllCategories}
          >
            전체
          </Button>
          {sortedCategories.map((category) => (
            <Button
              key={category.id}
              type="button"
              variant={selectedCategoryIdSet.has(category.id) ? "default" : "outline"}
              size="default"
              className="justify-start whitespace-normal text-left"
              onClick={() => onToggleCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="거리">
        <div className="grid grid-cols-4 gap-2">
          {RANGE_OPTIONS.map((range) => (
            <Button
              key={range.value}
              type="button"
              variant={rangeMeters === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => onSetRangeMeters(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </FilterSection>

      <div className="grid gap-2">
        <Button type="button" disabled={!canRecommend || isLoading} onClick={onRecommend}>
          {isLoading ? (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          ) : (
            <RefreshCw data-icon="inline-start" />
          )}
          {items ? "다시 추천" : "추천 받기"}
        </Button>
        {locationError ? <p className="text-sm text-destructive">{locationError}</p> : null}
        {error ? (
          <p className="text-sm text-destructive">
            {getStoreRequestErrorMessage(error, "추천 매장을 불러오지 못했습니다.")}
          </p>
        ) : null}
      </div>

      <RecommendationResults
        isLoading={isLoading}
        items={items}
        supplies={supplies}
        onSelect={onSelect}
      />
    </div>
  );
}

function FilterSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      {children}
    </section>
  );
}

function RecommendationResults({
  isLoading,
  items,
  supplies,
  onSelect,
}: {
  isLoading: boolean;
  items?: StoreRecommendation[];
  supplies?: StoreSupply[];
  onSelect: (storeId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!items) {
    return null;
  }

  if (!items.length) {
    return <p className="py-5 text-sm text-muted-foreground">조건에 맞는 추천 매장이 없습니다.</p>;
  }

  return (
    <div className="grid gap-2">
      {items.map((store) => (
        <RecommendationItem key={store.id} store={store} supplies={supplies} onSelect={onSelect} />
      ))}
    </div>
  );
}

function RecommendationItem({
  store,
  supplies,
  onSelect,
}: {
  store: StoreRecommendation;
  supplies?: StoreSupply[];
  onSelect: (storeId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-transparent transition-colors hover:bg-muted/70">
      <Button
        type="button"
        variant="ghost"
        className="h-auto w-full min-w-0 justify-start p-0 text-left whitespace-normal hover:bg-transparent"
        aria-label={getStoreRowAccessibleName(store, supplies, store.distanceMeters)}
        onClick={() => onSelect(store.id)}
      >
        <StoreListRow distanceMeters={store.distanceMeters} store={store} supplies={supplies} />
      </Button>
    </div>
  );
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

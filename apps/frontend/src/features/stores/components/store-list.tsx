import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  StoreFilters,
  StoreLocation,
  StoreListPagination,
  StoreSummary,
  StoreSupply,
} from "../types/store";
import { getStoreRequestErrorMessage } from "../utils/api-error";
import { calculateDistanceMeters, isValidGeoLocation } from "../utils/geo";
import { formatDistance, formatNumber, formatRating, getSupplyName } from "../utils/format";

type StoreListProps = {
  error: unknown;
  filters: StoreFilters;
  isError: boolean;
  isLoading: boolean;
  items?: StoreSummary[];
  onFilterChange: (filters: StoreFilters) => void;
  onSelect: (storeId: string) => void;
  pagination?: StoreListPagination;
  selectedStoreId: null | string;
  supplies?: StoreSupply[];
};

export function StoreList({
  error,
  filters,
  isError,
  isLoading,
  items,
  onFilterChange,
  onSelect,
  pagination,
  selectedStoreId,
  supplies,
}: StoreListProps) {
  const canGoPrevious = filters.offset > 0;
  const canGoNext = Boolean(pagination?.hasNext);
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const total = pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const rangeStart = total ? filters.offset + 1 : 0;
  const rangeEnd = Math.min(filters.offset + filters.limit, total);
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const distanceOrigin = getDistanceOrigin(filters);

  function moveToPage(page: number) {
    onFilterChange({
      ...filters,
      offset: (page - 1) * filters.limit,
    });
  }

  if (isLoading && !items) {
    return <StoreListSkeleton />;
  }

  if (isError && !items?.length) {
    return (
      <section className="flex min-h-0 flex-1 flex-col gap-3">
        <Card>
          <CardHeader>
            <CardTitle>목록을 불러오지 못했습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              {getStoreRequestErrorMessage(error, "잠시 후 다시 시도하세요.")}
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!items?.length) {
    return (
      <section className="flex min-h-0 flex-1 flex-col gap-3">
        <Card>
          <CardHeader>
            <CardTitle>검색 결과 없음</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">조건을 바꿔 다시 검색하세요.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      {isError ? (
        <div className="rounded-lg border p-3 text-sm text-destructive">
          {getStoreRequestErrorMessage(error, "최신 목록을 불러오지 못했습니다.")}
        </div>
      ) : null}
      <ScrollArea className="pr-0 lg:h-auto lg:min-h-0 lg:flex-1 lg:pr-3">
        <div className="grid gap-2">
          {items.map((store) => {
            const selected = selectedStoreId === store.id;
            const distanceMeters = distanceOrigin
              ? calculateDistanceMeters(distanceOrigin, store.location)
              : undefined;

            return (
              <div
                key={store.id}
                className="rounded-lg border border-transparent transition-colors hover:bg-muted/70 data-[selected=true]:border-primary/30 data-[selected=true]:bg-secondary"
                data-selected={selected}
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full min-w-0 justify-start p-0 text-left whitespace-normal hover:bg-transparent"
                  aria-label={getStoreAccessibleName(store, supplies, distanceMeters)}
                  onClick={() => onSelect(store.id)}
                >
                  <StoreListItem
                    distanceMeters={distanceMeters}
                    store={store}
                    supplies={supplies}
                  />
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="relative flex shrink-0 items-center justify-center pt-1 text-sm">
        <span className="absolute left-0 hidden text-muted-foreground whitespace-nowrap sm:inline">
          {formatNumber(rangeStart)}-{formatNumber(rangeEnd)} / {formatNumber(total)}
        </span>
        <nav className="flex items-center gap-1" aria-label="매장 페이지">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="이전 페이지"
            disabled={!canGoPrevious}
            onClick={() => moveToPage(currentPage - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`${item}-${index}`}
                className="flex size-7 items-center justify-center text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === currentPage ? "default" : "ghost"}
                size="icon-sm"
                aria-current={item === currentPage ? "page" : undefined}
                aria-label={`${formatNumber(item)} 페이지`}
                onClick={() => moveToPage(item)}
              >
                {formatNumber(item)}
              </Button>
            ),
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="다음 페이지"
            disabled={!canGoNext}
            onClick={() => moveToPage(currentPage + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      </div>
    </section>
  );
}

function getPaginationItems(currentPage: number, totalPages: number): Array<"ellipsis" | number> {
  const visiblePageCount = 7;

  if (totalPages <= visiblePageCount) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function StoreListItem({
  distanceMeters,
  store,
  supplies,
}: {
  distanceMeters?: number;
  store: StoreSummary;
  supplies?: StoreSupply[];
}) {
  const hasRating = store.rating.count > 0;
  const categoryNames = getStoreCategoryNames(store);

  return (
    <div className="w-full rounded-lg p-3">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <p className="min-w-0 truncate text-sm font-medium text-foreground">{store.name}</p>
              {distanceMeters !== undefined ? (
                <Badge variant="secondary">{formatDistance(distanceMeters)}</Badge>
              ) : null}
              {store.supply.map((supply) => (
                <Badge key={supply} variant="outline">
                  {getSupplyName(supply, supplies)}
                </Badge>
              ))}
              {store.flags.recommended ? <Badge variant="secondary">추천</Badge> : null}
              {store.flags.new ? <Badge variant="secondary">신규</Badge> : null}
            </div>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {categoryNames.map((categoryName) => (
                <span key={categoryName}>{categoryName}</span>
              ))}
            </div>
          </div>
          <div
            className={
              hasRating
                ? "shrink-0 text-right text-xs font-medium text-foreground whitespace-nowrap"
                : "shrink-0 text-right text-xs text-muted-foreground whitespace-nowrap"
            }
          >
            {formatRating(store.rating.score, store.rating.count)}
          </div>
        </div>

        {store.description ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">{store.description}</p>
        ) : null}
      </div>
    </div>
  );
}

function getStoreAccessibleName(
  store: StoreSummary,
  supplies?: StoreSupply[],
  distanceMeters?: number,
) {
  const supplyText = store.supply.map((supply) => getSupplyName(supply, supplies)).join(", ");
  const additionalCategoryText = getStoreCategoryNames(store)
    .filter((categoryName) => categoryName !== store.category.name)
    .join(", ");
  const badgeText = [
    store.flags.recommended ? "추천 매장" : null,
    store.flags.new ? "신규 매장" : null,
  ]
    .filter(Boolean)
    .join(", ");
  const parts = [
    store.name,
    supplyText ? `제공 방식 ${supplyText}` : null,
    store.category.name ? `분류 ${store.category.name}` : null,
    additionalCategoryText ? `카테고리 ${additionalCategoryText}` : null,
    distanceMeters !== undefined ? `거리 ${formatDistance(distanceMeters)}` : null,
    getStoreRatingLabel(store),
    badgeText,
  ].filter(Boolean);

  return parts.join(". ");
}

function getDistanceOrigin(filters: StoreFilters): StoreLocation | undefined {
  if (
    filters.sort !== "distance" ||
    filters.lat === undefined ||
    filters.lng === undefined ||
    !isValidGeoLocation({
      lat: filters.lat,
      lng: filters.lng,
    })
  ) {
    return undefined;
  }

  return {
    lat: filters.lat,
    lng: filters.lng,
  };
}

function getStoreCategoryNames(store: StoreSummary) {
  return Array.from(
    new Set([store.category.name, ...store.mainCategories.map((category) => category.name)]),
  );
}

function getStoreRatingLabel(store: StoreSummary) {
  if (store.rating.count === 0) {
    return "평점 없음";
  }

  return `평점 ${formatRating(store.rating.score, store.rating.count)}`;
}

function StoreListSkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 8 }, (_, index) => (
        <Card key={index} size="sm">
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

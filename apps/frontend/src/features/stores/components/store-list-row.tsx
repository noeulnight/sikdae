import { Badge } from "@/components/ui/badge";
import type { StoreSummary, StoreSupply } from "../types/store";
import { formatDistance, formatRating, getSupplyName } from "../utils/format";

type StoreListRowProps = {
  distanceMeters?: number;
  store: StoreSummary;
  supplies?: StoreSupply[];
};

export function StoreListRow({ distanceMeters, store, supplies }: StoreListRowProps) {
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

export function getStoreRowAccessibleName(
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

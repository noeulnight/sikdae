import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCurrentLocation } from "../hooks/use-current-location";
import type {
  StoreCategoriesResponse,
  StoreFilters,
  StoreListSort,
  StoreSupply,
} from "../types/store";
import { StoreMapDialog } from "./store-map-dialog";
import { StoreRecommendations } from "./store-recommendations";

type StoreFiltersProps = {
  categories?: StoreCategoriesResponse;
  filters: StoreFilters;
  selectedStoreId: null | string;
  supplies?: StoreSupply[];
  total: number;
  onChange: (filters: StoreFilters) => void;
  onResetPage: () => void;
  onSelect: (storeId: string) => void;
};

const SEARCH_DEBOUNCE_MS = 400;
const SORT_LABELS: Record<StoreListSort, string> = {
  default: "기본순",
  distance: "가까운순",
  rating: "평점순",
};
const SORT_OPTIONS: Array<{ label: string; value: StoreListSort }> = [
  { label: SORT_LABELS.default, value: "default" },
  { label: SORT_LABELS.rating, value: "rating" },
  { label: SORT_LABELS.distance, value: "distance" },
];

export function StoreFilters({
  categories,
  filters,
  selectedStoreId,
  supplies,
  total,
  onChange,
  onResetPage,
  onSelect,
}: StoreFiltersProps) {
  const [searchText, setSearchText] = useState(filters.q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortError, setSortError] = useState<string>();
  const currentLocation = useCurrentLocation();
  const selectedSort = filters.sort ?? "default";
  const selectedCategoryName =
    categories?.categories.find((category) => category.id === filters.categoryId)?.name ?? "전체";
  const selectedSupplyName = filters.supply
    ? (supplies?.find((supply) => supply.code === filters.supply)?.name ?? filters.supply)
    : "전체";
  const activeFilterCount =
    (filters.categoryId ? 1 : 0) +
    (filters.supply ? 1 : 0) +
    (filters.recommended ? 1 : 0) +
    (filters.isNew ? 1 : 0) +
    (selectedSort !== "default" ? 1 : 0);
  const filterSummary = [
    `정렬 ${SORT_LABELS[selectedSort]}`,
    `카테고리 ${selectedCategoryName}`,
    `제공 방식 ${selectedSupplyName}`,
    filters.recommended ? "추천" : null,
    filters.isNew ? "신규" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    setSearchText(filters.q ?? "");
  }, [filters.q]);

  useEffect(() => {
    const nextQuery = searchText.trim() || undefined;

    if (nextQuery === filters.q) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onChange({
        ...filters,
        q: nextQuery,
        offset: 0,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [filters, onChange, searchText]);

  function patchFilters(nextFilters: Partial<StoreFilters>) {
    onChange({
      ...filters,
      ...nextFilters,
      offset: 0,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    patchFilters({ q: searchText.trim() || undefined });
  }

  async function handleSortChange(sort: StoreListSort) {
    setSortError(undefined);

    if (sort === "distance") {
      const locationResult = await currentLocation.requestLocation();

      if (!locationResult.location) {
        setSortError(locationResult.errorMessage);
        return;
      }

      patchFilters({
        lat: locationResult.location.lat,
        lng: locationResult.location.lng,
        sort,
      });
      return;
    }

    patchFilters({
      lat: undefined,
      lng: undefined,
      sort: sort === "default" ? undefined : sort,
    });
  }

  function handleRecommendationSelect(storeId: string) {
    onResetPage();
    onSelect(storeId);
  }

  function resetFilterOptions() {
    setSortError(undefined);
    patchFilters({
      categoryId: undefined,
      isNew: undefined,
      lat: undefined,
      lng: undefined,
      mainCategoryId: undefined,
      recommended: undefined,
      sort: undefined,
      supply: undefined,
    });
  }

  return (
    <section className="sticky top-0 z-10 space-y-2 bg-background/95 pb-3 backdrop-blur lg:static lg:space-y-3 lg:bg-transparent lg:pb-0 lg:backdrop-blur-none">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          className="min-w-0 flex-1"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="매장명 검색"
          aria-label="매장명 검색"
        />
        <Button type="submit" variant="default" size="icon">
          <Search />
          <span className="sr-only">검색</span>
        </Button>
        <StoreMapDialog
          disabled={!total}
          filters={filters}
          selectedStoreId={selectedStoreId}
          supplies={supplies}
          total={total}
          onSelect={onSelect}
        />
        <StoreRecommendations
          categories={categories}
          supplies={supplies}
          onRecommend={onResetPage}
          onSelect={handleRecommendationSelect}
        />
      </form>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="h-auto w-full justify-between py-3">
              <span className="min-w-0 text-left">
                <span className="block text-sm font-medium">필터</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {filterSummary}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {activeFilterCount ? <Badge variant="secondary">{activeFilterCount}</Badge> : null}
                <SlidersHorizontal aria-hidden="true" />
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[min(82svh,620px)] max-h-[82svh] gap-0 overflow-hidden rounded-t-2xl"
          >
            <SheetHeader className="border-b pr-12">
              <SheetTitle>필터</SheetTitle>
              <SheetDescription className="line-clamp-2">{filterSummary}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <FilterContent
                categories={categories}
                filters={filters}
                idPrefix="mobile"
                mode="mobile"
                sortError={sortError}
                sortLoading={currentLocation.isLocating}
                supplies={supplies}
                onPatchFilters={patchFilters}
                onSortChange={handleSortChange}
              />
            </div>
            <SheetFooter className="grid grid-cols-[auto_1fr] border-t">
              <Button
                type="button"
                variant="outline"
                disabled={!activeFilterCount}
                onClick={resetFilterOptions}
              >
                초기화
              </Button>
              <SheetClose asChild>
                <Button type="button" className="w-full">
                  완료
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:block">
        <FilterCollapsible
          badge={activeFilterCount || undefined}
          open={filtersOpen}
          summary={filterSummary}
          title="필터"
          onOpenChange={setFiltersOpen}
        >
          <FilterContent
            categories={categories}
            filters={filters}
            idPrefix="desktop"
            mode="desktop"
            sortError={sortError}
            sortLoading={currentLocation.isLocating}
            supplies={supplies}
            onPatchFilters={patchFilters}
            onSortChange={handleSortChange}
          />
        </FilterCollapsible>
      </div>
    </section>
  );
}

function FilterContent({
  categories,
  filters,
  idPrefix,
  mode,
  sortError,
  sortLoading,
  supplies,
  onPatchFilters,
  onSortChange,
}: {
  categories?: StoreCategoriesResponse;
  filters: StoreFilters;
  idPrefix: string;
  mode: "desktop" | "mobile";
  sortError?: string;
  sortLoading: boolean;
  supplies?: StoreSupply[];
  onPatchFilters: (filters: Partial<StoreFilters>) => void;
  onSortChange: (sort: StoreListSort) => void | Promise<void>;
}) {
  const selectedSort = filters.sort ?? "default";

  return (
    <div className={mode === "mobile" ? "space-y-5" : "space-y-3"}>
      <FilterGroup mode={mode} title="정렬">
        {SORT_OPTIONS.map((sortOption) => (
          <Button
            key={sortOption.value}
            type="button"
            variant={selectedSort === sortOption.value ? "default" : "outline"}
            size="sm"
            aria-pressed={selectedSort === sortOption.value}
            className={mode === "mobile" ? "justify-start" : undefined}
            disabled={sortLoading && sortOption.value === "distance"}
            onClick={() => void onSortChange(sortOption.value)}
          >
            {sortOption.label}
          </Button>
        ))}
      </FilterGroup>
      {sortError ? <p className="text-sm text-destructive">{sortError}</p> : null}

      <FilterGroup mode={mode} title="카테고리">
        <Button
          type="button"
          variant={filters.categoryId ? "outline" : "default"}
          size="sm"
          className={mode === "mobile" ? "justify-start" : undefined}
          onClick={() => onPatchFilters({ categoryId: undefined, mainCategoryId: undefined })}
        >
          전체
        </Button>
        {getSortedCategories(categories).map((category) => (
          <Button
            key={category.id}
            type="button"
            variant={filters.categoryId === category.id ? "default" : "outline"}
            size="sm"
            className={mode === "mobile" ? "justify-start" : undefined}
            onClick={() => onPatchFilters({ categoryId: category.id, mainCategoryId: undefined })}
          >
            {category.name}
          </Button>
        ))}
      </FilterGroup>

      <FilterGroup mode={mode} title="제공 방식">
        <Button
          type="button"
          variant={filters.supply ? "outline" : "default"}
          size="sm"
          className={mode === "mobile" ? "justify-start" : undefined}
          onClick={() => onPatchFilters({ supply: undefined })}
        >
          전체
        </Button>
        {supplies?.map((supply) => (
          <Button
            key={supply.code}
            type="button"
            variant={filters.supply === supply.code ? "default" : "outline"}
            size="sm"
            className={mode === "mobile" ? "justify-start" : undefined}
            onClick={() => onPatchFilters({ supply: supply.code })}
          >
            {supply.name}
          </Button>
        ))}
      </FilterGroup>

      <FilterGroup mode={mode} title="매장 조건">
        <FilterSwitch
          checked={Boolean(filters.recommended)}
          id={`${idPrefix}-recommended-filter`}
          label="추천 매장"
          mode={mode}
          onCheckedChange={(checked) => onPatchFilters({ recommended: checked ? true : undefined })}
        />
        <FilterSwitch
          checked={Boolean(filters.isNew)}
          id={`${idPrefix}-new-filter`}
          label="신규 매장"
          mode={mode}
          onCheckedChange={(checked) => onPatchFilters({ isNew: checked ? true : undefined })}
        />
      </FilterGroup>
    </div>
  );
}

function getSortedCategories(categories?: StoreCategoriesResponse) {
  return [...(categories?.categories ?? [])].sort((first, second) => first.order - second.order);
}

function FilterGroup({
  children,
  mode,
  title,
}: {
  children: ReactNode;
  mode: "desktop" | "mobile";
  title: string;
}) {
  return (
    <div className={mode === "mobile" ? "space-y-3" : "space-y-2"}>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div
        className={
          mode === "mobile"
            ? "grid grid-cols-2 gap-2 min-[430px]:grid-cols-3"
            : "flex flex-wrap gap-2"
        }
      >
        {children}
      </div>
    </div>
  );
}

function FilterSwitch({
  checked,
  id,
  label,
  mode,
  onCheckedChange,
}: {
  checked: boolean;
  id: string;
  label: string;
  mode: "desktop" | "mobile";
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border bg-card data-[active=true]:border-primary/40 data-[active=true]:bg-primary/5",
        mode === "mobile"
          ? "col-span-2 px-3 py-3 min-[430px]:col-span-3"
          : "min-w-[180px] flex-1 px-3 py-2",
      )}
      data-active={checked}
    >
      <div className="grid gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs text-muted-foreground">{checked ? "켜짐" : "꺼짐"}</span>
      </div>
      <Switch
        id={id}
        aria-label={`${label}만 보기`}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function FilterCollapsible({
  badge,
  children,
  open,
  summary,
  title,
  onOpenChange,
}: {
  badge?: number;
  children: ReactNode;
  open: boolean;
  summary: string;
  title: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Collapsible open={open} className="rounded-lg border bg-card p-3" onOpenChange={onOpenChange}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="text-sm font-medium text-foreground">{title}</p>
            {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">{summary}</p>
        </div>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-mt-0.5"
            aria-label={`${title} ${open ? "접기" : "펼치기"}`}
          >
            <ChevronDown
              className={open ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="mt-3 space-y-3 border-t pt-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

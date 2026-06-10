import { useEffect, useState } from "react";
import { StoreFilters } from "../components/store-filters";
import { StoreList } from "../components/store-list";
import { StoreDetailPanel } from "../components/store-detail-panel";
import {
  useStoreCategoriesQuery,
  useStoresQuery,
  useStoreSupplyQuery,
} from "../queries/store-queries";
import type { StoreFilters as StoreFiltersState } from "../types/store";

const DEFAULT_FILTERS: StoreFiltersState = {
  offset: 0,
  limit: 20,
};

const STORE_DETAIL_PATH_PATTERN = /^\/stores\/([^/]+)\/?$/;

export function StoresPage() {
  const initialRouteStoreId = readStoreIdFromPath();
  const [filters, setFilters] = useState<StoreFiltersState>(DEFAULT_FILTERS);
  const [routeStoreId, setRouteStoreId] = useState<null | string>(initialRouteStoreId);
  const [selectedStoreId, setSelectedStoreId] = useState<null | string>(initialRouteStoreId);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(Boolean(initialRouteStoreId));
  const storesQuery = useStoresQuery(filters);
  const categoriesQuery = useStoreCategoriesQuery();
  const supplyQuery = useStoreSupplyQuery();
  const stores = storesQuery.data?.items;
  const pagination = storesQuery.data?.pagination;

  useEffect(() => {
    function handlePopState() {
      const nextRouteStoreId = readStoreIdFromPath();

      setRouteStoreId(nextRouteStoreId);
      setSelectedStoreId(nextRouteStoreId);
      setMobileDetailOpen(Boolean(nextRouteStoreId));
    }

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!stores) {
      return;
    }

    if (!stores.length) {
      if (!routeStoreId) {
        setSelectedStoreId(null);
        setMobileDetailOpen(false);
      }
      return;
    }

    if (
      !routeStoreId &&
      (!selectedStoreId || !stores.some((store) => store.id === selectedStoreId))
    ) {
      setSelectedStoreId(stores[0].id);
      setMobileDetailOpen(false);
    }
  }, [routeStoreId, selectedStoreId, stores]);

  function handleFilterChange(nextFilters: StoreFiltersState) {
    clearStoreRoute("replace");
    setRouteStoreId(null);
    setFilters(nextFilters);
    setMobileDetailOpen(false);
  }

  function handleListPageReset() {
    setFilters((currentFilters) =>
      currentFilters.offset ? { ...currentFilters, offset: 0 } : currentFilters,
    );
  }

  function handleSelectStore(storeId: string) {
    pushStoreRoute(storeId);
    setRouteStoreId(storeId);
    setSelectedStoreId(storeId);
    setMobileDetailOpen(true);
  }

  function handleBackToList() {
    clearStoreRoute("push");
    setRouteStoreId(null);
    setMobileDetailOpen(false);
  }

  return (
    <main className="min-h-svh bg-background text-foreground lg:h-svh lg:overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 md:px-6 lg:h-full">
        <header className="shrink-0 border-b pb-3">
          <h1 className="text-2xl font-semibold tracking-normal">식권대장</h1>
        </header>

        <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[440px_minmax(0,1fr)]">
          <aside
            className={`${mobileDetailOpen ? "hidden" : "block"} space-y-4 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden`}
          >
            <div className="lg:shrink-0">
              <StoreFilters
                categories={categoriesQuery.data}
                filters={filters}
                selectedStoreId={selectedStoreId}
                supplies={supplyQuery.data}
                total={pagination?.total ?? 0}
                onChange={handleFilterChange}
                onResetPage={handleListPageReset}
                onSelect={handleSelectStore}
              />
            </div>
            <StoreList
              error={storesQuery.error}
              filters={filters}
              isError={storesQuery.isError}
              isLoading={storesQuery.isLoading}
              items={stores}
              pagination={pagination}
              selectedStoreId={selectedStoreId}
              supplies={supplyQuery.data}
              onFilterChange={handleFilterChange}
              onSelect={handleSelectStore}
            />
          </aside>

          <section
            className={`${mobileDetailOpen ? "block" : "hidden"} lg:block lg:min-h-0 lg:overflow-hidden`}
          >
            <StoreDetailPanel
              storeId={selectedStoreId}
              supplies={supplyQuery.data}
              onBackToList={handleBackToList}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function readStoreIdFromPath() {
  if (typeof window === "undefined") {
    return null;
  }

  const match = window.location.pathname.match(STORE_DETAIL_PATH_PATTERN);

  if (!match?.[1]) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function pushStoreRoute(storeId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const nextPath = `/stores/${encodeURIComponent(storeId)}`;

  if (window.location.pathname !== nextPath) {
    window.history.pushState(null, "", nextPath);
  }
}

function clearStoreRoute(mode: "push" | "replace") {
  if (typeof window === "undefined" || !readStoreIdFromPath()) {
    return;
  }

  if (mode === "push") {
    window.history.pushState(null, "", "/");
    return;
  }

  window.history.replaceState(null, "", "/");
}

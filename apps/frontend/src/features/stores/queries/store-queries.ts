import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAppStatus,
  getStoreCategories,
  getStoreDetail,
  getStoreRecommendations,
  getStoreReviews,
  getStoreSupply,
  getStores,
} from "../api/stores-api";
import type { StoreFilters } from "../types/store";

export const storeQueryKeys = {
  all: ["stores"] as const,
  categories: () => [...storeQueryKeys.all, "categories"] as const,
  detail: (storeId: string) => [...storeQueryKeys.all, "detail", storeId] as const,
  list: (filters: StoreFilters) => [...storeQueryKeys.all, "list", filters] as const,
  map: (filters: StoreFilters) => [...storeQueryKeys.all, "map", filters] as const,
  reviews: (storeId: string) => [...storeQueryKeys.all, "reviews", storeId] as const,
  status: () => ["status"] as const,
  supply: () => [...storeQueryKeys.all, "supply"] as const,
};

export function useStoresQuery(filters: StoreFilters) {
  return useQuery({
    queryKey: storeQueryKeys.list(filters),
    queryFn: () => getStores(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useStoreMapQuery(filters: StoreFilters, enabled: boolean) {
  return useQuery({
    queryKey: storeQueryKeys.map(filters),
    queryFn: () => getStores(filters),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useStoreCategoriesQuery() {
  return useQuery({
    queryKey: storeQueryKeys.categories(),
    queryFn: getStoreCategories,
  });
}

export function useStoreSupplyQuery() {
  return useQuery({
    queryKey: storeQueryKeys.supply(),
    queryFn: getStoreSupply,
  });
}

export function useStoreRecommendationsMutation() {
  return useMutation({
    mutationFn: getStoreRecommendations,
  });
}

export function useStoreDetailQuery(storeId: null | string) {
  return useQuery({
    queryKey: storeQueryKeys.detail(storeId ?? ""),
    queryFn: () => getStoreDetail(storeId ?? ""),
    enabled: Boolean(storeId),
  });
}

export function useStoreReviewsQuery(storeId: null | string) {
  return useQuery({
    queryKey: storeQueryKeys.reviews(storeId ?? ""),
    queryFn: () => getStoreReviews(storeId ?? ""),
    enabled: Boolean(storeId),
  });
}

export function useAppStatusQuery() {
  return useQuery({
    queryKey: storeQueryKeys.status(),
    queryFn: getAppStatus,
    refetchInterval: 60_000,
  });
}

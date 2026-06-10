import { apiClient } from "@/lib/api/client";
import type {
  AppStatus,
  StoreCategoriesResponse,
  StoreDetailResponse,
  StoreFilters,
  StoreListResponse,
  StoreRecommendationFilters,
  StoreRecommendationResponse,
  StoreReviews,
  StoreSupply,
} from "../types/store";

function cleanParams(params: Record<string, boolean | number | string | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export async function getStores(filters: StoreFilters) {
  const response = await apiClient.get<StoreListResponse>("/stores", {
    params: cleanParams(filters),
  });

  return response.data;
}

export async function getStoreRecommendations(filters: StoreRecommendationFilters) {
  const response = await apiClient.get<StoreRecommendationResponse>("/stores/recommendations", {
    params: cleanParams(filters),
  });

  return response.data;
}

export async function getStoreCategories() {
  const response = await apiClient.get<StoreCategoriesResponse>("/stores/categories");

  return response.data;
}

export async function getStoreSupply() {
  const response = await apiClient.get<StoreSupply[]>("/stores/supply");

  return response.data;
}

export async function getStoreDetail(storeId: string) {
  const response = await apiClient.get<StoreDetailResponse>(`/stores/${storeId}`);

  return response.data;
}

export async function getStoreReviews(storeId: string) {
  const response = await apiClient.get<StoreReviews>(`/stores/${storeId}/reviews`);

  return response.data;
}

export async function getAppStatus() {
  const response = await apiClient.get<AppStatus>("/status");

  return response.data;
}

import type { StoreDetail, StoreMenu, StoreSummary, StoreSupply } from "../types/store";

const fallbackFormatter = new Intl.NumberFormat("ko-KR");

export function formatNumber(value: number) {
  return fallbackFormatter.format(value);
}

export function formatPrice(value: number) {
  return `${fallbackFormatter.format(value)}원`;
}

export function formatRating(score: number, count: number) {
  if (count === 0) {
    return "평점 없음";
  }

  return `${score.toFixed(1)} (${formatNumber(count)})`;
}

export function formatDate(value: null | string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatDistance(value: number) {
  if (value < 1_000) {
    return `${formatNumber(Math.round(value))}m`;
  }

  const kilometers = value / 1_000;

  return `${kilometers >= 10 ? Math.round(kilometers) : kilometers.toFixed(1)}km`;
}

export function getStoreImage(store: StoreDetail | StoreSummary) {
  return (
    store.images.thumbnail ??
    store.images.main ??
    getThumbnailUrl(store.images.thumbnails[0]) ??
    ("mainCategories" in store ? store.mainCategories[0]?.imageUrl : null)
  );
}

export function getMenuImage(menu: StoreMenu) {
  return (
    menu.images.thumbnail ?? menu.images.main ?? getThumbnailUrl(menu.images.thumbnails[0]) ?? null
  );
}

export function getSupplyName(code: string, supplies?: StoreSupply[]) {
  return supplies?.find((supply) => supply.code === code)?.name ?? code;
}

function getThumbnailUrl(thumbnail: string | { thumbnailImage?: string } | undefined) {
  if (!thumbnail) {
    return null;
  }

  return typeof thumbnail === "string" ? thumbnail : (thumbnail.thumbnailImage ?? null);
}

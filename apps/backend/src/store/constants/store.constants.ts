export const SIKDAE_STORE_PATHS = {
  detail: (storeId: string) => `/store/v6/${encodeURIComponent(storeId)}`,
  list: "/store/v5",
  menu: (storeId: string) => `/store/v5/${encodeURIComponent(storeId)}/menu`,
  reviews: (storeId: string) => `/review/v1/stores/${encodeURIComponent(storeId)}/expansion`,
} as const;

const SIKDAE_STORE_DETAIL_CACHE_PREFIX = "sikdae:store:detail:store:v1";
const SIKDAE_STORE_MENU_CACHE_PREFIX = "sikdae:store:menus:contract:v1";
const SIKDAE_STORE_REVIEW_CACHE_PREFIX = "sikdae:store:reviews:contract:v1";

export const SIKDAE_STORE_CACHE_KEYS = {
  detail: (storeId: string) => `${SIKDAE_STORE_DETAIL_CACHE_PREFIX}:${storeId}`,
  list: "sikdae:store:v5",
  menu: (storeId: string) => `${SIKDAE_STORE_MENU_CACHE_PREFIX}:${storeId}`,
  reviews: (storeId: string) => `${SIKDAE_STORE_REVIEW_CACHE_PREFIX}:${storeId}`,
} as const;

export const SIKDAE_STORE_DETAIL_CACHE_TTL_SECONDS = 86_400;
export const SIKDAE_STORE_LIST_CACHE_TTL_SECONDS = 86_400;
export const SIKDAE_STORE_MENU_CACHE_TTL_SECONDS = 60;
export const SIKDAE_STORE_REVIEW_CACHE_TTL_SECONDS = 300;

export const SIKDAE_STORE_HEADERS = {
  acceptLanguage: "HTTP_LANG",
  appName: "sikdae-ios",
  appPlatform: "mobile-app-ios",
  responseType: "json",
  uaDeviceMcc: "",
  uaDeviceMnc: "",
} as const;

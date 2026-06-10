export const SIKDAE_CACHE_SKEW_SECONDS = 60;
export const SIKDAE_GRANT_TYPE = "password";
export const SIKDAE_TOKEN_CACHE_PREFIX = "sikdae:oauth:token";

export const SIKDAE_API_PATHS = {
  me: "/app/v2/me",
} as const;

export const SIKDAE_APP_HEADERS = {
  acceptLanguage: "HTTP_LANG",
  appName: "sikdae-ios",
  appPlatform: "mobile-app-ios",
  responseType: "json",
  uaDeviceMcc: "",
  uaDeviceMnc: "",
} as const;

export const SIKDAE_OAUTH_PATHS = {
  kmsPublicKey: (keyId: string) => `/open/v2/kms/public/${encodeURIComponent(keyId)}`,
  sso: "/sso/v2",
  token: "/vendys/v2/token",
} as const;

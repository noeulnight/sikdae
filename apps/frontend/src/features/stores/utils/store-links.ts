import type { StoreDetail } from "../types/store";

type StoreShareNavigator = {
  clipboard: Pick<Clipboard, "writeText">;
  share?: (data: ShareData) => Promise<void>;
};

export function getNaverMapUrl(store: Pick<StoreDetail, "address" | "name">) {
  const query = [store.name, store.address].filter(Boolean).join(" ");

  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

export async function shareStore(
  title: string,
  url: string,
  browserNavigator: StoreShareNavigator = navigator,
) {
  if (browserNavigator.share) {
    try {
      await browserNavigator.share({ title, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  await browserNavigator.clipboard.writeText(url);
  return "copied";
}

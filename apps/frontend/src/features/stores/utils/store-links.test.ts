import { describe, expect, test } from "vite-plus/test";
import { getNaverMapUrl, shareStore } from "./store-links";

describe("store links", () => {
  test("builds a Naver Map search URL", () => {
    expect(getNaverMapUrl({ address: "서울 강남구", name: "맛집" })).toBe(
      "https://map.naver.com/p/search/%EB%A7%9B%EC%A7%91%20%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC",
    );
  });

  test("copies the URL when native sharing is unavailable", async () => {
    let copiedUrl = "";
    const browserNavigator = {
      clipboard: {
        writeText: async (url: string) => {
          copiedUrl = url;
        },
      },
    };

    await expect(
      shareStore("맛집", "https://example.com/stores/1", browserNavigator),
    ).resolves.toBe("copied");
    expect(copiedUrl).toBe("https://example.com/stores/1");
  });
});

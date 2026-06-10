import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { isAxiosError } from "axios";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CacheService } from "../cache/cache.service";
import type { SikdaeTokenResponse } from "../sikdae/interfaces/sikdae-oauth.interface";
import { SikdaeService } from "../sikdae/sikdae.service";
import {
  SIKDAE_STORE_CACHE_KEYS,
  SIKDAE_STORE_DETAIL_CACHE_TTL_SECONDS,
  SIKDAE_STORE_LIST_CACHE_TTL_SECONDS,
  SIKDAE_STORE_MENU_CACHE_TTL_SECONDS,
  SIKDAE_STORE_PATHS,
  SIKDAE_STORE_REVIEW_CACHE_TTL_SECONDS,
} from "./constants/store.constants";
import { StoreListQueryDto, StoreRecommendationQueryDto } from "./dto/store-list-query.dto";
import { SikdaeStoreException } from "./exceptions/store.exception";
import type {
  SikdaeStore,
  SikdaeStoreDetailResponse,
  SikdaeStoreListResponse,
  SikdaeStoreMenuResponse,
  SikdaeStoreReviewResponse,
  SikdaeStoreSupplyType,
  StoreCategoriesResult,
  StoreDetail,
  StoreDetailResult,
  StoreListResult,
  StoreMenuResult,
  StoreRecommendationResult,
  StoreReviews,
} from "./interfaces/store.interface";
import {
  mapCategory,
  mapMainCategory,
  mapReviews,
  mapStoreDetail,
  mapStoreMenuResult,
  mapStoreRecommendation,
  mapStoreSummary,
} from "./mappers/store.mapper";

@Injectable()
export class StoreService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly httpService: HttpService,
    private readonly sikdaeService: SikdaeService,
  ) {}

  async retrieveStores(): Promise<SikdaeStoreListResponse> {
    return this.cacheService.cache<SikdaeStoreListResponse>(
      SIKDAE_STORE_CACHE_KEYS.list,
      async () => {
        const token = await this.sikdaeService.retrieveToken();

        try {
          const response = await firstValueFrom(
            this.httpService.get<SikdaeStoreListResponse>(SIKDAE_STORE_PATHS.list, {
              headers: {
                Authorization: `${token.token_type} ${token.access_token}`,
              },
            }),
          );

          return response.data;
        } catch (error) {
          throw this.toSikdaeStoreException(error, SIKDAE_STORE_PATHS.list);
        }
      },
      {
        ttlSeconds: SIKDAE_STORE_LIST_CACHE_TTL_SECONDS,
      },
    );
  }

  async retrieveStoreList(query: StoreListQueryDto): Promise<StoreListResult> {
    const response = await this.retrieveStores();
    const filteredStores = this.filterStores(response.stores, query);
    const sortedStores = this.sortStores(filteredStores, query);
    const offset = query.offset ?? 0;
    const limit = query.limit ?? sortedStores.length;
    const items = sortedStores.slice(offset, offset + limit).map((store) => mapStoreSummary(store));

    return {
      items,
      pagination: {
        hasNext: offset + limit < sortedStores.length,
        limit,
        offset,
        total: sortedStores.length,
      },
    };
  }

  async retrieveRecommendations(
    query: StoreRecommendationQueryDto,
  ): Promise<StoreRecommendationResult> {
    const response = await this.retrieveStores();
    const categoryIds = this.resolveRecommendationCategoryIds(query);
    const candidates = response.stores
      .filter((store) => {
        if (categoryIds.length) {
          return categoryIds.includes(store.category.id);
        }

        return true;
      })
      .map((store) => ({
        distanceMeters: this.calculateDistanceMeters(
          query.lat,
          query.lng,
          store.location.gpslat,
          store.location.gpslon,
        ),
        store,
      }))
      .filter((candidate) => candidate.distanceMeters <= query.rangeMeters)
      .map((candidate) => ({
        ...candidate,
        randomOrder: Math.random(),
      }))
      .sort((left, right) => left.randomOrder - right.randomOrder)
      .slice(0, 5)
      .map((candidate) =>
        mapStoreRecommendation(candidate.store, Math.round(candidate.distanceMeters)),
      );

    return {
      items: candidates,
    };
  }

  private resolveRecommendationCategoryIds(query: StoreRecommendationQueryDto): number[] {
    return [...new Set(query.categoryIds?.length ? query.categoryIds : [query.categoryId])].filter(
      (categoryId): categoryId is number => categoryId !== undefined,
    );
  }

  async retrieveStore(storeId: string): Promise<StoreDetailResult> {
    const detailCacheKey = SIKDAE_STORE_CACHE_KEYS.detail(storeId);
    const menuCacheKey = SIKDAE_STORE_CACHE_KEYS.menu(storeId);
    let tokenPromise: Promise<SikdaeTokenResponse> | undefined;
    const retrieveToken = (): Promise<SikdaeTokenResponse> => {
      tokenPromise ??= this.sikdaeService.retrieveToken();

      return tokenPromise;
    };
    const [store, menu, reviews] = await Promise.all([
      this.cacheService.cache<StoreDetail>(
        detailCacheKey,
        async () => {
          const token = await retrieveToken();
          const detail = await this.fetchStoreDetail(storeId, token);

          return mapStoreDetail(detail.store);
        },
        {
          ttlSeconds: SIKDAE_STORE_DETAIL_CACHE_TTL_SECONDS,
        },
      ),
      this.cacheService.cache<StoreMenuResult>(
        menuCacheKey,
        async () => {
          const token = await retrieveToken();
          const menu = await this.fetchStoreMenu(storeId, token);

          return mapStoreMenuResult(menu);
        },
        {
          ttlSeconds: SIKDAE_STORE_MENU_CACHE_TTL_SECONDS,
        },
      ),
      this.retrieveStoreReviews(storeId),
    ]);

    return {
      menuCategories: menu.menuCategories,
      menus: menu.menus,
      reviews: reviews.summary,
      store,
    };
  }

  async retrieveStoreReviews(storeId: string): Promise<StoreReviews> {
    const cacheKey = SIKDAE_STORE_CACHE_KEYS.reviews(storeId);

    return this.cacheService.cache<StoreReviews>(
      cacheKey,
      async () => {
        const token = await this.sikdaeService.retrieveToken();
        const reviews = await this.fetchStoreReviews(storeId, token);

        return mapReviews(reviews);
      },
      {
        ttlSeconds: SIKDAE_STORE_REVIEW_CACHE_TTL_SECONDS,
      },
    );
  }

  async retrieveCategories(): Promise<StoreCategoriesResult> {
    const response = await this.retrieveStores();

    return {
      categories: response.categories.map((category) => mapCategory(category)),
      mainCategories: response.mainCategories.map((category) => mapMainCategory(category)),
    };
  }

  async retrieveSupply(): Promise<SikdaeStoreSupplyType[]> {
    const response = await this.retrieveStores();

    return response.supplyTypes;
  }

  private filterStores(stores: SikdaeStore[], query: StoreListQueryDto): SikdaeStore[] {
    let filteredStores = stores;
    const keyword = query.q?.trim().toLocaleLowerCase("ko-KR");

    if (keyword) {
      filteredStores = filteredStores.filter((store) => {
        const name = store.name.toLocaleLowerCase("ko-KR");
        const intro = store.intro.toLocaleLowerCase("ko-KR");

        return name.includes(keyword) || intro.includes(keyword);
      });
    }

    if (query.categoryId !== undefined) {
      filteredStores = filteredStores.filter((store) => store.category.id === query.categoryId);
    }

    if (query.mainCategoryId !== undefined) {
      filteredStores = filteredStores.filter((store) =>
        store.mainCategories.some((category) => category.id === query.mainCategoryId),
      );
    }

    if (query.supply) {
      filteredStores = filteredStores.filter((store) =>
        store.supplyTypes.some((supplyType) => supplyType.code === query.supply),
      );
    }

    if (query.recommended !== undefined) {
      filteredStores = filteredStores.filter((store) => store.isRecommended === query.recommended);
    }

    if (query.isNew !== undefined) {
      filteredStores = filteredStores.filter((store) => store.isNew === query.isNew);
    }

    return filteredStores;
  }

  private sortStores(stores: SikdaeStore[], query: StoreListQueryDto): SikdaeStore[] {
    const sort = query.sort ?? "default";

    if (sort === "default") {
      return stores;
    }

    if (sort === "rating") {
      return [...stores].sort(
        (left, right) => right.score - left.score || right.reviewCount - left.reviewCount,
      );
    }

    if (query.lat === undefined || query.lng === undefined) {
      throw new BadRequestException("lat and lng are required when sort is distance");
    }

    const { lat, lng } = query;

    return [...stores].sort(
      (left, right) =>
        this.calculateDistanceMeters(lat, lng, left.location.gpslat, left.location.gpslon) -
        this.calculateDistanceMeters(lat, lng, right.location.gpslat, right.location.gpslon),
    );
  }

  private calculateDistanceMeters(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): number {
    const earthRadiusMeters = 6_371_000;
    const fromLatRadians = this.toRadians(fromLat);
    const toLatRadians = this.toRadians(toLat);
    const latDelta = this.toRadians(toLat - fromLat);
    const lngDelta = this.toRadians(toLng - fromLng);
    const haversine =
      Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
      Math.cos(fromLatRadians) *
        Math.cos(toLatRadians) *
        Math.sin(lngDelta / 2) *
        Math.sin(lngDelta / 2);

    return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private async fetchStoreDetail(
    storeId: string,
    token: SikdaeTokenResponse,
  ): Promise<SikdaeStoreDetailResponse> {
    const path = SIKDAE_STORE_PATHS.detail(storeId);

    try {
      const response = await firstValueFrom(
        this.httpService.get<SikdaeStoreDetailResponse>(path, {
          headers: {
            Authorization: `${token.token_type} ${token.access_token}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw this.toSikdaeStoreException(error, path);
    }
  }

  private async fetchStoreMenu(
    storeId: string,
    token: SikdaeTokenResponse,
  ): Promise<SikdaeStoreMenuResponse> {
    const path = SIKDAE_STORE_PATHS.menu(storeId);

    try {
      const response = await firstValueFrom(
        this.httpService.get<SikdaeStoreMenuResponse>(path, {
          headers: {
            Authorization: `${token.token_type} ${token.access_token}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw this.toSikdaeStoreException(error, path);
    }
  }

  private async fetchStoreReviews(
    storeId: string,
    token: SikdaeTokenResponse,
  ): Promise<SikdaeStoreReviewResponse> {
    const path = SIKDAE_STORE_PATHS.reviews(storeId);

    try {
      const response = await firstValueFrom(
        this.httpService.get<SikdaeStoreReviewResponse>(path, {
          headers: {
            Authorization: `${token.token_type} ${token.access_token}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw this.toSikdaeStoreException(error, path);
    }
  }

  private toSikdaeStoreException(error: unknown, path: string): SikdaeStoreException {
    if (isAxiosError(error)) {
      return new SikdaeStoreException(
        `Sikdae store request failed: ${path}`,
        error.response?.status,
        error.code,
      );
    }

    return new SikdaeStoreException(`Sikdae store request failed: ${path}`);
  }
}

export type StoreSupplyCode = string;

export type StoreCategory = {
  id: number;
  name: string;
  order: number;
};

export type StoreMainCategory = {
  id: number;
  name: string;
  imageUrl: null | string;
};

export type StoreLocation = {
  lat: number;
  lng: number;
};

export type StoreRating = {
  score: number;
  count: number;
  visible?: boolean;
};

export type StoreImages = {
  main: null | string;
  thumbnail: null | string;
  thumbnails: Array<string | { thumbnailImage?: string }>;
};

export type StoreDetailImages = StoreImages & {
  menuBoards: string[];
  notices: string[];
  noticePopups: string[];
  signatures: string[];
};

export type StoreFlags = {
  booking: boolean;
  captainCode: boolean;
  captainPay?: boolean;
  cafeteria?: boolean;
  new?: boolean;
  recommended?: boolean;
  test?: boolean;
};

export type StoreSummary = {
  id: string;
  name: string;
  description: null | string;
  supply: StoreSupplyCode[];
  category: StoreCategory;
  mainCategories: StoreMainCategory[];
  location: StoreLocation;
  rating: StoreRating;
  images: StoreImages;
  flags: StoreFlags;
  registeredAt: null | string;
};

export type StoreListPagination = {
  total: number;
  offset: number;
  limit: number;
  hasNext: boolean;
};

export type StoreListResponse = {
  items: StoreSummary[];
  pagination: StoreListPagination;
};

export const STORE_LIST_SORT_VALUES = ["default", "distance", "rating"] as const;

export type StoreListSort = (typeof STORE_LIST_SORT_VALUES)[number];

export type StoreRecommendation = StoreSummary & {
  distanceMeters: number;
};

export type StoreRecommendationFilters = {
  categoryIds?: string;
  rangeMeters: number;
  lat: number;
  lng: number;
};

export type StoreRecommendationResponse = {
  items: StoreRecommendation[];
};

export type StoreCategoriesResponse = {
  categories: StoreCategory[];
  mainCategories: StoreMainCategory[];
};

export type StoreSupply = {
  code: StoreSupplyCode;
  name: string;
};

export type StorePayment = {
  type: string;
  rate: number;
  multiple: boolean;
};

export type StoreDetail = {
  id: string;
  name: string;
  description: null | string;
  address: null | string;
  telephone: null | string;
  supply: StoreSupplyCode[];
  payment: StorePayment;
  location: StoreLocation;
  rating: StoreRating;
  images: StoreDetailImages;
  flags: StoreFlags;
};

export type StoreMenuCategory = {
  id: number;
  name: string;
  order: number;
};

export type StoreMenuPrice = {
  regular: number;
  sale: number;
  discountRate: null | number;
};

export type StoreMenu = {
  id: string;
  name: string;
  description: null | string;
  warning: null | string;
  category: StoreMenuCategory;
  price: StoreMenuPrice;
  images: StoreImages;
  status: string;
  rating: StoreRating;
  order: number;
};

export type StoreReviewDistribution = {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
};

export type StoreReviewSummary = {
  score: number;
  count: number;
  commentCount: number;
  imageCount: number;
  distribution: StoreReviewDistribution;
};

export type StoreDetailResponse = {
  store: StoreDetail;
  menuCategories: StoreMenuCategory[];
  menus: StoreMenu[];
  reviews: StoreReviewSummary;
};

export type StoreReviewImage = {
  id: number;
  mainUrl: null | string;
  thumbnailUrl: null | string;
};

export type StoreReviewMenuImage = {
  main: null | string;
  thumbnail: null | string;
};

export type StoreReviewMenu = {
  id: string;
  name: string;
  image: StoreReviewMenuImage;
};

export type StoreReview = {
  id: number;
  score: number;
  content: string;
  author: {
    nickname: null | string;
  };
  images: StoreReviewImage[];
  menus: StoreReviewMenu[];
  reactions: {
    likes: number;
    likedByMe: boolean;
    writtenByMe: boolean;
  };
  createdAt: null | string;
};

export type StoreReviews = {
  summary: StoreReviewSummary;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
  };
  images: StoreReviewImage[];
  items: StoreReview[];
};

export type StoreFilters = {
  offset: number;
  limit: number;
  q?: string;
  categoryId?: number;
  lat?: number;
  lng?: number;
  mainCategoryId?: number;
  supply?: StoreSupplyCode;
  recommended?: boolean;
  isNew?: boolean;
  sort?: StoreListSort;
};

export type AppStatus = {
  ok: boolean;
  auth: {
    ok: boolean;
    me: {
      ok: boolean;
      remoteStatus: string;
      responseMs: number;
    };
    tokenCache: {
      hit: boolean;
      ttlSeconds: number;
    };
  };
  cache: {
    ok: boolean;
    redis: {
      ping: boolean;
      responseMs: number;
      status: string;
    };
    stores: {
      list?: {
        hit: boolean;
        ttlSeconds: number;
      };
    };
  };
  checkedAt: string;
  service: string;
};

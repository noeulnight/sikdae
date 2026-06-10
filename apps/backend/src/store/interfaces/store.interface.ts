export interface SikdaeStoreSupplyType {
  code: string;
  name: string;
}

export interface SikdaeStoreCategory {
  id: number;
  name: string;
  order: number;
}

export interface SikdaeStoreMainCategory {
  id: number;
  name: string;
  logoImage: string;
}

export interface SikdaeStoreLocation {
  gpslat: number;
  gpslon: number;
  image: string | null;
}

export interface SikdaeStoreImage {
  main: string | null;
  thumb: string | null;
  thumbnails: string[] | null;
}

export interface SikdaeStore {
  order: number;
  id: string;
  multipay: boolean;
  name: string;
  intro: string;
  supplyTypes: SikdaeStoreSupplyType[];
  isFavorites: boolean;
  isNew: boolean;
  isBooking: boolean | null;
  barcodeType: string | null;
  isCaptainCode: boolean;
  isRecommended: boolean;
  isHiddenMap: boolean;
  category: SikdaeStoreCategory;
  mainCategories: SikdaeStoreMainCategory[];
  location: SikdaeStoreLocation;
  isReview: boolean;
  score: number;
  reviewCount: number;
  isReviewVisible: boolean | null;
  image: SikdaeStoreImage;
  regDate: number;
}

export interface SikdaeStoreListResponse {
  supplyTypes: SikdaeStoreSupplyType[];
  categories: SikdaeStoreCategory[];
  mainCategories: SikdaeStoreMainCategory[];
  recommendedPhrase: string | null;
  recommendedStores: SikdaeStore[];
  stores: SikdaeStore[];
}

export interface SikdaeStoreDetailLocation {
  gpslat: number;
  gpslon: number;
}

export interface SikdaeStoreAutoEverCafeteria {
  isAutoEverCafeteria: boolean;
  webviewUrl: string | null;
}

export interface SikdaeStoreDetail {
  id: string;
  name: string;
  intro: string;
  multipay: boolean;
  supplyTypes: SikdaeStoreSupplyType[];
  limitAmount: number;
  isFavorites: boolean;
  isBooking: boolean | null;
  isCaptainCode: boolean;
  isCaptainPay: boolean;
  barcodeType: string | null;
  image: string | null;
  addr: string;
  tel: string | null;
  shippingFee: number | null;
  shippingInfo: string | null;
  paymentType: string;
  paymentRate: number;
  location: SikdaeStoreDetailLocation;
  additionalMessage: string | null;
  isReview: boolean;
  score: number;
  reviewCount: number;
  isMultiplePayment: boolean;
  externalLink: string | null;
  isExposeDeliveryRequirement: boolean;
  isTest: boolean | null;
  signatureImageList: string[];
  menuBoardImageList: string[];
  noticeImageList: string[];
  noticePopupImageList: string[];
  isCafeteria: boolean;
  autoEverCafeteria: SikdaeStoreAutoEverCafeteria;
}

export interface SikdaeStoreDetailResponse {
  store: SikdaeStoreDetail;
  booked: Record<string, unknown> | null;
  robotDeliveryInfo: Record<string, unknown> | null;
  selectedBookingDate: string | null;
}

export interface SikdaeStoreMenuImages {
  main: string | null;
  thumb: string | null;
  thumbnails: string[];
}

export interface SikdaeStoreMenuContent {
  order: number;
  id: string;
  name: string;
  intro: string;
  warning: string | null;
  price: number;
  salesPrice: number;
  discountRate: number | null;
  images: SikdaeStoreMenuImages;
  productId: string | null;
  status: string;
  booking: Record<string, unknown> | null;
  isReview: boolean;
  score: number;
  reviewCount: number;
  stock: Record<string, unknown> | null;
}

export interface SikdaeStoreMenuGroup {
  category: SikdaeStoreCategory;
  contents: SikdaeStoreMenuContent[];
}

export interface SikdaeStoreMenuResponse {
  menus: SikdaeStoreMenuGroup[];
}

export interface SikdaeStoreReviewPageInfo {
  page: number;
  pageRow: number;
  totalPage: number;
  totalRow: number;
  totalCommentRow: number;
}

export interface SikdaeStoreReviewScoreCountInfo {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
}

export interface SikdaeStoreReviewScoreInfo {
  score: number;
  countInfo: SikdaeStoreReviewScoreCountInfo;
}

export interface SikdaeStoreReviewImageSummary {
  reviewIdx: number;
  imageReviewIdx: number;
  thumbImageUrl: string;
}

export interface SikdaeStoreReviewImageInfo {
  totalRow: number;
  images: SikdaeStoreReviewImageSummary[];
}

export interface SikdaeStoreReviewImage {
  main: string;
  thumb: string;
  imageReviewIdx: number;
}

export interface SikdaeStoreReviewMenuImage {
  main: string | null;
  thumb: string | null;
}

export interface SikdaeStoreReviewMenu {
  menuId: string;
  name: string;
  image: SikdaeStoreReviewMenuImage;
}

export interface SikdaeStoreReviewStoreMenuInfo {
  storeId: string;
  name: string;
  supplyTypes: SikdaeStoreSupplyType[];
  menus: SikdaeStoreReviewMenu[];
}

export interface SikdaeStoreReview {
  reviewIdx: number;
  score: number;
  nickname: string | null;
  content: string;
  images: SikdaeStoreReviewImage[] | null;
  commentInfo: Record<string, unknown> | null;
  storeMenuInfo: SikdaeStoreReviewStoreMenuInfo;
  reportCount: number;
  likeCount: number;
  isLikeByMe: boolean;
  isReportByMe: boolean;
  isWriteByMe: boolean;
  isBlock: boolean;
  createDate: number;
}

export interface SikdaeStoreReviewResponse {
  pageInfo: SikdaeStoreReviewPageInfo;
  scoreInfo: SikdaeStoreReviewScoreInfo;
  imageReviewInfo: SikdaeStoreReviewImageInfo;
  reviews: SikdaeStoreReview[];
}

export interface StoreCategory {
  id: number;
  name: string;
  order: number;
}

export interface StoreMainCategory {
  id: number;
  name: string;
  imageUrl: string | null;
}

export interface StoreLocation {
  lat: number;
  lng: number;
}

export interface StoreImages {
  main: string | null;
  thumbnail: string | null;
  thumbnails: string[];
}

export interface StoreRating {
  score: number;
  count: number;
  visible?: boolean;
}

export interface StoreFlags {
  new?: boolean;
  favorite: boolean;
  recommended?: boolean;
  booking: boolean;
  captainCode: boolean;
  captainPay?: boolean;
  cafeteria?: boolean;
  test?: boolean;
}

export interface StoreSummary {
  id: string;
  name: string;
  description: string | null;
  supply: string[];
  category: StoreCategory;
  mainCategories: StoreMainCategory[];
  location: StoreLocation;
  rating: StoreRating;
  images: StoreImages;
  flags: StoreFlags;
  registeredAt: string | null;
}

export interface StoreListPagination {
  total: number;
  offset: number;
  limit: number;
  hasNext: boolean;
}

export interface StoreListResult {
  items: StoreSummary[];
  pagination: StoreListPagination;
}

export interface StoreRecommendation extends StoreSummary {
  distanceMeters: number;
}

export interface StoreRecommendationResult {
  items: StoreRecommendation[];
}

export interface StoreCategoriesResult {
  categories: StoreCategory[];
  mainCategories: StoreMainCategory[];
}

export interface StorePayment {
  type: string;
  rate: number;
  multiple: boolean;
}

export interface StoreDetail {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  telephone: string | null;
  supply: string[];
  payment: StorePayment;
  location: StoreLocation;
  rating: StoreRating;
  images: StoreImages & {
    signatures: string[];
    menuBoards: string[];
    notices: string[];
    noticePopups: string[];
  };
  flags: StoreFlags;
}

export interface StoreMenuCategory {
  id: number;
  name: string;
  order: number;
}

export interface StoreMenuPrice {
  regular: number;
  sale: number;
  discountRate: number | null;
}

export interface StoreMenu {
  id: string;
  name: string;
  description: string | null;
  warning: string | null;
  category: StoreMenuCategory;
  price: StoreMenuPrice;
  images: StoreImages;
  status: string;
  rating: StoreRating;
  order: number;
}

export interface StoreMenuResult {
  menuCategories: StoreMenuCategory[];
  menus: StoreMenu[];
}

export interface StoreReviewDistribution {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
}

export interface StoreReviewSummary {
  score: number;
  count: number;
  commentCount: number;
  imageCount: number;
  distribution: StoreReviewDistribution;
}

export interface StoreReviewPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
}

export interface StoreReviewImage {
  id: number;
  mainUrl: string | null;
  thumbnailUrl: string;
}

export interface StoreReviewMenu {
  id: string;
  name: string;
  image: {
    main: string | null;
    thumbnail: string | null;
  };
}

export interface StoreReview {
  id: number;
  score: number;
  content: string;
  author: {
    nickname: string | null;
  };
  images: StoreReviewImage[];
  menus: StoreReviewMenu[];
  reactions: {
    likes: number;
    likedByMe: boolean;
    writtenByMe: boolean;
  };
  createdAt: string | null;
}

export interface StoreReviews {
  summary: StoreReviewSummary;
  pagination: StoreReviewPagination;
  images: StoreReviewImage[];
  items: StoreReview[];
}

export interface StoreDetailResult extends StoreMenuResult {
  store: StoreDetail;
  reviews: StoreReviewSummary;
}

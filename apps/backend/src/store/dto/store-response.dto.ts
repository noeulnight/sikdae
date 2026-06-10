import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class StoreSupplyDto {
  @ApiProperty({ example: "delivery" })
  code!: string;

  @ApiProperty({ example: "배달" })
  name!: string;
}

export class StoreCategoryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "한식" })
  name!: string;

  @ApiProperty({ example: 1 })
  order!: number;
}

export class StoreMainCategoryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "추천" })
  name!: string;

  @ApiProperty({ example: "https://example.com/main-category.png", nullable: true, type: String })
  imageUrl!: string | null;
}

export class StoreLocationDto {
  @ApiProperty({ example: 37.5665 })
  lat!: number;

  @ApiProperty({ example: 126.978 })
  lng!: number;
}

export class StoreImagesDto {
  @ApiProperty({ example: "https://example.com/main.png", nullable: true, type: String })
  main!: string | null;

  @ApiProperty({ example: "https://example.com/thumb.png", nullable: true, type: String })
  thumbnail!: string | null;

  @ApiProperty({ example: ["https://example.com/thumb-1.png"], type: [String] })
  thumbnails!: string[];
}

export class StoreRatingDto {
  @ApiProperty({ example: 4.5 })
  score!: number;

  @ApiProperty({ example: 12 })
  count!: number;

  @ApiPropertyOptional({ example: true })
  visible?: boolean;
}

export class StoreFlagsDto {
  @ApiPropertyOptional({ example: true })
  new?: boolean;

  @ApiProperty({ example: false })
  favorite!: boolean;

  @ApiPropertyOptional({ example: true })
  recommended?: boolean;

  @ApiProperty({ example: false })
  booking!: boolean;

  @ApiProperty({ example: false })
  captainCode!: boolean;

  @ApiPropertyOptional({ example: false })
  captainPay?: boolean;

  @ApiPropertyOptional({ example: false })
  cafeteria?: boolean;

  @ApiPropertyOptional({ example: false })
  test?: boolean;
}

export class StoreSummaryDto {
  @ApiProperty({ example: "1C7FCC08-C242-F424-010F-2CEC2821B00A" })
  id!: string;

  @ApiProperty({ example: "식대 식당" })
  name!: string;

  @ApiProperty({ example: "점심 식사", nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ example: ["DELIVERY"], type: [String] })
  supply!: string[];

  @ApiProperty({ type: StoreCategoryDto })
  category!: StoreCategoryDto;

  @ApiProperty({ type: [StoreMainCategoryDto] })
  mainCategories!: StoreMainCategoryDto[];

  @ApiProperty({ type: StoreLocationDto })
  location!: StoreLocationDto;

  @ApiProperty({ type: StoreRatingDto })
  rating!: StoreRatingDto;

  @ApiProperty({ type: StoreImagesDto })
  images!: StoreImagesDto;

  @ApiProperty({ type: StoreFlagsDto })
  flags!: StoreFlagsDto;

  @ApiProperty({ example: "2026-06-10T01:00:00.000Z", nullable: true, type: String })
  registeredAt!: string | null;
}

export class StoreListPaginationDto {
  @ApiProperty({ example: 120 })
  total!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: true })
  hasNext!: boolean;
}

export class StoreListResponseDto {
  @ApiProperty({ type: [StoreSummaryDto] })
  items!: StoreSummaryDto[];

  @ApiProperty({ type: StoreListPaginationDto })
  pagination!: StoreListPaginationDto;
}

export class StoreRecommendationDto extends StoreSummaryDto {
  @ApiProperty({ example: 480 })
  distanceMeters!: number;
}

export class StoreRecommendationResponseDto {
  @ApiProperty({ type: [StoreRecommendationDto] })
  items!: StoreRecommendationDto[];
}

export class StoreCategoriesResponseDto {
  @ApiProperty({ type: [StoreCategoryDto] })
  categories!: StoreCategoryDto[];

  @ApiProperty({ type: [StoreMainCategoryDto] })
  mainCategories!: StoreMainCategoryDto[];
}

export class StorePaymentDto {
  @ApiProperty({ example: "CARD" })
  type!: string;

  @ApiProperty({ example: 100 })
  rate!: number;

  @ApiProperty({ example: false })
  multiple!: boolean;
}

export class StoreDetailImagesDto extends StoreImagesDto {
  @ApiProperty({ example: ["https://example.com/signature.png"], type: [String] })
  signatures!: string[];

  @ApiProperty({ example: ["https://example.com/menu-board.png"], type: [String] })
  menuBoards!: string[];

  @ApiProperty({ example: ["https://example.com/notice.png"], type: [String] })
  notices!: string[];

  @ApiProperty({ example: ["https://example.com/notice-popup.png"], type: [String] })
  noticePopups!: string[];
}

export class StoreDetailDto {
  @ApiProperty({ example: "1C7FCC08-C242-F424-010F-2CEC2821B00A" })
  id!: string;

  @ApiProperty({ example: "식대 식당" })
  name!: string;

  @ApiProperty({ example: "점심 식사", nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ example: "서울시 중구 세종대로 110", nullable: true, type: String })
  address!: string | null;

  @ApiProperty({ example: "02-1234-5678", nullable: true, type: String })
  telephone!: string | null;

  @ApiProperty({ example: ["DELIVERY"], type: [String] })
  supply!: string[];

  @ApiProperty({ type: StorePaymentDto })
  payment!: StorePaymentDto;

  @ApiProperty({ type: StoreLocationDto })
  location!: StoreLocationDto;

  @ApiProperty({ type: StoreRatingDto })
  rating!: StoreRatingDto;

  @ApiProperty({ type: StoreDetailImagesDto })
  images!: StoreDetailImagesDto;

  @ApiProperty({ type: StoreFlagsDto })
  flags!: StoreFlagsDto;
}

export class StoreMenuCategoryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "메인 메뉴" })
  name!: string;

  @ApiProperty({ example: 1 })
  order!: number;
}

export class StoreMenuPriceDto {
  @ApiProperty({ example: 12000 })
  regular!: number;

  @ApiProperty({ example: 10000 })
  sale!: number;

  @ApiProperty({ example: 16, nullable: true, type: Number })
  discountRate!: number | null;
}

export class StoreMenuDto {
  @ApiProperty({ example: "MENU-001" })
  id!: string;

  @ApiProperty({ example: "제육볶음" })
  name!: string;

  @ApiProperty({ example: "매콤한 제육볶음", nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ example: "알레르기 유발 성분 포함", nullable: true, type: String })
  warning!: string | null;

  @ApiProperty({ type: StoreMenuCategoryDto })
  category!: StoreMenuCategoryDto;

  @ApiProperty({ type: StoreMenuPriceDto })
  price!: StoreMenuPriceDto;

  @ApiProperty({ type: StoreImagesDto })
  images!: StoreImagesDto;

  @ApiProperty({ example: "SALE" })
  status!: string;

  @ApiProperty({ type: StoreRatingDto })
  rating!: StoreRatingDto;

  @ApiProperty({ example: 1 })
  order!: number;
}

export class StoreReviewDistributionDto {
  @ApiProperty({ example: 1 })
  one!: number;

  @ApiProperty({ example: 2 })
  two!: number;

  @ApiProperty({ example: 3 })
  three!: number;

  @ApiProperty({ example: 4 })
  four!: number;

  @ApiProperty({ example: 24 })
  five!: number;
}

export class StoreReviewSummaryDto {
  @ApiProperty({ example: 4.41 })
  score!: number;

  @ApiProperty({ example: 34 })
  count!: number;

  @ApiProperty({ example: 0 })
  commentCount!: number;

  @ApiProperty({ example: 14 })
  imageCount!: number;

  @ApiProperty({ type: StoreReviewDistributionDto })
  distribution!: StoreReviewDistributionDto;
}

export class StoreReviewPaginationDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;

  @ApiProperty({ example: 34 })
  totalItems!: number;

  @ApiProperty({ example: true })
  hasNext!: boolean;
}

export class StoreReviewImageDto {
  @ApiProperty({ example: 8461 })
  id!: number;

  @ApiProperty({ example: "https://example.com/review.png", nullable: true, type: String })
  mainUrl!: string | null;

  @ApiProperty({ example: "https://example.com/review-thumb.png" })
  thumbnailUrl!: string;
}

export class StoreReviewMenuImageDto {
  @ApiProperty({ example: "https://example.com/menu.png", nullable: true, type: String })
  main!: string | null;

  @ApiProperty({ example: "https://example.com/menu-thumb.png", nullable: true, type: String })
  thumbnail!: string | null;
}

export class StoreReviewMenuDto {
  @ApiProperty({ example: "MENU-001" })
  id!: string;

  @ApiProperty({ example: "제육볶음" })
  name!: string;

  @ApiProperty({ type: StoreReviewMenuImageDto })
  image!: StoreReviewMenuImageDto;
}

export class StoreReviewAuthorDto {
  @ApiProperty({ example: "링크브러리팀", nullable: true, type: String })
  nickname!: string | null;
}

export class StoreReviewReactionsDto {
  @ApiProperty({ example: 0 })
  likes!: number;

  @ApiProperty({ example: false })
  likedByMe!: boolean;

  @ApiProperty({ example: false })
  writtenByMe!: boolean;
}

export class StoreReviewDto {
  @ApiProperty({ example: 20619 })
  id!: number;

  @ApiProperty({ example: 5 })
  score!: number;

  @ApiProperty({ example: "맛있게 잘 먹었습니다." })
  content!: string;

  @ApiProperty({ type: StoreReviewAuthorDto })
  author!: StoreReviewAuthorDto;

  @ApiProperty({ type: [StoreReviewImageDto] })
  images!: StoreReviewImageDto[];

  @ApiProperty({ type: [StoreReviewMenuDto] })
  menus!: StoreReviewMenuDto[];

  @ApiProperty({ type: StoreReviewReactionsDto })
  reactions!: StoreReviewReactionsDto;

  @ApiProperty({ example: "2026-02-11T03:26:19.000Z", nullable: true, type: String })
  createdAt!: string | null;
}

export class StoreReviewsDto {
  @ApiProperty({ type: StoreReviewSummaryDto })
  summary!: StoreReviewSummaryDto;

  @ApiProperty({ type: StoreReviewPaginationDto })
  pagination!: StoreReviewPaginationDto;

  @ApiProperty({ type: [StoreReviewImageDto] })
  images!: StoreReviewImageDto[];

  @ApiProperty({ type: [StoreReviewDto] })
  items!: StoreReviewDto[];
}

export class StoreDetailResponseDto {
  @ApiProperty({ type: StoreDetailDto })
  store!: StoreDetailDto;

  @ApiProperty({ type: [StoreMenuCategoryDto] })
  menuCategories!: StoreMenuCategoryDto[];

  @ApiProperty({ type: [StoreMenuDto] })
  menus!: StoreMenuDto[];

  @ApiProperty({ type: StoreReviewSummaryDto })
  reviews!: StoreReviewSummaryDto;
}

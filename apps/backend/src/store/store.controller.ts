import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import {
  STORE_LIST_SORT_VALUES,
  StoreListQueryDto,
  StoreRecommendationQueryDto,
} from "./dto/store-list-query.dto";
import {
  StoreCategoriesResponseDto,
  StoreDetailResponseDto,
  StoreListResponseDto,
  StoreRecommendationResponseDto,
  StoreReviewsDto,
  StoreSupplyDto,
} from "./dto/store-response.dto";
import { StoreService } from "./store.service";

@ApiTags("stores")
@Controller("stores")
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiOperation({ summary: "List stores" })
  @ApiQuery({ name: "q", required: false, type: String })
  @ApiQuery({ name: "categoryId", required: false, type: Number })
  @ApiQuery({ name: "mainCategoryId", required: false, type: Number })
  @ApiQuery({ name: "supply", required: false, type: String })
  @ApiQuery({ name: "recommended", required: false, type: Boolean })
  @ApiQuery({ name: "isNew", required: false, type: Boolean })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiQuery({ enum: STORE_LIST_SORT_VALUES, name: "sort", required: false })
  @ApiQuery({ name: "lat", required: false, type: Number })
  @ApiQuery({ name: "lng", required: false, type: Number })
  @ApiOkResponse({ description: "Filtered store list", type: StoreListResponseDto })
  @Get()
  getStores(@Query() query: StoreListQueryDto): Promise<StoreListResponseDto> {
    return this.storeService.retrieveStoreList(query);
  }

  @ApiOperation({ summary: "List store categories" })
  @ApiOkResponse({
    description: "Categories and main categories",
    type: StoreCategoriesResponseDto,
  })
  @Get("categories")
  getCategories(): Promise<StoreCategoriesResponseDto> {
    return this.storeService.retrieveCategories();
  }

  @ApiOperation({ summary: "List store supply types" })
  @ApiOkResponse({ description: "Supply type list", isArray: true, type: StoreSupplyDto })
  @Get("supply")
  getSupply(): Promise<StoreSupplyDto[]> {
    return this.storeService.retrieveSupply();
  }

  @ApiOperation({ summary: "Recommend stores by current location" })
  @ApiQuery({
    name: "categoryIds",
    required: false,
    type: String,
    description: "Comma separated category ids. Omit for all categories.",
  })
  @ApiQuery({ name: "categoryId", required: false, type: Number })
  @ApiQuery({ name: "rangeMeters", required: true, type: Number })
  @ApiQuery({ name: "lat", required: true, type: Number })
  @ApiQuery({ name: "lng", required: true, type: Number })
  @ApiOkResponse({
    description: "Random location based store recommendations",
    type: StoreRecommendationResponseDto,
  })
  @Get("recommendations")
  getRecommendations(
    @Query() query: StoreRecommendationQueryDto,
  ): Promise<StoreRecommendationResponseDto> {
    return this.storeService.retrieveRecommendations(query);
  }

  @ApiOperation({ summary: "List store reviews" })
  @ApiParam({ name: "storeId", type: String })
  @ApiOkResponse({ description: "Store reviews", type: StoreReviewsDto })
  @Get(":storeId/reviews")
  getStoreReviews(@Param("storeId") storeId: string): Promise<StoreReviewsDto> {
    return this.storeService.retrieveStoreReviews(storeId);
  }

  @ApiOperation({ summary: "Get store detail view" })
  @ApiParam({ name: "storeId", type: String })
  @ApiOkResponse({ description: "Store detail with menus", type: StoreDetailResponseDto })
  @Get(":storeId")
  getStore(@Param("storeId") storeId: string): Promise<StoreDetailResponseDto> {
    return this.storeService.retrieveStore(storeId);
  }
}

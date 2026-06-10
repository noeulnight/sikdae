import type {
  SikdaeStore,
  SikdaeStoreCategory,
  SikdaeStoreDetail,
  SikdaeStoreImage,
  SikdaeStoreMainCategory,
  SikdaeStoreMenuContent,
  SikdaeStoreMenuGroup,
  SikdaeStoreMenuResponse,
  SikdaeStoreReview,
  SikdaeStoreReviewImage,
  SikdaeStoreReviewImageSummary,
  SikdaeStoreReviewMenu,
  SikdaeStoreReviewResponse,
  StoreCategory,
  StoreDetail,
  StoreImages,
  StoreMainCategory,
  StoreMenu,
  StoreMenuCategory,
  StoreMenuResult,
  StoreRecommendation,
  StoreReview,
  StoreReviewImage,
  StoreReviewMenu,
  StoreReviews,
  StoreSummary,
} from "../interfaces/store.interface";

export function mapStoreSummary(store: SikdaeStore): StoreSummary {
  return {
    category: mapCategory(store.category),
    description: normalizeNullableText(store.intro),
    flags: {
      booking: Boolean(store.isBooking),
      captainCode: store.isCaptainCode,
      favorite: store.isFavorites,
      new: store.isNew,
      recommended: store.isRecommended,
    },
    id: store.id,
    images: mapStoreImages(store.image),
    location: {
      lat: store.location.gpslat,
      lng: store.location.gpslon,
    },
    mainCategories: store.mainCategories.map((category) => mapMainCategory(category)),
    name: store.name,
    rating: {
      count: store.reviewCount,
      score: store.score,
      visible: Boolean(store.isReviewVisible),
    },
    registeredAt: mapTimestamp(store.regDate),
    supply: store.supplyTypes.map((supplyType) => supplyType.code),
  };
}

export function mapStoreRecommendation(
  store: SikdaeStore,
  distanceMeters: number,
): StoreRecommendation {
  return {
    ...mapStoreSummary(store),
    distanceMeters,
  };
}

export function mapStoreDetail(store: SikdaeStoreDetail): StoreDetail {
  return {
    address: normalizeNullableText(store.addr),
    description: normalizeNullableText(store.intro),
    flags: {
      booking: Boolean(store.isBooking),
      cafeteria: store.isCafeteria,
      captainCode: store.isCaptainCode,
      captainPay: store.isCaptainPay,
      favorite: store.isFavorites,
      test: Boolean(store.isTest),
    },
    id: store.id,
    images: {
      main: store.image,
      menuBoards: store.menuBoardImageList,
      notices: store.noticeImageList,
      noticePopups: store.noticePopupImageList,
      signatures: store.signatureImageList,
      thumbnail: null,
      thumbnails: [],
    },
    location: {
      lat: store.location.gpslat,
      lng: store.location.gpslon,
    },
    name: store.name,
    payment: {
      multiple: store.isMultiplePayment,
      rate: store.paymentRate,
      type: store.paymentType,
    },
    rating: {
      count: store.reviewCount,
      score: store.score,
    },
    supply: store.supplyTypes.map((supplyType) => supplyType.code),
    telephone: normalizeNullableText(store.tel),
  };
}

export function mapStoreMenuResult(menu: SikdaeStoreMenuResponse): StoreMenuResult {
  const menuCategories = menu.menus.map((group) => mapMenuCategory(group.category));
  const menus = menu.menus.flatMap((group) => mapMenus(group));

  return {
    menuCategories,
    menus,
  };
}

export function mapReviews(reviews: SikdaeStoreReviewResponse): StoreReviews {
  return {
    images: reviews.imageReviewInfo.images.map((image) => mapReviewImageSummary(image)),
    items: reviews.reviews.map((review) => mapReview(review)),
    pagination: {
      hasNext: reviews.pageInfo.page < reviews.pageInfo.totalPage,
      page: reviews.pageInfo.page,
      pageSize: reviews.pageInfo.pageRow,
      totalItems: reviews.pageInfo.totalRow,
      totalPages: reviews.pageInfo.totalPage,
    },
    summary: {
      commentCount: reviews.pageInfo.totalCommentRow,
      count: reviews.pageInfo.totalRow,
      distribution: reviews.scoreInfo.countInfo,
      imageCount: reviews.imageReviewInfo.totalRow,
      score: reviews.scoreInfo.score,
    },
  };
}

export function mapCategory(category: SikdaeStoreCategory): StoreCategory {
  return {
    id: category.id,
    name: category.name,
    order: category.order,
  };
}

export function mapMainCategory(category: SikdaeStoreMainCategory): StoreMainCategory {
  return {
    id: category.id,
    imageUrl: category.logoImage || null,
    name: category.name,
  };
}

function mapMenus(group: SikdaeStoreMenuGroup): StoreMenu[] {
  const category = mapMenuCategory(group.category);

  return group.contents.map((menu) => mapMenu(menu, category));
}

function mapMenu(menu: SikdaeStoreMenuContent, category: StoreMenuCategory): StoreMenu {
  return {
    category,
    description: normalizeNullableText(menu.intro),
    id: menu.id,
    images: mapMenuImages(menu.images),
    name: menu.name,
    order: menu.order,
    price: {
      discountRate: menu.discountRate,
      regular: menu.price,
      sale: menu.salesPrice,
    },
    rating: {
      count: menu.reviewCount,
      score: menu.score,
    },
    status: menu.status,
    warning: menu.warning,
  };
}

function mapReview(review: SikdaeStoreReview): StoreReview {
  return {
    author: {
      nickname: normalizeNullableText(review.nickname),
    },
    content: review.content,
    createdAt: mapTimestamp(review.createDate),
    id: review.reviewIdx,
    images: (review.images ?? []).map((image) => mapReviewImage(image)),
    menus: review.storeMenuInfo.menus.map((menu) => mapReviewMenu(menu)),
    reactions: {
      likedByMe: review.isLikeByMe,
      likes: review.likeCount,
      writtenByMe: review.isWriteByMe,
    },
    score: review.score,
  };
}

function mapReviewImageSummary(image: SikdaeStoreReviewImageSummary): StoreReviewImage {
  return {
    id: image.imageReviewIdx,
    mainUrl: null,
    thumbnailUrl: image.thumbImageUrl,
  };
}

function mapReviewImage(image: SikdaeStoreReviewImage): StoreReviewImage {
  return {
    id: image.imageReviewIdx,
    mainUrl: image.main,
    thumbnailUrl: image.thumb,
  };
}

function mapReviewMenu(menu: SikdaeStoreReviewMenu): StoreReviewMenu {
  return {
    id: menu.menuId,
    image: {
      main: menu.image.main,
      thumbnail: menu.image.thumb,
    },
    name: menu.name,
  };
}

function mapMenuCategory(category: SikdaeStoreCategory): StoreMenuCategory {
  return {
    id: category.id,
    name: category.name,
    order: category.order,
  };
}

function mapStoreImages(image: SikdaeStoreImage): StoreImages {
  return {
    main: image.main,
    thumbnail: image.thumb,
    thumbnails: image.thumbnails ?? [],
  };
}

function mapMenuImages(image: SikdaeStoreImage): StoreImages {
  return {
    main: image.main,
    thumbnail: image.thumb,
    thumbnails: image.thumbnails ?? [],
  };
}

function mapTimestamp(timestamp: number): string | null {
  if (!timestamp) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function normalizeNullableText(value: string | null): string | null {
  if (!value || value === "-") {
    return null;
  }

  return value;
}

import { useMemo, useState } from "react";
import { ChevronLeft, MapPin, MessageSquareText, Phone, Star, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStoreDetailQuery, useStoreReviewsQuery } from "../queries/store-queries";
import type { StoreMenu, StoreMenuCategory, StoreReview, StoreReviewImage } from "../types/store";
import {
  formatDate,
  formatNumber,
  formatPrice,
  formatRating,
  getMenuImage,
  getStoreImage,
  getSupplyName,
} from "../utils/format";
import type { StoreReviewSummary, StoreSupply } from "../types/store";
import { StoreImage } from "./store-image";
import { StoreLocationMap } from "./store-location-map";

type StoreDetailPanelProps = {
  storeId: null | string;
  supplies?: StoreSupply[];
  onBackToList?: () => void;
};

export function StoreDetailPanel({ storeId, supplies, onBackToList }: StoreDetailPanelProps) {
  const detailQuery = useStoreDetailQuery(storeId);
  const reviewsQuery = useStoreReviewsQuery(storeId);
  const detail = detailQuery.data;

  if (!storeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>매장을 선택하세요</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            왼쪽 목록에서 매장을 선택하면 메뉴와 리뷰를 볼 수 있습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (detailQuery.isLoading) {
    return <StoreDetailSkeleton />;
  }

  if (!detail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>상세 정보를 불러오지 못했습니다</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">잠시 후 다시 선택하세요.</p>
        </CardContent>
      </Card>
    );
  }

  const detailImage = getStoreImage(detail.store);

  return (
    <Card className="lg:h-full lg:min-h-0">
      {detailImage ? (
        <div className="h-52 overflow-hidden bg-muted">
          <StoreImage src={detailImage} alt={detail.store.name} />
        </div>
      ) : null}

      <CardHeader>
        {onBackToList ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-1 w-fit lg:hidden"
            onClick={onBackToList}
          >
            <ChevronLeft data-icon="inline-start" />
            목록
          </Button>
        ) : null}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {detail.store.supply.map((supply) => (
                <Badge key={supply} variant="outline">
                  {getSupplyName(supply, supplies)}
                </Badge>
              ))}
              {detail.store.flags.captainPay ? (
                <Badge variant="secondary">Captain Pay</Badge>
              ) : null}
              {detail.store.flags.booking ? <Badge variant="secondary">예약</Badge> : null}
            </div>
            <CardTitle>{detail.store.name}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="size-4 fill-current" aria-hidden="true" />
            {formatRating(detail.store.rating.score, detail.store.rating.count)}
          </div>
          {detail.store.address ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {detail.store.address}
            </div>
          ) : null}
          {detail.store.telephone ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" aria-hidden="true" />
              {detail.store.telephone}
            </div>
          ) : null}
        </div>
        <StoreLocationMap location={detail.store.location} storeName={detail.store.name} />
      </CardContent>

      <Separator />

      <CardContent className="min-h-0 flex-1">
        <Tabs defaultValue="menus" className="h-full min-h-0">
          <TabsList className="shrink-0">
            <TabsTrigger value="menus">
              <Utensils data-icon="inline-start" />
              메뉴 {detail.menus.length}
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageSquareText data-icon="inline-start" />
              리뷰 {reviewsQuery.data?.pagination.totalItems ?? detail.reviews.count}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menus" className="flex min-h-0 flex-col">
            <MenuList
              key={detail.store.id}
              menuCategories={detail.menuCategories}
              menus={detail.menus}
            />
          </TabsContent>

          <TabsContent value="reviews" className="flex min-h-0 flex-col">
            <ScrollArea className="pr-0 lg:h-auto lg:min-h-0 lg:flex-1 lg:pr-3">
              <ReviewSummary summary={reviewsQuery.data?.summary ?? detail.reviews} />
              <ReviewList isLoading={reviewsQuery.isLoading} reviews={reviewsQuery.data?.items} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ReviewSummary({ summary }: { summary: StoreReviewSummary }) {
  const distribution = [
    { label: "5점", value: summary.distribution.five },
    { label: "4점", value: summary.distribution.four },
    { label: "3점", value: summary.distribution.three },
    { label: "2점", value: summary.distribution.two },
    { label: "1점", value: summary.distribution.one },
  ];

  return (
    <section className="mb-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">리뷰 요약</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{summary.score.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              {formatNumber(summary.count)}개 리뷰
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">댓글 {formatNumber(summary.commentCount)}</Badge>
          <Badge variant="outline">사진 {formatNumber(summary.imageCount)}</Badge>
        </div>
      </div>

      <div className="mt-3 grid gap-1.5">
        {distribution.map((item) => {
          const width = summary.count ? `${(item.value / summary.count) * 100}%` : "0%";

          return (
            <div key={item.label} className="grid grid-cols-[32px_1fr_32px] items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-primary" style={{ width }} />
              </div>
              <span className="text-right text-xs text-muted-foreground">
                {formatNumber(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MenuList({
  menuCategories,
  menus,
}: {
  menuCategories: StoreMenuCategory[];
  menus: StoreMenu[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<"all" | number>("all");
  const sortedCategories = useMemo(
    () => [...menuCategories].sort((first, second) => first.order - second.order),
    [menuCategories],
  );
  const categoryCounts = useMemo(() => {
    const counts = new Map<number, number>();

    for (const menu of menus) {
      counts.set(menu.category.id, (counts.get(menu.category.id) ?? 0) + 1);
    }

    return counts;
  }, [menus]);
  const visibleMenus =
    selectedCategoryId === "all"
      ? menus
      : menus.filter((menu) => menu.category.id === selectedCategoryId);
  const groupedMenus = useMemo(
    () =>
      sortedCategories
        .map((category) => ({
          category,
          menus: visibleMenus.filter((menu) => menu.category.id === category.id),
        }))
        .filter((group) => group.menus.length > 0),
    [sortedCategories, visibleMenus],
  );

  if (!menus.length) {
    return <p className="py-8 text-sm text-muted-foreground">등록된 메뉴가 없습니다.</p>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {sortedCategories.length ? (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
          <Button
            type="button"
            variant={selectedCategoryId === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoryId("all")}
          >
            전체 {formatNumber(menus.length)}
          </Button>
          {sortedCategories.map((category) => (
            <Button
              key={category.id}
              type="button"
              variant={selectedCategoryId === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(category.id)}
            >
              {category.name} {formatNumber(categoryCounts.get(category.id) ?? 0)}
            </Button>
          ))}
        </div>
      ) : null}

      <ScrollArea className="pr-0 lg:h-auto lg:min-h-0 lg:flex-1 lg:pr-3">
        <div className="space-y-3">
          {groupedMenus.map((group) => (
            <section key={group.category.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <h3 className="font-medium">{group.category.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(group.menus.length)}개
                </span>
              </div>
              <div className="grid gap-2">
                {group.menus.map((menu) => (
                  <MenuItem key={menu.id} menu={menu} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function MenuItem({ menu }: { menu: StoreMenu }) {
  return (
    <div className="flex gap-3 rounded-lg border p-2">
      <div className="size-16 shrink-0 overflow-hidden rounded-md">
        <StoreImage
          src={getMenuImage(menu)}
          alt={menu.name}
          fallback={<Utensils className="size-5" aria-hidden="true" />}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{menu.name}</p>
            <p className="text-xs text-muted-foreground">{menu.category.name}</p>
          </div>
          <p className="shrink-0 text-sm font-medium">{formatPrice(menu.price.sale)}</p>
        </div>
        {menu.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{menu.description}</p>
        ) : null}
        {menu.warning ? <p className="mt-1 text-xs text-destructive">{menu.warning}</p> : null}
      </div>
    </div>
  );
}

function ReviewList({ isLoading, reviews }: { isLoading: boolean; reviews?: StoreReview[] }) {
  if (isLoading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!reviews?.length) {
    return <p className="py-8 text-sm text-muted-foreground">등록된 리뷰가 없습니다.</p>;
  }

  return (
    <div className="grid gap-2">
      {reviews.map((review) => (
        <article key={review.id} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{review.author.nickname ?? "익명"}</p>
              <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
            </div>
            <Badge variant="outline">★ {review.score.toFixed(1)}</Badge>
          </div>
          <p className="text-sm leading-6">{review.content}</p>
          {review.images.length ? (
            <div className="flex gap-2 overflow-x-auto">
              {review.images.map((image) => (
                <ReviewImage key={image.id} image={image} />
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function ReviewImage({ image }: { image: StoreReviewImage }) {
  const [visible, setVisible] = useState(true);
  const src = image.thumbnailUrl ?? image.mainUrl;

  if (!src || !visible) {
    return null;
  }

  return (
    <img
      src={src}
      alt=""
      className="size-16 shrink-0 rounded-md object-cover"
      loading="lazy"
      onError={() => setVisible(false)}
    />
  );
}

function StoreDetailSkeleton() {
  return (
    <Card>
      <Skeleton className="h-52 w-full" />
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  );
}

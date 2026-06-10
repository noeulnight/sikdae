import { ArrowLeft, CircleAlert, Clock3, RefreshCw, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletQuery } from "../queries/wallet-queries";
import type { WalletTimeWindow } from "../types/wallet";

const currencyFormatter = new Intl.NumberFormat("ko-KR");
const KOREA_OFFSET_MINUTES = 9 * 60;

export function WalletCard() {
  const walletQuery = useWalletQuery();

  if (walletQuery.isLoading) {
    return <WalletCardSkeleton />;
  }

  if (walletQuery.isError || !walletQuery.data) {
    return (
      <Card className="w-full max-w-[560px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleAlert data-icon="inline-start" className="text-destructive" />
            식대 정보를 확인할 수 없습니다
          </CardTitle>
          <CardDescription>잠시 후 다시 시도해주세요.</CardDescription>
          <CardAction>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="식대 정보 다시 불러오기"
              onClick={() => void walletQuery.refetch()}
            >
              <RefreshCw />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <BackToStoresButton />
        </CardContent>
      </Card>
    );
  }

  const wallet = walletQuery.data;

  return (
    <Card className="w-full max-w-[560px]">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WalletCards aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <CardTitle>식대포인트</CardTitle>
            <CardDescription>사용 가능한 포인트 현황</CardDescription>
          </div>
        </div>
        <CardAction>
          <BackToStoresButton />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5">
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">사용 가능 식대포인트</p>
          <p className="text-4xl font-semibold tracking-normal">{formatCurrency(wallet.amount)}</p>
        </section>

        <section className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <Clock3 aria-hidden="true" className="size-5 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">사용 가능 시간</p>
            <p className="truncate text-sm font-medium">{formatTimeWindows(wallet.timeWindows)}</p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function BackToStoresButton() {
  return (
    <Button asChild variant="outline" size="sm">
      <a href="/">
        <ArrowLeft data-icon="inline-start" />
        식당 목록
      </a>
    </Button>
  );
}

function WalletCardSkeleton() {
  return (
    <Card className="w-full max-w-[560px]">
      <CardHeader className="border-b">
        <Skeleton className="h-9 w-40" />
        <CardAction>
          <Skeleton className="h-7 w-20" />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-56" />
        </div>
        <Skeleton className="h-[74px] w-full" />
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return `${currencyFormatter.format(value)}원`;
}

function formatTimeWindows(timeWindows: WalletTimeWindow[]) {
  if (!timeWindows.length) {
    return "시간 제한 없음";
  }

  return timeWindows.map((timeWindow) => formatTimeWindow(timeWindow)).join(", ");
}

function formatTimeWindow(timeWindow: WalletTimeWindow) {
  return `${formatOffsetTime(timeWindow.startOffsetMs)}-${formatOffsetTime(timeWindow.endOffsetMs)}`;
}

function formatOffsetTime(offsetMs: number) {
  const totalMinutes = Math.floor(offsetMs / 60_000) + KOREA_OFFSET_MINUTES;
  const normalizedMinutes = ((totalMinutes % 1_440) + 1_440) % 1_440;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

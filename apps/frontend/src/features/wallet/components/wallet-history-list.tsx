import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletHistoryQuery } from "../queries/wallet-queries";
import type { WalletHistoryItem } from "../types/wallet";

const currencyFormatter = new Intl.NumberFormat("ko-KR");
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function WalletHistoryList() {
  const historyQuery = useWalletHistoryQuery();

  if (historyQuery.isLoading) {
    return <WalletHistorySkeleton />;
  }

  if (historyQuery.isError || !historyQuery.data) {
    return (
      <Card className="w-full max-w-[560px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleAlert data-icon="inline-start" className="text-destructive" />
            결제 내역을 확인할 수 없습니다
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const items = historyQuery.data.pages.flatMap((page) => page.items);

  return (
    <Card className="w-full max-w-[560px]">
      <CardHeader className="border-b">
        <CardTitle>결제 내역</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length ? (
          <div className="divide-y">
            {items.map((item) => (
              <HistoryRow key={`${item.id}-${item.usedAt}`} item={item} />
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">결제 내역이 없습니다.</p>
        )}
        {historyQuery.hasNextPage ? (
          <div className="border-t p-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={historyQuery.isFetchingNextPage}
              onClick={() => void historyQuery.fetchNextPage()}
            >
              {historyQuery.isFetchingNextPage ? "불러오는 중" : "다음 이력 보기"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function HistoryRow({ item }: { item: WalletHistoryItem }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">{formatUsedAt(item.usedAt)}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold">{formatAmount(item.amount)}</p>
    </div>
  );
}

function WalletHistorySkeleton() {
  return (
    <Card className="w-full max-w-[560px]">
      <CardHeader className="border-b">
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

function formatAmount(amount: number) {
  const sign = amount < 0 ? "-" : "+";

  return `${sign}${currencyFormatter.format(Math.abs(amount))}원`;
}

function formatUsedAt(usedAt: string) {
  return dateFormatter.format(new Date(usedAt));
}

import { CircleCheck, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStatusQuery } from "../queries/store-queries";

export function StatusStrip() {
  const statusQuery = useAppStatusQuery();

  if (statusQuery.isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    );
  }

  const status = statusQuery.data;
  const ok = Boolean(status?.ok && status.auth.ok && status.cache.ok);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge variant={ok ? "default" : "destructive"}>
        {ok ? <CircleCheck data-icon="inline-start" /> : <CircleHelp data-icon="inline-start" />}
        API {ok ? "정상" : "확인 필요"}
      </Badge>
      {status ? (
        <>
          <Badge variant="secondary">Redis {status.cache.redis.responseMs}ms</Badge>
          <Badge variant="outline">인증 {status.auth.me.responseMs}ms</Badge>
        </>
      ) : null}
    </div>
  );
}

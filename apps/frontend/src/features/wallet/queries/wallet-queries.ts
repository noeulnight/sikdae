import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getWallet, getWalletHistory } from "../api/wallet-api";

export const walletQueryKeys = {
  all: ["wallet"] as const,
  detail: () => [...walletQueryKeys.all, "detail"] as const,
  history: () => [...walletQueryKeys.all, "history"] as const,
};

export function useWalletQuery() {
  return useQuery({
    queryKey: walletQueryKeys.detail(),
    queryFn: getWallet,
    refetchInterval: 60_000,
  });
}

export function useWalletHistoryQuery() {
  return useInfiniteQuery({
    queryKey: walletQueryKeys.history(),
    queryFn: ({ pageParam }) => getWalletHistory({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.pagination.nextPage ?? undefined,
    refetchInterval: 60_000,
  });
}

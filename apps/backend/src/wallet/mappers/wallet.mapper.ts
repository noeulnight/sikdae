import type {
  SikdaeWalletHistoryResponse,
  SikdaeWalletPolicyItem,
  SikdaeWalletPolicyResponse,
  WalletHistoryResult,
  WalletResult,
  WalletTimeWindow,
} from "../interfaces/wallet.interface";

export function mapWallet(response: SikdaeWalletPolicyResponse): WalletResult {
  const policies = flattenPolicyItems(response);
  const policy = policies.find((item) => item.isAvailable) ?? policies[0] ?? null;

  return {
    amount: mapWalletAmount(response.budget, policy),
    timeWindows: policy ? mapTimeWindows(policy) : [],
  };
}

export function mapWalletHistory(
  response: SikdaeWalletHistoryResponse,
  pagination: { limit: number; page: number },
): WalletHistoryResult {
  const hasNext = response.history.length > pagination.limit;

  return {
    items: response.history
      .filter((item) => item.type === "USED")
      .slice(0, pagination.limit)
      .map((item) => ({
        amount: item.amount,
        id: item.id,
        title: item.title,
        usedAt: new Date(item.useDate).toISOString(),
      })),
    pagination: {
      hasNext,
      limit: pagination.limit,
      nextPage: hasNext ? pagination.page + 1 : null,
      page: pagination.page,
    },
  };
}

export function findWalletPolicyId(response: SikdaeWalletPolicyResponse): number | null {
  const policies = flattenPolicyItems(response);
  const policy = policies.find((item) => item.isAvailable) ?? policies[0] ?? null;

  return policy?.id ?? null;
}

function flattenPolicyItems(response: SikdaeWalletPolicyResponse): SikdaeWalletPolicyItem[] {
  const { policy } = response;

  return [
    ...(policy.dayPolicy ? [policy.dayPolicy] : []),
    ...(policy.longterm ?? []),
    ...(policy.infinite ?? []),
    ...(policy.demand ?? []),
    ...(policy.day ?? []),
  ];
}

function mapWalletAmount(budget: number, policy: SikdaeWalletPolicyItem | null): number {
  if (budget >= 0) {
    return budget;
  }

  return policy?.amount ?? 0;
}

function mapTimeWindows(policy: SikdaeWalletPolicyItem): WalletTimeWindow[] {
  return [
    mapTimeWindow(policy.startTime, policy.endTime),
    mapTimeWindow(policy.startTime2, policy.endTime2),
    mapTimeWindow(policy.startTime3, policy.endTime3),
  ].filter((timeWindow): timeWindow is WalletTimeWindow => Boolean(timeWindow));
}

function mapTimeWindow(
  startOffsetMs: number | null,
  endOffsetMs: number | null,
): WalletTimeWindow | null {
  if (startOffsetMs === null || endOffsetMs === null) {
    return null;
  }

  return {
    endOffsetMs,
    startOffsetMs,
  };
}

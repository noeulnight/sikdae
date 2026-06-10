export interface SikdaeWalletPolicyItem {
  id: number;
  amount: number;
  startTime: number | null;
  endTime: number | null;
  startTime2: number | null;
  endTime2: number | null;
  startTime3: number | null;
  endTime3: number | null;
  isAvailable: boolean;
}

export interface SikdaeWalletPolicy {
  dayPolicy: SikdaeWalletPolicyItem | null;
  longterm: SikdaeWalletPolicyItem[] | null;
  infinite: SikdaeWalletPolicyItem[] | null;
  demand: SikdaeWalletPolicyItem[] | null;
  day: SikdaeWalletPolicyItem[] | null;
}

export interface SikdaeWalletPolicyResponse {
  policy: SikdaeWalletPolicy;
  budget: number;
}

export interface WalletTimeWindow {
  startOffsetMs: number;
  endOffsetMs: number;
}

export interface WalletResult {
  amount: number;
  timeWindows: WalletTimeWindow[];
}

export interface SikdaeWalletHistoryItem {
  id: string;
  title: string;
  type: string;
  amount: number;
  useDate: number;
}

export interface SikdaeWalletHistoryResponse {
  history: SikdaeWalletHistoryItem[];
}

export interface WalletHistoryItem {
  id: string;
  title: string;
  amount: number;
  usedAt: string;
}

export interface WalletHistoryPagination {
  page: number;
  limit: number;
  hasNext: boolean;
  nextPage: number | null;
}

export interface WalletHistoryResult {
  items: WalletHistoryItem[];
  pagination: WalletHistoryPagination;
}

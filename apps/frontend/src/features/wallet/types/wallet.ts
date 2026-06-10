export type WalletTimeWindow = {
  startOffsetMs: number;
  endOffsetMs: number;
};

export type WalletResponse = {
  amount: number;
  timeWindows: WalletTimeWindow[];
};

export type WalletHistoryItem = {
  id: string;
  title: string;
  amount: number;
  usedAt: string;
};

export type WalletHistoryResponse = {
  items: WalletHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    hasNext: boolean;
    nextPage: null | number;
  };
};

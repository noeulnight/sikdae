import { apiClient } from "@/lib/api/client";
import type { WalletHistoryResponse, WalletResponse } from "../types/wallet";

export async function getWallet() {
  const response = await apiClient.get<WalletResponse>("/wallet");

  return response.data;
}

export async function getWalletHistory({ page }: { page: number }) {
  const response = await apiClient.get<WalletHistoryResponse>("/wallet/history", {
    params: {
      page,
    },
  });

  return response.data;
}

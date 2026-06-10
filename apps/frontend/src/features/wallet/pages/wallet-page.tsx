import { WalletCard } from "../components/wallet-card";
import { WalletHistoryList } from "../components/wallet-history-list";

export function WalletPage() {
  return (
    <main className="min-h-svh bg-background px-4 py-6 text-foreground">
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-4">
        <WalletCard />
        <WalletHistoryList />
      </div>
    </main>
  );
}

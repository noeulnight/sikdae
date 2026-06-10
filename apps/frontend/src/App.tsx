import { StoresPage } from "@/features/stores/pages/stores-page";
import { WalletPage } from "@/features/wallet/pages/wallet-page";

function App() {
  if (window.location.pathname === "/wallet") {
    return <WalletPage />;
  }

  return <StoresPage />;
}

export default App;

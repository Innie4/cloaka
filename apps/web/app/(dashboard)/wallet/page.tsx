import { PageFrame } from "@/components/layout/page-frame";
import { WalletConsole } from "@/components/wallet/wallet-console";

export default function WalletPage() {
  return (
    <PageFrame
      eyebrow="Wallet"
      title="The balance view should reassure first, then inform."
      description="The live wallet now shows available funds, held balances, partner-bank account context, and the ledger entries that explain every movement."
    >
      <WalletConsole />
    </PageFrame>
  );
}

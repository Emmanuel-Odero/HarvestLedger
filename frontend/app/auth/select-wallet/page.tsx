"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WalletConnector, WalletType } from "@/lib/wallet-utils";
import { useMutation } from "@apollo/client";
import { LINK_EMAIL_TO_WALLET } from "@/lib/graphql/auth";

export default function SelectWalletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletStatus, setWalletStatus] = useState<Record<WalletType, boolean>>(
    {} as Record<WalletType, boolean>
  );

  const [linkEmailToWallet] = useMutation(LINK_EMAIL_TO_WALLET);

  useEffect(() => {
    checkAvailableWallets();
  }, []);

  const checkAvailableWallets = async () => {
    const status: Record<WalletType, boolean> = {} as Record<
      WalletType,
      boolean
    >;

    for (const walletType of Object.values(WalletType)) {
      const isAvailable = await WalletConnector.isWalletAvailable(walletType);
      status[walletType] = isAvailable;
    }

    setWalletStatus(status);
  };

  const handleWalletConnect = async (walletType: WalletType) => {
    // Check if wallet is installed
    if (!walletStatus[walletType]) {
      window.open(getInstallLink(walletType), "_blank");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Connect to wallet
      const walletInfo = await WalletConnector.connect(walletType);

      if (!walletInfo) {
        throw new Error("Failed to connect to wallet");
      }

      // Sign message for verification
      const message = `Verify wallet ownership for HarvestLedger\nEmail: ${email}\nTimestamp: ${Date.now()}`;
      const signatureResult = await WalletConnector.signMessage(
        walletType,
        message
      );

      // Link email to wallet
      const { data } = await linkEmailToWallet({
        variables: {
          input: {
            email,
            walletAddress: walletInfo.address,
            walletType: walletType,
            signature: signatureResult.signature,
          },
        },
      });

      if (data?.linkEmailToWallet?.success) {
        // Redirect to complete registration
        router.push(
          `/auth/complete-registration?email=${encodeURIComponent(
            email
          )}&wallet=${walletInfo.address}`
        );
      } else {
        setError(data?.linkEmailToWallet?.message || "Failed to link wallet");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const getWalletIcon = (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.HASHPACK:
        return "🔷";
      case WalletType.BLADE:
        return "⚔️";
      case WalletType.METAMASK:
        return "🦊";
      case WalletType.NAMI:
        return "🌊";
      case WalletType.ETERNL:
        return "♾️";
      case WalletType.LACE:
        return "🎀";
      case WalletType.FLINT:
        return "🔥";
      case WalletType.KABILA:
        return "🔶";
      case WalletType.PORTAL:
        return "🌐";
      default:
        return "💼";
    }
  };

  const getWalletName = (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.HASHPACK:
        return "HashPack";
      case WalletType.BLADE:
        return "Blade Wallet";
      case WalletType.METAMASK:
        return "MetaMask";
      case WalletType.NAMI:
        return "Nami";
      case WalletType.ETERNL:
        return "Eternl";
      case WalletType.LACE:
        return "Lace";
      case WalletType.FLINT:
        return "Flint";
      case WalletType.KABILA:
        return "Kabila";
      case WalletType.PORTAL:
        return "Portal";
      default:
        return walletType;
    }
  };

  const getWalletDescription = (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.HASHPACK:
        return "Hedera network wallet";
      case WalletType.BLADE:
        return "Multi-chain Hedera wallet";
      case WalletType.METAMASK:
        return "Ethereum & EVM chains";
      case WalletType.NAMI:
        return "Cardano light wallet";
      case WalletType.ETERNL:
        return "Cardano full-featured wallet";
      case WalletType.LACE:
        return "Cardano wallet by IOG";
      case WalletType.FLINT:
        return "Cardano mobile & browser wallet";
      case WalletType.KABILA:
        return "Cardano network wallet";
      case WalletType.PORTAL:
        return "Cardano DeFi wallet";
      default:
        return "Blockchain wallet";
    }
  };

  const getInstallLink = (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.HASHPACK:
        return "https://www.hashpack.app/";
      case WalletType.BLADE:
        return "https://bladewallet.io/";
      case WalletType.METAMASK:
        return "https://metamask.io/";
      case WalletType.NAMI:
        return "https://namiwallet.io/";
      case WalletType.ETERNL:
        return "https://eternl.io/";
      case WalletType.LACE:
        return "https://www.lace.io/";
      case WalletType.FLINT:
        return "https://flint-wallet.com/";
      case WalletType.KABILA:
        return "https://kabila.app/";
      case WalletType.PORTAL:
        return "https://www.portalwallet.io/";
      default:
        return "#";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600">
            Choose a wallet to connect with your verified email:{" "}
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {Object.values(WalletType).map((walletType) => {
            const isInstalled = walletStatus[walletType];
            return (
              <button
                key={walletType}
                onClick={() => handleWalletConnect(walletType)}
                disabled={loading}
                className={`w-full p-5 border-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 ${
                  isInstalled
                    ? "border-green-200 bg-green-50 hover:border-green-500 hover:bg-green-100"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <span className="text-4xl">{getWalletIcon(walletType)}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getWalletName(walletType)}
                    </h3>
                    {isInstalled ? (
                      <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                        Installed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded-full">
                        Not Installed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {getWalletDescription(walletType)}
                  </p>
                </div>
                {isInstalled ? (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Click on any wallet to connect if
              installed, or to visit the installation page if not installed.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Go back
          </button>
        </div>
      </div>
    </div>
  );
}

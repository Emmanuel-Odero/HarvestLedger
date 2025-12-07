/**
 * Cardano Wallet Connect Component
 *
 * Displays wallet selection UI and shows connection status and balance.
 * Requirements: 1.1, 1.3
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  CardanoWalletConnector,
  CardanoWalletType,
  WalletConnection,
  WalletBalance,
  WalletConnectionError,
  WalletErrorCode,
} from "@/lib/cardano-wallet-connector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CardanoWalletConnectProps {
  onConnect?: (connection: WalletConnection) => void;
  onDisconnect?: () => void;
  className?: string;
}

export function CardanoWalletConnect({
  onConnect,
  onDisconnect,
  className = "",
}: CardanoWalletConnectProps) {
  const [connector] = useState(() => new CardanoWalletConnector());
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installedWallets, setInstalledWallets] = useState<CardanoWalletType[]>(
    []
  );

  // Check which wallets are installed
  useEffect(() => {
    const checkInstalledWallets = async () => {
      const supportedWallets = connector.getSupportedWallets();
      const installed: CardanoWalletType[] = [];

      for (const wallet of supportedWallets) {
        const isInstalled = await connector.isWalletInstalled(wallet);
        if (isInstalled) {
          installed.push(wallet);
        }
      }

      setInstalledWallets(installed);
    };

    checkInstalledWallets();
  }, [connector]);

  // Handle wallet connection
  const handleConnect = async (walletType: CardanoWalletType) => {
    setIsConnecting(true);
    setError(null);

    try {
      const conn = await connector.connectWallet(walletType);
      setConnection(conn);

      // Fetch balance
      const bal = await connector.getWalletBalance();
      setBalance(bal);

      onConnect?.(conn);
    } catch (err) {
      if (err instanceof WalletConnectionError) {
        setError(getErrorMessage(err));
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    await connector.disconnectWallet();
    setConnection(null);
    setBalance(null);
    setError(null);
    onDisconnect?.();
  };

  // Get user-friendly error message
  const getErrorMessage = (error: WalletConnectionError): string => {
    switch (error.code) {
      case WalletErrorCode.NOT_INSTALLED:
        return `Wallet not installed. Please install the ${error.details?.walletName} browser extension.`;
      case WalletErrorCode.USER_REJECTED:
        return "Connection was cancelled. Please try again if you want to connect.";
      case WalletErrorCode.NETWORK_MISMATCH:
        return "Network mismatch. Please switch to the correct network in your wallet.";
      case WalletErrorCode.CONNECTION_TIMEOUT:
        return "Connection timed out. Please try again.";
      default:
        return error.message || "An unknown error occurred.";
    }
  };

  // Format ADA balance (convert lovelace to ADA)
  const formatAdaBalance = (lovelace: string): string => {
    const ada = Number(lovelace) / 1_000_000;
    return ada.toFixed(2);
  };

  // Format wallet address
  const formatAddress = (address: string): string => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  // Get wallet display name
  const getWalletDisplayName = (walletType: CardanoWalletType): string => {
    const names: Record<CardanoWalletType, string> = {
      nami: "Nami",
      eternl: "Eternl",
      flint: "Flint",
      lace: "Lace",
      typhon: "Typhon",
    };
    return names[walletType];
  };

  // Get wallet icon (placeholder - would use actual icons in production)
  const getWalletIcon = (walletType: CardanoWalletType): string => {
    return `🔷`; // Placeholder icon
  };

  // Render wallet selection UI
  if (!connection) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Connect Cardano Wallet</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {installedWallets.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">No Cardano wallets detected</p>
            <p className="text-sm text-gray-500 mb-4">
              Please install a Cardano wallet extension to continue
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {connector.getSupportedWallets().map((wallet) => (
                <a
                  key={wallet}
                  href={`https://www.${wallet}.io`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Install {getWalletDisplayName(wallet)}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Select a wallet to connect to Cardano blockchain
            </p>
            {installedWallets.map((wallet) => (
              <button
                key={wallet}
                onClick={() => handleConnect(wallet)}
                disabled={isConnecting}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getWalletIcon(wallet)}</span>
                  <span className="font-medium">
                    {getWalletDisplayName(wallet)}
                  </span>
                </div>
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Cardano Network
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Make sure your wallet is connected to the Preprod testnet for
                testing purposes.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Render connected wallet status
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Connected Wallet</h3>
        <Badge variant="default" className="bg-green-100 text-green-800">
          Connected
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Wallet Info */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <span className="text-2xl">{getWalletIcon(connection.name)}</span>
          <div className="flex-1">
            <h4 className="font-medium">
              {getWalletDisplayName(connection.name)}
            </h4>
            <p className="text-sm text-gray-600 font-mono">
              {formatAddress(connection.address)}
            </p>
          </div>
        </div>

        {/* Balance Display */}
        {balance && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ADA Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ₳ {formatAdaBalance(balance.ada)}
              </p>
            </div>

            {/* Native Tokens */}
            {balance.assets.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Native Tokens ({balance.assets.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {balance.assets.map((asset, index) => (
                    <div
                      key={`${asset.policyId}-${asset.assetName}-${index}`}
                      className="p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {asset.metadata?.name || "Unknown Token"}
                          </p>
                          <p className="text-xs text-gray-500 font-mono truncate">
                            {asset.policyId.slice(0, 16)}...
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 ml-2">
                          {asset.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Network Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Network</span>
            <span className="font-medium text-gray-900">
              {connection.networkId === 0 ? "Testnet" : "Mainnet"}
            </span>
          </div>
        </div>

        {/* Disconnect Button */}
        <Button onClick={handleDisconnect} variant="outline" className="w-full">
          Disconnect Wallet
        </Button>
      </div>
    </Card>
  );
}

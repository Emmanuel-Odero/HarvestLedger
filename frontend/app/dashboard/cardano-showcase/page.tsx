/**
 * Cardano Showcase Page
 *
 * Demonstrates all Cardano blockchain features including wallet connection,
 * token minting, and token transfers.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CardanoWalletConnect,
  CardanoTokenMinting,
  CardanoTokenTransfer,
} from "@/components/cardano";
import { BlockchainSelector } from "@/components/BlockchainSelector";
import {
  CardanoWalletConnector,
  WalletConnection,
} from "@/lib/cardano-wallet-connector";
import { MintResult, TransferResult } from "@/lib/cardano-token-service";
import {
  BlockchainType,
  blockchainAbstraction,
} from "@/lib/blockchain-abstraction";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CardanoShowcasePage() {
  const router = useRouter();
  const [walletConnector] = useState(() => new CardanoWalletConnector());
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<BlockchainType>("cardano");
  const [activeTab, setActiveTab] = useState("wallet");

  // Handle blockchain selection
  const handleBlockchainChange = (blockchain: BlockchainType) => {
    setSelectedBlockchain(blockchain);
    blockchainAbstraction.setActiveBlockchain(blockchain);

    // If switching away from Cardano, redirect to appropriate page
    if (blockchain === "hedera") {
      router.push("/dashboard/blockchain-showcase");
    }
  };

  // Handle wallet connection
  const handleWalletConnect = (conn: WalletConnection) => {
    setConnection(conn);
    // Automatically switch to minting tab after connection
    setActiveTab("mint");
  };

  // Handle wallet disconnection
  const handleWalletDisconnect = () => {
    setConnection(null);
    setActiveTab("wallet");
  };

  // Handle successful minting
  const handleMintSuccess = (result: MintResult) => {
    console.log("Token minted successfully:", result);
    // Could show a notification or update UI
  };

  // Handle successful transfer
  const handleTransferSuccess = (result: TransferResult) => {
    console.log("Token transferred successfully:", result);
    // Could show a notification or update UI
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Cardano Blockchain Showcase
              </h1>
              <p className="text-gray-600 mt-2">
                Explore Cardano's native token capabilities and wallet
                integration
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              ← Back to Dashboard
            </Button>
          </div>

          {/* Blockchain Selector */}
          <BlockchainSelector
            defaultBlockchain="cardano"
            onBlockchainChange={handleBlockchainChange}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet Connection */}
          <div className="lg:col-span-1">
            <CardanoWalletConnect
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
            />

            {/* Connection Status Info */}
            {connection && (
              <Card className="mt-6 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network</span>
                    <span className="font-medium">
                      {connection.networkId === 0 ? "Testnet" : "Mainnet"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="text-green-600 font-medium">
                      Connected
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Info Card */}
            <Card className="mt-6 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                About Cardano
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Cardano is a proof-of-stake blockchain platform that enables
                native token creation without smart contracts, making it ideal
                for agricultural tokenization.
              </p>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-xs text-gray-600">Native token support</p>
                </div>
                <div className="flex items-start space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-xs text-gray-600">Rich metadata support</p>
                </div>
                <div className="flex items-start space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-xs text-gray-600">
                    Plutus smart contracts
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Token Operations */}
          <div className="lg:col-span-2">
            {!connection ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 mb-6">
                  Please connect your Cardano wallet to access token minting and
                  transfer features.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => setActiveTab("wallet")}
                    variant="outline"
                  >
                    View Wallet Options
                  </Button>
                </div>
              </Card>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mint">Mint Tokens</TabsTrigger>
                  <TabsTrigger value="transfer">Transfer Tokens</TabsTrigger>
                </TabsList>

                <TabsContent value="mint" className="mt-6">
                  <CardanoTokenMinting
                    walletConnector={walletConnector}
                    onMintSuccess={handleMintSuccess}
                  />

                  {/* Minting Info */}
                  <Card className="mt-6 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Token Minting Guide
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-2">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>
                          Fill in all required crop information and metadata
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>Review the details and click "Mint Token"</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>Approve the transaction in your wallet</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">4.</span>
                        <span>
                          Wait for blockchain confirmation (usually 20-30
                          seconds)
                        </span>
                      </li>
                    </ul>
                  </Card>
                </TabsContent>

                <TabsContent value="transfer" className="mt-6">
                  <CardanoTokenTransfer
                    walletConnector={walletConnector}
                    onTransferSuccess={handleTransferSuccess}
                  />

                  {/* Transfer Info */}
                  <Card className="mt-6 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Token Transfer Guide
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-2">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>Select the token you want to transfer</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>Enter the recipient's Cardano address</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>
                          Specify the quantity and review the transaction fee
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">4.</span>
                        <span>
                          Confirm the transfer and sign in your wallet
                        </span>
                      </li>
                    </ul>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Multi-Wallet Support
              </h3>
              <p className="text-sm text-gray-600">
                Connect with Nami, Eternl, Flint, Lace, or Typhon wallets
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Native Tokens
              </h3>
              <p className="text-sm text-gray-600">
                Create crop tokens without smart contracts, with rich metadata
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Secure Transfers
              </h3>
              <p className="text-sm text-gray-600">
                Transfer tokens with transparent fees and instant confirmation
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

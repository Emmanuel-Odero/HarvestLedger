/**
 * Cardano Showcase Component
 *
 * Comprehensive dashboard showcasing Cardano blockchain integration features.
 * Requirements: 1.1, 2.1, 4.1, 8.2
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardanoWalletConnect,
  CardanoTokenMinting,
  CardanoTokenTransfer,
} from "@/components/cardano";
import {
  CardanoWalletConnector,
  WalletConnection,
} from "@/lib/cardano-wallet-connector";
import { CardanoTokenService } from "@/lib/cardano-token-service";
import { MintResult, TransferResult } from "@/lib/cardano-token-service";

interface CardanoShowcaseProps {
  demoMode?: boolean;
  className?: string;
}

interface Transaction {
  txHash: string;
  type: "mint" | "transfer" | "metadata";
  timestamp: Date;
  status: "pending" | "confirmed" | "failed";
  details: string;
}

export function CardanoShowcase({
  demoMode = false,
  className = "",
}: CardanoShowcaseProps) {
  const [walletConnector] = useState(() => new CardanoWalletConnector());
  const [tokenService] = useState(
    () => new CardanoTokenService(walletConnector)
  );

  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [activeTab, setActiveTab] = useState("wallet");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verificationQuery, setVerificationQuery] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    const existingConnection = walletConnector.getConnectedWallet();
    if (existingConnection) {
      setConnection(existingConnection);
    }
  }, [walletConnector]);

  // Handle wallet connection
  const handleWalletConnect = (conn: WalletConnection) => {
    setConnection(conn);
  };

  // Handle wallet disconnection
  const handleWalletDisconnect = () => {
    setConnection(null);
  };

  // Handle successful token minting
  const handleMintSuccess = (result: MintResult) => {
    const newTransaction: Transaction = {
      txHash: result.txHash,
      type: "mint",
      timestamp: new Date(),
      status: "confirmed",
      details: `Minted ${result.quantity} tokens (${result.policyId.slice(
        0,
        8
      )}...)`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);

    // Auto-switch to verification tab
    setTimeout(() => {
      setActiveTab("verification");
      setVerificationQuery(result.policyId);
    }, 2000);
  };

  // Handle successful token transfer
  const handleTransferSuccess = (result: TransferResult) => {
    const newTransaction: Transaction = {
      txHash: result.txHash,
      type: "transfer",
      timestamp: new Date(),
      status: result.status === "confirmed" ? "confirmed" : "pending",
      details: `Token transfer`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  // Handle token verification
  const handleVerifyToken = async () => {
    if (!verificationQuery.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Check if it's a policy ID or asset name
      const isPolicyId = verificationQuery.length === 56;

      if (isPolicyId) {
        // Query by policy ID
        const tokenInfo = await tokenService.getTokenInfo(
          verificationQuery,
          ""
        );
        setVerificationResult({
          type: "policy",
          data: tokenInfo,
        });
      } else {
        // Try to parse as policyId.assetName
        const parts = verificationQuery.split(".");
        if (parts.length === 2) {
          const tokenInfo = await tokenService.getTokenInfo(parts[0], parts[1]);
          setVerificationResult({
            type: "token",
            data: tokenInfo,
          });
        } else {
          setVerificationResult({
            type: "error",
            message: "Invalid format. Use policy ID or policyId.assetName",
          });
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify token. Please check the ID and try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format address
  const formatAddress = (address: string): string => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                Cardano Blockchain Integration
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Tokenize crops, transfer assets, and verify authenticity on
                Cardano blockchain
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {connection && (
                <Badge variant="default" className="bg-green-600">
                  ✓ Connected
                </Badge>
              )}
              {demoMode && (
                <Badge variant="secondary" className="text-xs">
                  Demo Mode
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="text-3xl">🔷</div>
              <div>
                <h4 className="font-semibold text-sm">Native Tokens</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Create tokens without smart contracts using Cardano's native
                  token standard
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-3xl">🔒</div>
              <div>
                <h4 className="font-semibold text-sm">UTxO Model</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Enhanced security and predictability with Cardano's UTxO
                  transaction model
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-3xl">⚡</div>
              <div>
                <h4 className="font-semibold text-sm">Low Fees</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Cost-effective transactions with predictable and minimal fees
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab("wallet")}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">👛</div>
              <h3 className="font-semibold mb-1">Wallet</h3>
              <p className="text-xs text-gray-600">Connect Cardano wallets</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab("minting")}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🪙</div>
              <h3 className="font-semibold mb-1">Mint Tokens</h3>
              <p className="text-xs text-gray-600">Tokenize crop batches</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab("transfer")}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">↔️</div>
              <h3 className="font-semibold mb-1">Transfer</h3>
              <p className="text-xs text-gray-600">Send tokens to buyers</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab("verification")}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <h3 className="font-semibold mb-1">Verify</h3>
              <p className="text-xs text-gray-600">Check token authenticity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5 gap-1">
          <TabsTrigger value="wallet" className="text-xs">
            👛 Wallet
          </TabsTrigger>
          <TabsTrigger value="minting" className="text-xs">
            🪙 Mint
          </TabsTrigger>
          <TabsTrigger value="transfer" className="text-xs">
            ↔️ Transfer
          </TabsTrigger>
          <TabsTrigger value="verification" className="text-xs">
            ✓ Verify
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            📜 History
          </TabsTrigger>
        </TabsList>

        {/* Wallet Connection Tab */}
        <TabsContent value="wallet" className="space-y-4">
          <CardanoWalletConnect
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />

          {connection && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Next Steps</p>
                    <p className="text-gray-700">
                      Your wallet is connected! You can now mint tokens to
                      represent your crop batches, transfer tokens to buyers, or
                      verify existing tokens on the blockchain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Token Minting Tab */}
        <TabsContent value="minting" className="space-y-4">
          {!connection ? (
            <Card>
              <CardContent className="py-12 text-center">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  Please connect your wallet to mint tokens
                </p>
                <Button onClick={() => setActiveTab("wallet")}>
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <CardanoTokenMinting
                walletConnector={walletConnector}
                onMintSuccess={handleMintSuccess}
              />

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🪙</div>
                    <div className="text-sm">
                      <p className="font-semibold mb-1">
                        About Cardano Native Tokens
                      </p>
                      <p className="text-gray-700">
                        Cardano native tokens don't require smart contracts,
                        making them more efficient and cost-effective. Each
                        token is uniquely identified by a policy ID and asset
                        name, and can include rich metadata about your crops.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Token Transfer Tab */}
        <TabsContent value="transfer" className="space-y-4">
          {!connection ? (
            <Card>
              <CardContent className="py-12 text-center">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  Please connect your wallet to transfer tokens
                </p>
                <Button onClick={() => setActiveTab("wallet")}>
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <CardanoTokenTransfer
                walletConnector={walletConnector}
                onTransferSuccess={handleTransferSuccess}
              />

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🔒</div>
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Secure Transfers</p>
                      <p className="text-gray-700">
                        All transfers are signed in your wallet and recorded
                        permanently on the Cardano blockchain. Transaction fees
                        are calculated automatically and displayed before you
                        confirm.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Token Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verify Token Authenticity</CardTitle>
              <CardDescription>
                Enter a policy ID or token identifier to verify crop token
                details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={verificationQuery}
                  onChange={(e) => setVerificationQuery(e.target.value)}
                  placeholder="Enter policy ID or policyId.assetName"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyToken();
                    }
                  }}
                />
                <Button
                  onClick={handleVerifyToken}
                  disabled={isVerifying || !verificationQuery.trim()}
                >
                  {isVerifying ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </span>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>

              {verificationResult && (
                <div
                  className={`p-4 rounded-lg ${
                    verificationResult.type === "error"
                      ? "bg-red-50 border border-red-200"
                      : "bg-green-50 border border-green-200"
                  }`}
                >
                  {verificationResult.type === "error" ? (
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
                      <p className="text-sm text-red-800">
                        {verificationResult.message}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h4 className="font-semibold text-green-900">
                          Token Verified
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="bg-white p-3 rounded">
                          <p className="text-gray-600 text-xs mb-1">
                            Token Name
                          </p>
                          <p className="font-medium">
                            {verificationResult.data?.name || "Unknown"}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <p className="text-gray-600 text-xs mb-1">
                            Policy ID
                          </p>
                          <p className="font-mono text-xs break-all">
                            {verificationResult.data?.policyId}
                          </p>
                        </div>
                        {verificationResult.data?.metadata && (
                          <div className="bg-white p-3 rounded">
                            <p className="text-gray-600 text-xs mb-1">
                              Metadata
                            </p>
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(
                                verificationResult.data.metadata,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
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
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 mb-1">
                      How Verification Works
                    </h4>
                    <p className="text-blue-700">
                      Token verification queries the Cardano blockchain via
                      Blockfrost API to retrieve authentic token information
                      including metadata, minting history, and current holders.
                      This ensures complete transparency and traceability.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Recent Cardano blockchain transactions from this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">No transactions yet</p>
                  <p className="text-sm text-gray-500">
                    Mint or transfer tokens to see your transaction history
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div
                      key={`${tx.txHash}-${index}`}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              tx.type === "mint" ? "default" : "secondary"
                            }
                            className={
                              tx.type === "mint"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {tx.type === "mint" ? "🪙 Mint" : "↔️ Transfer"}
                          </Badge>
                          <Badge
                            variant={
                              tx.status === "confirmed"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              tx.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{tx.details}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono text-gray-500">
                          {formatAddress(tx.txHash)}
                        </p>
                        <a
                          href={`https://preprod.cardanoscan.io/transaction/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          View on Explorer →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Educational Footer */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle>Why Choose Cardano?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="text-3xl">🌱</div>
              <div>
                <h4 className="font-semibold mb-1">Sustainable</h4>
                <p className="text-sm text-gray-700">
                  Cardano uses proof-of-stake consensus, consuming significantly
                  less energy than proof-of-work blockchains while maintaining
                  security.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-3xl">🔬</div>
              <div>
                <h4 className="font-semibold mb-1">Research-Driven</h4>
                <p className="text-sm text-gray-700">
                  Built on peer-reviewed academic research, Cardano provides a
                  scientifically rigorous foundation for agricultural supply
                  chain management.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-3xl">🌍</div>
              <div>
                <h4 className="font-semibold mb-1">Global Reach</h4>
                <p className="text-sm text-gray-700">
                  With a focus on developing markets, Cardano is ideal for
                  connecting farmers worldwide to global agricultural markets.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

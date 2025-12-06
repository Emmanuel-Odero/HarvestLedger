"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  demoDataService,
  HTSToken,
  TokenTransfer,
} from "@/lib/demo-data-service";

interface TokenTransferDemoProps {
  demoMode?: boolean;
  onTransferComplete?: (transfer: TokenTransfer) => void;
}

interface WalletProfile {
  accountId: string;
  name: string;
  role: "farmer" | "buyer";
  balance: number;
}

export function TokenTransferDemo({
  demoMode = true,
  onTransferComplete,
}: TokenTransferDemoProps) {
  const [tokens, setTokens] = useState<HTSToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<HTSToken | null>(null);
  const [fromWallet, setFromWallet] = useState<WalletProfile | null>(null);
  const [toWallet, setToWallet] = useState<WalletProfile | null>(null);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [step, setStep] = useState<
    "select" | "wallets" | "amount" | "review" | "transferring" | "success"
  >("select");
  const [completedTransfer, setCompletedTransfer] =
    useState<TokenTransfer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo wallet profiles
  const walletProfiles: WalletProfile[] = [
    {
      accountId: demoDataService.generateWalletAddressForType("hashpack"),
      name: "John Kamau (Farmer)",
      role: "farmer",
      balance: 2450.75,
    },
    {
      accountId: demoDataService.generateWalletAddressForType("blade"),
      name: "Sarah Mwangi (Buyer)",
      role: "buyer",
      balance: 15230.5,
    },
    {
      accountId: demoDataService.generateWalletAddressForType("kabila"),
      name: "David Ochieng (Buyer)",
      role: "buyer",
      balance: 8750.25,
    },
  ];

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    setLoading(true);
    try {
      await demoDataService.initialize();
      const allTokens = demoDataService.getHTSTokens();
      setTokens(allTokens.slice(0, 10)); // Show first 10 tokens
    } catch (err) {
      setError("Failed to load tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSelect = (token: HTSToken) => {
    setSelectedToken(token);
    setStep("wallets");
  };

  const handleWalletSelection = (from: WalletProfile, to: WalletProfile) => {
    setFromWallet(from);
    setToWallet(to);
    setStep("amount");
  };

  const handleTransfer = async () => {
    if (!selectedToken || !fromWallet || !toWallet || !transferAmount) return;

    setStep("transferring");
    setError(null);

    try {
      const transfer = await demoDataService.simulateTokenTransfer(
        selectedToken.tokenId,
        fromWallet.accountId,
        toWallet.accountId,
        transferAmount,
        memo || undefined
      );

      setCompletedTransfer(transfer);
      setStep("success");

      if (onTransferComplete) {
        onTransferComplete(transfer);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      setStep("review");
    }
  };

  const handleReset = () => {
    setStep("select");
    setSelectedToken(null);
    setFromWallet(null);
    setToWallet(null);
    setTransferAmount("");
    setMemo("");
    setCompletedTransfer(null);
    setError(null);
  };

  const formatBalance = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "farmer"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HTS Token Transfer Demo</h2>
          <p className="text-sm text-gray-600 mt-1">
            Demonstrate tokenized crop transfers with automated settlement
          </p>
        </div>
        {demoMode && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* Progress Steps */}
      {step !== "select" && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            {[
              { id: "select", label: "Select Token" },
              { id: "wallets", label: "Choose Wallets" },
              { id: "amount", label: "Transfer Amount" },
              { id: "review", label: "Review & Confirm" },
            ].map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step === s.id ||
                    (step === "transferring" && s.id === "review") ||
                    (step === "success" && s.id === "review")
                      ? "bg-blue-600 text-white"
                      : ["select", "wallets", "amount", "review"].indexOf(
                          step
                        ) >
                        ["select", "wallets", "amount", "review"].indexOf(s.id)
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {["select", "wallets", "amount", "review"].indexOf(step) >
                  ["select", "wallets", "amount", "review"].indexOf(s.id) ? (
                    <svg
                      className="w-5 h-5"
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
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm font-medium">{s.label}</span>
                {index < 3 && (
                  <div className="w-12 h-0.5 bg-gray-300 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <svg
              className="w-5 h-5"
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
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Step 1: Token Selection */}
      {step === "select" && (
        <div>
          {loading ? (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tokens...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tokens.map((token) => (
                <Card
                  key={token.tokenId}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleTokenSelect(token)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{token.name}</h3>
                      <p className="text-sm text-gray-600">{token.symbol}</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      HTS Token
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Token ID:</span>
                      <span className="font-mono">{token.tokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Supply:</span>
                      <span className="font-semibold">{token.totalSupply}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Grade:</span>
                      <span className="font-semibold">
                        {token.metadata.qualityMetrics.overallGrade}
                      </span>
                    </div>
                  </div>

                  {token.metadata.certifications.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {token.metadata.certifications.slice(0, 2).map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button className="w-full mt-4" variant="outline">
                    Select Token
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Wallet Selection */}
      {step === "wallets" && selectedToken && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Select Sender & Receiver
          </h3>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">From (Sender)</h4>
            <div className="grid grid-cols-1 gap-2">
              {walletProfiles
                .filter((w) => w.role === "farmer")
                .map((wallet) => (
                  <div
                    key={wallet.accountId}
                    onClick={() => setFromWallet(wallet)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      fromWallet?.accountId === wallet.accountId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{wallet.name}</p>
                        <p className="text-xs font-mono text-gray-500">
                          {wallet.accountId}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getRoleBadgeColor(wallet.role)}>
                          {wallet.role}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">
                          {formatBalance(wallet.balance)} ℏ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">To (Receiver)</h4>
            <div className="grid grid-cols-1 gap-2">
              {walletProfiles
                .filter((w) => w.role === "buyer")
                .map((wallet) => (
                  <div
                    key={wallet.accountId}
                    onClick={() => setToWallet(wallet)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      toWallet?.accountId === wallet.accountId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{wallet.name}</p>
                        <p className="text-xs font-mono text-gray-500">
                          {wallet.accountId}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getRoleBadgeColor(wallet.role)}>
                          {wallet.role}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">
                          {formatBalance(wallet.balance)} ℏ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setStep("select")}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep("amount")}
              className="flex-1"
              disabled={!fromWallet || !toWallet}
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Transfer Amount */}
      {step === "amount" && selectedToken && fromWallet && toWallet && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Transfer Details</h3>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">From:</span>
              <span className="font-semibold">{fromWallet.name}</span>
            </div>
            <div className="flex items-center justify-center my-2">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">To:</span>
              <span className="font-semibold">{toWallet.name}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Transfer Amount
              </label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max={selectedToken.totalSupply}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {selectedToken.totalSupply} {selectedToken.symbol}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Memo (Optional)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add a note to this transfer"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Token Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Token:</span>
                  <span className="font-semibold">{selectedToken.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Symbol:</span>
                  <span className="font-semibold">{selectedToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quality:</span>
                  <span className="font-semibold">
                    {selectedToken.metadata.qualityMetrics.overallGrade}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep("wallets")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("review")}
                className="flex-1"
                disabled={!transferAmount || parseFloat(transferAmount) <= 0}
              >
                Review Transfer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Review & Confirm */}
      {step === "review" && selectedToken && fromWallet && toWallet && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Review Transfer</h3>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Transfer Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Token:</span>
                  <span className="font-semibold">{selectedToken.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">
                    {transferAmount} {selectedToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-semibold">{fromWallet.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-semibold">{toWallet.name}</span>
                </div>
                {memo && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 block mb-1">Memo:</span>
                    <span className="font-semibold">{memo}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
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
                  <p className="font-semibold text-blue-900 mb-1">
                    Automated Settlement
                  </p>
                  <p className="text-blue-700">
                    This transfer will be executed on Hedera Token Service (HTS)
                    with instant settlement and blockchain verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep("amount")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={handleTransfer} className="flex-1">
                Confirm Transfer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Transferring State */}
      {step === "transferring" && (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Processing Transfer...
          </h3>
          <p className="text-gray-600">
            Executing token transfer on Hedera network
          </p>
        </Card>
      )}

      {/* Success State */}
      {step === "success" && completedTransfer && selectedToken && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="text-center mb-6">
            <svg
              className="w-16 h-16 mx-auto text-green-600 mb-4"
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
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              Transfer Successful!
            </h3>
            <p className="text-gray-700">
              Token transfer completed with automated settlement
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
              <p className="font-mono text-sm break-all">
                {completedTransfer.transactionId}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Amount Transferred</p>
              <p className="font-semibold text-lg">
                {completedTransfer.amount} {selectedToken.symbol}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">From</p>
              <p className="font-mono text-sm">{completedTransfer.from}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">To</p>
              <p className="font-mono text-sm">{completedTransfer.to}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Consensus Timestamp</p>
              <p className="font-mono text-sm">
                {completedTransfer.consensusTimestamp}
              </p>
            </div>
          </div>

          <Button onClick={handleReset} className="w-full">
            Make Another Transfer
          </Button>
        </Card>
      )}
    </div>
  );
}

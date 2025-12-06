"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoDataService } from "@/lib/demo-data-service";

interface DemoWalletProfile {
  id: string;
  name: string;
  walletType: "HashPack" | "Blade" | "Kabila" | "MetaMask" | "Portal";
  accountId: string;
  balance: {
    hbar: number;
    tokens: Array<{
      tokenId: string;
      balance: string;
      symbol: string;
    }>;
  };
  transactionHistory: Array<{
    id: string;
    type: string;
    amount: number;
    timestamp: Date;
    status: "success" | "pending" | "failed";
  }>;
  role: "farmer" | "buyer" | "processor";
}

interface WalletConnectionDemoProps {
  onWalletConnect?: (profile: DemoWalletProfile) => void;
  showBalances?: boolean;
  demoMode?: boolean;
}

export function WalletConnectionDemo({
  onWalletConnect,
  showBalances = true,
  demoMode = true,
}: WalletConnectionDemoProps) {
  const [selectedProfile, setSelectedProfile] =
    useState<DemoWalletProfile | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  // Generate demo wallet profiles
  const demoProfiles: DemoWalletProfile[] = [
    {
      id: "profile-1",
      name: "John Kamau - Coffee Farmer",
      walletType: "HashPack",
      accountId: demoDataService.generateWalletAddressForType("hashpack"),
      balance: {
        hbar: 2450.75,
        tokens: [
          { tokenId: "0.0.12345", balance: "5000", symbol: "COFFEE" },
          { tokenId: "0.0.12346", balance: "1200", symbol: "CERT" },
        ],
      },
      transactionHistory: [
        {
          id: demoDataService.generateHederaTransactionId(),
          type: "Token Transfer",
          amount: 500,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: "success",
        },
        {
          id: demoDataService.generateHederaTransactionId(),
          type: "HCS Message",
          amount: 0.05,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: "success",
        },
        {
          id: demoDataService.generateHederaTransactionId(),
          type: "Loan Repayment",
          amount: 1000,
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: "success",
        },
      ],
      role: "farmer",
    },
    {
      id: "profile-2",
      name: "Sarah Mwangi - Crop Buyer",
      walletType: "Blade",
      accountId: demoDataService.generateWalletAddressForType("blade"),
      balance: {
        hbar: 15230.5,
        tokens: [
          { tokenId: "0.0.12345", balance: "25000", symbol: "COFFEE" },
          { tokenId: "0.0.12347", balance: "8000", symbol: "MAIZE" },
          { tokenId: "0.0.12348", balance: "3500", symbol: "WHEAT" },
        ],
      },
      transactionHistory: [
        {
          id: demoDataService.generateHederaTransactionId(),
          type: "Token Purchase",
          amount: 5000,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: "success",
        },
        {
          id: demoDataService.generateHederaTransactionId(),
          type: "Smart Contract",
          amount: 250,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: "success",
        },
        {
          id: demoDataService.generateHederaTransactionId(),
          type: "Token Transfer",
          amount: 2000,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: "success",
        },
      ],
      role: "buyer",
    },
    {
      id: "profile-3",
      name: "David Ochieng - Processor",
      walletType: "Kabila",
      accountId: demoDataService.generateWalletAddressForType("kabila"),
      balance: {
        hbar: 8750.25,
        tokens: [
          { tokenId: "0.0.12345", balance: "12000", symbol: "COFFEE" },
          { tokenId: "0.0.12349", balance: "5000", symbol: "PROC" },
        ],
      },
      transactionHistory: [
        {
          id: demoDataService.generateHederaTransactionId(),
          type: "Processing Fee",
          amount: 150,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: "success",
        },
        {
          id: demoDataService.generateHederaTransactionId(),
          type: "Token Mint",
          amount: 50,
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          status: "success",
        },
      ],
      role: "processor",
    },
  ];

  const handleConnect = async (profile: DemoWalletProfile) => {
    setConnecting(true);
    setSelectedProfile(null);

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSelectedProfile(profile);
    setConnecting(false);

    if (onWalletConnect) {
      onWalletConnect(profile);
    }
  };

  const handleDisconnect = () => {
    setSelectedProfile(null);
    setShowTransactionHistory(false);
  };

  const formatBalance = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "farmer":
        return "bg-green-100 text-green-800";
      case "buyer":
        return "bg-blue-100 text-blue-800";
      case "processor":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWalletIcon = (walletType: string) => {
    // Return appropriate icon based on wallet type
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
        {walletType.charAt(0)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wallet Connection Demo</h2>
          <p className="text-sm text-gray-600 mt-1">
            Connect with demo wallet profiles to explore features
          </p>
        </div>
        {demoMode && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* Connected Wallet Display */}
      {selectedProfile && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {getWalletIcon(selectedProfile.walletType)}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {selectedProfile.name}
                  </h3>
                  <Badge className={getRoleColor(selectedProfile.role)}>
                    {selectedProfile.role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedProfile.walletType} Wallet
                </p>
                <p className="text-xs font-mono text-gray-500 mt-1">
                  {selectedProfile.accountId}
                </p>
              </div>
            </div>
            <Button onClick={handleDisconnect} variant="outline" size="sm">
              Disconnect
            </Button>
          </div>

          {showBalances && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">HBAR Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatBalance(selectedProfile.balance.hbar)} ℏ
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Token Holdings</p>
                <p className="text-2xl font-bold text-purple-600">
                  {selectedProfile.balance.tokens.length} Tokens
                </p>
              </div>
            </div>
          )}

          {showBalances && selectedProfile.balance.tokens.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Token Balances</h4>
              <div className="space-y-2">
                {selectedProfile.balance.tokens.map((token, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded"
                  >
                    <div>
                      <p className="font-semibold">{token.symbol}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        {token.tokenId}
                      </p>
                    </div>
                    <p className="font-bold">{token.balance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <Button
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
              variant="outline"
              className="w-full"
            >
              {showTransactionHistory ? "Hide" : "Show"} Transaction History
            </Button>
          </div>

          {showTransactionHistory && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-3">
                Recent Transactions
              </h4>
              <div className="space-y-2">
                {selectedProfile.transactionHistory.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between bg-white p-3 rounded"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{tx.type}</p>
                        <Badge
                          variant={
                            tx.status === "success" ? "default" : "destructive"
                          }
                          className={
                            tx.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {tx.id}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {tx.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {tx.amount > 0 && (
                      <p className="font-bold text-blue-600">
                        {formatBalance(tx.amount)} ℏ
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Wallet Selection */}
      {!selectedProfile && !connecting && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoProfiles.map((profile) => (
            <Card
              key={profile.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleConnect(profile)}
            >
              <div className="flex items-center gap-3 mb-4">
                {getWalletIcon(profile.walletType)}
                <div>
                  <h3 className="font-semibold">{profile.name}</h3>
                  <p className="text-xs text-gray-600">{profile.walletType}</p>
                </div>
              </div>

              <Badge className={`${getRoleColor(profile.role)} mb-3`}>
                {profile.role}
              </Badge>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">HBAR:</span>
                  <span className="font-semibold">
                    {formatBalance(profile.balance.hbar)} ℏ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens:</span>
                  <span className="font-semibold">
                    {profile.balance.tokens.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-semibold">
                    {profile.transactionHistory.length}
                  </span>
                </div>
              </div>

              <Button className="w-full mt-4" variant="outline">
                Connect Wallet
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Connecting State */}
      {connecting && (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Connecting Wallet...
          </h3>
          <p className="text-gray-600">
            Please approve the connection in your wallet
          </p>
        </Card>
      )}
    </div>
  );
}

/**
 * Blockchain Selector Component
 *
 * Provides a toggle to switch between Hedera and Cardano blockchains.
 * Requirements: 9.2
 */

"use client";

import React, { useState, useEffect } from "react";
import { BlockchainType } from "@/lib/blockchain-abstraction";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlockchainSelectorProps {
  onBlockchainChange?: (blockchain: BlockchainType) => void;
  defaultBlockchain?: BlockchainType;
  className?: string;
}

export function BlockchainSelector({
  onBlockchainChange,
  defaultBlockchain = "hedera",
  className = "",
}: BlockchainSelectorProps) {
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<BlockchainType>(defaultBlockchain);

  useEffect(() => {
    // Notify parent component of initial selection
    onBlockchainChange?.(selectedBlockchain);
  }, []);

  const handleBlockchainChange = (blockchain: BlockchainType) => {
    setSelectedBlockchain(blockchain);
    onBlockchainChange?.(blockchain);
  };

  const blockchainInfo = {
    hedera: {
      name: "Hedera",
      icon: "⚡",
      description: "Fast, fair, and secure",
      color: "purple",
      features: ["HCS", "HTS", "Smart Contracts"],
    },
    cardano: {
      name: "Cardano",
      icon: "🔷",
      description: "Proof-of-stake blockchain",
      color: "blue",
      features: ["Native Tokens", "Plutus", "Metadata"],
    },
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Select Blockchain
        </h3>
        <Badge variant="outline" className="text-xs">
          {selectedBlockchain === "hedera" ? "Hedera Active" : "Cardano Active"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Hedera Option */}
        <button
          onClick={() => handleBlockchainChange("hedera")}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedBlockchain === "hedera"
              ? "border-purple-500 bg-purple-50 shadow-md"
              : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">{blockchainInfo.hedera.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-1">
              {blockchainInfo.hedera.name}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {blockchainInfo.hedera.description}
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {blockchainInfo.hedera.features.map((feature) => (
                <span
                  key={feature}
                  className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </button>

        {/* Cardano Option */}
        <button
          onClick={() => handleBlockchainChange("cardano")}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedBlockchain === "cardano"
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">{blockchainInfo.cardano.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-1">
              {blockchainInfo.cardano.name}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {blockchainInfo.cardano.description}
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {blockchainInfo.cardano.features.map((feature) => (
                <span
                  key={feature}
                  className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </button>
      </div>

      {/* Info Banner */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg
            className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0"
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
          <p className="text-xs text-gray-600">
            {selectedBlockchain === "hedera"
              ? "Using Hedera testnet for fast consensus and token services."
              : "Using Cardano preprod testnet for native tokens and smart contracts."}
          </p>
        </div>
      </div>
    </Card>
  );
}

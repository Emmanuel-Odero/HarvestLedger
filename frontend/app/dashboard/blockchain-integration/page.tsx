"use client";

import React, { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import {
  HashScanSimulator,
  WalletConnectionDemo,
  HarvestRecordingWorkflow,
  TokenTransferDemo,
  CertificationSystem,
} from "@/components/dashboard";

export default function BlockchainIntegrationPage() {
  const [activeTab, setActiveTab] = useState("hashscan");

  const tabs = [
    {
      id: "hashscan",
      label: "HashScan Explorer",
      component: <HashScanSimulator demoMode={true} />,
    },
    {
      id: "wallet",
      label: "Wallet Connection",
      component: <WalletConnectionDemo demoMode={true} showBalances={true} />,
    },
    {
      id: "harvest",
      label: "Harvest Recording",
      component: <HarvestRecordingWorkflow demoMode={true} />,
    },
    {
      id: "transfer",
      label: "Token Transfer",
      component: <TokenTransferDemo demoMode={true} />,
    },
    {
      id: "certification",
      label: "Certifications",
      component: <CertificationSystem demoMode={true} />,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Blockchain Integration Showcase
        </h1>
        <p className="text-gray-600">
          Explore blockchain features with realistic demonstrations and
          interactive workflows
        </p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}

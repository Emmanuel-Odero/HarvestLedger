"use client";

import { useState } from "react";
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
  LiveHCSTopicViewer,
  SupplyChainVisualization,
  TokenizationInterface,
  QualityAssuranceDisplay,
  LoanManagementDashboard,
  AnalyticsDashboard,
  DisputeResolutionInterface,
} from "@/components/dashboard";
import { useDemoMode } from "@/lib/demo-mode-context";
import { NotificationCenter } from "@/components/user-journey";
import { useRouter } from "next/navigation";

export default function BlockchainShowcase() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState("hcs");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Blockchain Showcase Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Interactive demonstration of agricultural blockchain
                  capabilities
                </p>
              </div>
              <div className="flex items-center gap-3">
                <NotificationCenter />
                <Badge
                  variant={isDemoMode ? "default" : "secondary"}
                  className="text-sm cursor-pointer"
                  onClick={toggleDemoMode}
                >
                  {isDemoMode ? "🎭 Demo Mode" : "🔴 Live Mode"}
                </Badge>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => router.push("/dashboard/user-journey")}
                >
                  🎯 Start Journey
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab("hcs")}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📝</div>
                <h3 className="font-semibold mb-1">HCS Messages</h3>
                <p className="text-xs text-gray-600">
                  Real-time harvest records
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab("supply-chain")}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🔗</div>
                <h3 className="font-semibold mb-1">Supply Chain</h3>
                <p className="text-xs text-gray-600">Track crop journey</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab("tokenization")}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🪙</div>
                <h3 className="font-semibold mb-1">Tokenization</h3>
                <p className="text-xs text-gray-600">HTS token management</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab("quality")}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🔬</div>
                <h3 className="font-semibold mb-1">Quality</h3>
                <p className="text-xs text-gray-600">IoT & certifications</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab("loans")}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="font-semibold mb-1">Loan Management</h3>
                <p className="text-xs text-gray-600">DeFi & smart contracts</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab("analytics")}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-semibold mb-1">Analytics</h3>
                <p className="text-xs text-gray-600">Insights & predictions</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab("disputes")}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">⚖️</div>
                <h3 className="font-semibold mb-1">Dispute Resolution</h3>
                <p className="text-xs text-gray-600">Immutable evidence</p>
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
          <TabsList className="grid w-full grid-cols-7 gap-1">
            <TabsTrigger value="hcs" className="text-xs">
              📝 HCS
            </TabsTrigger>
            <TabsTrigger value="supply-chain" className="text-xs">
              🔗 Supply
            </TabsTrigger>
            <TabsTrigger value="tokenization" className="text-xs">
              🪙 Tokens
            </TabsTrigger>
            <TabsTrigger value="quality" className="text-xs">
              🔬 Quality
            </TabsTrigger>
            <TabsTrigger value="loans" className="text-xs">
              💰 Loans
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger value="disputes" className="text-xs">
              ⚖️ Disputes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hcs" className="space-y-4">
            <LiveHCSTopicViewer
              topicId="0.0.1001"
              demoMode={isDemoMode}
              realTimeUpdates={false}
              limit={10}
            />
          </TabsContent>

          <TabsContent value="supply-chain" className="space-y-4">
            <SupplyChainVisualization
              showVerificationBadges={true}
              interactiveMode={true}
            />
          </TabsContent>

          <TabsContent value="tokenization" className="space-y-4">
            <TokenizationInterface
              walletConnected={true}
              demoMode={isDemoMode}
            />
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <QualityAssuranceDisplay
              showIoTData={true}
              showCertifications={true}
            />
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <LoanManagementDashboard demoMode={isDemoMode} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard demoMode={isDemoMode} />
          </TabsContent>

          <TabsContent value="disputes" className="space-y-4">
            <DisputeResolutionInterface demoMode={isDemoMode} />
          </TabsContent>
        </Tabs>

        {/* Platform Benefits */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Platform Benefits</CardTitle>
            <CardDescription>
              How blockchain technology transforms agricultural supply chains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <div className="text-3xl">🔒</div>
                <div>
                  <h4 className="font-semibold mb-1">Immutable Records</h4>
                  <p className="text-sm text-gray-700">
                    All harvest data, quality metrics, and transactions are
                    permanently recorded on the blockchain, preventing fraud and
                    ensuring data integrity.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-3xl">🌍</div>
                <div>
                  <h4 className="font-semibold mb-1">Full Traceability</h4>
                  <p className="text-sm text-gray-700">
                    Track crops from farm to consumer with GPS verification, IoT
                    monitoring, and blockchain-verified checkpoints at every
                    stage.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-3xl">💰</div>
                <div>
                  <h4 className="font-semibold mb-1">New Financing Options</h4>
                  <p className="text-sm text-gray-700">
                    Tokenized crops can be used as collateral for loans, traded
                    on marketplaces, or sold directly to buyers, providing
                    farmers with more financial flexibility.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Button variant="outline" className="flex-1">
            📖 View Documentation
          </Button>
          <Button variant="outline" className="flex-1">
            🎥 Watch Tutorial
          </Button>
          <Button variant="outline" className="flex-1">
            💬 Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
